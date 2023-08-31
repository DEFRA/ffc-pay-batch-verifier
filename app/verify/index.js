const { getPendingFilenames, getProcessedFilenames } = require('./filenames')
const validate = require('./validate')

const verifyBatch = async (controlFile) => {
  const pendingFilenames = getPendingFilenames(controlFile)
  const processedFilenames = getProcessedFilenames(pendingFilenames)

  await validate(controlFile.type, pendingFilenames, processedFilenames)
}

module.exports = verifyBatch
