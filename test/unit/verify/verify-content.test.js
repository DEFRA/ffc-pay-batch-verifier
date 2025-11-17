const verifyContent = require('../../../app/verify/verify-content')

const VALID_CONTENT = 'This is valid content'
const INVALID_CONTENT = 'This is invalid content'
const VALID_HASH = '66782c2a5e08026b7dac0d6dc377cbc478eec6eaa32da3415616806deca338d0'

describe('verifyContent', () => {
  test('returns true when content matches hash', () => {
    expect(verifyContent(VALID_CONTENT, VALID_HASH)).toBe(true)
  })

  test('returns false when content does not match hash', () => {
    expect(verifyContent(INVALID_CONTENT, VALID_HASH)).toBe(false)
  })

  test.each([
    ['', VALID_HASH],
    [VALID_CONTENT, ''],
    ['', ''],
    [null, VALID_HASH],
    [VALID_CONTENT, null],
    [null, null],
    [undefined, VALID_HASH],
    [VALID_CONTENT, undefined],
    [undefined, undefined],
    [{}, VALID_HASH],
    [VALID_CONTENT, {}],
    [{}, {}],
    [[], VALID_HASH],
    [VALID_CONTENT, []],
    [[], []],
    [123, VALID_HASH],
    [VALID_CONTENT, 123],
    [123, 123],
    [true, VALID_HASH],
    [VALID_CONTENT, true],
    [true, true],
    [() => {}, VALID_HASH],
    [VALID_CONTENT, () => {}],
    [() => {}, () => {}]
  ])('returns false for invalid content/hash pair (%p, %p)', (content, hash) => {
    expect(verifyContent(content, hash)).toBe(false)
  })
})
