import Welcome from './welcome'
import StoryList from './stories/story-list'


export const state = {
	welcome: Welcome.state,
	story_list: StoryList.state,
}

export const actions = {
	welcome: Welcome.actions,
	story_list: StoryList.actions,
}

export const routes = [{
	path: '/welcome',
	view: Welcome.view,
}, {
	path: '/stories',
	view: StoryList.view,
}]