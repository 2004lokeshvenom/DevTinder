const validator=require("validator");

const validateuser=(req)=>{
    const {firstName,lastName,email,password}=req.body;

    if(!validator.isEmail(email)){
        throw new Error("ERROR email must be valid");
    }
    else if (!firstName || !lastName){
        throw new Error("Error name must be there");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("error strong password needed");
    }
}

module.exports={
    validateuser
}