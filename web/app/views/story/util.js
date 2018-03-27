export const parseDate = date => `${date.toDateString()} - ${date.toTimeString()}`
	.replace(/GMT.*/g, '')
	.substring(0, 23)

export const timestampToDate = post => ({
	...post,
	created_on: parseDate(new Date(post.created_on))
})
