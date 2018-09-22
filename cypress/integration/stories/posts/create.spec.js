import urls from '../../../support/urls'


describe('Create post', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createTestUser()
		cy.$login()
	})

	it('Can add a new post', () => {
		prepareStories()
			.then(story_id => {
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.type('It was a long night.')
				cy.get('#edit-save-btn')
					.click()
				cy.get('.post-author')
					.should('contain', 'test')
				cy.get('.post-body')
					.should('contain', 'It was a long night.')
			})
	})

	it('Can add a new meta post', () => {
		prepareStories()
			.then(story_id => {
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.type('It was a long night.')
				cy.get('#edit-save-meta-btn')
					.click()
				cy.get('.meta-group .post-author')
					.should('contain', 'test')
				cy.get('.meta-group .post-body')
					.should('contain', 'It was a long night.')
			})
	})

	it('Fails when text is empty', () => {
		prepareStories()
			.then(story_id => {
				cy.visit(urls.stories.posts(story_id, 1))
			})
		cy.get('#reply-btn')
			.click()
		cy.get('#edit-save-btn')
			.click()
		cy.get('.edit-panel .alert-error')
			.should('contain', `Missing key 'text'`)
	})

	function prepareStories() {
		return cy.fixture('stories/story.list.json')
			.then(cy.$createStories)
			.then(ids => ids[0])
	}
})
