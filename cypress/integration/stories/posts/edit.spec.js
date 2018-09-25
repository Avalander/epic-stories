import urls from '../../../support/urls'


describe('Edit post', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createTestUser()
		cy.$login()
	})

	it(`Can edit user's posts`, () => {
		prepareStories()
			.then(story_id => {
				preparePosts(story_id)
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get(':nth-child(1) > .post-body > .post-body-header > .button-container')
					.contains('Edit')
					.click()
				cy.get('#edit-text')
					.type(' This is an edit.')
				cy.get('#edit-save-btn')
					.click()
				postsArePresent([
					[ 'First post. This is an edit.', 'test', 1 ],
					[ 'Second post.', 'batman', 2 ],
				])
			})
	})

	it(`Cannot edit another user's posts`, () => {
		prepareStories()
			.then(story_id => {
				preparePosts(story_id)
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get(':nth-child(2) > .post-body > .post-body-header > .button-container')
					.should('not.contain', 'Edit')
			})
	})

	it('Can change a regular post to meta', () => {
		prepareStories()
			.then(story_id => {
				preparePosts(story_id)
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get(':nth-child(1) > .post-body > .post-body-header > .button-container')
					.contains('Edit')
					.click()
				cy.get('#edit-text')
					.type(' This is an edit.')
				cy.get('#edit-save-meta-btn')
					.click()
				cy.get('.meta-group > .post > .post-header')
					.should('contain', 'test')
				cy.get('.meta-group > .post > .post-body')
					.should('contain', 'First post. This is an edit.')
			})
	})


	function postsArePresent(posts) {
		cy.wrap(posts)
			.each(([text, author, position]) => {
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
