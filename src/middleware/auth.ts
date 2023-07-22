import { RequestHandler } from "express";
import createHttpError from "http-errors";

export const requiresAuth: RequestHandler = (req, res, next) => {
    // console.log("========inside middleware==========");
    // let sess_user_id = "";
    // if (req.headers.authorization) {
    //     sess_user_id = req.headers.authorization.split(' ')[1];
    //     // console.log(`sess_user_id is ${sess_user_id}`);
    // }
    // console.log(req.session);
    // console.log(req.body);
    // console.log(req.cookies);
    // console.log(`User Id in Session is ${req.session.userId}`);
    // console.log("========inside middleware==========");
    // console.log(req);

    // if (req.session.userId || sess_user_id) {
    if (req.session.userId) {
        next();
    } else {
        // res.clearCookie("connect.sid");
        next(createHttpError(401, "User is not authenticated"));
    }
};