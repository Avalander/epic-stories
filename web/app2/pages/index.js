import Welcome from './welcome'
import StoryList from './stories/story-list'
import StoryChapters from './stories/story-chapters'


export const state = {
	welcome: Welcome.state,
	story_list: StoryList.state,
	story_chapters: StoryChapters.state,
}

export const actions = {
	welcome: Welcome.actions,
	story_list: StoryList.actions,
	story_chapters: StoryChapters.actions,
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
}]