import Welcome from './welcome'
import StoryList from './stories/story-list'
import StoryChapters from './stories/story-chapters'
import StoryMyCharacter from './stories/story-my-character'
import StoryCharacters from './stories/story-characters'


export const state = {
	welcome: Welcome.state,
	story_list: StoryList.state,
	story_chapters: StoryChapters.state,
	story_my_character: StoryMyCharacter.state,
	story_characters: StoryCharacters.state,
}

export const actions = {
	welcome: Welcome.actions,
	story_list: StoryList.actions,
	story_chapters: StoryChapters.actions,
	story_my_character: StoryMyCharacter.actions,
	story_characters: StoryCharacters.actions,
}

export const routes = [{
	path: '/welcome',
	view: Welcome.view,
}, {
	path: '/stories',
	view: StoryList.view,
}, {
	path: '/stories/:story_id/chapters',
	view: StoryChapters.view,
}, {
	path: '/stories/:story_id/my-character',
	view: StoryMyCharacter.view,
}, {
	path: '/stories/:story_id/characters',
	view: StoryCharacters.view,
}]