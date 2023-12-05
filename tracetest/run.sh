#!/bin/bash

TRACETEST_DIR=$(dirname "$(readlink -f "$0")")

tracetest configure -e "http://localhost:11633"
tracetest run testsuite --file "${TRACETEST_DIR}/suites/buy_product_test_suite.yaml" \
  --vars "${TRACETEST_DIR}/variables/otel_demo_variable_set.yaml"
