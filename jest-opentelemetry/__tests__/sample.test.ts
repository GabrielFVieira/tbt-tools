import { jest, describe, it, beforeAll } from "@jest/globals";
import { expectTrace, TraceLoop } from "@traceloop/expect-opentelemetry";

jest.setTimeout(30000);

describe("resource http request matchers", () => {
	describe("when orders-service makes an http call to emails-service", () => {
		let traceloop: TraceLoop;
		beforeAll(async () => {
			traceloop = new TraceLoop();

			await traceloop.axiosInstance.get("http://host.docker.internal:8080/api/products/2ZYFJ3GM2N");
			await traceloop.fetchTraces({ url: "http://localhost:4123/v1/traces" });
		});

		// it("should contain outbound http call from orders-service with all parameters", async () => {
		// 	expectTrace(traceloop.serviceByName("orders-service"))
		// 		.toSendHttpRequest()
		// 		.withMethod("POST")
		// 		.withUrl("/emails/send", { compareType: "contains" })
		// 		.withRequestHeader("content-type", "application/json")
		// 		.withRequestBody({
		// 			email: "test",
		// 			nestedObject: { test: "test" },
		// 		})
		// 		.withRequestBody({ nestedObject: { test: "test" } }, { compareType: "contains" })
		// 		.withStatusCode(200);
		// });

		it("should contain inbound http call to emails-service", async () => {
			expectTrace(traceloop.serviceByName("frontend"))
				.toReceiveHttpRequest()
				.withMethod("GET")
				.withUrl("/api/products/2ZYFJ3GM2N", { compareType: "contains" })
				.withStatusCode(200);
		});
	});
});
