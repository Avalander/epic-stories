export const makeFetch = (HTTP, category, url$) => {
	const request$ = url$.map(url => ({
		url,
		category,
		method: 'GET',
		withCredentials: true
	}))

	const http_response$ = HTTP.select(category)
		.flatten()
		.map(req => req.body)
	const response$ = http_response$.filter(res => res.ok)
		.map(res => res.result)
	const error$ = http_response$.filter(res => !res.ok)
		.map(res => res.error)
	
	return {
		request$,
		response$,
		error$,
	}
}
