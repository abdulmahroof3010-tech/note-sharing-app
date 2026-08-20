import noteModel from "../models/notesModel.js";
import crypto from "crypto"
import bcrypt from "bcryptjs"
import generateAccessKey from "../services/genrateAccessKey.js";



export const noteContoller=async(c)=>{
    try{
        const id=c.get("user");
        const {title,content,shareType,accessType,expiresAt}=await c.req.json();

        if(!title || !content || !shareType || !accessType ){
            return c.json({message:"all field is required"},400)
        }
    
        if(shareType==="time-based"){
            if(!expiresAt){
                return c.json({message:"Eexpire date is required for time based links"},400)
            }
            const expiryDate = new Date(expiresAt);
            
            if (Number.isNaN(expiryDate.getTime())) {
                return c.json(
                    { message: "Invalid expiry date" },
                    400
                );
            }
            
            if (expiryDate <= new Date()) {
                return c.json(
                    { message: "Expiry date must be in the future" },
                    400
                );
            }
        }
        

           let accessKey;
           let passwordHash;
        if(accessType==="password-protected"){
            accessKey= generateAccessKey();
            passwordHash=await bcrypt.hash(accessKey,12);
        }

        let shareToken= crypto.randomBytes(32).toString('hex');
       const note=await noteModel.create({
        userId:id.userId,
        title,
        content,
        shareToken:shareToken,
        shareType:shareType,
        accessType:accessType,
        expiresAt:shareType==="time-based" ? new Date(expiresAt):undefined,
        passwordHash:passwordHash,


       });
       const shareUrl=`${process.env.FRONTEND_URL}/share/${shareToken}`;

       if(accessType==="public"){
        return c.json({message:"note created successfuly",shareUrl},201)
       }
     
       return c.json({message:"note created successfull",shareUrl,accessKey:accessKey},201)

    }catch(e){
        console.log("checing the create not:",e)
        return c.json({message:"internal server error"},500)
    }
}

export const getNotesController=async(c)=>{
    try{
        const user=c.get("user");

        const notes=await noteModel.find({userId:user.userId});

        if (!notes) {
    return c.json({message: "Note not found" }, 404);
}

        return c.json({notes},200);
    }catch(e){
        console.log("geting all notes error",e)
        return c.json({message:"internal server error"},500)
    }
}


export const getSpecificeNote=async(c)=>{
    try{
        const id=c.req.param("id");
        const user=c.get("user");

        const note=await noteModel.findOne({_id:id,userId:user.userId});
        if (!note) {
            return c.json({message: "Note not found"}, 404);
}

        return c.json({note},200);
    }catch(e){
        return c.json({message:"internal server error",},500)
    }
}

export const noteRevoke=async(c)=>{
    try{

        const noteid=c.req.param("id");
        const user=c.get("user");

        const note=await noteModel.findOne({_id:noteid,userId:user.userId});

        if(!note){
            return c.json({message:"note not found"},404)
        }
        
        if(note.revoked){
            return c.json({message:"share link already revoked"},400);
        }

        note.revoked=true;
        await note.save();

        return c.json({message:"share link revoked successfuly"},200)

    }catch(e){
        return c.json({message:"internal server error"},500)
    }
}

