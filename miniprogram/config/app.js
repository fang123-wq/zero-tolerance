/**
 * Mini Program runtime config.
 * Default is local development mode.
 */

// Current mini program AppID.
const APP_ID = 'wx0d1aac1dd838a649';

// Environment switch:
// - development: local mock mode
// - production: fill your own service endpoints
const ENV = 'development';

const CONFIG = {
  development: {
    apiBaseUrl: '',
    webBaseUrl: '',
    vrBaseUrl: '',
    imageBaseUrl: '',
    debug: true,
    // Static runnable mode: local mock API, no backend required.
    mockData: true
  },
  production: {
    apiBaseUrl: '',
    webBaseUrl: '',
    vrBaseUrl: '',
    imageBaseUrl: '',
    debug: false,
    mockData: false
  }
};

const currentConfig = CONFIG[ENV] || CONFIG.development;

module.exports = {
  appId: APP_ID,
  env: ENV,
  apiBaseUrl: currentConfig.apiBaseUrl,
  webBaseUrl: currentConfig.webBaseUrl,
  vrBaseUrl: currentConfig.vrBaseUrl,
  imageBaseUrl: currentConfig.imageBaseUrl,
  debug: currentConfig.debug,
  mockData: currentConfig.mockData,
  config: currentConfig
};
