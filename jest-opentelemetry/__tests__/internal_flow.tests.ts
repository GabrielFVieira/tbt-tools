import { jest, describe, it, beforeAll } from "@jest/globals";
import { expectTrace, TraceLoop } from "@traceloop/expect-opentelemetry";
import { ChannelCredentials } from "@grpc/grpc-js";
import { ListRecommendationsResponse, RecommendationServiceClient } from "../protos/demo";

const { RECOMMENDATION_SERVICE_ADDR = "" } = process.env;
const FETCH_TRACES_CONFIG = { maxPollTime: 15000, awaitAllSpansInTraceTimeout: 4000 };

jest.setTimeout(30000);

describe("List recommendation internal flow", () => {
	let traceloop: TraceLoop;
	beforeAll(async () => {
		traceloop = new TraceLoop();

		const client = new RecommendationServiceClient(RECOMMENDATION_SERVICE_ADDR, ChannelCredentials.createInsecure());
		const recommendationServiceGateway = () => ({
			listRecomendations() {
				return new Promise<ListRecommendationsResponse>((resolve, reject) =>
					client.listRecommendations({ productIds: [], userId: "" }, (error, response) =>
						error ? reject(error) : resolve(response)
					)
				);
			},
		});

		await recommendationServiceGateway().listRecomendations();
		await traceloop.fetchTraces(FETCH_TRACES_CONFIG);

		client.close();
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
