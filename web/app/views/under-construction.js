import xs from 'xstream'

import {
	div,
	h1,
} from '@cycle/dom'


const UnderConstruction = sources => ({
	DOM: xs.of(
		div([
			h1('Under Construction'),
		])
	)
})

export default UnderConstruction
