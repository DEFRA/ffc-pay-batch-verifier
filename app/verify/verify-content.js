const crypto = require('crypto')

const verifyContent = (content, hash) => {
  const fileHash = crypto.createHash('sha256').update(content).digest('hex')
  const isValid = fileHash === hash

  if (isValid) {
    console.log('File content successfully verified')
  } else {
    console.log('File verification failed')
    console.log(`File hash: ${fileHash}`)
    console.log(`Validation hash: ${hash}`)
  }
  return isValid
}

module.exports = {
  verifyContent
}
