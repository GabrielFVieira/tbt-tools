## Usecases to test:

### Frontend

- **List products -** The system should be able to list all the 10 existing products

  ```mermaid
  graph LR
  A(frontend) -->|gRPC| B(ProductCatalogService/ListProducts)
  ```

- **Product Detail -** The system should be able to return a specific product data

  ```mermaid
  graph LR
  A(frontend) -->|gRPC| B(ProductCatalogService/GetProduct)
  ```

- **Get Recommendation (empty Cart) -** The system should be able to return a list of recommended products

  ```mermaid
  graph LR
  A(frontend)
  A -->|gRPC| B(RecommendationService/ListRecommendations)
  A -->|gRPC| C(ProductCatalogService/GetProduct) -->|gRPC| E
  B -->|gRPC| D(ProductCatalogService/ListProducts)
  B -->|gRPC| E(FeatureFlagService/GetFlag) --> F(PostgreSQL Database)
  ```

- **Get Recommendation (Cart with items) -** TODO: Preencher

  ```mermaid
  graph LR
  A(frontend)
  A -->|gRPC| B(RecommendationService/ListRecommendations)
  A -->|gRPC| C(ProductCatalogService/GetProduct) -->|gRPC| E
  B -->|gRPC| D(ProductCatalogService/ListProducts)
  B -->|gRPC| E(FeatureFlagService/GetFlag) --> F(PostgreSQL Database)
  ```

- **Get Ads -** The system should be able to return a list of product ads

  ```mermaid
  graph LR
  A(frontend)
  A -->|gRPC| B(AdService/GetAds) -->|gRPC| C(FeatureFlagService/GetFlag) --> D(PostgreSQL Database)
  ```

- **View Cart -** TODO: Preencher

- **Add product to Cart -** TODO: Preencher

- **Place Order -** TODO: Preencher

- **Clear Cart -** TODO: Preencher
