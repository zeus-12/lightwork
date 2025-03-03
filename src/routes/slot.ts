import { bookSlot } from "@/controllers/slot";
import express from "express";

const router = express.Router();

router.post("/:slotId/book", (req, res) => {
  bookSlot(req, res);
});

export default router;
