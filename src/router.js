import express from "express";
import {getWord, getDLEWord, addWord, deleteWord} from "./controller.js"

const router = express.Router();

router.get("/", getWord);
router.post("/", addWord);
//router.post("/test", addWordTest);
router.delete("/:id", deleteWord);
router.get("/api/dle/:word", getDLEWord);
export default router;
