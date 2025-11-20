const { BlobServiceClient } = require('@azure/storage-blob')
jest.mock('../../../app/config/verify', () => ({ totalRetries: 1 }))
const createHash = require('../../../app/verify/create-hash')
const storageConfig = require('../../../app/config/storage')
const pollInbound = require('../../../app/polling/poll-inbound')

const INBOUND = 'inbound'
const ARCHIVE = 'archive'
const QUARANTINE = 'quarantine'

const VALID_CONTENT = 'Valid content'
const VALID_HASH = createHash(VALID_CONTENT)
const INVALID_CONTENT = 'Invalid content'
const EMPTY_CONTENT = ''

const FILES = {
  ORIGINAL_BATCH: 'PENDING_TEST_BATCH.dat',
  ORIGINAL_CTL_BATCH: 'CTL_PENDING_TEST_BATCH.dat',
  ORIGINAL_CHECKSUM: 'PENDING_TEST_BATCH.txt',
  ORIGINAL_CTL_CHECKSUM: 'CTL_PENDING_TEST_BATCH.txt',
  GLOS_BATCH: 'PENDING_FCAP_TEST_BATCH.dat',
  GLOS_CTL_BATCH: 'PENDING_FCAP_TEST_BATCH.ctl',
  PROCESSED_BATCH: 'TEST_BATCH.dat',
  PROCESSED_CTL_BATCH: 'CTL_TEST_BATCH.dat',
  PROCESSED_CHECKSUM: 'TEST_BATCH.txt',
  PROCESSED_CTL_CHECKSUM: 'CTL_TEST_BATCH.txt',
  GLOS_PROCESSED_BATCH: 'FCAP_TEST_BATCH.dat',
  GLOS_PROCESSED_CTL_BATCH: 'FCAP_TEST_BATCH.ctl'
}

let blobServiceClient
let container

const upload = async (file, content) => {
  const client = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${file}`)
  await client.upload(content, content.length)
}

const listBlobs = async (folder) => {
  const prefix = folder === ARCHIVE
    ? storageConfig.archiveFolder
    : folder === QUARANTINE
      ? storageConfig.quarantineFolder
      : storageConfig.inboundFolder
  const files = []
  for await (const blob of container.listBlobsFlat({ prefix })) {
    files.push(blob.name.replace(`${prefix}/`, ''))
  }
  return files
}

describe('verifyBatchContent', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionStr)
    container = blobServiceClient.getContainerClient(storageConfig.container)
    await container.deleteIfExists()
    await container.createIfNotExists()
  })

  describe('successful processing', () => {
    const tests = [
      { blob: FILES.ORIGINAL_BATCH, ctl: FILES.ORIGINAL_CTL_BATCH, checksum: FILES.ORIGINAL_CHECKSUM, ctlChecksum: FILES.ORIGINAL_CTL_CHECKSUM, expectedInbound: FILES.PROCESSED_BATCH, expectedArchive: FILES.PROCESSED_CTL_BATCH },
      { blob: FILES.ORIGINAL_BATCH, ctl: FILES.ORIGINAL_CTL_BATCH, checksum: FILES.ORIGINAL_CHECKSUM, ctlChecksum: FILES.ORIGINAL_CTL_CHECKSUM, expectedInbound: null, expectedArchive: FILES.PROCESSED_CHECKSUM },
      { blob: FILES.ORIGINAL_BATCH, ctl: FILES.ORIGINAL_CTL_BATCH, checksum: FILES.ORIGINAL_CHECKSUM, ctlChecksum: FILES.ORIGINAL_CTL_CHECKSUM, expectedInbound: null, expectedArchive: FILES.PROCESSED_CTL_CHECKSUM },
      { blob: FILES.GLOS_BATCH, ctl: FILES.GLOS_CTL_BATCH, checksum: FILES.ORIGINAL_CHECKSUM, ctlChecksum: FILES.ORIGINAL_CTL_CHECKSUM }
    ]

    test.each(tests)('processes batch %p and moves/renames correctly', async ({ blob, ctl, checksum, ctlChecksum, expectedInbound, expectedArchive }) => {
      if (blob) {
        await upload(blob, VALID_CONTENT)
      }

      if (ctl) {
        await upload(ctl, EMPTY_CONTENT)
      }

      if (checksum) {
        await upload(checksum, VALID_HASH)
      }

      if (ctlChecksum) {
        await upload(ctlChecksum, EMPTY_CONTENT)
      }

      await pollInbound()

      const inbound = await listBlobs(INBOUND)
      const archive = await listBlobs(ARCHIVE)

      if (expectedInbound) {
        expect(inbound).toContain(expectedInbound)
      }

      if (expectedArchive) {
        expect(archive).toContain(expectedArchive)
      }
    })
  })

  describe('failed processing', () => {
    const filesToQuarantine = [FILES.ORIGINAL_BATCH, FILES.ORIGINAL_CTL_BATCH, FILES.ORIGINAL_CHECKSUM, FILES.ORIGINAL_CTL_CHECKSUM]

    test.each(filesToQuarantine)('quarantines %p when hash invalid/empty', async (file) => {
      await upload(FILES.ORIGINAL_BATCH, INVALID_CONTENT)
      await upload(FILES.ORIGINAL_CTL_BATCH, EMPTY_CONTENT)
      await upload(FILES.ORIGINAL_CHECKSUM, VALID_HASH)
      await upload(FILES.ORIGINAL_CTL_CHECKSUM, EMPTY_CONTENT)

      await pollInbound()
      const quarantine = await listBlobs(QUARANTINE)
      expect(quarantine).toContain(file)
    })
  })

  describe('missing files', () => {
    test('does not process batch if files missing', async () => {
      await upload(FILES.ORIGINAL_BATCH, VALID_CONTENT)
      await upload(FILES.ORIGINAL_CHECKSUM, VALID_HASH)
      await upload(FILES.ORIGINAL_CTL_CHECKSUM, EMPTY_CONTENT)

      await pollInbound()
      const inbound = await listBlobs(INBOUND)
      expect(inbound).toEqual(expect.arrayContaining([FILES.ORIGINAL_BATCH, FILES.ORIGINAL_CHECKSUM, FILES.ORIGINAL_CTL_CHECKSUM]))
    })

    test('pollInbound does not throw if files missing', async () => {
      await upload(FILES.ORIGINAL_CTL_BATCH, EMPTY_CONTENT)
      await expect(pollInbound()).resolves.not.toThrow()
    })
  })

  describe('already processed and unknown files', () => {
    const processed = [FILES.PROCESSED_BATCH, FILES.PROCESSED_CTL_BATCH, FILES.PROCESSED_CHECKSUM, FILES.PROCESSED_CTL_CHECKSUM]

    test.each(processed)('ignores already processed %p', async (file) => {
      await upload(file, file.includes('CHECKSUM') ? VALID_HASH : EMPTY_CONTENT)
      await pollInbound()
      const inbound = await listBlobs(INBOUND)
      expect(inbound).toContain(file)
    })

    test('ignores unknown file', async () => {
      await upload('UNKNOWN_BLOB_NAME', VALID_CONTENT)
      await pollInbound()
      const inbound = await listBlobs(INBOUND)
      expect(inbound).toContain('UNKNOWN_BLOB_NAME')
    })
  })
})
