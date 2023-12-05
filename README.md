## Cenários de teste:

- ### 1 - Sistema 100% funcional

  #### Objetivo:

  Validar a capacidade das ferramentas em testar o sistema em seu fluxo "feliz", onde todos os serviços estão respondendo de acordo com o esperado. Busca-se entender as funcionalidades das ferramentas e validar a dificuldade de criar testes do "zero" em cada uma delas.

  #### Fluxos do sistema a testar:

  **Fluxos via frontend service (Camada que o usuário interage)**

  - **Listar produtos -** O sistema deve ser capaz de retornar todos os 10 produtos cadastrados.

    ```mermaid
    graph LR
    A(frontend) -->|gRPC| B(ProductCatalogService/ListProducts)
    ```

  - **Detalhes de um produto -** O sistema deve ser capaz de retornar as informações sobre um produto em específico (Utilizar o id `0PUK6V6EV0`).

    ```mermaid
    graph LR
    A(frontend) -->|gRPC| B(ProductCatalogService/GetProduct)
    ```

  - **Obter recomendações -** O sistema deve retornar até 4 recomendações de produtos com base no contexto do produto atual. A listagem não pode conter o próprio produto do contexto (Utilizar o id `0PUK6V6EV0`).

    ```mermaid
    graph LR
    A(frontend)
    A -->|gRPC| B(RecommendationService/ListRecommendations)
    A -->|gRPC| C(ProductCatalogService/GetProduct) -->|gRPC| E
    B -->|gRPC| D(ProductCatalogService/ListProducts)
    B -->|gRPC| E(FeatureFlagService/GetFlag) --> F(PostgreSQL Database)
    ```

  - **Adicionar produto ao carrinho -** O sistema deve ser capaz de adicionar um produto ao carrinho vazio (Utilizar o id `0PUK6V6EV0`).

    ```mermaid
    graph LR
    A(frontend)
    A -->|gRPC| B(CartService/GetCart) --> C(Redis Database)
    A -->|gRPC| D(CartService/AddItem) --> C(Redis Database)
    ```

  - **Realizar compra -**

    ```mermaid
    graph LR
    A(frontend)
    A -->|gRPC| B(CheckoutService/PlaceOrder)
    B -->|gRPC| C(CartService/GetCart) --> D(Redis Database)
    B -->|gRPC| E(ProductCatalogService/GetProduct) -->|gRPC| F(FeatureFlagService/GetFlag)
    F --> G(PostgreSQL Database)
    B -->|gRPC| H(CurrencyService/Convert)
    B -->|gRPC| I(ShippingService/GetQuote) -->|HTTP| Q(QuoteService POST/getquote)
    B -->|gRPC| J(PaymentService/Charge)
    B -->|gRPC| K(ShippingService/ShipOrder)
    B -->|gRPC| L(CartService/EmptyCart) --> D
    B -->|HTTP| M(EmailService POST /send_order_confirmation)
    B --> N(Kafka)
    N --> O(AccountingService)
    N --> P(FraudDetectionService)
    A -->|gRPC| E

    ```

  **Fluxos interno**

  - **Funcionamento do serviço de recomendação -** Validar a capacidade da ferramenta em realizar chamadas e testes para componentes internos da aplicação que não podem ser chamados externamente pelo usuário.

    ```mermaid
    graph LR
    A(RecommendationService/ListRecommendations)
    A -->|gRPC| B(ProductCatalogService/ListProducts)
    A -->|gRPC| C(FeatureFlagService/GetFlag) --> D(PostgreSQL Database)
    ```

---

- ### 2 - Serviços CheckoutService e RecommendationService não funcionais

  #### Objetivo:

  Validar a capacidade das ferramentas em identificar pontos de falha no sistema, auxiliando no troubleshooting da aplicação. Para isso serão injetados problemas nas aplicações, no qual a `CheckoutService` não fará a chamada para o `CartService/EmptyCart`, resultando no carrinho de compras nunca sendo esvaziado, porém a compra sendo efetuada. No caso do `RecommendationService` será alterado o código para retornar erro sempre que o método `ListRecommendations` for chamado. No `frauddetectionService` foi alterado o tópico do Kafka que o mesmo escuta, fazendo-o não ser chamado após o fluxo de finalização da compra, tal comportamento não retorna erros para a chamada do usuário, dificultando seu descobrimento.

  #### Fluxos do sistema a testar:

  Os testes dos fluxos **Obter recomendações** e **Realizar compra** deverão apresentar falhas e sinalizar que traces não ocorreram no fluxo.

## Testes criados:

|                     | Tracetest | Jest OpenTelemetry |
| ------------------- | :-------: | :----------------: |
| Fluxos              |     6     |         6          |
| Traces testados     |    34     |         30         |
| Asserts individuais |    67     |         84         |
