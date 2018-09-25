import urls from '../../support/urls'


describe('My character', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createTestUser()
		cy.$login()
	})

	it('Can create a new character', () => {
		prepareStories()
			.then(([ story_id ]) => {
				cy.visit(urls.stories.myCharacter(story_id))
				cy.$fillForm({
					'#name': 'Twilight Sparkle',
					'#high-concept': 'Princess of friendship.',
					'#trouble': 'Socialising is overrated.',
					'#description': 'Protagonist of My Little Pony.'
				})
				cy.get('#save-btn')
					.click()
				cy.get('.alert-success')
					.contains('Character saved successfully')
				cy.get('.tab-container')
					.contains('Characters')
					.click()
				cy.$path()
					.should('eq', urls.stories.characters(story_id))
				cy.contains('Twilight Sparkle')
					.click()
				cy.get('.character-body')
					.should('contain', 'test')
					.should('contain', 'Princess of friendship.')
					.should('contain', 'Socialising is overrated.')
					.should('contain', 'Protagonist of My Little Pony.')
			})
	})

	it('Can edit an existing character', () => {
		prepareStories()
			.then(([ story_id ]) => {
				prepareCharacter(story_id)
				cy.visit(urls.stories.myCharacter(story_id))
				cy.$fillForm({
					'#description': 'Edited description.'
				})
				cy.get('#save-btn')
					.click()
				cy.get('.alert-success')
					.contains('Character saved successfully')
				cy.get('.tab-container')
					.contains('Characters')
					.click()
				cy.$path()
					.should('eq', urls.stories.characters(story_id))
				cy.contains('Twilight Sparkle')
					.click()
				cy.get('.character-body')
					.should('contain', 'test')
					.should('contain', 'Princess of friendship.')
					.should('contain', 'Socialising is overrated.')
					.should('contain', 'Edited description.')
			})
	})

	it('Fails when name is empty', () => {
		prepareStories()
			.then(([story_id]) => {
				cy.visit(urls.stories.myCharacter(story_id))
				cy.$fillForm({
					'#high-concept': 'Princess of friendship.',
					'#trouble': 'Socialising is overrated.',
					'#description': 'Protagonist of My Little Pony.'
				})
				cy.get('#save-btn')
					.click()
				cy.get('.alert-error')
					.contains(`Missing key 'name'`)
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

	function prepareCharacter(story_id) {
		cy.fixture('stories/character.one.json')
			.then(x => cy.$insertInDb('characters', ({ ...x, story_id })))

	}
})