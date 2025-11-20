const filenames = require('../../../app/verify/filenames')
const { SITI_AGRI, GENESIS, GLOS, IMPS, DPS, UNKNOWN } = require('../../../app/constants/file-types')

const FILES = {
  [SITI_AGRI]: {
    pending: {
      batchFilename: 'PENDING_TEST_BATCH.dat',
      controlFilename: 'CTL_PENDING_TEST_BATCH.dat',
      checksumFilename: 'PENDING_TEST_BATCH.txt',
      checksumControlFilename: 'CTL_PENDING_TEST_BATCH.txt'
    },
    processed: {
      batchFilename: 'TEST_BATCH.dat',
      controlFilename: 'CTL_TEST_BATCH.dat',
      checksumFilename: 'TEST_BATCH.txt',
      checksumControlFilename: 'CTL_TEST_BATCH.txt'
    }
  },
  [GENESIS]: {
    pending: { batchFilename: 'PENDING_TEST_BATCH.gne', controlFilename: 'PENDING_TEST_BATCH.gne.ctl' },
    processed: { batchFilename: 'TEST_BATCH.gne', controlFilename: 'TEST_BATCH.gne.ctl' }
  },
  [GLOS]: {
    pending: { batchFilename: 'PENDING_TEST_BATCH.dat', controlFilename: 'PENDING_TEST_BATCH.ctl' },
    processed: { batchFilename: 'TEST_BATCH.dat', controlFilename: 'TEST_BATCH.ctl' }
  },
  [IMPS]: {
    pending: { batchFilename: 'PENDING_TEST_BATCH.INT', controlFilename: 'CTL_PENDING_TEST_BATCH.INT' },
    processed: { batchFilename: 'TEST_BATCH.INT', controlFilename: 'CTL_TEST_BATCH.INT' }
  },
  [DPS]: {
    pending: { batchFilename: 'PENDING_BGAN_TEST_BATCH.OUT', controlFilename: 'CTL_PENDING_BGAN_TEST_BATCH.OUT' },
    processed: { batchFilename: 'BGAN_TEST_BATCH.OUT', controlFilename: 'CTL_BGAN_TEST_BATCH.OUT' }
  }
}

describe('filenames', () => {
  test.each(Object.entries(FILES))('%s: getPendingFilenames returns correct filenames', (type, files) => {
    const result = filenames.getPendingFilenames({ name: files.pending.controlFilename, type })
    expect(result).toEqual(files.pending)
  })

  test.each(Object.entries(FILES))('%s: getProcessedFilenames returns correct filenames', (type, files) => {
    const result = filenames.getProcessedFilenames(files.pending)
    expect(result).toEqual(files.processed)
  })

  test('throws error if file type is unknown', () => {
    expect(() => filenames.getPendingFilenames({ name: 'irrelevant.dat', type: UNKNOWN })).toThrow()
  })
})
