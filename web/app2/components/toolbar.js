import { header, i } from '@hyperapp/html'
import { Link } from '@hyperapp/router'


export default () =>
	header({ class: 'toolbar fixed' }, [
		i({ class: 'fa fa-bars pointer toolbar-icon' }),
		Link({ class: 'brand pointer', to: '/stories' }, 'Epic Stories'),
	])
