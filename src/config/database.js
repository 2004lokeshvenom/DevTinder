const mongoose = require('mongoose')
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://lokesh:ImyvQOsLkkLO2JaK@legendvenom.zaaf7pk.mongodb.net/DevTinder'
  await mongoose.connect(mongoURI)
}
module.exports = connectDB
