const formatDate = require('date-fns/format')
const differenceInMonths = require('date-fns/differenceInMonths')
const differenceInWeeks = require('date-fns/differenceInWeeks')
const differenceInYears = require('date-fns/differenceInYears')
const differenceInDays = require('date-fns/differenceInDays')
const addDays = require('date-fns/addDays')
const subYears = require('date-fns/subYears') //change to sub
// const subMonths = require('date-fns/subMonths')
const sub = require('date-fns/sub')
const isSameYear = require('date-fns/isSameYear')
const isSameMonth = require('date-fns/isSameMonth')
const isSameWeek = require('date-fns/isSameWeek')




const utils = {

  findRecurringTransactions (transactions){ //break this up into different services for pt 1, 2, 3, 4 ?????
    const returnVal = []
    // console.log('first log->',transactions)
    // console.log(this.compareTransactionDescriptions(transactions))

    const recurringTransactions = this.compareTransactionDescriptions(transactions)
    // let recurring = this.compareTransactionDescriptions(transactions)
    // for (let key in recurringTransactions) {
    //   this.findAverageAmount(recurringTransactions[key])
    // }
    const calculateMeanAndSTDDEV = this.findAverageandStandardDeviation(recurringTransactions)
    const transactionPeriodicity = this.determineTransactionPeriodicity(calculateMeanAndSTDDEV) //push this to response
    //part 2
    const validateCurrentRecurringTransactions = this.validateCurrentRecurringTransactions(transactionPeriodicity)
    const addPastTransactions = this.addPastTransactions(validateCurrentRecurringTransactions)
    const addFutureTransactions = this.addFutureTransactions(addPastTransactions)
    const determineRecurringValueTotals = this.determineRecurringValueTotals(addFutureTransactions)
    const formatRecurringValueList = this.formatRecurringValueList(determineRecurringValueTotals) //push this to response

    //part 3
    const windowLimit = this.determineWindowLimit(transactionPeriodicity)
  },
  compareTransactionDescriptions (transactions){
    const recurring = {}

    // Take in the unsorted list of transactions and create groups of transactions
    // that are in the format of the example below.

    // {
    //   "netflix": {
    //     frequency: 2,
    //     dates: [
    //       {date1: amount},
    //       {date2: amount}
    //     ]
    //   }
    // }

      //calculate transaction totals, create counterparty entry if it is not yet present
    for (let transaction of transactions) {
      const counterParty = transaction.description
      const date = transaction.date
      const amount = transaction.amount

      if (recurring?.[counterParty]?.['frequency']) {
        recurring[counterParty]['frequency'] ++
        recurring[counterParty]['dates'].push({date, amount})
      }
      else {
        recurring[`${counterParty}`] = {
          frequency: 1,
          dates: [{date, amount}]
        }
      }
    }

    //filter out non recurring transactions
    for (let counterParty in recurring) {
      if (recurring[counterParty]['frequency'] < 2) delete recurring[counterParty]
    }

    return recurring
  },
  determineTransactionPeriodicity(transactions) {
    const returnVal = transactions
    //console.log('analyze', transactions)
    //identify and format dates
    for (let key in returnVal) {
      let periodDetectedFlag = false
      let dates = returnVal[key]['dates']
      let formattedDates = []
      //console.log('dates', dates)
      
      for (let i = 0; i < dates.length; i++) {
        let element = dates[i]['date']
        let amount = dates[i]['amount']
        let formattedDate = new Date(element)
        //formattedDates.push({'date': formattedDate, amount })
        formattedDates.push([formattedDate, amount])
        //console.log(formattedDates)
        //let formattedDate = formatDate(element, 'w')
        //console.log('elem', element, formattedDate)
        // for (let j = 1; j < dates.length; j++) {

        // }

      }
      returnVal[key].dates = formattedDates.sort((a,b) => a[0] - b[0])
      //console.log('datesarray', formattedDates)
      //console.log(transactions[key]['dates'])

      //test against comparison windows. each subsequent test only runs if periodicity not detected previously
        //yearly
        if (!periodDetectedFlag) {
          for (let i = 0; i <= formattedDates.length - 2; i++) {
            let firstDate = formattedDates[i][0]
            let secondDate = formattedDates[i + 1][0]
            //console.log(firstDate,secondDate)
            //add days to acceptance window in order to account for leap year, slightly off-schedule billing, etc.
            let paddedDate = addDays(secondDate, 60)
            //console.log('years', differenceInYears(paddedDate, firstDate),'months', differenceInMonths(secondDate, firstDate),'days', differenceInDays(secondDate, firstDate))
            //console.log(i, firstDate, paddedDate)
            //console.log(formattedDates.length, i === formattedDates.length - 2)
            //console.log(formattedDates)
            if (differenceInYears(paddedDate, firstDate) !== 1) {
              //console.log(firstDate, paddedDate)
              break
            }
            else if (differenceInYears(paddedDate, firstDate) === 1 && i === formattedDates.length - 2) {
              // console.log(formattedDates.length, i, paddedDate)
              //console.log('yearly')
              returnVal[key]['periodicity'] = 'annual'
              //console.log(transactions)
              periodDetectedFlag = true
            }
          }
        }
          //monthly
        if (!periodDetectedFlag) {
          for (let i = 0; i <= formattedDates.length - 2; i++) {
          let firstDate = formattedDates[i][0]
          let secondDate = formattedDates[i + 1][0]
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
            //console.log('monthly')
            returnVal[key]['periodicity'] = 'monthly'
            // console.log(transactions)
            periodDetectedFlag = true
          }
        }
      }
      if (!periodDetectedFlag) {
        for (let i = 0; i <= formattedDates.length - 2; i++) {
        let firstDate = formattedDates[i][0]
        let secondDate = formattedDates[i + 1][0]
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
          returnVal[key]['periodicity'] = 'weekly'
          //console.log(transactions)
          periodDetectedFlag = true
        }
      }
    }

    }
    //console.log(returnVal)
    return returnVal
  },
  findAverageandStandardDeviation(transactions) {
    let returnVal = transactions
    //console.log('trans', transactions)
    for (let key in returnVal) {
      let transactionDates = returnVal[key]['dates']
      let transactionAmounts = []

      for (let i = 0; i < transactionDates.length; i++) {
        let date = transactionDates[i]
        transactionAmounts.push(date['amount'])
        //console.log('amt', transactionAmounts)
      }
      //calculate Average
      let averageAmount = transactionAmounts.reduce((acc, cum) => acc + cum, 0) / transactionAmounts.length
      returnVal[key]['averageAmount'] = averageAmount

       //calculate variance
      let squareDiffs = transactionAmounts.map((value) => {
        let diff = value - averageAmount;
        diff *= diff
        return diff
      })
      let variance = squareDiffs.reduce((acc, cum) => acc + cum, 0) / squareDiffs.length
      //console.log('variance', squareDiffs, variance)
      //calculate SD 
      let stdDeviation = Math.sqrt(variance)
      stdDeviation = +stdDeviation.toFixed(2)

      //only return if SD < 2.5
      if (stdDeviation < 2.5) returnVal[key]['stdDeviation'] = stdDeviation
      else delete returnVal[key]
    }
    
    //console.log('trans2', transactions)
    return returnVal
  },
  validateCurrentRecurringTransactions(transactions) {
    const returnVal = transactions
    //validate recurring transacation has occured past 3 periods
    const currentDate = new Date()
    //console.log(returnVal)
    for (let key in returnVal) {
      const dates = returnVal[key]['dates']
      const mostRecentTransaction = dates[dates.length - 1][0]
      const secondMostRecentTransaction = dates[dates.length - 2] ? dates[dates.length - 2][0] : null
      const thirdMostRecentTransaction = dates[dates.length - 3] ? dates[dates.length - 3][0] : null
      const periodicity = returnVal[key]['periodicity']
      //console.log(periodicity, key)
      //console.log(secondMostRecentTransaction, thirdMostRecentTransaction)
      if (!periodicity || !secondMostRecentTransaction || !thirdMostRecentTransaction) { //put this before transaction assigments to shorten ( if dates.length !> 3 delete)
        delete returnVal[key]
        continue
      }

      if (periodicity === 'annual') {
        const firstPrevYear = subYears(currentDate, 1)
        const secondPrevYear = subYears(currentDate, 2)
        const thirdPrevYear = subYears(currentDate, 3)
        // console.log(dates)
        // console.log(isSameYear(mostRecentPeriod, firstPrevYear))
        // console.log(isSameYear(secondMostRecentPeriod, secondPrevYear))
        // console.log(isSameYear(thirdMostRecentPeriod, thirdPrevYear), thirdPrevYear, thirdMostRecentPeriod)

        if (!isSameYear(mostRecentTransaction, firstPrevYear) 
          || !isSameYear(secondMostRecentTransaction, secondPrevYear)
          || !isSameYear(thirdMostRecentTransaction, thirdPrevYear)) {
            delete returnVal[key]
            //console.log("nope year", key)
            //return false
          } else {
            //console.log("yup year", key)
            //return true
          }
      }
      if (periodicity === 'monthly') {
        const firstPrevMonth = sub(currentDate, { months: 1 })
        const secondPrevMonth = sub(currentDate, { months: 2 })
        const thirdPrevMonth = sub(currentDate, { months: 3 })
        // console.log(dates)
        // console.log( firstPrevMonth, firstPrevMonth)
        // console.log(isSameYear(secondMostRecentPeriod, secondPrevYear))
        // console.log(isSameYear(thirdMostRecentPeriod, thirdPrevYear), thirdPrevYear, thirdMostRecentPeriod)

        if (!isSameMonth(mostRecentTransaction, firstPrevMonth) 
          || !isSameMonth(secondMostRecentTransaction, secondPrevMonth)
          || !isSameMonth(thirdMostRecentTransaction, thirdPrevMonth)) {
            delete returnVal[key]
            //console.log("nope month", key)
            //return false
          } else {
            //console.log("yup month", key)
            //return true
          }
      }
      if (periodicity === 'weekly') {
        const firstPrevWeek = sub(currentDate, { weeks: 1 })
        const secondPrevWeek = sub(currentDate, { weeks: 2 })
        const thirdPrevWeek = sub(currentDate, { weeks: 3 })
        //console.log('hello')
        // console.log( firstPrevMonth, firstPrevMonth)
        // console.log(isSameYear(secondMostRecentPeriod, secondPrevYear))
        // console.log(isSameYear(thirdMostRecentPeriod, thirdPrevYear), thirdPrevYear, thirdMostRecentPeriod)

        if (!isSameWeek(mostRecentTransaction, firstPrevWeek) 
          || !isSameWeek(secondMostRecentTransaction, secondPrevWeek)
          || !isSameWeek(thirdMostRecentTransaction, thirdPrevWeek)) {
            //console.log("nope week", key)
            //return false
            delete returnVal[key]
          } else {
            //console.log("yup week", key)
            //return true
          }
      }
    }
    //console.log(returnVal)
    return returnVal
  },
  addPastTransactions(transactions) {
    const returnVal = transactions
    
    for (let key in returnVal) {
      let total = 0
      let dates = returnVal[key]['dates']

      for (let i = 0; i < dates.length; i ++ ) {
        let amount = dates[i][1]
        total += amount
      }
      //console.log(total)
      returnVal[key]['pastTransactionsTotal'] = total
    }
    //console.log(returnVal)
    return returnVal
  },
  addFutureTransactions(transactions) {
    const returnVal = transactions

    for (let key in returnVal) {
      const periodicity = returnVal[key]['periodicity']
      const averageAmount = returnVal[key]['averageAmount']
      //using average amount as best predictor of future payment amounts
      if (periodicity === 'annual') {
        returnVal[key]['futureTransactionsTotal'] = averageAmount * 10
      }
      if (periodicity === 'monthly') {
        returnVal[key]['futureTransactionsTotal'] = averageAmount * 120
      }
      if (periodicity === 'weekly') {
        returnVal[key]['futureTransactionsTotal'] = averageAmount * 520
      }
    }
    return returnVal
    //console.log(returnVal)
  },
  determineRecurringValueTotals(transactions) {
    const returnVal = transactions
    //console.log(returnVal)
    for (let key in returnVal) {
      const futureTransactionsTotal = returnVal[key]['futureTransactionsTotal']
      const pastTransactionsTotal = returnVal[key]['pastTransactionsTotal']
      const recurringValueTotal = futureTransactionsTotal + pastTransactionsTotal
      //console.log('recurring total',recurringValueTotal)

      //compute recurringTotalValue to return if sum is less than 0
      if (recurringValueTotal >= 0){
        continue
      } else {
        returnVal[key]['recurringValueTotal'] = recurringValueTotal
      }
    }
    //console.log(returnVal)
    return returnVal
  },
  formatRecurringValueList(transactions) {
    const returnVal = []
    //console.log(transactions)
    for (let key in transactions) {
      //console.log(transactions[key])
      const description = transactions[key]
      const recurringValueTotal = transactions[key]?.['recurringValueTotal'] ?? null

      if (recurringValueTotal) {
        returnVal.push({
          'description': key,
          'value': recurringValueTotal
        })
      }
    }
    //console.log(returnVal)
    return returnVal
  },
  // determineWindowLimit(transactions) {
  //   console.log(transactions)
  //   const returnVal = []
  //   const windowLimit = 2000000
  //   let largestAmount
  //   // const startDate = new Date()
  //   // const endDate =  new Date(2022, 1, 9)
  //   // const diff = differenceInDays(endDate, startDate)
  //   // console.log(dates)

  //   for (let key in transactions) {
  //     let dates = transactions[key]['dates']
  //     let left = 0 //set pointers for moving window search on dates array
  //     let right = 1
  //     // console.log(dates)
  //     while (right < dates.length) {
  //       let windowAmount = 0

  //       let idxLeft = dates[left]
  //       let idxRight = dates[right]

  //       let dateLeft = idxLeft[0]
  //       let dateRight = idxRight[0]
  //       let diff = differenceInDays(dateRight, dateLeft)

  //       let amountLeft = idxLeft[1]
  //       let amountRight = idxRight[1]

  //       // console.log(diff)
  //       break

  //     }

  //     }

  //     }
   
}

module.exports = utils
