import { RequestHandler } from "express";
import NoteModel from "../models/note";
import createHttpError from "http-errors";
// import mongoose from "mongoose";
import { assertIsDefined } from "../utils/assertIsDefined";

//Specifying RequestHandler as type, TypeScript can infer the types of arguments
export const getNotes: RequestHandler = async (req, res, next) => {
    // res.send("Hello, World");
    const authenticatedUserId = req.session.userId || req.sess_user_id;

    // let authenticatedUserId;
    // if (req.headers.authorization) {
    //     authenticatedUserId = new mongoose.Types.ObjectId(req.headers.authorization.split(' ')[1]);
    // } else {
    //     authenticatedUserId = req.session.userId;
    // }


    try {
        assertIsDefined(authenticatedUserId);
        // throw Error("Forcing error test!");

        const notes = await NoteModel.findAll({ where: { userId: authenticatedUserId } });

        //const notes = await NoteModel.find({ userId: authenticatedUserId }).exec();
        res.status(200).json(notes);
    } catch (err) {
        next(err);//go to error handler middleware
    }
}

export const getNote: RequestHandler = async (req, res, next) => {
    const noteId = req.params.noteId;
    const authenticatedUserId = req.session.userId || req.sess_user_id;
    // let authenticatedUserId;
    // if (req.headers.authorization) {
    //     authenticatedUserId = new mongoose.Types.ObjectId(req.headers.authorization.split(' ')[1]);
    // } else {
    //     authenticatedUserId = req.session.userId;
    // }


    try {
        assertIsDefined(authenticatedUserId);

        await NoteModel.findByPk(noteId).then((record) => {
            if (record === null) {
                throw createHttpError(404, "Note not found");
            } else {
                if (!record?.dataValues("userId").equals(authenticatedUserId)) {
                    throw createHttpError(401, "You cannot access this note");
                } else {
                    res.status(200).json(record);
                }
            }
        });

        /*
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, "Invalid note id");
        }

        const note = await NoteModel.findById(noteId).exec();

        if (!note) {
            throw createHttpError(404, "Note not found");
        }

        if (!note.userId?.equals(authenticatedUserId)) {
            throw createHttpError(401, "You cannot access this note");
        }
        */

        // res.status(200).json(note);
    } catch (err) {
        next(err);//go to error handler middleware
    }
}

interface CreateNoteType {
    title?: string, //this field is required but we want to check it manually, if request body has it or not
    text?: string //this field is optional
}

//unknown is the type-safe counterpart of any. Anything is assignable to unknown, but unknown isn’t assignable to anything but itself and any without a type assertion or a control flow based narrowing. Likewise, no operations are permitted on an unknown without first asserting or narrowing to a more specific type.

//request body is the third argument in RequestHandler and that is the only paramer we need right now, hence rest are unknown
export const createNote: RequestHandler<unknown, unknown, CreateNoteType, unknown> = async (req, res, next) => {
    // throw Error("Forcing error test!");
    // console.log(req.body);
    const title = req.body.title;
    const text = req.body.text;
    const authenticatedUserId = req.session.userId || req.sess_user_id;

    // let authenticatedUserId;
    // if (req.headers.authorization) {
    //     authenticatedUserId = new mongoose.Types.ObjectId(req.headers.authorization.split(' ')[1]);
    // } else {
    //     authenticatedUserId = req.session.userId;
    // }


    try {
        assertIsDefined(authenticatedUserId);
        if (!title) {
            //400 is bad request
            throw createHttpError(400, "Note body is missing title parameter");
        }

        // const newNote = await NoteModel.create({
        await NoteModel.create({
            userId: authenticatedUserId,
            title: title,
            text: text
        }).then((newNote => {
            res.status(201).json(newNote);
        }))

        // res.status(201).json(newNote);

    } catch (err) {
        next(err);//go to error handler middleware
    }
}

interface UpdateNoteParams {
    noteId: string
}

interface UpdateNoteBody {
    title?: string
    text?: string
}

export const updateNote: RequestHandler<UpdateNoteParams, unknown, UpdateNoteBody, unknown> = async (req, res, next) => {
    const noteId = req.params.noteId;
    const noteTitle = req.body.title;
    const noteText = req.body.text;
    const authenticatedUserId = req.session.userId || req.sess_user_id;
    // let authenticatedUserId;
    // if (req.headers.authorization) {
    //     authenticatedUserId = new mongoose.Types.ObjectId(req.headers.authorization.split(' ')[1]);
    // } else {
    //     authenticatedUserId = req.session.userId;
    // }


    try {
        assertIsDefined(authenticatedUserId);

        if (!noteTitle) {
            throw createHttpError(400, "Title paramter not found in Body")
        }

        const note = await NoteModel.findOne({ where: { id: noteId } });

        if (note === null) {
            throw createHttpError(404, "Note not found");
        } else {

            await NoteModel.update(
                { "title": noteTitle, text: noteText },
                { where: { id: noteId } }
            ).then(async (success) => {
                let updatedNote = await NoteModel.findOne({ where: { id: noteId } });
                console.log("updated note is", updatedNote);
                res.status(200).json(updatedNote);
            });
        }

        /*
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, "Invalid note id");
        }

        if (!noteTitle) {
            throw createHttpError(400, "Title paramter not found in Body")
        }

        const note = await NoteModel.findById(noteId).exec();

        if (!note) {
            throw createHttpError(404, "Note not found");
        }

        if (!note.userId?.equals(authenticatedUserId)) {
            throw createHttpError(401, "You cannot access this note");
        }

        note.title = noteTitle;
        note.text = noteText;

        const updatedNote = await note.save();

        //Alternate way to update note
        // NoteModel.findByIdAndUpdate(note);// But this is redundant as we have already checked if note exists above

        res.status(200).json(updatedNote);
        */
    } catch (err) {
        next(err);//go to error handler middleware
    }
}

export const deleteNote: RequestHandler = async (req, res, next) => {
    const noteId = req.params.noteId;
    const authenticatedUserId = req.session.userId || req.sess_user_id;
    // let authenticatedUserId;
    // if (req.headers.authorization) {
    //     authenticatedUserId = new mongoose.Types.ObjectId(req.headers.authorization.split(' ')[1]);
    // } else {
    //     authenticatedUserId = req.session.userId;
    // }


    try {
        assertIsDefined(authenticatedUserId);

        const note = await NoteModel.findOne({ where: { id: noteId } });

        if (note === null) {
            throw createHttpError(404, "Note not found");
        } else {
            await note.destroy();
            res.sendStatus(204);//since we are not sending body here, so instead of status do sendStatus
        }


        /*
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, "Invalid note Id");
        }

        const note = await NoteModel.findById(noteId).exec();

        if (!note) {
            throw createHttpError(404, "Note not found");
        }

        if (!note.userId?.equals(authenticatedUserId)) {
            throw createHttpError(401, "you cannot access this note");
        }

        await note.deleteOne();

        res.sendStatus(204);//since we are not sending body here, so instead of status do sendStatus
        */


    } catch (err) {
        next(err);//go to error handler middleware
    }
}