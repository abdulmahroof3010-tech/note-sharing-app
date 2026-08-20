import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DataBase Connected Successfuly")
    }catch(e){
        console.log("DataBase Connected Failed",e);
        process.exit(1)
    }
}

export default connectDB;