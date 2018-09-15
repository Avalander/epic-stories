import Welcome from './welcome'
import StoryList from './stories/story-list'
import Story from './stories/story'
import Preferences from './preferences'


export const state = {
	welcome: Welcome.state,
	story_list: StoryList.state,
	story: Story.state,
	preferences: Preferences.state,
}

export const actions = {
	welcome: Welcome.actions,
	story_list: StoryList.actions,
	story: Story.actions,
	preferences: Preferences.actions,
}

export const routes = [{
	path: '/welcome',
	view: Welcome.view,
}, {
	path: '/stories',
	view: StoryList.view,
}, {
	parent: true,
	path: '/stories/:story_id',
	view: Story.view,
}, {
	path: '/preferences',
	view: Preferences.view,
}]