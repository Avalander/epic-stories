import urls from '../../../support/urls'


describe('List posts', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createUser()
		cy.$login()
	})

	it('Shows only chapter posts', () => {
		prepareStories()
			.then(story_id => {
				preparePosts(story_id)
				cy.visit(urls.stories.posts(story_id, 1))
				postsArePresent([
					[ 'First post.', 'test', 1 ],
					[ 'Second post.', 'batman', 2 ],
					[ 'Third post.', 'test', 3 ],
					[ 'Fourth post.', 'batman', 4 ],
					[ 'Seventh post.', 'test', 5 ],
					[ 'Eighth post.', 'batman', 6 ],
				])
				cy.get('.content')
					.should('not.contain', 'Fifth post.')
					.should('not.contain', 'Sixth post.')
			})
	})

	it('Groups adjacent meta posts', () => {
		prepareStories()
			.then(story_id => {
				preparePosts(story_id)
				preparePosts(story_id, '/stories/post.meta.json')
				cy.visit(urls.stories.posts(story_id, 1))
				cy.get('.post-list .main > :nth-child(2)')
					.should('have.class', 'meta-group')
					.should('contain', 'First meta post.')
					.should('contain', 'Second meta post.')
					.should('contain', 'Third meta post.')
					.should('not.contain', 'Fourth meta post.')
				cy.get('.post-list .main > :nth-child(4)')
					.should('have.class', 'meta-group')
					.should('not.contain', 'First meta post.')
					.should('not.contain', 'Second meta post.')
					.should('not.contain', 'Third meta post.')
					.should('contain', 'Fourth meta post.')
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

	function preparePosts(story_id, fixture = '/stories/post-2.list.json') {
		return cy.fixture(fixture)
			.then(posts =>
				posts.map(
					x => ({ ...x, story_id })
				)
			)
			.then(posts => cy.$insertInDb('posts', posts))
	}
})