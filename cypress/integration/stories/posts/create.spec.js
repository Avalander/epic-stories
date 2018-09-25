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

	it('Adds new post to the end of the list', () => {
		prepareStories()
			.then(story_id => {
				preparePosts(story_id)
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.type('This should be third post.')
				cy.get('#edit-save-btn')
					.click()
				postsArePresent([
					[ 'First post.', 'test', 1 ],
					[ 'Second post.', 'batman', 2 ],
					[ 'This should be third post.', 'test', 3 ],
				])
			})
	})

	function postsArePresent(posts) {
		cy.wrap(posts)
			.each(([ text, author, position ]) => {
				cy.get(`:nth-child(${position}) > .post-body`)
					.should('contain', text)
					.find('.post-body-header')
						.should('contain', author)
			})
	}

	function prepareStories() {
		return cy.fixture('stories/story.list.json')
			.then(cy.$createStories)
			.then(ids => ids[0])
	}

	function preparePosts(story_id) {
		return cy.fixture('/stories/post.list.json')
			.then(posts =>
				posts.map(
					x => ({ ...x, story_id })
				)
			)
			.then(posts => cy.$insertInDb('posts', posts))
	}
})
