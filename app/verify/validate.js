const verifyContent = require('./verify-content')
const getFiles = require('./get-files')
const success = require('./success')
const failure = require('./failure')
const { validateGlosFiles } = require('./validate-glos-files')

const validate = async (pendingFilenames, processedFilenames) => {
  const [checksumFile, batchFile, controlFile] = await getFiles(pendingFilenames)

  if (pendingFilenames.batchFilename.match(/_FCAP_/gm)) {
    console.log('Identified FC file, validating against control file')
    validateGlosFiles(batchFile, controlFile) ? console.log('FC file valid') : await failure(pendingFilenames)
  }

  if (verifyContent(batchFile, checksumFile)) {
    await success(pendingFilenames, processedFilenames)
  } else {
    await failure(pendingFilenames)
  }
}

module.exports = validate
