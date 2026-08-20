import "dotenv/config"

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import {cors} from "hono/cors"

import connectDb from "./src/config/db.js"
import authRoute from "./src/routes/authRoute.js";
import noteRoute from "./src/routes/noteRoute.js";
import shareRoute from "./src/routes/shareRoute.js";
const PORT=process.env.PORT ||5001

const app=new Hono();

app.use("/api/*",cors({
  origin:["http://localhost:3000",
     "https://note-sharing-frontend.onrender.com",
  ],
  credentials:true,
}))

app.get("/",async(c)=>{
    return c.json({message:"not sharied api is runnign"})
})
app.route("/api/auth",authRoute);
app.route("/api/notes",noteRoute);
app.route("/api/share",shareRoute)


connectDb()
serve({
    fetch:app.fetch,
    port:PORT
})


console.log(`server is running port ${PORT}` )

