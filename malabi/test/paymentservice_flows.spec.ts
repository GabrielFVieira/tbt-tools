const SERVICE_UNDER_TEST_PORT = process.env.PORT || 8086;
import { malabi } from 'malabi';

import { expect } from 'chai';
import axios from 'axios';

describe('testing service-under-test remotely', () => {
    it('successful /users request', async () => {
        // get spans created from the previous call
        const telemetryRepo = await malabi( async () => {
            // call to the service under test
            // const res = await axios.post(`http://localhost:${SERVICE_UNDER_TEST_PORT}/api/v1/pay`);
			// await axios.get(`http://localhost:${SERVICE_UNDER_TEST_PORT}/users/Rick`).catch(()=>{});
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

			// expect(res.status).equals(400);
        });

		console.log("Resp: ")
		console.log(telemetryRepo)

		console.log("Span: ")
		console.log(telemetryRepo.spans.first)

        // Validating that /users had ran a single select statement and responded with an array.
        const sequelizeActivities = telemetryRepo.spans.sequelize();
        expect(sequelizeActivities.length).equals(1);
        expect(sequelizeActivities.first.dbOperation).equals("SELECT");
        expect(Array.isArray(JSON.parse(sequelizeActivities.first.dbResponse))).equals(true);
    });
});