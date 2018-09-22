import urls from '../support/urls'


describe('Login page', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createTestUser()
	})

	it('Loads', () => {
		cy.visit(urls.login)
		cy.contains('Login')
		cy.contains('Username')
		cy.contains('Password')
	})

	it('Can login with a valid user', () => {
		cy.visit(urls.login)
		cy.$fillForm({
			'#username': 'test',
			'#password': 'test',
		})
		cy.get('form')
			.submit()
		cy.location('pathname')
			.should('eq', urls.home)
	})

	it('Fails with an invalid username', () => {
		cy.visit(urls.login)
		cy.$fillForm({
			'#username': 'testo',
			'#password': 'test',
		})
		cy.get('form')
			.submit()
		cy.contains('User not found')
	})

	it('Fails with an invalid password', () => {
		cy.visit(urls.login)
		cy.$fillForm({
			'#username': 'test',
			'#password': 'testo',
		})
		cy.get('form')
			.submit()
		cy.contains('User not found')
	})

	it('Fails with an empty username', () => {
		cy.visit(urls.login)
		cy.$fillForm({
			'#password': 'test',
		})
		cy.get('form')
			.submit()
		cy.contains('Username is empty')
	})

	it('Fails with an empty password', () => {
		cy.visit(urls.login)
		cy.$fillForm({
			'#username': 'test',
		})
		cy.get('form')
			.submit()
		cy.contains('Password is empty')
	})
})