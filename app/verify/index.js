const { getPendingFilenames, getProcessedFilenames } = require('./filenames')
const validate = require('./validate')

const verifyBatch = async (batchFilename) => {
  const pendingFilenames = getPendingFilenames(batchFilename)
  const processedFilenames = getProcessedFilenames(pendingFilenames)

  await validate(pendingFilenames, processedFilenames)
}

module.exports = verifyBatch
