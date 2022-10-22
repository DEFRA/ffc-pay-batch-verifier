const Joi = require('joi')

// Define config schema
const schema = Joi.object({
  totalRetries: Joi.number().integer().default(10),
  pollingInterval: Joi.number().default(10000), // 10 seconds
  pollingActive: Joi.boolean().default(true)
})

// Build config
const config = {
  totalRetries: process.env.TOTAL_RETRIES,
  pollingInterval: process.env.POLLING_INTERVAL,
  pollingActive: process.env.POLLING_ACTIVE
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The verification config is invalid. ${result.error.message}`)
}

module.exports = result.value
