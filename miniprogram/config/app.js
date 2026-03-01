/**
 * Mini Program runtime config.
 * Default is local development mode.
 */

// Current mini program AppID.
const APP_ID = 'wx0d1aac1dd838a649';

// Environment switch:
// - development: local backend/web/vr
// - production: online services
const ENV = 'development';

// For real-device preview, change LOCAL_HOST to your LAN IP (e.g. 192.168.1.10).
const LOCAL_HOST = '127.0.0.1';

const CONFIG = {
  development: {
    apiBaseUrl: 'http://' + LOCAL_HOST + ':3000/api',
    webBaseUrl: 'http://' + LOCAL_HOST + ':8080',
    vrBaseUrl: 'http://' + LOCAL_HOST + ':8084/',
    // Keep image resources on OSS by default.
    imageBaseUrl: 'https://oss.bjgjlc.com/drug-education',
    debug: true,
    // Static runnable mode: local mock API, no backend required.
    mockData: true
  },
  production: {
    apiBaseUrl: 'https://drug.coiot.net/api',
    webBaseUrl: 'https://drug-web.coiot.net',
    vrBaseUrl: 'https://drug-vr.coiot.net/vr-panorama/',
    imageBaseUrl: 'https://oss.bjgjlc.com/drug-education',
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
