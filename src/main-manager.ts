import { UserManager } from './managers/user-manager';
import { EntryManager } from './managers/entry-manager';
const mongoose = require('mongoose');

class Manager {
	public static manager: Manager = null;
	constructor() {
		if (Manager.manager == null) {
			Manager.manager = this;
		}
	}
	public userManager: UserManager = new UserManager();
	public entryManager: EntryManager = new EntryManager();
	public mongoose = mongoose;
}

const manager = new Manager();
const MainManager = Manager.manager;
export default MainManager;
