const config = require('../config/verify')
const pollInbound = require('./poll-inbound')

const start = async () => {
  await pollInbound()
  setTimeout(start, config.pollingInterval)
}

module.exports = {
  start
}
