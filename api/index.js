const router = require('express').Router();
module.exports = router;

router.use('/upload_historical_transactions', require('./uploadTransactions'));

router.get('/', async (req, res, next) => {
  const email = req.body.email
  const response = `you did it ${email}!`
  res.status(200).send(response)
})

router.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});
