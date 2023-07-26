import app from "./app";
import env from "./utils/validateEnv";
// import mongoose from "mongoose";
import db from "./db-config";

const port = env.PORT;

(async function db_connect() {
    db.authenticate()
        // mongoose.connect(env.MONGO_CONNECTION_STRING)
        .then(async () => {
            // console.log("Mongoose connected");
            console.log("MySQL DB connected");

            await db.sync();

            app.listen(port, () => {
                console.log(`Server running on port ${port}`)
            });
        }).catch((e) => {
            // console.log("DB Error: Could not connect to MongoDB");
            console.log("DB Error: Could not connect to MySQL DB");
            console.error(e.message);
        });
})();
