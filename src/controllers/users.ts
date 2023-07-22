import { RequestHandler } from "express";
import createHttpError from "http-errors";
import Usermodel from "../models/user";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
    // const authenticatedUserId = req.session.userId;

    let authenticatedUserId;
    if (req.headers.authorization) {
        authenticatedUserId = new mongoose.Types.ObjectId(req.headers.authorization.split(' ')[1]);
    } else {
        authenticatedUserId = req.session.userId;
    }

    try {
        // if (!authenticatedUserId) {
        //     throw createHttpError(401, "User not authenticated");
        // }
        // const user = await Usermodel.findById(authenticatedUserId).select("+email").exec();
        const user = await Usermodel.findById(authenticatedUserId).select("+email").exec();
        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

interface signUpBody {
    username?: string,
    email?: string,
    password?: string
}

export const signUp: RequestHandler<unknown, unknown, signUpBody, unknown> = async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const passwordRaw = req.body.password;

    try {
        if (!username || !email || !passwordRaw) {
            throw createHttpError(400, "Parameters missing");
        }

        const existingUsername = await Usermodel.findOne({ username: username }).exec();
        if (existingUsername) {
            throw createHttpError(409, "Username already exists. Please choose a new username");
        }

        const existingEmail = await Usermodel.findOne({ email: email }).exec();
        if (existingEmail) {
            throw createHttpError(409, "Email already exists. Please choose a new email");
        }

        const passwordHashed = await bcrypt.hash(passwordRaw, 10);

        const newUser = await Usermodel.create({
            username: username,
            email: email,
            password: passwordHashed,
        });

        req.session.userId = newUser._id;

        return res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
}

interface loginBody {
    username?: string,
    password?: string
}

export const login: RequestHandler<unknown, unknown, loginBody, unknown> = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        if (!username || !password) {
            throw createHttpError(400, "Parameters missing");
        }

        const user = await Usermodel.findOne({ username: username }).select("+password +email").lean().exec();

        // console.log("=======userdata========");
        // console.log(user);
        // console.log("=======userdata========");

        if (!user) {
            throw createHttpError(401, "Invalid Credentials");
        }

        const passwordMatch = await bcrypt.compare(password, user.password as string);

        if (!passwordMatch) {
            throw createHttpError(401, "Invalid Credentials");
        }

        req.session.userId = user._id;
        //  userId = user._id;
        // req.session.save();
        console.log("=======login and return========");
        console.log(req.session);
        // console.log(user);
        console.log("=======login and return========");
        // return res.status(201).json(user);
        return res.status(201).send(user);
        // return res.status(201).send("User logged in successfully");

    } catch (error) {
        next(error);
    }
}

export const logout: RequestHandler = async (req, res, next) => {
    req.session.destroy(error => {
        if (error) {
            next(error)
        } else {
            res.sendStatus(200)
        }
    });
}