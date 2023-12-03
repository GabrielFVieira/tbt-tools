JEST_OTEL_FOLDER=jest-opentelemetry

.PHONY: jestotel-build
jestotel-build:
	@ cd ${JEST_OTEL_FOLDER} && npm install

.PHONY: jestotel-run
jestotel-run:
	@ cd ${JEST_OTEL_FOLDER} && npm run test