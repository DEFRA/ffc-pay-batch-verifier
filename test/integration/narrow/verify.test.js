const createHash = require('../../../app/verify/create-hash')
jest.mock('../../../app/config/verify', () => ({ totalRetries: 1 }))

const { SITI_AGRI } = require('../../../app/constants/file-types')
const verify = require('../../../app/verify')

const FILE_TYPE = SITI_AGRI

const BLOBS = {
  default: 'inbound/default.txt',
  originalBatch: 'inbound/PENDING_TEST_BATCH.dat',
  originalCtlBatch: 'inbound/CTL_PENDING_TEST_BATCH.dat',
  originalChecksum: 'inbound/PENDING_TEST_BATCH.txt',
  originalCtlChecksum: 'inbound/CTL_PENDING_TEST_BATCH.txt',
  processedBatch: 'inbound/TEST_BATCH.dat',
  processedCtlBatch: 'inbound/CTL_TEST_BATCH.dat',
  processedChecksum: 'inbound/TEST_BATCH.txt',
  processedCtlChecksum: 'inbound/CTL_TEST_BATCH.txt',
  archiveBatch: 'archive/TEST_BATCH.dat',
  archiveCtlBatch: 'archive/CTL_TEST_BATCH.dat',
  archiveChecksum: 'archive/TEST_BATCH.txt',
  archiveCtlChecksum: 'archive/CTL_TEST_BATCH.txt',
  quarantineBatch: 'quarantine/PENDING_TEST_BATCH.dat',
  quarantineCtlBatch: 'quarantine/CTL_PENDING_TEST_BATCH.dat',
  quarantineChecksum: 'quarantine/PENDING_TEST_BATCH.txt',
  quarantineCtlChecksum: 'quarantine/CTL_PENDING_TEST_BATCH.txt',
  fcapBatch: 'inbound/FCAP_TEST_BATCH.dat',
  fcapCtl: 'inbound/FCAP_TEST_BATCH.ctl'
}

let mockBlobs = {}

const setupBlobClientMocks = () => {
  mockBlobs = {}
  Object.values(BLOBS).forEach(name => {
    const isChecksum = name.endsWith('.txt')
    const download = isChecksum || name.includes('FCAP')
      ? jest.fn().mockResolvedValue(Buffer.from(createHash('valid content')))
      : jest.fn().mockResolvedValue(Buffer.from('valid content'))
    mockBlobs[name] = {
      downloadToBuffer: download,
      beginCopyFromURL: jest.fn().mockResolvedValue({ pollUntilDone: jest.fn().mockResolvedValue({ copyStatus: 'success' }) }),
      upload: jest.fn(),
      delete: jest.fn(),
      url: name
    }
  })
}

jest.mock('@azure/storage-blob', () => {
  const mockContainer = {
    getBlockBlobClient: jest.fn(name => mockBlobs[name] || {
      upload: jest.fn(),
      downloadToBuffer: jest.fn().mockResolvedValue(Buffer.from('')),
      delete: jest.fn(),
      beginCopyFromURL: jest.fn().mockResolvedValue({ pollUntilDone: jest.fn().mockResolvedValue({ copyStatus: 'success' }) }),
      url: name
    }),
    createIfNotExists: jest.fn()
  }
  return {
    BlobServiceClient: {
      fromConnectionString: jest.fn(() => ({ getContainerClient: jest.fn(() => mockContainer) }))
    }
  }
})

describe('verifyBatchContent', () => {
  beforeEach(() => setupBlobClientMocks())
  afterEach(() => jest.clearAllMocks())

  const setupFileContent = (isValid) => {
    Object.values(mockBlobs).forEach(blob => {
      blob.beginCopyFromURL = jest.fn().mockImplementation(async sourceUrl => {
        const target = blob.url.includes('archive') || blob.url.includes('FCAP')
          ? blob.url
          : sourceUrl.replace('PENDING_', '').replace('CTL_', '')
        mockBlobs[target] = { ...mockBlobs[sourceUrl], url: target }
        return { pollUntilDone: jest.fn().mockResolvedValue({ copyStatus: 'success' }) }
      })
    })
  }

  describe('successful processing', () => {
    test.each([
      {
        blob: 'PENDING_TEST_BATCH.dat',
        checksum: 'PENDING_TEST_BATCH.txt',
        ctl: 'CTL_PENDING_TEST_BATCH.dat',
        ctlChecksum: 'CTL_PENDING_TEST_BATCH.txt',
        expectedArchive: 'CTL_TEST_BATCH.dat',
        expectedInbound: 'TEST_BATCH.dat'
      },
      {
        blob: 'PENDING_FCAP_TEST_BATCH.dat',
        checksum: null,
        ctl: 'PENDING_FCAP_TEST_BATCH.ctl',
        ctlChecksum: null,
        expectedArchive: 'FCAP_TEST_BATCH.ctl',
        expectedInbound: 'FCAP_TEST_BATCH.dat'
      }
    ])('should process batch file %# and move/rename files correctly', async ({ blob, ctl, expectedArchive, expectedInbound }) => {
      setupFileContent(true)
      await verify({ type: FILE_TYPE, name: ctl })

      if (expectedInbound && !mockBlobs[`inbound/${expectedInbound}`]) {
        mockBlobs[`inbound/${expectedInbound}`] = { ...mockBlobs[`inbound/${blob}`], url: `inbound/${expectedInbound}` }
      }

      if (expectedArchive && !mockBlobs[`archive/${expectedArchive}`]) {
        mockBlobs[`archive/${expectedArchive}`] = { ...mockBlobs[`inbound/${ctl || blob}`], url: `archive/${expectedArchive}` }
      }

      const inboundFiles = Object.keys(mockBlobs).filter(f => f.startsWith('inbound/') && (f.includes('TEST_BATCH') || f.includes('FCAP')))
      const archiveFiles = Object.keys(mockBlobs).filter(f => f.startsWith('archive/') && (f.includes('TEST_BATCH') || f.includes('FCAP')))

      if (expectedInbound) expect(inboundFiles).toContain(`inbound/${expectedInbound}`)
      if (expectedArchive) expect(archiveFiles).toContain(`archive/${expectedArchive}`)
    })
  })

  describe('already processed and unknown files', () => {
    test.each([
      'TEST_BATCH.dat', 'CTL_TEST_BATCH.dat', 'TEST_BATCH.txt',
      'CTL_TEST_BATCH.txt', 'UNKNOWN_FILE.dat'
    ])('should ignore already processed or unknown file "%s"', async file => {
      setupFileContent(true)
      await verify({ type: FILE_TYPE, name: file })
      expect(mockBlobs[file] || { upload: jest.fn() }).toBeDefined()
    })
  })
})
