const { getNumberOfGlosInvoiceLines } = require('../../../app/verify/get-number-of-glos-invoice-lines')

const batchFileLine = ',,,19/06/2023 23:22:00,,,0730,EWCO003-22-23 97,2599,2599,062-ETPP-SUSTAINABLE FOREST MAN,EWCO,062EWCG,,,,23/24,,,,,1102667064,,19/06/2023 23:22:00,122202115,19/06/2023 23:22:00'

describe('getNumberOfGlosInvoiceLines', () => {
  test.each([
    ['', 0],
    [batchFileLine, 1],
    [`${batchFileLine}\n${batchFileLine}\n${batchFileLine}`, 3],
    [`${batchFileLine}\n${batchFileLine}\n${batchFileLine}\n`, 3],
    [`${batchFileLine}\n${batchFileLine}\n${batchFileLine}\n\n\n\n\n`, 3]
  ])('returns %i for batchFile: %s', (batchFile, expected) => {
    const result = getNumberOfGlosInvoiceLines(batchFile)
    expect(result).toBe(expected)
  })
})
