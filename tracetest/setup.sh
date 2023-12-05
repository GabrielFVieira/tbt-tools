#!/bin/bash

TRACETEST_DIR=$(dirname "$(readlink -f "$0")")

tracetest configure -e "http://localhost:11633"

tests=("add_to_cart.yaml" "checkout.yaml" "get_product.yaml" "list_products.yaml" "product_recommendation_grpc.yaml" "product_recommendation.yaml")

tracetest apply variableset -f "${TRACETEST_DIR}/variables/otel_demo_variable_set.yaml"

for test in ${tests[@]}; do
  tracetest apply test -f "${TRACETEST_DIR}/tests/${test}"
done

tracetest apply testsuite -f "${TRACETEST_DIR}/suites/buy_product_test_suite.yaml"
