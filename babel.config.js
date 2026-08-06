module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource lets NativeWind read className on React Native views.
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // react-native-reanimated's babel plugin is added by babel-preset-expo
    // automatically when the package is installed. Adding it here as well
    // would apply it twice and break the build.
  };
};
