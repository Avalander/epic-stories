import 'scss/main.scss'

import xs from 'xstream'

import { run } from '@cycle/run'
import {
	makeDOMDriver,
	div,
	header,
	h1,
	main,
} from '@cycle/dom'


const view = () => xs.of(false).map(x =>
	div([
		header('.toolbar.fixed', 'Epic Stories'),
		main('.with-fixed-toolbar', [
			h1('Ponies'),
		])
	])
)

fetch('/api/ping', { method: 'POST', credentials: 'include' })
	.then(res => res.json())
	.then(x => console.log(x))

const app = sources => {
	return {
		DOM: view()
	}
}

const drivers = {
	DOM: makeDOMDriver('#root'),
}

run(app, drivers)