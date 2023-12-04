import { jest, describe, it, beforeAll } from "@jest/globals";
import { expectTrace, TraceLoop } from "@traceloop/expect-opentelemetry";
import { ChannelCredentials } from "@grpc/grpc-js";
import { ProductCatalogServiceClient } from "../protos/demo";

jest.setTimeout(30000);

describe("resource http request matchers", () => {
	describe("when orders-service makes an http call to emails-service", () => {
		let traceloop: TraceLoop;
		beforeAll(async () => {
			traceloop = new TraceLoop();

			const client = new ProductCatalogServiceClient("localhost:8083", ChannelCredentials.createInsecure());

			client.getProduct({ id: "2ZYFJ3GM2N" }, () => {});

			// await traceloop.axiosInstance.get("http://host.docker.internal:8080/api/products/2ZYFJ3GM2N");
			await traceloop.fetchTraces({ url: "http://localhost:4123/v1/traces" });
		});

		it("should contain inbound http call to emails-service", async () => {
			expectTrace(traceloop.serviceByName("productcatalogservice")).toReceiveGrpcRequest().withRpcMethod("GetProduct");
		});
	});
});
