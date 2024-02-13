JEST_OTEL_FOLDER=jest-opentelemetry
TRACETEST_FOLDER=tracetest
MALABI_FOLDER=malabi

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

.PHONY: jestotel-k8s
jestotel-k8s: ## Run the jest-opentelemetry tests
	@ docker build -t dev.local/jestotel:sc1 ./${JEST_OTEL_FOLDER}
	@ kind load docker-image dev.local/jestotel:sc1 --name tbt-tests
	@ kubectl create namespace jest-opentelemetry --dry-run=client -o yaml | kubectl apply -f -
	@ kubectl delete deployment jestotel -n jest-opentelemetry || true
	@ kubectl create -f ${JEST_OTEL_FOLDER}/k8s/deployment.yaml

##@ Tracetest

.PHONY: tracetest-setup
tracetest-setup: ## Install the tracetest tests on the server
	@ bash ./${TRACETEST_FOLDER}/setup.sh

.PHONY: tracetest-run
tracetest-run: ## Run the tracetest tests on the server
	@ bash ./${TRACETEST_FOLDER}/run.sh

##@ Malabi

.PHONY: malabi-build
malabi-build: ## Install the malabi dependencies
	@ cd ${MALABI_FOLDER} && npm install

.PHONY: malabi-run
malabi-run: ## Run the malabi tests
	@ cd ${MALABI_FOLDER} && npm run test

.PHONY: malabi-k8s
malabi-k8s: ## Run the malabi tests
	@ docker build -t dev.local/malabi:sc1 ./${MALABI_FOLDER}
	@ kind load docker-image dev.local/malabi:sc1 --name tbt-tests
	@ kubectl create namespace malabi --dry-run=client -o yaml | kubectl apply -f -
	@ kubectl delete deployment malabi -n malabi || true
	@ kubectl create -f ${MALABI_FOLDER}/k8s/deployment.yaml