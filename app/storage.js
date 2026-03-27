const { DefaultAzureCredential } = require('@azure/identity')
const { BlobServiceClient } = require('@azure/storage-blob')
const config = require('./config/storage')
const { getFileType } = require('./verify/get-file-type')
const { UNKNOWN } = require('./constants/file-types')

let blobServiceClient
let initPromise
let foldersInitialised = false

console.log('[storage] Initialising BlobServiceClient')

if (config.useConnectionStr) {
  console.log('[storage] Using connection string for BlobServiceClient')
  blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionStr)
} else {
  console.log('[storage] Using DefaultAzureCredential for BlobServiceClient')
  const uri = `https://${config.storageAccount}.blob.core.windows.net`
  blobServiceClient = new BlobServiceClient(
    uri,
    new DefaultAzureCredential({
      managedIdentityClientId: config.managedIdentityClientId
    })
  )
}

const container = blobServiceClient.getContainerClient(config.container)

const ensureInitialised = async () => {
  if (!initPromise) {
    console.log('[storage] First initialisation triggered')
    initPromise = initialiseContainers()
  }
  return initPromise
}

const initialiseContainers = async () => {
  const start = Date.now()
  console.log('[storage] initialiseContainers started')

  if (config.createContainers) {
    const createStart = Date.now()
    console.log('[storage] Ensuring blob container exists')

    await container.createIfNotExists()

    console.log(`[storage] Container ready (${Date.now() - createStart}ms)`)
  }

  if (!foldersInitialised) {
    await initialiseFolders()
  }

  console.log(`[storage] initialiseContainers finished (${Date.now() - start}ms)`)
}

const initialiseFolders = async () => {
  const start = Date.now()

  console.log('[storage] Ensuring folders exist')

  const placeHolderText = 'Placeholder'
  const blobPath = `${config.inboundFolder}/default.txt`

  const inboundClient = container.getBlockBlobClient(blobPath)

  const uploadStart = Date.now()
  await inboundClient.upload(placeHolderText, placeHolderText.length)

  console.log(`[storage] Placeholder uploaded (${Date.now() - uploadStart}ms)`)

  foldersInitialised = true

  console.log(`[storage] Folder initialisation finished (${Date.now() - start}ms)`)
}

const getBlob = async (folder, filename) => {
  await ensureInitialised()

  const blobPath = `${folder}/${filename}`
  console.log('[storage] getBlob', { blobPath })

  return container.getBlockBlobClient(blobPath)
}

const sanitizeFilename = (filename) => {
  const sanitized = filename.replace(`${config.container}/${config.inboundFolder}/`, '')

  if (filename !== sanitized) {
    console.log('[storage] sanitizeFilename', { original: filename, sanitized })
  }

  return sanitized
}

const getFile = async (filename) => {
  const start = Date.now()

  filename = sanitizeFilename(filename)

  console.log('[storage] getFile searching', { filename })

  const blob = await getBlob(config.inboundFolder, filename)

  const downloadStart = Date.now()
  const downloaded = await blob.downloadToBuffer()

  console.log('[storage] blob downloaded', {
    filename,
    bytes: downloaded.length,
    duration: Date.now() - downloadStart
  })

  console.log('[storage] getFile complete', {
    filename,
    totalDuration: Date.now() - start
  })

  return downloaded.toString()
}

const getPendingControlFiles = async () => {
  const start = Date.now()

  await ensureInitialised()

  console.log('[storage] Listing pending control files')

  const fileList = []
  const prefix = `${config.inboundFolder}/`

  let scanned = 0

  for await (const file of container.listBlobsFlat({ prefix })) {
    scanned++

    const filename = file.name.replace(prefix, '')
    const type = getFileType(filename)

    if (type !== UNKNOWN) {
      fileList.push({ type, name: filename })
    }

    if (scanned % 100 === 0) {
      console.log('[storage] Blob scan progress', {
        scanned,
        matched: fileList.length
      })
    }
  }

  console.log('[storage] Blob listing complete', {
    scanned,
    matched: fileList.length,
    duration: Date.now() - start
  })

  return fileList
}

// Copies blob from one folder to another folder and deletes blob from original folder
const moveFile = async (sourceFolder, destinationFolder, sourceFilename, destinationFilename) => {
  const start = Date.now()

  console.log('[storage] moveFile start', {
    sourceFolder,
    destinationFolder,
    sourceFilename,
    destinationFilename
  })

  const sourceBlob = await getBlob(sourceFolder, sourceFilename)
  const destinationBlob = await getBlob(destinationFolder, destinationFilename)

  const copyStart = Date.now()

  const copyPoller = await destinationBlob.beginCopyFromURL(sourceBlob.url)
  const copyResult = await copyPoller.pollUntilDone()

  console.log('[storage] copy operation finished', {
    duration: Date.now() - copyStart,
    status: copyResult.copyStatus
  })

  if (copyResult.copyStatus === 'success') {
    const deleteStart = Date.now()

    await sourceBlob.delete()

    console.log('[storage] source blob deleted', {
      filename: sourceFilename,
      duration: Date.now() - deleteStart
    })

    console.log('[storage] moveFile success', {
      filename: sourceFilename,
      totalDuration: Date.now() - start
    })

    return true
  }

  console.warn('[storage] moveFile failed', {
    filename: sourceFilename,
    status: copyResult.copyStatus
  })

  return false
}

const archiveFile = async (filename) => {
  console.log('[storage] archiveFile', { filename })
  return moveFile(config.inboundFolder, config.archiveFolder, filename, filename)
}

const quarantineFile = async (filename) => {
  console.log('[storage] quarantineFile', { filename })
  return moveFile(config.inboundFolder, config.quarantineFolder, filename, filename)
}

const renameFile = async (filename, targetFilename) => {
  filename = sanitizeFilename(filename)
  targetFilename = sanitizeFilename(targetFilename)

  console.log('[storage] renameFile', { filename, targetFilename })

  return moveFile(config.inboundFolder, config.inboundFolder, filename, targetFilename)
}

module.exports = {
  getPendingControlFiles,
  getFile,
  renameFile,
  archiveFile,
  quarantineFile
}
