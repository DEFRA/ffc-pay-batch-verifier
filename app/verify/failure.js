const storage = require('../storage')

const failure = async (pendingFilenames) => {
  console.log('Quarantining files')
  for (const key in pendingFilenames) {
    await storage.quarantineFile(pendingFilenames[key])
  }
}

module.exports = failure
