import db from "../db-config";
import { DataTypes } from "sequelize";
import Notes from "./note";

const sessionSchema = db.define('Sessions', {
    sid: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    expires: {
        type: DataTypes.DATE
    },
    data: {
        type: DataTypes.JSON,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {});

export default sessionSchema;