import express from "express";
import SavedTimeline from "../models/SavedTimeline.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateUser, async (req, res) => {
  try {
    const { name, config, notes } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const doc = await SavedTimeline.create({
      userId: req.user._id,
      name: name.trim(),
      config: {
        selectedLayerIds: config?.selectedLayerIds ?? [],
        categoryByLayerId: config?.categoryByLayerId ?? {},
        yearRange: config?.yearRange ?? [1500, 2000],
      },
      notes: typeof notes === "string" ? notes : "",
    });

    return res.status(201).json({ success: true, response: doc });
  } catch (err) {
    console.error("POST /api/saved-timelines error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save timeline",
      error: err.message,
    });
  }
});

router.get("/", authenticateUser, async (req, res) => {
  try {
    const docs = await SavedTimeline.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("_id name createdAt updatedAt");

    return res.json({ success: true, response: docs });
  } catch (err) {
    console.error("GET /api/saved-timelines error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved timelines",
      error: err.message,
    });
  }
});

router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const doc = await SavedTimeline.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Saved timeline not found",
      });
    }

    return res.json({ success: true, response: doc });
  } catch (err) {
    console.error("GET /api/saved-timelines/:id error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved timeline",
      error: err.message,
    });
  }
});

router.patch("/:id", authenticateUser, async (req, res) => {
  try {
    const { name, notes } = req.body;

    const update = {};
    if (typeof name === "string") update.name = name.trim();
    if (typeof notes === "string") update.notes = notes;

    const doc = await SavedTimeline.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: update },
      { new: true },
    );

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Saved timeline not found",
      });
    }

    return res.json({ success: true, response: doc });
  } catch (err) {
    console.error("PATCH /api/saved-timelines/:id error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update saved timeline",
      error: err.message,
    });
  }
});

router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const result = await SavedTimeline.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Saved timeline not found",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/saved-timelines/:id error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete saved timeline",
      error: err.message,
    });
  }
});

export default router;
