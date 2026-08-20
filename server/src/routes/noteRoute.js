import { Hono } from "hono";

import { getNotesController, getSpecificeNote, noteContoller, noteRevoke } from "../controllers/noteController.js";
import authMiddleware from "../middleware/authmiddleware.js";

const route=new Hono();


route.get("/",authMiddleware,getNotesController)
route.post("/new",authMiddleware,noteContoller);
route.get("/:id",authMiddleware,getSpecificeNote)
route.patch("/:id/revoke",authMiddleware,noteRevoke)


export default route