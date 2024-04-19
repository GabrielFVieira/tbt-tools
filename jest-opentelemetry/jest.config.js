module.exports = {
	preset: "@traceloop/jest-opentelemetry",
	transform: {
		"^.+\\.(t|j)sx?$": ["@swc/jest"],
	},
	transformIgnorePatterns: [
		"<rootDir>/node_modules/@babel",
		"<rootDir>/node_modules/@jest",
		"<rootDir>/node_modules/lodash",
		"signal-exit",
		"is-typedarray",
	],
	testEnvironment: "jest-environment-node",
	testTimeout: 1000000,
};
