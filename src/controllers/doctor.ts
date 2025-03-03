import { prisma } from "@/lib/db";
import { doctorSchema } from "@/lib/schemas/doctor";
import {
  availableSlotsQuerySchema,
  slotSchema,
  slotDatesAndDoctorIdSchema,
} from "@/lib/schemas/slot";
import { generateSlotsForDate } from "@/lib/utils";
import { Request, Response } from "express";
import { isValidRecurrenceDay } from "@/lib/utils";
import dayjs from "dayjs";
import { handleErrorMessage } from "@/lib/utils";

export const addDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = doctorSchema.parse(req.body);

    const data = await prisma.doctor.create({
      data: {
        username: doctor.username,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
      },
    });

    return res.status(201).json({
      data: data,
      message: "Doctor created",
    });
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      message: handleErrorMessage(err),
    });
  }
};

export const addSlots = async (req: Request, res: Response) => {
  try {
    const { doctorId, ...slotData } = slotSchema.parse({
      ...req.body,
      doctorId: req.params.doctorId,
    });

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        status: "error",
        message: "Doctor not found",
      });
    }

    const dailyStartTime = slotData.startTime.split("T")[1].replace("Z", "");
    const dailyEndTime = slotData.endTime.split("T")[1].replace("Z", "");

    const recurrenceRule = await prisma.recurrenceRule.create({
      data: {
        doctorId,
        repeatType: slotData.repeatType,
        daysOfWeek: slotData.daysOfWeek,
        endDate: new Date(slotData.endDate),
        dailyStartTime,
        dailyEndTime,
        slotDuration: slotData.slotDuration,
        startDate: new Date(slotData.startTime),
      },
    });

    const generationDate = new Date(slotData.startTime);

    const slots = generateSlotsForDate(
      generationDate,
      recurrenceRule.dailyStartTime,
      recurrenceRule.dailyEndTime,
      recurrenceRule.slotDuration,
      doctorId,
      recurrenceRule.id,
      slotData.endDate,
    );

    await prisma.slot.createMany({ data: slots });

    return res.status(201).json({
      message: "Slots created",
      recurrenceRuleId: recurrenceRule.id,
      createdSlots: slots.length,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      message: handleErrorMessage(err),
    });
  }
};

export const getAllBookedAppointments = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, doctorId } = slotDatesAndDoctorIdSchema.parse({
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      doctorId: req.params.doctorId,
    });

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        status: "error",
        message: "Doctor not found",
      });
    }

    const startDateInUtc = dayjs(startDate).startOf("day").toDate();
    const endDateInUtc = dayjs(endDate).endOf("day").toDate();

    const data = await prisma.booking.findMany({
      where: {
        slot: {
          doctorId,
          startTime: {
            gte: startDateInUtc,
            lte: endDateInUtc,
          },
        },
      },
      include: {
        slot: true,
      },
    });

    return res.status(200).json({
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      message: handleErrorMessage(err),
    });
  }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { doctorId, date, slotDuration } = availableSlotsQuerySchema.parse({
      doctorId: req.params.doctorId,
      date: req.query.date,
      slotDuration: req.query.slotDuration,
    });

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        status: "error",
        message: "Doctor not found",
      });
    }

    const requestedDate = dayjs(date);
    const dayOfWeek = requestedDate.day();

    let slots = await prisma.slot.findMany({
      where: {
        doctorId,
        startTime: {
          gte: requestedDate.startOf("day").toDate(),
          lt: requestedDate.endOf("day").toDate(),
        },
        booking: null,
      },
    });

    if (slots.length === 0) {
      const recurrenceRules = await prisma.recurrenceRule.findMany({
        where: {
          doctorId,
          endDate: {
            gte: requestedDate.toDate(),
          },
        },
      });

      const slotPromises = recurrenceRules
        .filter(
          (rule) =>
            rule.daysOfWeek !== null &&
            isValidRecurrenceDay(rule.daysOfWeek, dayOfWeek),
        )
        .flatMap((rule) => {
          if (!rule.endDate || !rule.dailyStartTime || !rule.dailyEndTime) {
            return [];
          }

          const slots = generateSlotsForDate(
            requestedDate.toDate(),
            rule.dailyStartTime,
            rule.dailyEndTime,
            slotDuration,
            doctorId,
            rule.id,
            requestedDate.add(1, "day").toDate().toISOString().split("T")[0],
          );

          return slots.map((slot) =>
            prisma.slot.create({
              data: {
                doctorId,
                recurrenceId: rule.id,
                startTime: new Date(slot.startTime.toISOString()),
                endTime: new Date(slot.endTime.toISOString()),
                slotDuration,
              },
            }),
          );
        });

      const newSlots = await Promise.all(slotPromises);
      slots.push(...newSlots);
    }

    return res.json({
      status: "success",
      data: slots,
    });
  } catch (err: any) {
    return res.status(400).json({
      status: "error",
      message: handleErrorMessage(err),
    });
  }
};
