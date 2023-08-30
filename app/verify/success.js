const storage = require('../storage')

const success = async (pendingFilenames, processedFilenames) => {
  console.log('Renaming files')
  for (const key in pendingFilenames) {
    await storage.renameFile(pendingFilenames[key], processedFilenames[key])
  }
  console.log('Archiving files')
  for (const key in processedFilenames) {
    if (key !== 'batchFilename') {
      await storage.archiveFile(processedFilenames[key])
    }
  }
  console.log('Success')
}

module.exports = success
