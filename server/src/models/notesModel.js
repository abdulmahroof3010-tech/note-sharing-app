import mongoose,{Schema} from "mongoose";

const noteSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true

    },
    title:{
        type:String,
        required:true,
    },
    content:{
         type:String,
         required:true
    },
    shareToken:{
        type:String,
        required:true,
        unique:true,
        

    },
    shareType:{
        type:String,
        enum:["one-time","time-based"],
        required:true
    },
    accessType:{
        type:String,
        enum:["public","password-protected"],
        required:true
    },
    passwordHash:{
        type:String,
        select:false
        
    },
    expiresAt:{
        type:Date
    },
    used:{
        type:Boolean,
        default:false,
    },
    revoked:{
        type:Boolean,
        default:false

    },
    viewCount:{
        type:Number,
        default:0,
    },


},{timestamps:true});

const noteModel=mongoose.model("Notes",noteSchema);

export default noteModel;