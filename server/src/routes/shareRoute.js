import { Hono } from "hono";
import {sharePublicNoteController,unlockShareNoteController} from "../controllers/shareController.js";
import { rateLimitMiddleware } from "../middleware/rateLimiterMiddleware.js";

const route=new Hono();

route.get("/:token",sharePublicNoteController);
route.post("/:token/unlock",rateLimitMiddleware,unlockShareNoteController)

export default route;