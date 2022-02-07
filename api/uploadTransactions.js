const express = require('express')
const router = express.Router()

router.get('/', async (req, res, next) => {
  const email = req.body.email
  const response = `you hit the upload transactions endpoint ${email}!`
  res.status(200).send(response)
})

module.exports = router