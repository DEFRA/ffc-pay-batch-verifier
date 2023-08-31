const retry = require('../retry')
const storage = require('../storage')

const getFileContent = async (pendingFilenames) => {
  return Promise.all(
    Object.keys(pendingFilenames).map(async (key) => {
      const filename = pendingFilenames[key]
      const content = await retry(() => storage.getFile(filename))
      return { filename, content }
    })
  )
}

module.exports = getFileContent
