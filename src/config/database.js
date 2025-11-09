const mongoose = require('mongoose')
const connectDB = async () => {
  const mongoURI = process.env.DB_SECRET_LINK
  await mongoose.connect(mongoURI)
}
module.exports = connectDB
