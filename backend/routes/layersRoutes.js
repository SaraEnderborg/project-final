import express from "express";
import { listLayers, listLayerEvents } from "./layers.controller.js";

const router = express.Router();

router.get("/", listLayers);
router.get("/:id/events", listLayerEvents);

export default router;
