import urls from '../support/urls'


describe('Sidebar', () => {
	before(() => {
		cy.$clearDb()
		cy.$createUser()
		cy.fixture('stories/story.list.json')
			.then(cy.$createStories)
	})

	beforeEach(() => {
		cy.$login()
	})

	it('Appears when clicking the toolbar icon', () => {
		cy.visit(urls.home)
		cy.get('[data-action="open-sidebar"]')
			.click()
		cy.get('.sidebar')
			.should('exist')
			.should('have.css', 'width', '250px')
		cy.get('.sidebar .avatar')
			.should('have.attr', 'src', '/api/avatars/test')
		cy.get('.sidebar-header')
			.should('contain', 'test')
	})

	it('Can be closed by clicking on the overlay', () => {
		cy.visit(urls.home)
		cy.get('[data-action="open-sidebar"]')
			.click()
		cy.get('.sidebar')
			.should('exist')
			.should('have.css', 'width', '250px')
		cy.get('.overlay')
			.should('exist')
			.click()
		cy.get('.sidebar')
			.should('not.exist')
		cy.get('.overlay')
			.should('not.exist')
	})

	it('Can be closed by clicking the dismiss button', () => {
		cy.visit(urls.home)
		cy.get('[data-action="open-sidebar"]')
			.click()
		cy.get('.sidebar')
			.should('exist')
			.should('have.css', 'width', '250px')
		cy.get('.dismiss')
			.click()
		cy.get('.sidebar')
			.should('not.exist')
		cy.get('.overlay')
			.should('not.exist')
	})

	it('Shows all existing stories', () => {
		cy.visit(urls.home)
		cy.get('[data-action="open-sidebar"]')
			.click()
		cy.get('.sidebar .components')
			.should('contain', 'All Stories')
			.should('contain', 'Once upon a time')
			.should('contain', 'Miss Beaver')
			.should('contain', 'Preferences')
	})
})