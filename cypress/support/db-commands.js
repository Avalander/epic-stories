Cypress.Commands.add('$clearDb', () => cy.task('clearDb'))

Cypress.Commands.add('$createTestUser', () => cy.task('createTestUser'))

Cypress.Commands.add('$createUser', (username='test') =>
	cy.task('createUser', username)
)

Cypress.Commands.add('$createInviteToken', () => cy.task('createInviteToken'))

Cypress.Commands.add('$createStories',
	(stories) => cy.task('createStories', stories)
)

Cypress.Commands.add('$insertInDb',
	(collection, items) => cy.task('insertInDb', { collection, items })
)
