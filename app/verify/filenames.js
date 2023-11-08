const { SITI_AGRI, GENESIS, GLOS, IMPS, DPS } = require('../constants/file-types')

const getPendingFilenames = (controlFile) => {
  switch (controlFile.type) {
    case SITI_AGRI:
      return {
        controlFilename: controlFile.name,
        batchFilename: controlFile.name.replace('CTL_', ''),
        checksumControlFilename: controlFile.name.replace('.dat', '.txt'),
        checksumFilename: controlFile.name.replace('CTL_', '').replace('.dat', '.txt')
      }
    case GENESIS:
      return {
        controlFilename: controlFile.name,
        batchFilename: controlFile.name.replace('.ctl', '.gne')
      }
    case GLOS:
      return {
        controlFilename: controlFile.name,
        batchFilename: controlFile.name.replace('.ctl', '.dat')
      }
    case IMPS:
    case DPS:
      return {
        controlFilename: controlFile.name,
        batchFilename: controlFile.name.replace('CTL_', '')
      }
    default:
      throw new Error(`Unknown file type ${controlFile.type}`)
  }
}

const getProcessedFilenames = (pendingFilenames) => {
  return Object.keys(pendingFilenames).reduce((processedFilenames, key) => {
    processedFilenames[key] = pendingFilenames[key].replace('PENDING_', '')
    return processedFilenames
  }, {})
}

module.exports = {
  getPendingFilenames,
  getProcessedFilenames
}
