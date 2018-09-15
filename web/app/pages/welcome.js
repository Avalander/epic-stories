import { article, div } from '@hyperapp/html'
import { Link } from '@hyperapp/router'

import { Markdown } from 'App/components'


const state = {}

const actions = {}

const view = () =>
	article({ key: 'welcome', class: 'content welcome' }, [
		Markdown(text),
		div({ class: 'button-container' }, [
			Link({
				class: 'btn primary',
				to: '/stories',
			}, 'Let\'s start!'),
		]),
	])

export default {
	state,
	actions,
	view,
}

const text = `
# Welcome to Epic Stories!

Epic Stories is a game where you create a collaborative story with your friends one post at a time.

## How does it work?

Epic Stories is played by multiple people adding a fragment to the ongoing story, one person at a time. Each participant creates a character and writes from that character's point of view, most of the time at least. This is the basic premise, but there aren't any hard and fast rules. Just play however is most fun for your group.

When you click the **Let's start!** button, at the bottom of this page, you will see a list of ongoing stories. Choose a story you like and press **Join**.

When you join a story, you start by creating the character you will play. If you don't really know what kind of character you want to play, just give them a name and maybe a concept, and move on. You can always edit your character's details later.

Then you will see the story thread. Read what your friends have written and post a continuation to the story. It is that simple.

You can also read about the other characters in the story if you go to **characters** in the sidebar. It's a good idea to learn about the characters before starting to contribute to an ongoing story.

You can also create a new story in the list of stories. Just think of a title, create your character and start writing!

## Suggestions for a great story

The whole point of Epic Stories is to have fun together with your friends. While elaborated plots and great stories are encouraged, they are not a necessary part of the experience and there are other aspects more important when considering a collaborative story. Here are some suggestions to make the game more fun for everybody.

### Yes, and...

When another player has brought something into the story, it's preferable to build on that instead of moving the story towards a completely different direction and dismissing the previous player's contribution, even if that means abandoning a great idea. If James suggests that the Stone of Destiny might be hidden in the City of Amber, don't just write that the stone is actually hidden in the Forest of Doom. You can probably find another reason to visit the Forest of Doom in the future anyway!

Due to the asynchronous nature of Epic Stories - it might take hours or days for somebody else to pick the story where you left it and continue, sometimes the players write other characters' reactions, dialogues and/or actions to be able to give some meaningful advancement to the story. Be considerate and mindful when this happens.

When you are writing about somebody else's character try to adhere to the nature of that character as much as you can - that's why each player wrote a thorough description of their character!

When someone else is writing your character, try to accept whatever they wrote and go with it, even if it's not what you think your character would have done. Don't have your friend write an action for your character just to answer that your character actually did the opposite. If you really disagree with what has been written about your character, you can always post a meta comment requesting an edit.

### Make the other characters look good

Don't have your character solve every problem and be the smartest in the room. Nobody likes playing with a [Mary Sue](https://en.wikipedia.org/wiki/Mary_Sue), give the other characters their chance to shine!

This is very important to remember when you are writing somebody else's character. Show them in the best light possible. You might even create situations where the other characters' skills are needed, or even get your character in such a trouble that only another character can help them out.

### Have fun!

Above all, remember that this is all about having fun and moving the story forward! Don't get stuck on details, embrace unexpected ideas, and don't expect everything to make sense all the time.

We're glad to have you here and hope that you will enjoy your stay!
`
