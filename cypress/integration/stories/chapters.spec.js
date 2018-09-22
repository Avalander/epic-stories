import urls from '../../support/urls'


describe('Chapters page', () => {
	beforeEach(() => {
		cy.$clearDb()
		cy.$createTestUser()
		cy.$login()
	})

	it('Displays the chapters of the story', () => {
		prepareStories()
			.then(([ story_id ]) => {
				cy.visit(urls.stories.chapters(story_id))
				cy.contains('Once upon a time')
				cy.contains('1. And so it begins')
				cy.contains('2. And so it continues')
			})
	})

	it('Has links to each chapter', () => {
		prepareStories()
			.then(([ story_id ]) => {
				cy.visit(urls.stories.chapters(story_id))
				hasChapters(story_id, [
					[1, '1. And so it begins'],
					[2, '2. And so it continues'],
				])
			})
	})

	it('Can create a new chapter in an empty story', () => {
		prepareStories()
			.then(([ _, story_id ]) => {
				cy.visit(urls.stories.chapters(story_id))
				cy.contains('Miss Beaver')
				createChapter()
				cy.contains('1. Next chapter')
					.should('have.attr', 'href', urls.stories.posts(story_id, 1))
			})
	})

	it('Can create a new chapter in an ongoing story', () => {
		prepareStories()
			.then(([ story_id ]) => {
				cy.visit(urls.stories.chapters(story_id))
				cy.contains('Once upon a time')
				createChapter()
				hasChapters(story_id, [
					[ 1, '1. And so it begins' ],
					[ 2, '2. And so it continues' ],
					[ 3, '3. Next chapter' ],
				])
			})
	})

	it('Does not add a new chapter on cancel', () => {
		prepareStories()
			.then(([ story_id ]) => {
				cy.visit(urls.stories.chapters(story_id))
				cy.contains('Once upon a time')
				cy.get('#new-chapter-btn')
					.click()
				cy.get('#title')
					.type('Next chapter')
				cy.get('#cancel-btn')
					.click()
				cy.get('#title')
					.should('not.exist')
				cy.get('body')
					.should('not.contain', 'Next chapter')
					.should('not.contain', '3. Next chapter')
				cy.get('#new-chapter-btn')
					.click()
				cy.get('#title')
					.should('have.value', '')
			})
	})

	it('Fails to create a chapter without a title', () => {
		prepareStories()
			.then(([ _, story_id ]) => {
				cy.visit(urls.stories.chapters(story_id))
				cy.contains('Miss Beaver')
				cy.get('#new-chapter-btn')
					.click()
				cy.get('#save-btn')
					.click()
				cy.get('.alert-error')
					.should('contain', `Missing key 'title'`)
			})
	})

	function hasChapters(story_id, chapters) {
		cy.wrap(chapters)
			.each(([ id, title ]) => {
				cy.contains(title)
					.should('have.attr', 'href', urls.stories.posts(story_id, id))
			})
	}

	function createChapter(title='Next chapter') {
		cy.get('#new-chapter-btn')
			.click()
		cy.get('#title')
			.type(title)
		cy.get('#save-btn')
			.click()
	}

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
