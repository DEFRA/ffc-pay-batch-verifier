const storage = require('../storage')
const verifyBatch = require('../verify')

const pollInbound = async () => {
  const controlFiles = await storage.getPendingControlFiles()
  for (const controlFile of controlFiles) {
    try {
      await verifyBatch(controlFile)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = pollInbound
