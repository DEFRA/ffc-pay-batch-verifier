const { SITI_AGRI, GENESIS, GLOS, IMPS, UNKNOWN } = require('../constants/file-types')

const getFileType = (filename) => {
  if (!filename.includes('PENDING_')) {
    return UNKNOWN
  }

  if (filename.startsWith('CTL_PENDING_') && filename.endsWith('.dat')) {
    return SITI_AGRI
  }

  if (filename.startsWith('PENDING_GENESIS') && filename.endsWith('.ctl')) {
    return GENESIS
  }

  if (filename.startsWith('PENDING_FCAP') && filename.endsWith('.ctl')) {
    return GLOS
  }

  if (filename.startsWith('CTL_PENDING_') && filename.endsWith('.INT')) {
    return IMPS
  }

  return UNKNOWN
}

module.exports = {
  getFileType
}
