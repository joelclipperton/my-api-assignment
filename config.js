/*
 * Create and export environments
 *
 */

 // Environments object
 const environments = {};

 // Staging ENV
environments.staging = {
  'envName': 'staging',
  'httpPort': 3000,
  'httpsPort': 3001
};

// Production ENV
environments.production = {
  'envName': 'production',
  'httpPort': 5000,
  'httpsPort': 5001
}

// Determine with environment was passed through the command line or system ENV.
let currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that currentEnv is predefined in environments {}, if not, default to staging.
let environmentToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

// Export environment
module.exports = environmentToExport;