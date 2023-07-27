import { RequestHandler } from "express";
import { SessionData } from "express-session";
import createHttpError from "http-errors";
import SessionModel from "../models/session";

export const requiresAuth: RequestHandler = async (req, res, next) => {
    // console.log("========inside middleware==========");
    // console.log(req.session);
    // let sess_user_id = req.session.userId;
    if (req.headers.authorization) {
        let sess_user_id = req.headers.authorization.split(' ')[1];
        // console.log(`session id in token is: ${sess_user_id}`);
        await SessionModel.findOne({ where: { sid: sess_user_id } }).then((record) => {
            if (record !== null) {
                let stored_user_id = record?.getDataValue("data");
                // console.log(typeof stored_user_id);
                // console.log(`stored session data is: ${stored_user_id}`);
                let json_obj_record = JSON.parse(stored_user_id);
                req.sess_user_id = json_obj_record.userId;
                // req.session.userId = json_obj_record.userId;
            }
        });
    }
    // console.log(req.session);
    // console.log(req.body);
    // console.log(req.cookies);
    // console.log(`User Id in Session is ${req.sess_user_id}`);
    // console.log("========inside middleware==========");
    // console.log(req);

    // if (req.session.userId || sess_user_id) {
    if (req.sess_user_id) {
        // if (req.session.userId) {
        next();
    } else {
        // res.clearCookie("connect.sid");
        next(createHttpError(401, "User is not authenticated"));
    }
};