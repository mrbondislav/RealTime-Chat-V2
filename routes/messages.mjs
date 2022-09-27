import { Router } from "express";
import { addMessage, getAllMessage } from "../controllers/messageController.mjs";

export const mRouter = Router();

mRouter.post("/addmsg/", addMessage);
mRouter.post("/getmsg/", getAllMessage);
