module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin',
     [
      'module-resolver',
      {
        alias: {
          '$assets': './src/assets',
          '$constants': './src/constants',
          '$components': './src/components/ludo',
          '$helpers': './src/helpers',
          '$screens': './src/screens/ludo',
          '$redux': './src/redux',
          '$hooks': './src/hooks',
          '$navigation': './src/navigation',
        },
      },
    ],
  ],
};
