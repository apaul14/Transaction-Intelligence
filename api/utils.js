const utils = {

  findRecurringTransactions (transactions){
    const returnVal = []
    // console.log('first log->',transactions)
    // console.log(this.compareTransactionDescriptions(transactions))

    const recurringTransactions = this.compareTransactionDescriptions(transactions)
    // let recurring = this.compareTransactionDescriptions(transactions)
    // console.log("recurring in func", recurring)
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
  compareAmounts(transactions) {
    
  }
}

module.exports = utils
