// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const child_process = require('child_process')

const test_user = JSON.stringify({
	password: '$2b$10$lbWdsGejhQfVOS4Hf3Fu3e7AIl0L22Po74El0RHE48qX3q5YZ6ueS',
	groups: [ '1' ],
	username: 'test',
})

const path = `DB_URL=mongodb://172.17.0.1:28002/db`

module.exports = (on, config) => {
	on('task', {
		clearDb() {
			child_process.execSync(`${path} node .e2e/tools.js reset users user-preferences stories posts characters invites`)
			return null
		},
		createTestUser() {
			child_process.execSync(`${path} node .e2e/tools.js insert users '${test_user}'`)
			return null
		},
		createInviteToken() {
			const token = child_process.execSync(`${path} node .e2e/tools.js create_token`).toString()
			return token
		}
	})
}