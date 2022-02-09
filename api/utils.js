const utils = {

  findRecurringTransactions (transactions){
    const returnVal = []
    // console.log('first log->',transactions)
    // console.log(this.compareTransactionDescriptions(transactions))

    const recurringTransactions = this.compareTransactionDescriptions(transactions)
    // let recurring = this.compareTransactionDescriptions(transactions)
    // for (let key in recurringTransactions) {
    //   this.findAverageAmount(recurringTransactions[key])
    // }
    const calculateMeanandSTDDEV = this.findAverageandStandardDeviation(recurringTransactions)
  },
  compareTransactionDescriptions (transactions){
    //const recurring = []
    const recurring = {}

    // {
    //   "netflix": {
    //     frequency: 2,
    //     dates: [
    //       {date1: amount},
    //       {date2: amount}
    //     ]
    //   }
    // }

      //calculate transaction totals
    for (let transaction of transactions) {
      //console.log('axshuns->', transaction.description)
      const counterParty = transaction.description
      const date = transaction.date
      const amount = transaction.amount
    //   
    // if (recurring[counterParty]) {
    //   recurring[counterParty] ++
    // }
    //   else recurring[counterParty] = 1
    // }


    //DONT USE
      // if (recurring[counterParty]['frequency']) {
      //   recurring[counterParty]['frequency'] ++
      // } else {
      //   recurring[counterParty] = counterParty
      //   recurring[counterParty] = {frequency: 1}
      // }

      if (recurring?.[counterParty]?.['frequency']) {
        recurring[counterParty]['frequency'] ++
        recurring[counterParty]['dates'].push({date, amount})
      }
      else {
        recurring[`${counterParty}`] = {
          frequency: 1,
          dates: [{date, amount}]
        }
        // recurring['counterParty']['frequency'] = 1
        // recurring.counterParty.dates = [{date1: amount}]
        
        
        }
      }
      //console.log('recurring', recurring)

    //filter out non recurring transactions
    for (let counterParty in recurring) {
      if (recurring[counterParty]['frequency'] < 2) delete recurring[counterParty]
    }

    //console.log('recurring filtered', recurring)

    return recurring
  },
  findAverageandStandardDeviation(transactions) {
    //console.log('trans', transactions)
    for (let key in transactions) {
      let transactionDates = transactions[key]['dates']
      let transactionAmounts = []

      for (let i = 0; i < transactionDates.length; i++) {
        let date = transactionDates[i]
        transactionAmounts.push(date['amount'])
        //console.log('amt', transactionAmounts)
      }
      //calculate Average
      let averageAmount = transactionAmounts.reduce((acc, cum) => acc + cum, 0) / transactionAmounts.length
      transactions[key]['averageAmount'] = averageAmount

       //calculate variance
      let squareDiffs = transactionAmounts.map((value) => {
        let diff = value - averageAmount;
        diff *= diff
        return diff
      })
      let variance = squareDiffs.reduce((acc, cum) => acc + cum, 0) / squareDiffs.length
      //console.log('variance', squareDiffs, variance)
      //calculate std deviation
      let stdDeviation = Math.sqrt(variance)
      stdDeviation = +stdDeviation.toFixed(2)
      transactions[key]['stdDeviation'] = stdDeviation
    }
    
    //console.log('trans2', transactions)
    return transactions
  },
  // findAndCompareStandardDeviation(transactions) {
  //   console.log(transactions)

  // }
}

module.exports = utils
