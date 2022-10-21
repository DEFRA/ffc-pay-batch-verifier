require('./insights').setup()
require('log-timestamp')
const verify = require('./verify')

module.exports = (async () => {
  await verify.start()
})()
