Cypress.Commands.add('$clearDb', () => cy.task('clearDb'))

Cypress.Commands.add('$createTestUser', () => cy.task('createTestUser'))

Cypress.Commands.add('$createInviteToken', () => cy.task('createInviteToken'))