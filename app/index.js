require('./insights').setup()
require('log-timestamp')
const poll = require('./poll')

module.exports = (async () => {
  await poll.start()
})()
