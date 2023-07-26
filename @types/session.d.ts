import session from 'express-session';

declare module 'express-session' {
    export interface SessionData {
        userId: number;
    }
}

// import mongoose from "mongoose";

// declare module "express-session" {
//     interface SessionData {
//         // userId: mongoose.Types.ObjectId;
//     }
// }