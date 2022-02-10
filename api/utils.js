const formatDate = require('date-fns/format')
const differenceInMonths = require('date-fns/differenceInMonths')
const differenceInWeeks = require('date-fns/differenceInWeeks')
const differenceInYears = require('date-fns/differenceInYears')
const addDays = require('date-fns/addDays')



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
    this.determineTransactionPeriodicity(calculateMeanandSTDDEV)
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
  determineTransactionPeriodicity(transactions) {
    console.log('analyze', transactions)
    //identify and format dates
    for (let key in transactions) {
      let periodDetectedFlag = false
      let dates = transactions[key].dates
      let formattedDates = []
      //console.log('dates', dates)
      
      for (let i = 0; i < dates.length; i++) {
        let element = dates[i]['date']
        let formattedDate = new Date(element)
        formattedDates.push(formattedDate)
        //let formattedDate = formatDate(element, 'w')
        //console.log('elem', element, formattedDate)
        // for (let j = 1; j < dates.length; j++) {

        // }

      }
      formattedDates.sort((a,b) => a - b)
      console.log('datesarray', formattedDates)

      //test against comparison windows. each subsequent test only runs if periodicity not detected previously
        //yearly
        if (!periodDetectedFlag) {
          for (let i = 0; i <= formattedDates.length - 2; i++) {
            let firstDate = formattedDates[i]
            let secondDate = formattedDates[i + 1]
            //add days to acceptance window in order to account for leap year, slightly off-schedule billing, etc.
            let paddedDate = addDays(secondDate, 60)
            //console.log('years', differenceInYears(paddedDate, firstDate),'months', differenceInMonths(secondDate, firstDate),'days', differenceInDays(secondDate, firstDate))
            // console.log(i, firstDate, paddedDate)
            // console.log(formattedDates.length, i === formattedDates.length - 2)
            if (differenceInYears(paddedDate, firstDate) !== 1) {
              // console.log(firstDate, paddedDate)
              break
            }
            else if (differenceInYears(paddedDate, firstDate) === 1 && i === formattedDates.length - 2) {
              // console.log(formattedDates.length, i, paddedDate)
              // console.log('yearly')
              transactions[key]['periodicity'] = 'annual'
              // console.log(transactions)
              periodDetectedFlag = true
            }
          }
        }
          //monthly
        if (!periodDetectedFlag) {
          for (let i = 0; i <= formattedDates.length - 2; i++) {
          let firstDate = formattedDates[i]
          let secondDate = formattedDates[i + 1]
          //add days to acceptance window in order to account for leap year, slightly off-schedule billing, etc.
          let paddedDate = addDays(secondDate, 7)
          //console.log('years', differenceInYears(paddedDate, firstDate),'months', differenceInMonths(secondDate, firstDate),'days', differenceInDays(secondDate, firstDate))
          // console.log(i, firstDate, paddedDate)
          // console.log(formattedDates.length, i === formattedDates.length - 2)
          if (differenceInMonths(paddedDate, firstDate) !== 1) {
            //console.log(firstDate, paddedDate)
            break
          }
          else if (differenceInMonths(paddedDate, firstDate) === 1 && i === formattedDates.length - 2) {
            // console.log(formattedDates.length, i, paddedDate)
            // console.log('monthly')
            transactions[key]['periodicity'] = 'monthly'
            // console.log(transactions)
            periodDetectedFlag = true
          }
        }
      }
      if (!periodDetectedFlag) {
        for (let i = 0; i <= formattedDates.length - 2; i++) {
        let firstDate = formattedDates[i]
        let secondDate = formattedDates[i + 1]
        //add days to acceptance window in order to account for weekends, slightly off-schedule billing, etc.
        let paddedDate = addDays(secondDate, 3)
        //console.log('years', differenceInYears(paddedDate, firstDate),'months', differenceInMonths(secondDate, firstDate),'days', differenceInDays(secondDate, firstDate))
        // console.log(i, firstDate, paddedDate)
        // console.log(formattedDates.length, i === formattedDates.length - 2)
        if (differenceInWeeks(paddedDate, firstDate) !== 1) {
          // console.log(firstDate, paddedDate)
          break
        }
        else if (differenceInWeeks(paddedDate, firstDate) === 1 && i === formattedDates.length - 2) {
          //console.log(formattedDates.length, i, paddedDate)
          //console.log('weekly')
          transactions[key]['periodicity'] = 'weekly'
          //console.log(transactions)
          periodDetectedFlag = true
        }
      }
    }

    }
    console.log(transactions)
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
  }
}

module.exports = utils
