const config = require('../config/verify')
const pollInbound = require('./poll-inbound')

const start = async () => {
  try {
    await pollInbound()
  } catch (err) {
    console.error(err)
  } finally {
    setTimeout(start, config.pollingInterval)
  }
}

module.exports = {
  start
}
