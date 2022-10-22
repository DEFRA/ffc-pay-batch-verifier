jest.mock('../../app/poll')
const poll = require('../../app/poll')

describe('app', () => {
  beforeEach(() => {
    require('../../app')
  })

  test('starts polling once', async () => {
    expect(poll.start).toHaveBeenCalledTimes(1)
  })
})
