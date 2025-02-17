module.exports = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  setupFiles: ["dotenv/config"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};
