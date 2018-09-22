import urls from '../../support/urls'


describe('Create story', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createTestUser()
		cy.$login()
	})

	it('Creates a new story', () => {
		cy.visit(urls.stories.list())
		cy.contains('Start a new story')
			.click()
		cy.get('#title')
			.type('Once upon a time')
		cy.get('#save-btn')
			.click()
		cy.contains('Chapters')
		cy.contains('Once upon a time')
	})

	it('Fails when title is empty', () => {
		cy.visit(urls.stories.list())
		cy.contains('Start a new story')
			.click()
		cy.get('#save-btn')
			.click()
		cy.contains(`Missing key 'title'`)
	})

	it('Hides title input on cancel', () => {
		cy.visit(urls.stories.list())
		cy.contains('Start a new story')
			.click()
		cy.get('#cancel-btn')
			.click()
		cy.get('#title')
			.should('not.exist')
	})

	it('Clears title after cancel', () => {
		cy.visit(urls.stories.list())
		openCreate()
		cy.get('#title')
			.type('Potatoes')
		cy.get('#cancel-btn')
			.click()
		cy.get('#title')
			.should('not.exist')
		openCreate()
		cy.get('#title')
			.should('have.value', '')
	})

	function openCreate() {
		cy.contains('Start a new story')
			.click()
	}
})