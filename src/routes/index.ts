import express from "express";
import DoctorRoute from "./doctor";
import SlotRoute from "./slot";

const router = express.Router();

router.use("/doctor", DoctorRoute);
router.use("/slot", SlotRoute);

export default router;
