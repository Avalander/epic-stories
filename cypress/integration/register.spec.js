import urls from '../support/urls'


describe('Register page', () => {
	it('Loads', () => {
		cy.visit(urls.register())
		cy.contains('Register')
		cy.contains('Username')
		cy.contains('Password')
		cy.contains('Repeat password')
	})

	it('Fails when no invite token is provided', () => {
		cy.visit(urls.register())
		cy.$fillForm({
			'#username': 'batman',
			'#password': 'potatoes',
			'#repeat-password': 'potatoes',
		})
		cy.get('form')
			.submit()
		cy.contains('Invalid token')
	})

	it('Fails when passwords do not match', () => {
		cy.visit(urls.register())
		cy.$fillForm({
			'#username': 'batman',
			'#password': 'potatoes',
			'#repeat-password': 'potatos',
		})
		cy.get('form')
			.submit()
		cy.contains(`Passwords don't match`)
	})

	it('Fails when username is empty', () => {
		cy.visit(urls.register())
		cy.$fillForm({
			'#password': 'potatoes',
			'#repeat-password': 'potatoes',
		})
		cy.get('form')
			.submit()
		cy.contains('Please provide a username')
	})

	it('Fails when password is empty', () => {
		cy.visit(urls.register())
		cy.$fillForm({
			'#username': 'batman',
		})
		cy.get('form')
			.submit()
		cy.contains(`Passwords don't match`)
	})

	it('Fails when token is invalid', () => {
		cy.visit(urls.register('invalid'))
		cy.$fillForm({
			'#username': 'batman',
			'#password': 'potatoes',
			'#repeat-password': 'potatoes',
		})
		cy.get('form')
			.submit()
		cy.contains('Invalid token')
	})

	/*
	it('Can register with a valid token', () => {
		const token = cy.$db()
			.createToken()
		cy.visit(urls.register(token))
	})
	*/
})