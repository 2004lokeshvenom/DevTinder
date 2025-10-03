// middlewares/auth.js
const hellovenom2key = (req,res,next)=>{
    const authkey="xyz";
    const authentication = authkey==="xyz";
    if(!authentication){
        console.log("bad authkey");
        return res.status(401).send("unauthorized authentication");
    }
    console.log("auth key successfully");
    next();
}

const venomkey = (req,res,next)=>{
    const authkey="xyz";
    const authentication = authkey==="xyz";
    if(!authentication){
        console.log("bad authkey");
        return res.status(401).send("unauthorized authentication");
    }
    console.log("auth key successfully");
    next();
}

module.exports = {
    hellovenom2key,
    venomkey
};
