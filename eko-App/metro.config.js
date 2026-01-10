const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver for web to handle react-native-maps
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // On web, replace react-native-maps with a mock
    if (platform === 'web' && moduleName === 'react-native-maps') {
      return {
        type: 'empty',
      };
    }
    
    // Use default resolution for everything else
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
