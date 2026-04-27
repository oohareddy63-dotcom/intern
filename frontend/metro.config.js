const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for resolving modules from the src directory
config.resolver.alias = {
  '@': './src',
};

module.exports = config;
