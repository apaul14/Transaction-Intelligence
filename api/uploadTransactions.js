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
    //console.log(req.body)
    mockDataStore.push(req.body)
    const data = mockDataStore

    const response = {
      recurringTransactions: [],
      recurringValues: [],
      windowLimits: [],
      counterPartyLimits: []
    }
    //console.log('data in ->', data)

    
    // const recurringTransactions = utils.findRecurringTransactions(mockDataStore[0].transactions)
    const recurringTransactions = utils.findRecurringTransactions(req.body.transactions)
    for (let key in recurringTransactions) response.recurringTransactions.push(recurringTransactions)


    res.status(201).send(response)
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
