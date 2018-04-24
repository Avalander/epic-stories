const DAY_MILIS = 24 * 60 * 60 * 1000

const WEEK_DAYS = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
]

const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]

export const parseDate = date =>
	`${dateToString(date)} at ${timeToString(date)}`

export const timestampToDate = post => ({
	...post,
	created_on: parseDate(new Date(post.created_on))
})

const dateToString = date => {
	const days_past = daysInBetween(new Date(), date)
	if (days_past < 1) return 'Today'
	if (days_past < 2) return 'Yesterday'
	if (days_past < 7) {
		return `Last ${WEEK_DAYS[date.getDay()]}`
	}
	return `${WEEK_DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${dateWithSuffix(date)}`
}

const dateWithSuffix = date => {
	const _d = date.getDate().toString()
	if (_d.endsWith('1')) return `${_d}st`
	if (_d.endsWith('2')) return `${_d}nd`
	if (_d.endsWith('3')) return `${_d}rd`
	return `${_d}th`
}

const timeToString = date =>
	`${date.getHours()}:${padString(2, date.getMinutes().toString())}`

const daysInBetween = (date_1, date_2) =>
	(toUTCDate(date_1) - toUTCDate(date_2)) / DAY_MILIS

const toUTCDate = date =>
	Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())

const padString = (min_length, str) =>
	(str.length < min_length
		? padString(min_length, '0' + str)
		: str)
