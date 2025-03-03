-- CreateIndex
CREATE INDEX "Slot_doctorId_startTime_endTime_idx" ON "Slot"("doctorId", "startTime", "endTime");
