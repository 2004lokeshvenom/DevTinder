const mongoose= require("mongoose");
const connectDB= async()=>{
    await mongoose.connect("mongodb+srv://lokesh:ImyvQOsLkkLO2JaK@legendvenom.zaaf7pk.mongodb.net/Projects");
}
module.exports=connectDB;