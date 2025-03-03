import {
  addDoctor,
  addSlots,
  getAllBookedAppointments,
  getAvailableSlots,
} from "@/controllers/doctor";
import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  addDoctor(req, res);
});

router.post("/:doctorId/slots", (req, res) => {
  addSlots(req, res);
});

router.get("/:doctorId/bookings", (req, res) => {
  getAllBookedAppointments(req, res);
});

router.get("/:doctorId/available_slots", (req, res) => {
  getAvailableSlots(req, res);
});

export default router;
