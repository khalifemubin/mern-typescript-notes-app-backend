"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const validateEnv_1 = __importDefault(require("./utils/validateEnv"));
// import mongoose from "mongoose";
const db_config_1 = __importDefault(require("./db-config"));
const port = validateEnv_1.default.PORT;
(function db_connect() {
    return __awaiter(this, void 0, void 0, function* () {
        db_config_1.default.authenticate()
            // mongoose.connect(env.MONGO_CONNECTION_STRING)
            .then(() => __awaiter(this, void 0, void 0, function* () {
            // console.log("Mongoose connected");
            console.log("MySQL DB connected");
            yield db_config_1.default.sync();
            app_1.default.listen(port, () => {
                console.log(`Server running on port ${port}`);
            });
        })).catch((e) => {
            // console.log("DB Error: Could not connect to MongoDB");
            console.log("DB Error: Could not connect to MySQL DB");
            console.error(e.message);
        });
    });
})();
