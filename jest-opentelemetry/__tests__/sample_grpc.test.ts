import { jest, describe, it, beforeAll } from "@jest/globals";
import { expectTrace, TraceLoop } from "@traceloop/expect-opentelemetry";
import { ChannelCredentials } from "@grpc/grpc-js";
import { Product, ProductCatalogServiceClient } from "../protos/demo";

jest.setTimeout(30000);

describe("resource http request matchers", () => {
	describe("when orders-service makes an http call to emails-service", () => {
		let traceloop: TraceLoop;
		beforeAll(async () => {
			traceloop = new TraceLoop();

			const client = new ProductCatalogServiceClient("localhost:8083", ChannelCredentials.createInsecure());
			const productCatalogGateway = () => ({
				getProduct(id: string) {
					return new Promise<Product>((resolve, reject) =>
						client.getProduct({ id }, (error, response) => (error ? reject(error) : resolve(response)))
					);
				},
			});

			await productCatalogGateway().getProduct("2ZYFJ3GM2N");
			await traceloop.fetchTraces({ url: "http://localhost:4123/v1/traces" });

			client.close();
		});

		it("should contain inbound http call to productcatalogservice", async () => {
			expectTrace(traceloop.serviceByName("productcatalogservice")).toReceiveGrpcRequest().withRpcMethod("GetProduct");
		});
	});
});
