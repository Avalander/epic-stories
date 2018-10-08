import urls from '../../support/urls'


describe('List stories', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createTestUser()
		cy.$login()
	})

	it(`Shows stories in the user's group`, () => {
		cy.fixture('stories/story.list.json')
			.then(cy.$createStories)
		cy.visit(urls.stories.list())
		cy.contains('Once upon a time')
		cy.contains('Miss Beaver')
	})

	it(`Doesn't show stories that are not in the user's group`, () => {
		cy.fixture('stories/story.list.json')
			.then(cy.$createStories)
		cy.visit(urls.stories.list())
		cy.get('body')
			.should('not.contain', 'Lady Fate')
	})

	it(`Links to the right story`, () => {
		cy.fixture('stories/story.list.json')
			.then(cy.$createStories)
			.then(([ first, second ]) => {
				cy.visit(urls.stories.list())
				cy.contains('Once upon a time')
					.click()
				cy.location('pathname')
					.should('eq', urls.stories.chapters(first))
				cy.visit(urls.stories.list())
				cy.contains('Miss Beaver')
					.click()
				cy.location('pathname')
					.should('eq', urls.stories.chapters(second))
			})
	})

	it('Has link to latest post when story has posts', () => {
		cy.fixture('stories/story.list.json')
			.then(cy.$createStories)
			.then(([ first ]) => {
				cy.fixture('/stories/post.list.json')
					.then(posts =>
						posts.map(
							x => ({ ...x, story_id: first })
						)
					)
					.then(posts => cy.$insertInDb('posts', posts))
				cy.visit(urls.stories.list())
				cy.get('.link-to-latest time')
					.should('have.attr', 'datetime', '2018-09-15T17:19:46.816Z')
					.click()
				cy.location('pathname')
					.should('contain', urls.stories.posts(first, 1))
			})
	})
})