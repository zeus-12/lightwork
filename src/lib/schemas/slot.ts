import { RepeatType } from "@prisma/client";
import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Date must be in YYYY-MM-DD format",
});

const slotDurationSchema = z
  .union([z.literal("15"), z.literal("30")], {
    message: "Slot duration must be either 15 or 30 minutes",
  })
  .transform((val) => parseInt(val));

export const slotBookingSchema = z.object({
  slotId: z.string().uuid(),
  reason: z.string(),
});

export const slotDatesAndDoctorIdSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
  doctorId: z.string(),
});

export const availableSlotsQuerySchema = z.object({
  doctorId: z.string().uuid(),
  date: dateSchema,
  slotDuration: slotDurationSchema,
  });
