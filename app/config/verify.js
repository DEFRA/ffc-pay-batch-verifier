const Joi = require('joi')

// Define config schema
const schema = Joi.object({
  pollingInterval: Joi.number().default(10000), // 10 seconds
  totalRetries: Joi.boolean().default(10)
})

// Build config
const config = {
  pollingInterval: process.env.POLLING_INTERVAL,
  totalRetries: process.env.TOTAL_RETRIES
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
