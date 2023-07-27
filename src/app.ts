import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import NotesRoutes from "./routes/notes";
import UserRoutes from "./routes/users";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import cors from 'cors';
import session from "express-session";
import env from "./utils/validateEnv";
import { requiresAuth } from "./middleware/auth";
import db from "./db-config";


const app = express();
// app.set('trust proxy', 1);

// app.use((_req, res, next) => {
//     res.header('Access-Control-Allow-Origin', env.FRONTEND_URL);
//     res.header('Access-Control-Allow-Headers', '*');
//     res.header('Access-Control-Allow-Credentials', 'true');

//     next();
// });

app.use(express.json());
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({ credentials: true, origin: [env.FRONTEND_URL] }));

app.use(morgan("combined"));

const SequelizeStore = require("connect-session-sequelize")(
    session.Store
);
var sessionStore = new SequelizeStore({
    db: db,
});


if (process.env.NODE_ENV === 'production') {
    app.use(session({
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 100, //one day
            // maxAge: 20 * 1000 //test for 20 seconds (need to manually refresh to check)
            // secure: true,
            // httpOnly: false,
            // sameSite: 'none',
            // domain: env.FRONTEND_URL
        },
        rolling: true, //refresh cooking key as long as user is using the app
        store: sessionStore,
        // store: new SequelizeStore({
        //     db: db
        // })
        // store: MongoStore.create({
        //     mongoUrl: env.MONGO_CONNECTION_STRING
        // })
    }));
} else {
    app.use(session({
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 100, //one day
            // maxAge: 20 * 1000 //test for 20 seconds (need to manually refresh to check)
            // secure: false,
            // httpOnly: false,
            // sameSite: 'none',
            // domain: env.FRONTEND_URL
        },
        rolling: true, //refresh cooking key as long as user is using the app
        store: sessionStore,
        // store: new SequelizeStore({
        //     db: db
        // })
        // store: MongoStore.create({
        //     mongoUrl: env.MONGO_CONNECTION_STRING
        // })
    }));
}

sessionStore.sync();

/*
if (process.env.NODE_ENV === 'PRODUCTION') {
    let sess = {
        secret: env.SESSION_SECRET,
        saveUninitialized: true,
        resave: false,
        proxy: true,
        name: "app",
        cookie: {
            // secure: true, // This will only work if you have https enabled!
            httpOnly: false,
            // sameSite: 'none'
        }
    };

    app.use(session(sess));
};

if (process.env.NODE_ENV === 'DEVELOPMENT') {
    let sess = {
        secret: env.SESSION_SECRET,
        saveUninitialized: true,
        resave: false,
        proxy: true,
        name: "app",
        cookie: {
            httpOnly: true,
        }
    };

    app.use(session(sess));
};
*/

// app.options('*', cors()) // include before other routes
// app.options('/api/users', cors());
app.get("/", (req, res) => {
    res.send("This is a root api endpoint");
});
app.use("/api/users", UserRoutes);
// app.options('/api/notes', cors());
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
    // console.log(`isHttpError: ${isHttpError(err)}`);

    if (isHttpError(err)) {
        statusCode = err.status;
        errorMessage = err.message;
    }

    console.log(errorMessage);
    // res.status(statusCode).json({ error: errorMessage })
    return res.status(statusCode).send({ error: errorMessage });
});

export default app;