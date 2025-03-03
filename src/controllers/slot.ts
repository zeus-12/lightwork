import { prisma } from "@/lib/db";
import { slotBookingSchema } from "@/lib/schemas/slot";
import { handleErrorMessage } from "@/lib/utils";
import { Request, Response } from "express";

export const bookSlot = async (req: Request, res: Response) => {
  try {
    const { reason, slotId } = slotBookingSchema.parse({
      slotId: req.params.slotId,
      reason: req.body.reason,
    });

    const slot = await prisma.slot.findUnique({
      where: {
        id: slotId,
      },
      include: {
        booking: true,
      },
    });

    if (!slot) {
      return res.status(404).json({
        status: "error",
        message: "Slot not found",
      });
    }

    if (slot.booking) {
      return res.status(400).json({
        status: "error",
        message: "Slot is already booked",
      });
    }

    const booking = await prisma.booking.create({
      data: {
        slotId,
        reason,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Slot booked successfully",
      data: booking,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      message: handleErrorMessage(err),
    });
  }
};
