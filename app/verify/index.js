const { getPendingFilenames, getPendingGlosFilenames, getProcessedFilenames } = require('./filenames')
const validate = require('./validate')

const verifyBatch = async (batchControlFilename) => {
  const pendingFilenames = batchControlFilename.match(/_FCAP_/gm) ? getPendingGlosFilenames(batchControlFilename) : getPendingFilenames(batchControlFilename)
  const processedFilenames = getProcessedFilenames(pendingFilenames)

  await validate(pendingFilenames, processedFilenames)
}

module.exports = verifyBatch
