import { section } from '@hyperapp/html'
import marked from 'marked'


export default raw =>
	section({
		class: 'markdown-content',
		oncreate: el => el.innerHTML = marked(raw)
	})
