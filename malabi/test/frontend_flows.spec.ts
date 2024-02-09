const { FRONTEND_SERVICE_ADDR = "" } = process.env;

import { malabi } from 'malabi';

import { expect } from 'chai';
import axios from 'axios';

const TEST_PRODUCT_ID = "0PUK6V6EV0";

describe('Checkout cart', function () {
	this.timeout(30000)

	const userId = crypto.randomUUID();

    it('Card successfuly charged', async () => {
        const telemetryRepo = await malabi( async () => {
			await axios.post(`${FRONTEND_SERVICE_ADDR}/api/cart`, {
				userId: userId,
				item: {
					productId: TEST_PRODUCT_ID,
					quantity: 1,
				},
			});

			await axios.post(`${FRONTEND_SERVICE_ADDR}/api/checkout`, {
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
        });

		const httpSpans = telemetryRepo.spans.httpPost();
		expect(httpSpans.length).equals(1);
		expect(httpSpans.first.httpRoute).equals("/api/v1/pay")
		expect(httpSpans.first.statusCode).equals(200)
		expect(httpSpans.first.attribute("app.payment.amount").valueOf()).equals(183.9) // 175 product + 8.9 shipping

		const chargeSpans = telemetryRepo.spans.all.filter(span => span.name == "charge")
		expect(chargeSpans.length).equals(1);
		expect(chargeSpans[0].attribute("app.payment.card_type").toString()).equals("visa")
		expect(chargeSpans[0].attribute("app.payment.card_valid").valueOf()).equals(true)
		expect(chargeSpans[0].attribute("app.payment.charged").valueOf()).equals(true)
    });
});