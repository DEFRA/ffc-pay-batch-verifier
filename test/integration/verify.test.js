const crypto = require('crypto')
const { BlobServiceClient } = require('@azure/storage-blob')
const storageConfig = require('../../app/config/storage')
const pollInbound = require('../../app/poll/poll-inbound')

let blobServiceClient
let container

const createHash = (content) => {
  return crypto.createHash('sha256').update(content).digest('hex')
}

const INBOUND = 'inbound'
const ARCHIVE = 'archive'
const QUARANTINE = 'quarantine'

const VALID_CONTENT = 'Valid content'
const VALID_HASH = createHash(VALID_CONTENT)
const INVALID_CONTENT = 'Invalid content'
const EMPTY_CONTENT = ''

const ORIGINAL_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.dat'
const ORIGINAL_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.dat'
const ORIGINAL_CHECKSUM_BLOB_NAME = 'PENDING_TEST_BATCH.txt'
const ORIGINAL_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.txt'

const PROCESSED_BATCH_BLOB_NAME = 'TEST_BATCH.dat'
const PROCESSED_CTL_BATCH_BLOB_NAME = 'CTL_TEST_BATCH.dat'
const PROCESSED_CHECKSUM_BLOB_NAME = 'TEST_BATCH.txt'
const PROCESSED_CTL_CHECKSUM_BLOB_NAME = 'CTL_TEST_BATCH.txt'

const uploadBlob = async (blobName, content) => {
  const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${blobName}`)
  await blockBlobClient.upload(content, content.length)
}

const getBlobs = async (folder) => {
  let directory
  switch (folder) {
    case ARCHIVE:
      directory = storageConfig.archive
      break
    case QUARANTINE:
      directory = storageConfig.quarantine
      break
    default:
      directory = storageConfig.inbound
      break
  }

  const fileList = []
  for await (const item of container.listBlobsFlat({ prefix: directory })) {
    fileList.push(item.name.replace(`${directory}/`, ''))
  }
  return fileList
}

describe('verify batch content', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionStr)
    container = blobServiceClient.getContainerClient(storageConfig.container)
    await container.deleteIfExists()
    await container.createIfNotExists()
  })

  test('renames batch file on success if all files present and hash valid', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, EMPTY_CONTENT)
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, EMPTY_CONTENT)

    await pollInbound()

    const files = await getBlobs(INBOUND)

    expect(files.filter(x => x === PROCESSED_BATCH_BLOB_NAME).length).toBe(1)
  })

  test('renames and archives batch control file on success if all files present and hash valid', async () => {
    await uploadBlob(ORIGINAL_BATCH_BLOB_NAME, VALID_CONTENT)
    await uploadBlob(ORIGINAL_CTL_BATCH_BLOB_NAME, '')
    await uploadBlob(ORIGINAL_CHECKSUM_BLOB_NAME, VALID_HASH)
    await uploadBlob(ORIGINAL_CTL_CHECKSUM_BLOB_NAME, '')

    await pollInbound()

    const files = await getBlobs(ARCHIVE)

    expect(files.filter(x => x === PROCESSED_CTL_BATCH_BLOB_NAME).length).toBe(1)
  })

  // test('ignores unrelated file', async () => {F
  //   const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inbound}/ignore me.dat`)
  //   await blockBlobClient.uploadFile(TEST_FILEPATH_SFI_PILOT)

  //   await pollInbound()

  //   const fileList = []
  //   for await (const item of container.listBlobsFlat()) {
  //     fileList.push(item.name)
  //   }
  //   expect(fileList.filter(x => x === `${storageConfig.inbound}/ignore me.dat`).length).toBe(1)
  // })

  // test('quarantines invalid batch header number of payment requests to actual number of payment requests for SFI Pilot', async () => {
  //   const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI_PILOT}`)
  //   await blockBlobClient.uploadFile(TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILEPATH_SFI_PILOT)

  //   await pollInbound()

  //   const fileList = []
  //   for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
  //     fileList.push(item.name)
  //   }
  //   expect(fileList.filter(x => x === `${storageConfig.quarantineFolder}/${TEST_INVALID_BATCH_HEADER_NUMBER_OF_PAYMENT_REQUESTS_TO_ACTUAL_NUMBER_OF_PAYMENT_REQUESTS_FILE_SFI_PILOT}`).length).toBe(1)
  // })
})
