import { register, login, setAvatar, getAllUsers, logOut } from "../controllers/userController.mjs";
import { Router } from "express";
export const uRouter = Router();

uRouter.post("/register", register);
uRouter.post("/login", login);
uRouter.post("/setAvatar/:id", setAvatar);
uRouter.get("/allusers/:id", getAllUsers);
uRouter.get("/logout/:id", logOut);






