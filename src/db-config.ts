import env from "./utils/validateEnv";
import { Sequelize } from "sequelize";

const db = new Sequelize(
    env.MYSQL_DB_NAME,
    env.MYSQL_DB_USER,
    env.MYSQL_DB_PASS,
    {
        host: env.MYSQL_DB_HOST,
        dialect: 'mysql'
    }
);

// db.authenticate()
//     // mongoose.connect(env.MONGO_CONNECTION_STRING)
//     .then(() => {
//         // console.log("Mongoose connected");
//         console.log("MySQL DB connected");
//     }).catch((e) => {
//         // console.log("DB Error: Could not connect to MongoDB");
//         console.log("DB Error: Could not connect to MySQL DB");
//         console.error(e.message);
//     });

export default db;