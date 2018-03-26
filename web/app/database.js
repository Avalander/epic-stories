export default upgradeDb => {
	switch (upgradeDb.oldVersion) {
		case 0:
			upgradeDb.createObjectStore('user-cache', { keyPath: 'key' })
	}
}