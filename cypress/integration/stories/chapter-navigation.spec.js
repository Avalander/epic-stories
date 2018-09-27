import urls from '../../support/urls'


describe('Chapter navigation', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createUser()
		cy.$login()
	})

	it('Only displays next chapter link in first chapter', () => {
		prepareStories()
			.then(([ story_id ]) => {
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('.pager.left')
					.should('not.exist')
				cy.get('.pager.right')
					.should('exist')
					.should('have.attr', 'title', 'Next chapter')
					.should('have.attr', 'href', urls.stories.posts(story_id, 2))
			})
	})

	it('Displays previous and next chapter links in second chapter', () => {
		prepareStories()
			.then(([ story_id ]) => {
				cy.visit(urls.stories.posts(story_id, 2))
				cy.get('.pager.left')
					.should('exist')
					.should('have.attr', 'title', 'Previous chapter')
					.should('have.attr', 'href', urls.stories.posts(story_id, 1))
				cy.get('.pager.right')
					.should('exist')
					.should('have.attr', 'title', 'Next chapter')
					.should('have.attr', 'href', urls.stories.posts(story_id, 3))
			})
	})

	it('Only displays previous chapter link in last chapter', () => {
		prepareStories()
			.then(([ story_id ]) => {
				cy.visit(urls.stories.posts(story_id, 3))
				cy.get('.pager.left')
					.should('exist')
					.should('have.attr', 'title', 'Previous chapter')
					.should('have.attr', 'href', urls.stories.posts(story_id, 2))
				cy.get('.pager.right')
					.should('not.exist')
			})
	})

	it('Navigate through chapters using the links', () => {
		prepareStories()
			.then(([ story_id ]) => {
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('.pager.left')
					.should('not.exist')
				// Second page
				cy.get('.pager.right')
					.should('exist')
					.click()
				cy.$path()
					.should('eq', urls.stories.posts(story_id, 2))
				cy.get('.post-list')
					.should('contain', 'Fourth post.')
					.should('contain', 'Fifth post.')
					.should('contain', 'Sixth post.')
				// Third page
				cy.get('.pager.right')
					.should('exist')
					.click()
				cy.$path()
					.should('eq', urls.stories.posts(story_id, 3))
				cy.get('.post-list')
					.should('contain', 'Seventh post.')
					.should('contain', 'Eighth post.')
				// Back to second page
				cy.get('.pager.left')
					.should('exist')
					.click()
				cy.$path()
					.should('eq', urls.stories.posts(story_id, 2))
				cy.get('.post-list')
					.should('contain', 'Fourth post.')
					.should('contain', 'Fifth post.')
					.should('contain', 'Sixth post.')
				// Back to first page
				cy.get('.pager.left')
					.should('exist')
					.click()
				cy.$path()
					.should('eq', urls.stories.posts(story_id, 1))
				cy.get('.post-list')
					.should('contain', 'First post.')
					.should('contain', 'Second post.')
					.should('contain', 'Third post.')
			})
	})

	function prepareStories() {
		return cy.fixture('stories/chapter-navigation/story.list.json')
			.then(cy.$createStories)
			.then(ids => {
				return cy.fixture('stories/chapter-navigation/post.list.json')
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