import crypto from "crypto";

const generateAccessKey=()=>{
    const char="ABCDEFGH12345";

    let key="";

    for(let i=0;i<6;i++){
        const randomIndex=crypto.randomInt(0,char.length);
        key+=char[randomIndex]
    }

    return key
    console.log(key)
}

export default generateAccessKey