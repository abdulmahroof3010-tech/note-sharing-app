import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import userModel from "../models/userMode.js";


const authMiddleware=async(c,next)=>{
    try{
        const tokenkey=getCookie(c,"token");

        if(!tokenkey){
            return c.json({message:"token is not found"},401)
        }

        const decode=jwt.verify(tokenkey,process.env.TOKENKEY)

        const user=await userModel.findById(decode.id);

        if(!user){
            return c.json({message:"user not found"},401)
        }

       c.set("user",{
            email:user.email,
            userId:user._id,
        })

     await   next()

    }catch(e){
    return c.json({message:"Internal server error"},500)
    }
}

export default authMiddleware