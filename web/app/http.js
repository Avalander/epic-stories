import xs from 'xstream'


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

export const makePost = (HTTP, category, url$) => {
	const http_response$ = HTTP.select(category)
		.flatten()
		.map(req => req.body)
	const response$ = http_response$.filter(res => res.ok)
		.map(res => res.result)
	const error$ = http_response$.filter(res => !res.ok)
		.map(res => res.error)
	
	const makeRequest = data$ => xs.combine(url$, data$)
		.map(([ url, data ]) => ({
			url, category,
			method: 'POST',
			withCredentials: true,
			send: data,
		}))
	
	return {
		response$,
		error$,
		makeRequest,
	}
}
