import * as Dotenv from 'dotenv';
Dotenv.config({ path: __dirname + '/../.env' });
import 'source-map-support/register';
import MongooseInitializer from './initializers/mongoose-initializer';
import ServerInitializer from './initializers/server-initializer';

(async () => {
	console.log(`*********** INITIALIZING STARTED ***********`);
	await new MongooseInitializer();
	await new ServerInitializer();
	console.log(`*********** INITIALIZING FINISHED **********`);
})();
