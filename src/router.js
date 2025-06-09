import express from "express";
import {getWord, addWord, addWordTest, deleteWord} from "./controller.js"

const router = express.Router();

router.get("/", getWord);
router.post("/", addWord);
//router.post("/test", addWordTest);
router.delete("/:id", deleteWord);

export default router;
