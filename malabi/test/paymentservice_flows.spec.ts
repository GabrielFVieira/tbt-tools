const SERVICE_UNDER_TEST_PORT = process.env.PORT || 8086;

import { malabi } from 'malabi';

import { expect } from 'chai';
import axios from 'axios';

describe('Charge requests', () => {
    it('Card successfuly charged', async () => {
        const telemetryRepo = await malabi( async () => {
			await axios.post(`http://localhost:${SERVICE_UNDER_TEST_PORT}/api/v1/pay`, {
				amount: {
					currencyCode: "USD",
					nanos: 0,
					units: 1
				},
				creditCard: {
					creditCardCvv: 123,
					creditCardExpirationMonth: 12,
					creditCardExpirationYear: 2024,
					creditCardNumber: "4432-8015-6152-0454"
				}
			}).catch(()=>{});
        });

		const httpSpans = telemetryRepo.spans.httpPost();
		expect(httpSpans.length).equals(1);
		expect(httpSpans.first.httpRoute).equals("/api/v1/pay")
		expect(httpSpans.first.statusCode).equals(200)
		expect(httpSpans.first.attribute("app.payment.amount").valueOf()).equals(1)

		const chargeSpans = telemetryRepo.spans.all.filter(span => span.name == "charge")
		expect(chargeSpans.length).equals(1);
		expect(chargeSpans[0].attribute("app.payment.card_type").toString()).equals("visa")
		expect(chargeSpans[0].attribute("app.payment.card_valid").valueOf()).equals(true)
		expect(chargeSpans[0].attribute("app.payment.charged").valueOf()).equals(true)
    });

    it('Invalid card number', async () => {
        const telemetryRepo = await malabi( async () => {
			await axios.post(`http://localhost:${SERVICE_UNDER_TEST_PORT}/api/v1/pay`, {
				amount: {
					currencyCode: "USD",
					nanos: 0,
					units: 1
				},
				creditCard: {
					creditCardCvv: 123,
					creditCardExpirationMonth: 12,
					creditCardExpirationYear: 2024,
					creditCardNumber: "0123-4567-8910-1112"
				}
			}).catch(()=>{});
        });

		const httpSpans = telemetryRepo.spans.httpPost();
		expect(httpSpans.length).equals(1);
		expect(httpSpans.first.httpRoute).equals("/api/v1/pay")
		expect(httpSpans.first.statusCode).equals(400)
		expect(httpSpans.first.hasError).equals(true)
		expect(httpSpans.first.attribute("app.payment.amount").valueOf()).equals(1)

		const chargeSpans = telemetryRepo.spans.all.filter(span => span.name == "charge")
		expect(chargeSpans.length).equals(0);
    });

	it('Invalid card type', async () => {
        const telemetryRepo = await malabi( async () => {
			await axios.post(`http://localhost:${SERVICE_UNDER_TEST_PORT}/api/v1/pay`, {
				amount: {
					currencyCode: "USD",
					nanos: 0,
					units: 1
				},
				creditCard: {
					creditCardCvv: 1782,
					creditCardExpirationMonth: 12,
					creditCardExpirationYear: 2027,
					creditCardNumber: "5067-2766-0618-2975"
				}
			}).catch(()=>{});
        });

		const httpSpans = telemetryRepo.spans.httpPost();
		expect(httpSpans.length).equals(1);
		expect(httpSpans.first.httpRoute).equals("/api/v1/pay")
		expect(httpSpans.first.statusCode).equals(400)
		expect(httpSpans.first.hasError).equals(true)
		expect(httpSpans.first.attribute("app.payment.amount").valueOf()).equals(1)

		const chargeSpans = telemetryRepo.spans.all.filter(span => span.name == "charge")
		expect(chargeSpans.length).equals(0);
    });
});