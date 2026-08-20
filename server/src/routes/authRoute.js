import { Hono } from "hono";
import { registerController ,loginController} from "../controllers/authController.js";
const route=new Hono();

route.get("/debug", (c) => {
  return c.json({
    message: "Auth route is working",
  });
});

route.post("/register",registerController);
route.post("/login",loginController)



export default route;   