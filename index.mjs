import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { uRouter } from "./routes/auth.mjs";
import { mRouter } from "./routes/messages.mjs";

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