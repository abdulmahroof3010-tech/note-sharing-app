import mongoose,{Schema} from "mongoose";


const userSchema=new Schema({
    name:{type:String,
        required:true
    },
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true,select:false}
},{timestamps:true});

const userModel=mongoose.model("Users",userSchema);

export default userModel;