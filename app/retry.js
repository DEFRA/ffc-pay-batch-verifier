const { totalRetries } = require('./config/verify')

const retry = async (fn, retriesLeft = totalRetries, interval = 2000, exponential = false) => {
  try {
    return (await fn())
  } catch (err) {
    if (retriesLeft > 0) {
      await new Promise(resolve => setTimeout(resolve, interval))
      return retry(fn, retriesLeft - 1, exponential ? interval * 2 : interval, exponential)
    } else {
      throw err
    }
  }
}

module.exports = retry
