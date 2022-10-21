const storage = require('../storage')

const failure = async (context, pendingFilenames) => {
  context.log('Quarantining files')
  await storage.quarantineFile(pendingFilenames.controlFilename)
  await storage.quarantineFile(pendingFilenames.batchFilename)
  await storage.quarantineFile(pendingFilenames.checksumControlFilename)
  await storage.quarantineFile(pendingFilenames.checksumFilename)
}

module.exports = failure
