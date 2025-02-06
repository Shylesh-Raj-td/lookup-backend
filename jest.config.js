module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',  // Ensure .ts files are processed by ts-jest
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,  // Optional: speeds up tests but may impact types in some cases
    },
  },
};
