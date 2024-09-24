import { Router } from "express";
import { getChatHistory } from "../controllers/message.controllers.js";

const router = Router();

router.route("/chat-history/:id").post(getChatHistory);

export default router;
