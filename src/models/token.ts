import db from "../db-config";
import { DataTypes } from "sequelize";

const tokenSchema = db.define('Tokens', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    token: {
        type: DataTypes.STRING,
        unique: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: "id"
        }
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {});

export default tokenSchema;