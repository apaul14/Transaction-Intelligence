const express = require('express')
const router = express.Router()
const utils = require('./utils')

const mockDataStore = []

// router.get('/', async (req, res, next) => {
//   const email = req.body.email
//   const response = `you hit the upload transactions endpoint ${email}!`
//   res.status(200).send(response)
// })

router.post('/', async (req, res, next) => {
  try {
    mockDataStore.push(req.body)
    const data = mockDataStore

    const response = utils.processTransactions(req.body.transactions)

    res.status(201).send(response)
  } catch (error) {
    next(error)
  }
})

module.exports = router
