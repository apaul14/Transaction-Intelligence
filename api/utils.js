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
const parseISO = require('date-fns/parseISO')




const utils = {

  processTransactions (transactions) {
    const response = {
      recurringTransactions: [],
      recurringValues: [],
      windowLimits: [],
      counterPartyLimits: []
    }
  
    const recurringTransactions = this.compareTransactionDescriptions(transactions)
  
    const calculateMeanAndSTDDEV = this.findAverageandStandardDeviation(recurringTransactions)
    const transactionPeriodicity = this.determineTransactionPeriodicity(calculateMeanAndSTDDEV) //push this to response

    response.recurringTransactions.push(transactionPeriodicity)

    //part 2
    const validateCurrentRecurringTransactions = this.validateCurrentRecurringTransactions(transactionPeriodicity)
    const addPastTransactions = this.addPastTransactions(validateCurrentRecurringTransactions)
    const addFutureTransactions = this.addFutureTransactions(addPastTransactions)
    const determineRecurringValueTotals = this.determineRecurringValueTotals(addFutureTransactions)
    const formatRecurringValueList = this.formatRecurringValueList(determineRecurringValueTotals) //push this to response

    response.recurringValues.push(formatRecurringValueList)

    //part 3
    const windowLimit = this.determineWindowLimit(recurringTransactions)
    console.log(response)
    return response
  },
  compareTransactionDescriptions (transactions) {
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
    const returnVal = JSON.parse(JSON.stringify(transactions))

    for (let key in returnVal) {
      let periodDetectedFlag = false
      const dates = returnVal[key]['dates']
      const formattedDates = []
      
      for (let i = 0; i < dates.length; i++) {
        const element = dates[i]['date']
        const amount = dates[i]['amount']
        const formattedDate = parseISO(element)

        formattedDates.push([formattedDate, amount])
      }
      //sort dates for comparison
      returnVal[key].dates = formattedDates.sort((a,b) => a[0] - b[0])

      //test against comparison windows. each subsequent test only runs if periodicity not detected previously
        //yearly
          if (!periodDetectedFlag) {
            for (let i = 0; i <= formattedDates.length - 2; i++) {
              const firstDate = formattedDates[i][0]
              const secondDate = formattedDates[i + 1][0]

              //add days to acceptance window in order to account for leap year, slightly off-schedule billing, etc.
              const paddedDate = addDays(secondDate, 60)

              if (differenceInYears(paddedDate, firstDate) !== 1) {
                break
              }
              else if (differenceInYears(paddedDate, firstDate) === 1 && i === formattedDates.length - 2) {
                returnVal[key]['periodicity'] = 'annual'
                periodDetectedFlag = true
              }
            }
          }
        //monthly
          if (!periodDetectedFlag) {
            for (let i = 0; i <= formattedDates.length - 2; i++) {
            const firstDate = formattedDates[i][0]
            const secondDate = formattedDates[i + 1][0]
            //add days to acceptance window in order to account for leap year, slightly off-schedule billing, etc.
            const paddedDate = addDays(secondDate, 7)

            if (differenceInMonths(paddedDate, firstDate) !== 1) {
              break
            }
            else if (differenceInMonths(paddedDate, firstDate) === 1 && i === formattedDates.length - 2) {
              returnVal[key]['periodicity'] = 'monthly'
              periodDetectedFlag = true
            }
          }
        }
      //weekly
        if (!periodDetectedFlag) {
          for (let i = 0; i <= formattedDates.length - 2; i++) {
          const firstDate = formattedDates[i][0]
          const secondDate = formattedDates[i + 1][0]
          //add days to acceptance window in order to account for weekends, slightly off-schedule billing, etc.
          const paddedDate = addDays(secondDate, 3)
    
          if (differenceInWeeks(paddedDate, firstDate) !== 1) {
            break
          }
          else if (differenceInWeeks(paddedDate, firstDate) === 1 && i === formattedDates.length - 2) {
            returnVal[key]['periodicity'] = 'weekly'
            periodDetectedFlag = true
          }
        }
      }
    }
    return returnVal
  },
  findAverageandStandardDeviation(transactions) {
    const returnVal = JSON.parse(JSON.stringify(transactions))
    
    for (let key in returnVal) {
      const transactionDates = returnVal[key]['dates']
      const transactionAmounts = []
      
      for (let i = 0; i < transactionDates.length; i++) {
        const date = transactionDates[i]
        transactionAmounts.push(date['amount'])
      }

      //calculate Average
      const averageAmount = transactionAmounts.reduce((acc, cum) => acc + cum, 0) / transactionAmounts.length
      returnVal[key]['averageAmount'] = averageAmount

       //calculate variance
      const squareDiffs = transactionAmounts.map((value) => {
        let diff = value - averageAmount;
        diff *= diff
        return diff
      })
      const variance = squareDiffs.reduce((acc, cum) => acc + cum, 0) / squareDiffs.length

      //calculate SD 
      let stdDeviation = Math.sqrt(variance)
      stdDeviation = +stdDeviation.toFixed(2)

      //only return if SD < 2.5
      if (stdDeviation < 2.5) returnVal[key]['stdDeviation'] = stdDeviation
      else delete returnVal[key]
    }
    return returnVal
  },
  validateCurrentRecurringTransactions(transactions) {
    const returnVal = JSON.parse(JSON.stringify(transactions))

    //validate recurring transacation has occured past 3 periods
    const currentDate = new Date()

    for (let key in returnVal) {
      const dates = returnVal[key]['dates']

      //must return dates to ISO from strings created during deep copying for use with date lib
      dates.forEach(date => date[0] = parseISO(date[0]))

      const mostRecentTransaction = dates[dates.length - 1][0]
      const secondMostRecentTransaction = dates[dates.length - 2] ? dates[dates.length - 2][0] : null
      const thirdMostRecentTransaction = dates[dates.length - 3] ? dates[dates.length - 3][0] : null
      const periodicity = returnVal[key]['periodicity']
  
      if (!periodicity || !secondMostRecentTransaction || !thirdMostRecentTransaction) { //put this before transaction assigments to shorten ( if dates.length !> 3 delete)
        delete returnVal[key]
        continue
      }

      if (periodicity === 'annual') {
        const firstPrevYear = subYears(currentDate, 1)
        const secondPrevYear = subYears(currentDate, 2)
        const thirdPrevYear = subYears(currentDate, 3)
    
        if (!isSameYear(mostRecentTransaction, firstPrevYear) 
          || !isSameYear(secondMostRecentTransaction, secondPrevYear)
          || !isSameYear(thirdMostRecentTransaction, thirdPrevYear)) {
            delete returnVal[key]
        } 
      }
        
      if (periodicity === 'monthly') {
        const firstPrevMonth = sub(currentDate, { months: 1 })
        const secondPrevMonth = sub(currentDate, { months: 2 })
        const thirdPrevMonth = sub(currentDate, { months: 3 })
  
        if (!isSameMonth(mostRecentTransaction, firstPrevMonth) 
          || !isSameMonth(secondMostRecentTransaction, secondPrevMonth)
          || !isSameMonth(thirdMostRecentTransaction, thirdPrevMonth)) {
            delete returnVal[key]
        } 
      }
      if (periodicity === 'weekly') {
        const firstPrevWeek = sub(currentDate, { weeks: 1 })
        const secondPrevWeek = sub(currentDate, { weeks: 2 })
        const thirdPrevWeek = sub(currentDate, { weeks: 3 })

        if (!isSameWeek(mostRecentTransaction, firstPrevWeek) 
          || !isSameWeek(secondMostRecentTransaction, secondPrevWeek)
          || !isSameWeek(thirdMostRecentTransaction, thirdPrevWeek)) {
            delete returnVal[key]
          }
        }
      }
    return returnVal
  },
  addPastTransactions(transactions) {
    const returnVal = JSON.parse(JSON.stringify(transactions))
    
    for (let key in returnVal) {
      let total = 0
      const dates = returnVal[key]['dates']

      for (let i = 0; i < dates.length; i ++ ) {
        const amount = dates[i][1]
        total += amount
      }
      returnVal[key]['pastTransactionsTotal'] = total
    }
    return returnVal
  },
  addFutureTransactions(transactions) {
    const returnVal = JSON.parse(JSON.stringify(transactions))

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
  },
  determineRecurringValueTotals(transactions) {
    const returnVal = JSON.parse(JSON.stringify(transactions))

    for (let key in returnVal) {
      const futureTransactionsTotal = returnVal[key]['futureTransactionsTotal']
      const pastTransactionsTotal = returnVal[key]['pastTransactionsTotal']
      const recurringValueTotal = futureTransactionsTotal + pastTransactionsTotal
  
      //compute recurringTotalValue to return if sum is less than 0
      if (recurringValueTotal >= 0) {
        continue
      } else {
        returnVal[key]['recurringValueTotal'] = recurringValueTotal
      }
    }
    return returnVal
  },
  formatRecurringValueList(transactions) {
    const returnVal = []

    for (let key in transactions) {
      const description = transactions[key]
      const recurringValueTotal = transactions[key]?.['recurringValueTotal'] ?? null

      if (recurringValueTotal) {
        returnVal.push({
          'description': key,
          'value': recurringValueTotal
        })
      }
    }
    return returnVal
  },
  determineWindowLimit(transactions) {

    //for this function we use the original (organized and unfiltered) data so all transactions are considered.
    // This means we have to re-parse and sort dates
    const transactionsCopy = JSON.parse(JSON.stringify(transactions))
    
    for (let key in transactionsCopy) {
      const dates = transactionsCopy[key]['dates']
      const formattedDates = []

      for (let i = 0; i < dates.length; i++) {
        const element = dates[i]['date']
        const amount = dates[i]['amount']
        const formattedDate = parseISO(element)

        formattedDates.push([formattedDate, amount])
      }
      //sort dates for comparison
      transactionsCopy[key]['dates'] = formattedDates.sort((a,b) => a[0] - b[0])
    }

    const returnVal = []
    const windowLimit = 2000000
    

    for (let key in transactions) {
      let dates = transactionsCopy[key]['dates']
      let left = 0 //set pointers for moving window search on dates array
      let right = 1
      let largestAmount = -Infinity
      let windowAmount
      //console.log(dates)
      while (right <= dates.length - 1) {
        let idxLeft = dates[left]
        let idxRight = dates[right]

        let dateLeft = idxLeft[0]
        let dateRight = idxRight[0]
        let diff = differenceInDays(dateRight, dateLeft)

        let amountLeft = idxLeft[1]
        let amountRight = idxRight[1]

        windowAmount = amountLeft

        //console.log(left, right, diff, windowAmount)

        if (diff <= 31) {
          windowAmount +=amountRight
          right ++
        } 
        else if (windowAmount > windowLimit) {
          largestAmount = Math.max(largestAmount, windowAmount)
          left = right
          right = left + 1
        } else {
          left = right
          right = left + 1
        }
      }
    } 
    // console.log(transactionsCopy)
    // console.log(largestAmount)
  }
}

module.exports = utils
