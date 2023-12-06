import { jest, describe, it, beforeAll } from "@jest/globals";
import { expectTrace, TraceLoop } from "@traceloop/expect-opentelemetry";
import crypto from "crypto";

const { FRONTEND_SERVICE_ADDR = "" } = process.env;
const TEST_PRODUCT_ID = "0PUK6V6EV0";
const FETCH_TRACES_CONFIG = { maxPollTime: 15000, awaitAllSpansInTraceTimeout: 4000 }

jest.setTimeout(30000);

describe("Application flow simulating the user interaction when trying to buy a product", () => {
	const userId = crypto.randomUUID();

	describe("List Products", () => {
		let traceloop: TraceLoop;
		beforeAll(async () => {
			traceloop = new TraceLoop();

			await traceloop.axiosInstance.get(`${FRONTEND_SERVICE_ADDR}/api/products`);
			await traceloop.fetchTraces(FETCH_TRACES_CONFIG);
		});

		it("Frontend endpoint should be called on GET /api/products", async () => {
			expectTrace(traceloop.serviceByName("frontend"))
				.toReceiveHttpRequest()
				.withMethod("GET")
				.withUrl("/api/products", { compareType: "contains" })
				.withStatusCode(200);
		});

		it("ProductCatalogService/ListProducts should be called via gRPC", async () => {
			expectTrace(traceloop.serviceByName("productcatalogservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("ListProducts")
				.withRpcGrpcStatusCode(0);
		});
	});

	describe("Get Product", () => {
		let traceloop: TraceLoop;
		beforeAll(async () => {
			traceloop = new TraceLoop();

			await traceloop.axiosInstance.get(`${FRONTEND_SERVICE_ADDR}/api/products/${TEST_PRODUCT_ID}`);
			await traceloop.fetchTraces(FETCH_TRACES_CONFIG);
		});

		it(`Frontend endpoint should be called on GET /api/products/${TEST_PRODUCT_ID}`, async () => {
			expectTrace(traceloop.serviceByName("frontend"))
				.toReceiveHttpRequest()
				.withMethod("GET")
				.withUrl(`/api/products/${TEST_PRODUCT_ID}`, { compareType: "contains" })
				.withStatusCode(200);
		});

		it("ProductCatalogService/GetProduct should be called via gRPC", async () => {
			expectTrace(traceloop.serviceByName("productcatalogservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("GetProduct")
				.withRpcGrpcStatusCode(0);
		});
	});




	describe("Sample test", () => {
		let traceloop: TraceLoop;
		beforeAll(async () => {
			traceloop = new TraceLoop();

			await traceloop.axiosInstance.get(`${FRONTEND_SERVICE_ADDR}/api/products`);
			await traceloop.fetchTraces(FETCH_TRACES_CONFIG);
		});

		it(`Frontend endpoint should be called on GET /api/products/${TEST_PRODUCT_ID}`, async () => {
			expectTrace(traceloop.serviceByName("frontend")).;
		});
	});










	describe("Get products recommendations", () => {
		let traceloop: TraceLoop;
		beforeAll(async () => {
			traceloop = new TraceLoop();

			await traceloop.axiosInstance.get(`${FRONTEND_SERVICE_ADDR}/api/recommendations`);
			await traceloop.fetchTraces(FETCH_TRACES_CONFIG);
		});

		it("Frontend endpoint should be called on GET /api/recommendations", async () => {
			expectTrace(traceloop.serviceByName("frontend"))
				.toReceiveHttpRequest()
				.withMethod("GET")
				.withUrl("/api/recommendations", { compareType: "contains" })
				.withStatusCode(200);
		});

		it("RecomendationService/ListRecommendations should be called via gRPC", async () => {
			expectTrace(traceloop.serviceByName("recommendationservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("ListRecommendations")
				.withRpcGrpcStatusCode(0);
		});

		it("ProductCatalogService/ListProducts should be called via gRPC", async () => {
			expectTrace(traceloop.serviceByName("productcatalogservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("ListProducts")
				.withRpcGrpcStatusCode(0);
		});

		it("ProductCatalogService/GetProduct should be called via gRPC", async () => {
			expectTrace(traceloop.serviceByName("productcatalogservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("GetProduct")
				.withRpcGrpcStatusCode(0);
		});
	});

	describe("Add to Cart", () => {
		let traceloop: TraceLoop;
		beforeAll(async () => {
			traceloop = new TraceLoop();

			await traceloop.axiosInstance.post(`${FRONTEND_SERVICE_ADDR}/api/cart`, {
				userId: userId,
				item: {
					productId: TEST_PRODUCT_ID,
					quantity: 1,
				},
			});
			await traceloop.fetchTraces(FETCH_TRACES_CONFIG);
		});

		it("Frontend endpoint should be called on POST /api/cart", async () => {
			expectTrace(traceloop.serviceByName("frontend"))
				.toReceiveHttpRequest()
				.withMethod("POST")
				.withUrl("/api/cart", { compareType: "contains" })
				.withStatusCode(200);
		});

		it("CartService/AddItem should be called via gRPC", async () => {
			expectTrace(traceloop.serviceByName("cartservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("AddItem")
				.withRpcGrpcStatusCode(0);
		});

		it("CartService/GetCart should be called via gRPC", async () => {
			expectTrace(traceloop.serviceByName("cartservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("GetCart")
				.withRpcGrpcStatusCode(0);
		});

		it("Cart retrived from Redis database", async () => {
			expectTrace(traceloop.serviceByName("cartservice"))
				.toSendRedisCommand({ times: 2 })
				.withStatement(`HGET ${userId}`, { compareType: "equals" });
		});

		it("Cart item set on Redis database", async () => {
			expectTrace(traceloop.serviceByName("cartservice"))
				.toSendRedisCommand({ times: 1 })
				.withStatement(`HMSET ${userId}`, { compareType: "equals" });
		});
	});

	describe("Checkout", () => {
		let traceloop: TraceLoop;
		beforeAll(async () => {
			traceloop = new TraceLoop();

			await traceloop.axiosInstance.post(`${FRONTEND_SERVICE_ADDR}/api/checkout`, {
				userId: userId,
				email: "someone@example.com",
				address: {
					streetAddress: "1600 Amphitheatre Parkway",
					state: "CA",
					country: "United States",
					city: "Mountain View",
					zipCode: "94043",
				},
				userCurrency: "USD",
				creditCard: {
					creditCardCvv: 672,
					creditCardExpirationMonth: 1,
					creditCardExpirationYear: 2030,
					creditCardNumber: "4432-8015-6152-0454",
				},
			});
			await traceloop.fetchTraces(FETCH_TRACES_CONFIG);
		});

		it("Frontend endpoint should be called on POST /api/checkout", async () => {
			expectTrace(traceloop.serviceByName("frontend"))
				.toReceiveHttpRequest()
				.withMethod("POST")
				.withUrl("/api/checkout", { compareType: "contains" })
				.withStatusCode(200);
		});

		it("Order placed", async () => {
			expectTrace(traceloop.serviceByName("checkoutservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("PlaceOrder")
				.withRpcGrpcStatusCode(0);
		});

		it("Currency conversion called", async () => {
			expectTrace(traceloop.serviceByName("currencyservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("Convert")
				.withRpcGrpcStatusCode(0);
		});

		it("Cart retrived", async () => {
			expectTrace(traceloop.serviceByName("cartservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("GetCart")
				.withRpcGrpcStatusCode(0);
		});

		it("Cart retrived from Redis database", async () => {
			expectTrace(traceloop.serviceByName("cartservice"))
				.toSendRedisCommand({ times: 1 })
				.withStatement(`HGET ${userId}`, { compareType: "equals" });
		});

		it("Quote retrived", async () => {
			expectTrace(traceloop.serviceByName("checkoutservice"))
				.toSendGrpcRequest()
				.withRpcMethod("GetQuote")
				.withRpcGrpcStatusCode(0);
		});

		it("User charged", async () => {
			expectTrace(traceloop.serviceByName("paymentservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("Charge")
				.withRpcGrpcStatusCode(0);
		});

		it("Order shipped", async () => {
			expectTrace(traceloop.serviceByName("shippingservice")).toReceiveGrpcRequest().withRpcGrpcStatusCode(0);
		});

		it("Cart Emptied", async () => {
			expectTrace(traceloop.serviceByName("cartservice"))
				.toReceiveGrpcRequest()
				.withRpcMethod("EmptyCart")
				.withRpcGrpcStatusCode(0);
		});

		it("Cart was updated at the Redis database", async () => {
			expectTrace(traceloop.serviceByName("cartservice"))
				.toSendRedisCommand({ times: 1 })
				.withStatement(`HMSET ${userId}`, { compareType: "equals" });
		});

		it("Email confirmation sent", async () => {
			expectTrace(traceloop.serviceByName("emailservice"))
				.toReceiveHttpRequest()
				.withMethod("POST")
				.withStatusCode(200);
		});

		it("Order sent to be processed asyncronously", async () => {
			expectTrace(traceloop.serviceByCustomAttribute("messaging.destination.name", "orders"));
		});

		it("Order sent to accountability service", async () => {
			expectTrace(traceloop.serviceByName("orders receive"));
		});

		it("Order sent to fraud detection service", async () => {
			expectTrace(traceloop.serviceByCustomAttribute("messaging.kafka.consumer.group", "frauddetectionservice"));
		});
	});
});
