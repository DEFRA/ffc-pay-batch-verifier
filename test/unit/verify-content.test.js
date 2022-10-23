const verifyContent = require('../../app/verify/verify-content')

describe('verify content', () => {
  test('should return true when content matches hash', () => {
    const content = 'Hello World'
    const hash = '2ef7bde608ce5404e97d5f042f95f89f1c2328719e8b1b4bca0d1f0da11f5c4b'
    const result = verifyContent(content, hash)

    expect(result).toBeTruthy()
  })
})
