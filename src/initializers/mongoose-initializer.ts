'use strict';

import MainManager from '../main-manager';
import { Initializer } from '../etc/app/initializer';

const { MONGO_HOST, MONGO_PORT, MONGO_DB } = process.env;
const mongoStr = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;

export default class MongooseInitializer extends Initializer {
	async run() {
		await MainManager.mongoose.connect(mongoStr);
		return true;
	}
}
