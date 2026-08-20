import userModel from "../models/userMode.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {setCookie} from "hono/cookie"
export const registerController=async(c)=>{
    

    try{
        const {name,email,password}=await c.req.json();

        if(!name || !email || !password){
           return  c.json({sucess:false,message:"required all fields"},400)
        }

        const exitingUser=await userModel.findOne({email});

        if(exitingUser){
            return c.json({sucess:false,message:"user already exits"},409)
        }

        const hashedpassword=await bcrypt.hash(password,12);

        const user=await userModel.create({
            name,
            email,
            password:hashedpassword,
        });

     return   c.json({message:"Registation successfull",},201);
    }catch(e){
        console.log("catching the error",e)
       return c.json({message:"internal server error"},500)
    }
}


export const loginController=async(c)=>{
    try{
        const {email,password}=await c.req.json();
       
        const isUser=await userModel.findOne({email}).select("+password");

        if(!isUser){
            return c.json({message:"Not have and account create account"},404)
        }
        
        const validate=await bcrypt.compare(password,isUser.password);

        if(!validate){
            return c.json({message:"Invalid password"},401)
        }
        
        const token=jwt.sign({id:isUser._id,email:isUser.email},process.env.TOKENKEY,{expiresIn:"1d"});
      
        setCookie(c,"token",token,{
            httpOnly:true,
            secure:false,
            sameSite:'Lax',
            path:'/',
        });
       return c.json({message:"login successfull",user:{name:isUser.name,email:isUser.email}},200)

    }catch(e){
       c.json({message:"internal server error"},500)
    }
}