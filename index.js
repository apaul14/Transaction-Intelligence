const express = require('express')
const cors = require('cors')
// const session = require("express-session")

const PORT = process.env.PORT || 8080// const db = require('./db')
const app = express()

// BODY PARSER
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// app.use(
//   session({
//     secret: "Super secret secret",
//     resave: true,
//     saveUninitialized: false,
//     cookie: { secure: false, httpOnly: false }
//   })
// )

app.use(cors({
  origin: 'http://localhost:3000',//
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
  credentials: true
}))

//Mount on API
app.use('/api', require('./api'))
//START BACKEND SERVER FUNCTIOON
const serverRun = () => {
  app.listen(PORT, () => {
    console.log(`Live on port : ${PORT}`)  })
}//DB Sync Function
//Optional parameters
// {force:true} - drops current tables and places new empty tables
//{alter:true} - This checks what is the current state of the table in the database (which columns it has, what are their data types, etc), and then performs the necessary changes in the table to make it match the model.

// const syncDb = () => db.sync()
// Connects to //postgres://localhost:5432/dbname

//Run server and sync DB
// syncDb()
serverRun()

module.exports = app
