require('./insights').setup()
require('log-timestamp')
const poll = require('./poll')
const storage = require('./storage')

module.exports = (async () => {
  storage.connect()
  await poll.start()
})()
