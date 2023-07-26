// import { InferSchemaType, Schema, model } from "mongoose";
import db from "../db-config";
import { DataTypes } from "sequelize";
import User from "./user";

const noteSchema = db.define('notes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: "id"
        }
    },
    title: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
    },
    text: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {});

export default noteSchema;
/*
const noteSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, require: true },
    title: { type: String, required: true },
    text: { type: String },
}, { timestamps: true });

type Note = InferSchemaType<typeof noteSchema>;

export default model<Note>("Note", noteSchema);
*/