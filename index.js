import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { Router } from "express";
import UserModel from "./model/userModel.js";
import bcrypt from "bcrypt";

//UserController
const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const usernameCheck = await UserModel.findOne({ username });
        if (usernameCheck)
            return res.json({ msg: "Username already used", status: false });
        const emailCheck = await UserModel.findOne({ email });
        if (emailCheck)
            return res.json({ msg: "Email already used", status: false });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            email,
            username,
            password: hashedPassword,
        });
        delete user.password;
        return res.json({ status: true, user });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await UserModel.findOne({ username });
        if (!user)
            return res.json({ msg: "Incorrect username or password", status: false });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.json({ msg: "Incorrect username or password", status: false });
        delete user.password;
        return res.json({ status: true, user });
    } catch (error) {
        next(error);
    }
};


//UserRoutes
const router = Router();
router.post("/register", register);
router.post("/login", login);


const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", router)

mongoose
    .connect("mongodb+srv://mrbondislav:root@cluster0.vxvl5.mongodb.net/chat?retryWrites=true&w=majority", {
    })
    .then(() => {
        console.log("DB connected")
    })
    .catch((err) => {
        console.log(err.message);
    });

const server = app.listen(5000, () => {
    console.log('Server started');
});
