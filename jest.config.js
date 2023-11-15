/** @type {import('ts-jest').JestConfigWithTsJest} */
const IS_E2E = process.env.IS_E2E === "true";

let testRegex = ".*\\.spec\\.ts$";
if (IS_E2E) {
  testRegex = ".e2e-spec.ts$";
}
const testPathIgnorePatterns = ["/lib/"];
module.exports = {
  preset: "ts-jest",
  moduleFileExtensions: ["js", "json", "ts"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "^@helia/unixfs$": "<rootDir>/node_modules/@helia/unixfs/dist/src/index.js",
  },
  testEnvironment: "node",
  testPathIgnorePatterns,
  testRegex,
};
