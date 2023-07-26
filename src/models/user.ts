import db from "../db-config";
import { DataTypes } from "sequelize";
import Notes from "./note";

const userSchema = db.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    defaultScope: {
        attributes: { exclude: ['password'] }
    }
});

userSchema.hasMany(Notes);

export default userSchema;

/*
import { InferSchemaType, Schema, model } from "mongoose";

const userSchema = new Schema({
    username: { type: String, require: true, unique: true },
    email: { type: String, require: true, unique: true, select: false },
    password: { type: String, require: true, select: false },
});

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);
*/