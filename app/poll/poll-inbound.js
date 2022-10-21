const storage = require('../storage')
const verifyBatch = require('./verify')

const pollInbound = async () => {
  const inboundFiles = await storage.getInboundFileList()
  for (const inboundFile of inboundFiles) {
    await verifyBatch(inboundFile)
  }
}

module.exports = pollInbound
