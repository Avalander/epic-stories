export const database_version = 2

export const initDatabase = upgradeDb => {
	switch (upgradeDb.oldVersion) {
		case 0:
			upgradeDb.createObjectStore('user-cache', { keyPath: 'key' })
		case 1:
			upgradeDb.createObjectStore('user-drafts', { keyPath: 'username' })
	}
}