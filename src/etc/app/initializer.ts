'use strict';

export abstract class Initializer {
	constructor() {
		console.log(
			`*********** INITIALIZING ********** ------> ${this.constructor.name}`
		);
		(async () => {
			await this.run();
		})();
	}

	abstract run(): Promise<any>;
}
