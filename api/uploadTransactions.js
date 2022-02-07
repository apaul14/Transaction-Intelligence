const express = require('express')
const router = express.Router()

const mockDataStore = []

// router.get('/', async (req, res, next) => {
//   const email = req.body.email
//   const response = `you hit the upload transactions endpoint ${email}!`
//   res.status(200).send(response)
// })

router.post('/', async (req, res, next) => {
  try {
    console.log(req.body)
    mockDataStore.push(req.body)
    
    res.status(201).send(mockDataStore)
  } catch (error) {
    next(error)
  }
  
})
// console.log(JSON.parse(req.body))
    // const data = JSON.parse(req.body)
    //mockDataStore.concat(data)
    // const email = req.body.email
    // const response = `you hit the upload transactions endpoint ${email}!`

module.exports = router