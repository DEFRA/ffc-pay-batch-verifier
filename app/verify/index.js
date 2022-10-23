const { getPendingFilenames, getProcessedFilenames } = require('./filenames')
const validate = require('./validate')

const verifyBatch = async (batchControlFilename) => {
  const pendingFilenames = getPendingFilenames(batchControlFilename)
  const processedFilenames = getProcessedFilenames(pendingFilenames)

  await validate(pendingFilenames, processedFilenames)
}

module.exports = verifyBatch
