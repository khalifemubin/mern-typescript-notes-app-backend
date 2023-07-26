import { cleanEnv } from "envalid";
import { port, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
    MONGO_CONNECTION_STRING: str(),
    PORT: port(),
    SESSION_SECRET: str(),
    FRONTEND_URL: str(),
    MYSQL_DB_NAME: str(),
    MYSQL_DB_USER: str(),
    MYSQL_DB_PASS: str(),
    MYSQL_DB_HOST: str()
});