const verifyContent = require('./verify-content')
const getFiles = require('./get-files')
const success = require('./success')
const failure = require('./failure')

const validate = async (pendingFilenames, processedFilenames) => {
  const [checksumFile, batchFile] = await getFiles(pendingFilenames)

  if (verifyContent(batchFile, checksumFile)) {
    await success(pendingFilenames, processedFilenames)
  } else {
    await failure(pendingFilenames)
  }
}

module.exports = validate
