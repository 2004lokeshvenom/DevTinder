const express = require('express') //importing express server
const app = express() //express server
const connectDB = require('./config/database') //connecting data base to our mongodb account
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/authroute')
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request')
const userRouter = require('./routes/user')
const cors = require('cors');

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/', authRouter)
app.use('/', profileRouter)
app.use('/', requestRouter)
app.use('/', userRouter)

connectDB()
  .then(() => {
    console.log('connection established successfully with database')
    app.listen(7676, () => {
      console.log('server is succesfully on port 7676')
    })
  })
  .catch(() => {
    console.log('something wrong in connecting database')
  })
