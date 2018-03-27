import xs from 'xstream'

import { makeFetch } from 'app/http'
import { $update, $delete } from 'cycle-idb'


export default ({ HTTP, IDB, invalid_credentials$ }) => {
	const fetch_user = makeFetch(HTTP, 'fetch-user', xs.of('/api/user'))
	const save_user$ = fetch_user.response$
		.map(({ username, groups }) => $update('user-cache', { key: 'current_user', username, groups }))
	const clear_user_cache$ = invalid_credentials$
		.map(() => $delete('user-cache', 'current_user'))
	
	const idb$ = xs.merge(
		save_user$,
		clear_user_cache$,
	)

	IDB.error$
		.addListener({
			next: x => console.log(x),
			error: e => console.error(e),
		})

	return {
		HTTP: fetch_user.request$,
		IDB: idb$,
	}
}