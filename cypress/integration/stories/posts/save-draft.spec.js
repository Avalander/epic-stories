import urls from '../../../support/urls'


describe('Save post draft', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createUser()
		cy.$createUser('pinkie.pie')
		cy.$login()
	})

	it('Saves draft', () => {
		prepareStories()
			.then(story_id => {
				cy.visit(urls.stories.posts(story_id, 1))
			})
		cy.get('#reply-btn')
			.click()
		cy.get('#edit-text')
			.type('This is a draft.')
		cy.reload()
		cy.get('#reply-btn')
			.click()
		cy.get('#edit-text')
			.should('have.value', 'This is a draft.')
	})

	it('Discards draft on cancel', () => {
		prepareStories()
			.then(story_id => {
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.type('This is a draft.')
				cy.get('#edit-cancel-btn')
					.click()
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.should('have.value', '')
				cy.reload()
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.should('have.value', '')
			})
	})

	it(`Doesn't show draft when logged in with another user`, () => {
		prepareStories()
			.then(story_id => {
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.type('This is a draft.')
				cy.$login('pinkie.pie')
				cy.reload()
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.should('have.value', '')
			})
	})

	it('Shows draft after logging in with another user and loging in back', () => {
		prepareStories()
			.then(story_id => {
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.type('This is a draft.')
				cy.$login('pinkie.pie')
				cy.reload()
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.should('have.value', '')
				cy.$login('test')
				cy.reload()
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.should('have.value', 'This is a draft.')
			})
	})

	it('Saves draft of an edited post', () => {
		prepareStories()
			.then(story_id => {
				preparePosts(story_id)
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('.post-body-header > .button-container > .btn')
					.click()
				cy.get('#edit-text')
					.type(' This is an edit.')
				cy.reload()
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.should('have.value', 'First post. This is an edit.')
				cy.get('.edit-panel')
					.should('contain', 'Editing post created on')
					.find('time')
						.should('have.attr', 'datetime', '2018-09-15T17:19:44.816Z')
			})
	})

	it('Posts draft after saving', () => {
		prepareStories()
			.then(story_id => {
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.type('This is a draft.')
				cy.$login('pinkie.pie')
				cy.reload()
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.should('have.value', '')
				cy.$login('test')
				cy.reload()
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-text')
					.should('have.value', 'This is a draft.')
				cy.get('#edit-save-btn')
					.click()
				cy.get('.post-author')
					.should('contain', 'test')
				cy.get('.post-body')
					.should('contain', 'This is a draft.')
			})
	})

	it('Posts edit draft after saving', () => {
		prepareStories()
			.then(story_id => {
				preparePosts(story_id)
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('.post-body-header > .button-container > .btn')
					.click()
				cy.get('#edit-text')
					.type(' This is an edit.')
				cy.reload()
				cy.get('#reply-btn')
					.click()
				cy.get('#edit-save-btn')
					.click()
				cy.get(':nth-child(1) > .post-body')
					.should('contain', 'First post. This is an edit.')
			})
	})

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
