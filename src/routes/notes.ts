import express from "express";
import * as  NoteController from "../controllers/notes";
// import env from "../utils/validateEnv";

const router = express.Router();

// router.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", env.FRONTEND_URL);
//     res.header("Access-Control-Allow-Credentials", "true");
//     // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

router.get("/", NoteController.getNotes);
router.get("/:noteId", NoteController.getNote);
router.post("/", NoteController.createNote);
router.patch("/:noteId", NoteController.updateNote);
router.delete("/:noteId", NoteController.deleteNote);

export default router;