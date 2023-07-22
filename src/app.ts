import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import NotesRoutes from "./routes/notes";
import UserRoutes from "./routes/users";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import cors from 'cors';
import session from "express-session";
import env from "./utils/validateEnv";
import MongoStore from "connect-mongo";
import { requiresAuth } from "./middleware/auth";

const path = require('path');

const app = express();
app.use(express.json());

// if (process.env.NODE_ENV === 'production') {
//     //*Set static folder up in production
//     app.use(express.static('../../client/build'));

//     app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../../client', 'build', 'index.html')));
// }

// app.use((_req, res, next) => {
//     res.header('Access-Control-Allow-Origin', [env.FRONTEND_URL]);
//     res.header('Access-Control-Allow-Credentials', 'true');
//     res.header('Access-Control-Allow-Headers', '*');

//     next();
// });

// app.use(cors({
//     credentials: true,
//     origin: [env.FRONTEND_URL],
//     allowedHeaders: 'Content-Type',
//     // exposedHeaders: ['Referer'],
// }));

// app.use(cors({
//     credentials: true,
//     origin: true,
//     // allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
//     exposedHeaders: 'Content-Type',
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
// }));

const allowedOrigins = [env.FRONTEND_URL];

const options: cors.CorsOptions = {
    credentials: true,
    origin: allowedOrigins
};

// Then pass these options to cors:
app.use(cors(options));
// app.use(cors<Request>());
// app.use((req: Request, res: Response, next: NextFunction) => {
//     next();
// }, cors({ maxAge: 84600 }));
// app.use((cors as (options: cors.CorsOptions) => express.RequestHandler)({}));
app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//     credentials: true,
//     origin: [env.FRONTEND_URL],
//     // exposedHeaders: ['Referer'],
// }));

app.use(morgan("combined"));

app.use(session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 100, //one day
        // maxAge: 20 * 1000 //test for 20 seconds (need to manually refresh to check)
        // secure: false,
        // httpOnly: false,
        // sameSite: 'none',
        // domain: env.FRONTEND_URL
    },
    rolling: true, //refresh cooking key as long as user is using the app
    store: MongoStore.create({
        mongoUrl: env.MONGO_CONNECTION_STRING
    })
}));

app.use("/api/users", UserRoutes);
// app.use("/api/notes", NotesRoutes);
app.use("/api/notes", requiresAuth, NotesRoutes);

app.use((req, res, next) => {
    //come to this middleware, when no previous endpoint is matched
    // next(Error("API endpoint not found"));
    next(createHttpError(404, "API endpoint not found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    // console.error(err);
    let errorMessage = "An unknown error occured";
    let statusCode = 500;
    // if (err instanceof Error) errorMessage = err.message;
    if (isHttpError(err)) {
        statusCode = err.status;
        errorMessage = err.message;
    }
    res.status(statusCode).json({ error: errorMessage })
});

export default app;