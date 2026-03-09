const storage = require('../storage')
const verifyBatch = require('../verify')

const pollInbound = async () => {
  const pollStart = Date.now()
  console.log('[pollInbound] Poll started')

  let controlFiles

  try {
    const listStart = Date.now()
    console.log('[pollInbound] Fetching pending control files')

    controlFiles = await storage.getPendingControlFiles()

    const listDuration = Date.now() - listStart
    console.log(`[pollInbound] Retrieved ${controlFiles.length} control files in ${listDuration}ms`)
  } catch (err) {
    console.error('[pollInbound] Failed to fetch control files', err)
    throw err   // ← critical fix
  }

  for (const controlFile of controlFiles) {
    const fileStart = Date.now()

    console.log('[pollInbound] Processing file', controlFile)

    try {
      await verifyBatch(controlFile)

      console.log('[pollInbound] File processed', {
        name: controlFile.name,
        duration: Date.now() - fileStart
      })
    } catch (err) {
      console.error('[pollInbound] File processing failed', {
        name: controlFile.name,
        error: err
      })
    }
  }

  console.log('[pollInbound] Poll finished', {
    filesProcessed: controlFiles.length,
    duration: Date.now() - pollStart
  })
}

module.exports = pollInbound
