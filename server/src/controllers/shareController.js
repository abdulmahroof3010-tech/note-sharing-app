import noteModel from "../models/notesModel.js";
import bcrypt from "bcryptjs";



export const sharePublicNoteController=async(c)=>{
    try{
        const shareToken= c.req.param("token");

        const note=await noteModel.findOne({shareToken});

        if(!note){
            return c.json({message:"not found note"},404)
        }

        if (note.revoked) {
    return c.json({ message: "Share link has been revoked" }, 403);
}

      if (note.shareType === "time-based" &&
            note.expiresAt <= new Date()) {
            return c.json({ message: "Share link has expired" },410);
        }
        

        if (note.accessType !== "public") {
            return c.json({ message: "Password required", requiresPassword: true },401 );
}

    if(note.shareType ==='one-time'){
        const consumesNote=await noteModel.findOneAndUpdate(
            {shareToken,used:false,revoked:false},{$set:{used:true,},$inc:{viewCount:1}},{ returnDocument: "after" ,})
         
            if(!consumesNote){
                return c.json({message:"Share link has already been used"},410)
            }
            return c.json({title:consumesNote.title,content:consumesNote.content},);
    }



    const updatedNote=await noteModel.findOneAndUpdate({shareToken,revoked:false,},{$inc:{viewCount:1}},{ returnDocument: "after" });

    if(!updatedNote){
        return c.json({message:"share link are no longer available"},410)
    }
    
    return c.json({title:updatedNote.title,content:updatedNote.content},200)
    
    }catch(e){
        return c.json({message:"internal server error"},500)
    }
}




export const unlockShareNoteController=async(c)=>{
    try{
        const shareToken=c.req.param("token");

        const {accessKey}=await c.req.json();

        if(!accessKey){
            return c.json({message:"Access key is required"},400)
        }

        const note=await noteModel.findOne({shareToken}).select("+passwordHash");

    if(!note){
        return c.json({message:"note not found"},404);
    }

    if(note.revoked){
        return c.json({message:"share link have been revoked"},403)
    }

    if(note.shareType==="time-based" && note.expiresAt<=new Date()){
        return c.json({message:"share link has expired"},410)

    }

    if(note.accessType !== "password-protected"){
        return c.json({message:"This share link does not require a password"},400)
    }

    const isValid=await bcrypt.compare(accessKey,note.passwordHash);

    if(!isValid){
        return c.json({message:"invalid access key"},401);
    };

    if(note.shareType ==="one-time"){
        const consumesNote=await noteModel.findOneAndUpdate(
            {shareToken,used:false,revoked:false},{$set:{used:true},$inc:{viewCount:1}},{ returnDocument: "after" })
            
                if(!consumesNote){
                    return c.json({message:"share link has already been used"},410)
            
                }
                return c.json({title:consumesNote.title,content:consumesNote.content},200);
    }



    const updatedNote=await noteModel.findOneAndUpdate({shareToken,revoked:false},{$inc:{viewCount:1}},{ returnDocument: "after" });

    if(!updatedNote){
        return c.json({message:"share link is no longer available"},410);


    }

    return  c.json({title:updatedNote.title,content:updatedNote.content},200)


    }catch(e){

        return c.json({message:"internal server error"},500)

    }
}