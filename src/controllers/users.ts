import { RequestHandler } from "express";
import createHttpError from "http-errors";
import Usermodel from "../models/user";
import bcrypt from "bcryptjs";
import SessionModel from "../models/session";
import NotesModel from "../models/note";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
    const authenticatedUserId = req.session.userId || req.sess_user_id;
    try {
        // if (!authenticatedUserId) {
        //     throw createHttpError(401, "User not authenticated");
        // }
        // const user = await Usermodel.findById(authenticatedUserId).select("+email").exec();
        const user = await Usermodel.findByPk(authenticatedUserId);
        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }

    /*
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
    */
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

        const existingUsername = await Usermodel.findOne({ where: { username: username } });

        if (existingUsername) {
            throw createHttpError(409, "Username already exists. Please choose a new username");
        }

        const existingEmail = await Usermodel.findOne({ where: { email: email } });
        if (existingEmail) {
            throw createHttpError(409, "Email already exists. Please choose a new email");
        }

        const passwordHashed = await bcrypt.hash(passwordRaw, 10);

        // const newUser = await Usermodel.create({
        await Usermodel.create({
            username: username,
            email: email,
            password: passwordHashed,
        }).then((newUser) => {
            console.log(`Created newuser with user id ${newUser.getDataValue("id")} in session`);
            // req.session.userId = newUser.getDataValue("id");
            // req.session.save();
            // return res.status(201).json(newUser);

            let jsonData = { ...newUser, sessionID: req.sessionID };
            req.session.userId = newUser?.getDataValue("id");
            req.session.save((err) => {
                if (err) next(err)
                return res.status(201).send(jsonData);
            });

        })

        // req.session.userId = newUser.getDataValue("id");

        // return res.status(201).json(newUser);

        /*
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
        */
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

        const user = await Usermodel.findOne({ where: { username: username }, attributes: ['id', 'username', 'email', 'password'] });

        if (!user) {
            throw createHttpError(401, "Invalid Credentials");
        }

        const passwordMatch = await bcrypt.compare(password, user.getDataValue("password") as string);

        if (!passwordMatch) {
            throw createHttpError(401, "Invalid Credentials");
        }

        // console.log(`User id for session is :${user.getDataValue("id")}`);

        req.sess_user_id = user.getDataValue("id");
        req.session.userId = user.getDataValue("id");
        user.setDataValue("sessionID", req.sessionID);
        return res.status(201).json(user);

        /*
        const user = await Usermodel.findOne({ username: username }).select("+password +email").lean().exec();

        if (!user) {
            throw createHttpError(401, "Invalid Credentials");
        }

        const passwordMatch = await bcrypt.compare(password, user.password as string);

        if (!passwordMatch) {
            throw createHttpError(401, "Invalid Credentials");
        }

        req.session.userId = user._id;
        return res.status(201).send(user);
        // return res.status(201).send("User logged in successfully");
        */

    } catch (error) {
        next(error);
    }
}

export const logout: RequestHandler = async (req, res, next) => {
    if (req.headers.authorization) {
        let sess_user_id = req.headers.authorization.split(' ')[1];
        SessionModel.destroy({
            where: { sid: sess_user_id }
        })
    }

    res.sendStatus(200);

    // req.session.destroy(error => {
    //     if (error) {
    //         next(error)
    //     } else {
    //         res.sendStatus(200)
    //     }
    // });
}

export const deleteAccount: RequestHandler = async (req, res, next) => {
    if (req.headers.authorization) {
        let sess_user_id = req.headers.authorization.split(' ')[1];

        await SessionModel.findOne({ where: { sid: sess_user_id } }).then(async (record) => {
            if (record !== null) {
                let stored_user_id = record?.getDataValue("data");
                let json_obj_record = JSON.parse(stored_user_id);
                let delete_user_id = json_obj_record.userId;

                //Delete all notes
                await NotesModel.findOne({ where: { userId: delete_user_id } });

                //Delete the user
                await Usermodel.destroy({ where: { id: delete_user_id } });

                //Finally delete the sessions of this user
                await SessionModel.destroy({
                    where: { "data.userId": delete_user_id }
                })
            }

            res.sendStatus(204);
        });
    }



    // req.session.destroy(error => {
    //     if (error) {
    //         next(error)
    //     } else {
    //         res.sendStatus(200)
    //     }
    // });
}