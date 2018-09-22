import urls from '../../support/urls'


describe('Story header', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createTestUser()
		cy.$login()
	})

	it('Has header links', () => {
		prepareStories()
			.then(([ story_id ]) => {
				cy.visit(urls.stories.detail(story_id))
				cy.get('.tab-container')
					.contains('Chapters')
					.should('have.attr', 'href', urls.stories.chapters(story_id))
				cy.get('.tab-container')
					.contains('Characters')
					.should('have.attr', 'href', urls.stories.characters(story_id))
				cy.get('.tab-container')
					.contains('My Character')
					.should('have.attr', 'href', urls.stories.myCharacter(story_id))
			})
	})

	it('Has link to chapters', () => {
		prepareStories()
			.then(([story_id]) => {
				cy.visit(urls.stories.detail(story_id))
				cy.get('.tab-container')
					.contains('Chapters')
					.should('have.attr', 'href', urls.stories.chapters(story_id))
					.click()
				cy.$path()
					.should('eq', urls.stories.chapters(story_id))
				cy.get('.tab-container')
					.contains('Chapters')
					.should('have.class', 'active')
			})
	})

	it('Has link to characters', () => {
		prepareStories()
			.then(([story_id]) => {
				cy.visit(urls.stories.detail(story_id))
				cy.get('.tab-container')
					.contains('Characters')
					.should('have.attr', 'href', urls.stories.characters(story_id))
					.click()
				cy.$path()
					.should('eq', urls.stories.characters(story_id))
				cy.get('.tab-container')
					.contains('Characters')
					.should('have.class', 'active')
			})
	})

	it('Has link to my character', () => {
		prepareStories()
			.then(([story_id]) => {
				cy.visit(urls.stories.detail(story_id))
				cy.get('.tab-container')
					.contains('My Character')
					.should('have.attr', 'href', urls.stories.myCharacter(story_id))
					.click()
				cy.$path()
					.should('eq', urls.stories.myCharacter(story_id))
				cy.get('.tab-container')
					.contains('My Character')
					.should('have.class', 'active')
			})
	})

	function prepareStories() {
		return cy.fixture('stories/story.list.json')
			.then(cy.$createStories)
			.then(ids => {
				return cy.fixture('/stories/post.list.json')
					.then(posts =>
						posts.map(
							x => ({ ...x, story_id: ids[0] })
						)
					)
					.then(posts => cy.$insertInDb('posts', posts))
					.then(() => ids)
			})
	}
})