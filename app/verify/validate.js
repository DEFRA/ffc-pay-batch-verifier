const verifyContent = require('./verify-content')
const getFiles = require('./get-files')
const success = require('./success')
const failure = require('./failure')
const { validateGlosFiles } = require('./validate-glos-files')
const { GLOS, SITI_AGRI } = require('../constants/file-types')

const validate = async (fileType, pendingFilenames, processedFilenames) => {
  const fileContents = await getFiles(pendingFilenames)

  if (fileType === GLOS) {
    validateGlosFiles(fileContents.find(x => x.filename === pendingFilenames.batchFilename).content, fileContents.find(x => x.filename === pendingFilenames.controlFilename).content)
      ? await success(pendingFilenames, processedFilenames)
      : await failure(pendingFilenames)
  } else if (fileType === SITI_AGRI) {
    verifyContent(fileContents.find(x => x.filename === pendingFilenames.batchFilename).content, fileContents.find(x => x.filename === pendingFilenames.checksumFilename).content)
      ? await success(pendingFilenames, processedFilenames)
      : await failure(pendingFilenames)
  } else {
    await success(pendingFilenames, processedFilenames)
  }
}

module.exports = validate
