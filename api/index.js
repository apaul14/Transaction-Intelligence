const router = require('express').Router();
module.exports = router;

router.use('/upload_historical_transactions', require('./uploadTransactions'));

router.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});
