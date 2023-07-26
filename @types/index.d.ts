import express from "express";

declare global {
    namespace Express {
        interface Request {
            sess_user_id?: number
        }
    }
}