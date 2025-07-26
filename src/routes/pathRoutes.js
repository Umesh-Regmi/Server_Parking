import express from "express";
import { getShortestPath } from "../controllers/pathController.js";

const router = express.Router();

router.post("/", getShortestPath);

export default router;
