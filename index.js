import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { Router } from "express";
import UserModel from "./model/userModel.js";
import bcrypt from "bcrypt";
import messageModel from "./model/messageModel.js";
import { Server } from "socket.io";

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

const setAvatar = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const avatarImage = req.body.image;
        const userData = await UserModel.findByIdAndUpdate(userId, {
            isAvatarImageSet: true,
            avatarImage,
        });
        return res.json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
        });
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find({ _id: { $ne: req.params.id } }).select([
            "email",
            "username",
            "avatarImage",
            "_id",
        ]);
        return res.json(users);

    } catch (error) {
        next(error);
    }
};

const logOut = (req, res, next) => {
    try {
        if (!req.params.id) return res.json({ msg: "User id is required " });
        onlineUsers.delete(req.params.id);
        return res.status(200).send();
    } catch (ex) {
        next(ex);
    }
};

//MessagesController
const addMessage = async (req, res, next) => {
    try {
        const { from, to, message } = req.body;
        const data = await messageModel.create({
            message: { text: message },
            users: [from, to],
            sender: from
        });
        if (data) return res.json({ msg: "msg yspeshno dobavleno" });
        return res.json({ msg: "failed ;(" })
    } catch (error) {
        next(error);
    }
};

const getAllMessage = async (req, res, next) => {
    try {
        const { from, to } = req.body;
        const messages = await messageModel.find({
            users: {
                $all: [from, to],
            },
        }).sort({ updatedAt: 1 });
        const projectMessages = messages.map((msg) => {
            return {
                fromSelf: msg.sender.toString() === from,
                message: msg.message.text,
            };
        });
        res.json(projectMessages);
    } catch (error) {
        next(error)
    }
};




//UserRoutes
const uRouter = Router();
uRouter.post("/register", register);
uRouter.post("/login", login);
uRouter.post("/setAvatar/:id", setAvatar);
uRouter.get("/allusers/:id", getAllUsers);
uRouter.get("/logout/:id", logOut);

//MsgRoutes
const mRouter = Router();
mRouter.post("/addmsg/", addMessage);
mRouter.post("/getmsg/", getAllMessage);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", uRouter)
app.use("/api/messages", mRouter)

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


const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        }
    });
});