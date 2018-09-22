Cypress.Commands.add('$fillForm', data => {
	Object.keys(data)
		.forEach(
			key => cy.get(key)
				.type(data[key])
		)
})

Cypress.Commands.add('$login', (username='test', password='test') => {
	cy.request({
		url: '/api/login',
		method: 'POST',
		body: {
			username,
			password,
		}
	})
	cy.getCookie('bearer')
		.should('have.property', 'value')
})

Cypress.Commands.add('$path', () => cy.location('pathname'))
