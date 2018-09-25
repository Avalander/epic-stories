import urls from '../../support/urls'


describe('Characters', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createTestUser()
		cy.$login()
	})

	it('Displays existing characters', () => {
		prepareStories()
			.then(story_id => {
				cy.visit(urls.stories.characters(story_id))
				cy.log(story_id)
				return cy.fixture('stories/character.list.json')
			})
			.then(chars => {
				cy.wrap(chars)
					.each(x =>
						cy.get('.content')
							.should('contain', x.name)
							.should('contain', x.username)
							.should('contain', x.high_concept)
							.should('contain', x.trouble)
					)
			})
	})


	function prepareStories() {
		return cy.fixture('stories/story.list.json')
			.then(cy.$createStories)
			.then(ids => {
				cy.fixture('/stories/post.list.json')
					.then(posts =>
						posts.map(
							x => ({ ...x, story_id: ids[0] })
						)
					)
					.then(posts => cy.$insertInDb('posts', posts))
					.then(() => prepareCharacters(ids[0]))
			})
	}

	function prepareCharacters(story_id) {
		return cy.fixture('/stories/character.list.json')
			.then(chars =>
				chars.map(x => ({ ...x, story_id }))
			)
			.then(chars =>
				cy.$insertInDb('characters', chars)
			)
			.then(() => story_id)
	}
})