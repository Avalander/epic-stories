import { header, i } from '@hyperapp/html'
import { Link } from '@hyperapp/router'


export default (_, actions) =>
	header({ class: 'toolbar fixed' }, [
		i({
			class: 'fa fa-bars pointer toolbar-icon',
			onclick: () => actions.sidebar.open(),
		}),
		Link({ class: 'brand pointer', to: '/stories' }, 'Epic Stories'),
	])
