const filenames = require('../../../app/verify/filenames')

const { SITI_AGRI, GENESIS, GLOS, IMPS, DPS, UNKNOWN } = require('../../../app/constants/file-types')

const PENDING_SITI_AGRI_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.dat'
const PENDING_SITI_AGRI_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.dat'
const PENDING_SITI_AGRI_CHECKSUM_BLOB_NAME = 'PENDING_TEST_BATCH.txt'
const PENDING_SITI_AGRI_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.txt'

const PROCESSED_SITI_AGRI_BATCH_BLOB_NAME = 'TEST_BATCH.dat'
const PROCESSED_SITI_AGRI_CTL_BATCH_BLOB_NAME = 'CTL_TEST_BATCH.dat'
const PROCESSED_SITI_AGRI_CHECKSUM_BLOB_NAME = 'TEST_BATCH.txt'
const PROCESSED_SITI_AGRI_CTL_CHECKSUM_BLOB_NAME = 'CTL_TEST_BATCH.txt'

const PENDING_GENESIS_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.gne'
const PENDING_GENESIS_CTL_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.gne.ctl'

const PROCESSED_GENESIS_BATCH_BLOB_NAME = 'TEST_BATCH.gne'
const PROCESSED_GENESIS_CTL_BATCH_BLOB_NAME = 'TEST_BATCH.gne.ctl'

const PENDING_GLOS_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.dat'
const PENDING_GLOS_CTL_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.ctl'

const PROCESSED_GLOS_BATCH_BLOB_NAME = 'TEST_BATCH.dat'
const PROCESSED_GLOS_CTL_BATCH_BLOB_NAME = 'TEST_BATCH.ctl'

const PENDING_IMPS_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.INT'
const PENDING_IMPS_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.INT'

const PROCESSED_IMPS_BATCH_BLOB_NAME = 'TEST_BATCH.INT'
const PROCESSED_IMPS_CTL_BATCH_BLOB_NAME = 'CTL_TEST_BATCH.INT'

const PENDING_DPS_BATCH_BLOB_NAME = 'PENDING_BGAN_TEST_BATCH.OUT'
const PENDING_DPS_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_BGAN_TEST_BATCH.OUT'

const PROCESSED_DPS_BATCH_BLOB_NAME = 'BGAN_TEST_BATCH.OUT'
const PROCESSED_DPS_CTL_BATCH_BLOB_NAME = 'CTL_BGAN_TEST_BATCH.OUT'

describe('filenames', () => {
  test('should return four pending filenames if file type is Siti Agri', () => {
    const result = filenames.getPendingFilenames({ name: PENDING_SITI_AGRI_CTL_BATCH_BLOB_NAME, type: SITI_AGRI })
    expect(result).toEqual({
      controlFilename: PENDING_SITI_AGRI_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_SITI_AGRI_BATCH_BLOB_NAME,
      checksumControlFilename: PENDING_SITI_AGRI_CTL_CHECKSUM_BLOB_NAME,
      checksumFilename: PENDING_SITI_AGRI_CHECKSUM_BLOB_NAME
    })
  })

  test('should return four processed filenames if file type is Siti Agri', () => {
    const result = filenames.getProcessedFilenames({
      controlFilename: PENDING_SITI_AGRI_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_SITI_AGRI_BATCH_BLOB_NAME,
      checksumControlFilename: PENDING_SITI_AGRI_CTL_CHECKSUM_BLOB_NAME,
      checksumFilename: PENDING_SITI_AGRI_CHECKSUM_BLOB_NAME
    })
    expect(result).toEqual({
      controlFilename: PROCESSED_SITI_AGRI_CTL_BATCH_BLOB_NAME,
      batchFilename: PROCESSED_SITI_AGRI_BATCH_BLOB_NAME,
      checksumControlFilename: PROCESSED_SITI_AGRI_CTL_CHECKSUM_BLOB_NAME,
      checksumFilename: PROCESSED_SITI_AGRI_CHECKSUM_BLOB_NAME
    })
  })

  test('should return two pending filenames if file type is Genesis', () => {
    const result = filenames.getPendingFilenames({ name: PENDING_GENESIS_CTL_BATCH_BLOB_NAME, type: GENESIS })
    expect(result).toEqual({
      controlFilename: PENDING_GENESIS_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_GENESIS_BATCH_BLOB_NAME
    })
  })

  test('should return two processed filenames if file type is Genesis', () => {
    const result = filenames.getProcessedFilenames({
      controlFilename: PENDING_GENESIS_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_GENESIS_BATCH_BLOB_NAME
    })
    expect(result).toEqual({
      controlFilename: PROCESSED_GENESIS_CTL_BATCH_BLOB_NAME,
      batchFilename: PROCESSED_GENESIS_BATCH_BLOB_NAME
    })
  })

  test('should return two pending filenames if file type is Glos', () => {
    const result = filenames.getPendingFilenames({ name: PENDING_GLOS_CTL_BATCH_BLOB_NAME, type: GLOS })
    expect(result).toEqual({
      controlFilename: PENDING_GLOS_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_GLOS_BATCH_BLOB_NAME
    })
  })

  test('should return two processed filenames if file type is Glos', () => {
    const result = filenames.getProcessedFilenames({
      controlFilename: PENDING_GLOS_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_GLOS_BATCH_BLOB_NAME
    })
    expect(result).toEqual({
      controlFilename: PROCESSED_GLOS_CTL_BATCH_BLOB_NAME,
      batchFilename: PROCESSED_GLOS_BATCH_BLOB_NAME
    })
  })

  test('should return two pending filenames if file type is Imps', () => {
    const result = filenames.getPendingFilenames({ name: PENDING_IMPS_CTL_BATCH_BLOB_NAME, type: IMPS })
    expect(result).toEqual({
      controlFilename: PENDING_IMPS_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_IMPS_BATCH_BLOB_NAME
    })
  })

  test('should return two processed filenames if file type is Imps', () => {
    const result = filenames.getProcessedFilenames({
      controlFilename: PENDING_IMPS_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_IMPS_BATCH_BLOB_NAME
    })
    expect(result).toEqual({
      controlFilename: PROCESSED_IMPS_CTL_BATCH_BLOB_NAME,
      batchFilename: PROCESSED_IMPS_BATCH_BLOB_NAME
    })
  })

  test('should return two pending filenames if file type is DPS', () => {
    const result = filenames.getPendingFilenames({ name: PENDING_DPS_CTL_BATCH_BLOB_NAME, type: DPS })
    expect(result).toEqual({
      controlFilename: PENDING_DPS_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_DPS_BATCH_BLOB_NAME
    })
  })

  test('should return two processed filenames if file type is DPS', () => {
    const result = filenames.getProcessedFilenames({
      controlFilename: PENDING_DPS_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_DPS_BATCH_BLOB_NAME
    })
    expect(result).toEqual({
      controlFilename: PROCESSED_DPS_CTL_BATCH_BLOB_NAME,
      batchFilename: PROCESSED_DPS_BATCH_BLOB_NAME
    })
  })

  test('should throw error if file type is unknown', () => {
    expect(() => {
      filenames.getPendingFilenames({ name: PENDING_IMPS_CTL_BATCH_BLOB_NAME, type: UNKNOWN })
    }).toThrow()
  })
})
