import bcrypt from "bcrypt";
import UserModel from "../model/userModel.mjs";

export const register = async (req, res, next) => {
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

export const login = async (req, res, next) => {
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

export const setAvatar = async (req, res, next) => {
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

export const getAllUsers = async (req, res, next) => {
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

export const logOut = (req, res, next) => {
    try {
        if (!req.params.id) return res.json({ msg: "User id is required " });
        onlineUsers.delete(req.params.id);
        return res.status(200).send();
    } catch (ex) {
        next(ex);
    }
};

