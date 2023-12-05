JEST_OTEL_FOLDER=jest-opentelemetry

##@ General

help: ## Display this help.
	@ awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-49s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Jest OpenTelemetry

.PHONY: jestotel-build
jestotel-build: ## Install the jest-opentelemetry dependencies
	@ cd ${JEST_OTEL_FOLDER} && npm install

.PHONY: jestotel-run
jestotel-run: ## Run the jest-opentelemetry tests
	@ cd ${JEST_OTEL_FOLDER} && npm run test

.PHONY: jestotel-receiver
jestotel-receiver: ## Run thje jest-opentelemetry receiver application
	@ node jest-opentelemetry/node_modules/@traceloop/otel-receiver/dist/index.js