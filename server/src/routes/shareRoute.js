import { Hono } from "hono";
import {sharePublicNoteController,unlockShareNoteController} from "../controllers/shareController.js";


const route=new Hono();

route.get("/:token",sharePublicNoteController);
route.post("/:token/unlock",unlockShareNoteController)

export default route;