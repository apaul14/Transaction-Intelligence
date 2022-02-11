const express = require('express')
const cors = require('cors')

const PORT = process.env.PORT || 8080// const db = require('./db')
const app = express()

// BODY PARSER
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(cors({
  origin: 'http://localhost:3000',//
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
  credentials: true
}))

//Mount on API
app.use('/api', require('./api'))


const serverRun = () => {
  app.listen(PORT, () => {
    console.log(`Live on port : ${PORT}`)  })
}//DB Sync Function
//Optional parameters

// const syncDb = () => db.sync()
// Connects to //postgres://localhost:5432/dbname

//Run server and sync DB
// syncDb()
serverRun()

module.exports = app
