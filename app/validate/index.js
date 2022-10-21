const storage = require('../storage')
const { verifyContent } = require('../verify')
const getFiles = require('../get-files')
const success = require('./success')
const failure = require('./failure')
const { storageConnectionString } = require('../config')

const validate = async (pendingFilenames, processedFilenames) => {
  storage.connect(storageConnectionString)
  const [checksumFile, batchFile] = await getFiles(pendingFilenames)

  if (verifyContent(batchFile, checksumFile)) {
    await success(pendingFilenames, processedFilenames)
  } else {
    await failure(pendingFilenames)
  }
}

module.exports = validate
