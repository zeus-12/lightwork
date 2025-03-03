import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export const handleErrorMessage = (error: any) => {
  return error instanceof ZodError
    ? fromZodError(error).message
    : error.message;
};

export const isValidRecurrenceDay = (
  daysOfWeek: number,
  day: number,
): boolean => {
  return (daysOfWeek & (1 << day)) !== 0;
};

const MAX_SLOT_COUNT = 15;

export const generateSlotsForDate = (
  date: Date,
  dailyStartTime: string,
  dailyEndTime: string,
  slotDuration: number,
  doctorId: string,
  recurrenceId: string,
  endDate: string,
) => {
  const [startHour, startMinute] = dailyStartTime.split(":").map(Number);
  const [endHour, endMinute] = dailyEndTime.split(":").map(Number);

  const slots = [];
  const endDateTime = new Date(
    Date.UTC(
      new Date(endDate).getFullYear(),
      new Date(endDate).getMonth(),
      new Date(endDate).getDate(),
    ),
  );

  let currentDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  while (currentDate <= endDateTime && slots.length < MAX_SLOT_COUNT) {
    const slotStartTime = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
        startHour,
        startMinute,
      ),
    );

    const slotEndBoundary = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
        endHour,
        endMinute,
      ),
    );

    let currentSlotStart = new Date(slotStartTime);

    while (
      currentSlotStart.getTime() + slotDuration * 60000 <=
        slotEndBoundary.getTime() &&
      slots.length < MAX_SLOT_COUNT
    ) {
      const currentSlotEnd = new Date(
        Date.UTC(
          currentSlotStart.getUTCFullYear(),
          currentSlotStart.getUTCMonth(),
          currentSlotStart.getUTCDate(),
          currentSlotStart.getUTCHours(),
          currentSlotStart.getUTCMinutes() + slotDuration,
        ),
      );

      slots.push({
        doctorId,
        recurrenceId,
        startTime: currentSlotStart,
        endTime: currentSlotEnd,
        slotDuration,
      });

      currentSlotStart = currentSlotEnd;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
};
