const pad = n => str =>
	(str.length >= n
		? str
		: pad(n) ('0' + str)
	)

const padInt = n => str =>
	pad(n) (str.toString())

const currentTime = () => {
	const now = new Date()
	return `${now.getFullYear()}-${padInt(2)(now.getMonth() + 1)}-${padInt(2)(now.getDate())} ${padInt(2)(now.getHours())}:${padInt(2)(now.getMinutes())}:${padInt(2)(now.getSeconds())}`
}

const log = level => (...message) =>
	console.log(`${currentTime()} ${level} |> ${message}`)

module.exports = {
	error: log('ERROR'),
	warn: log('WARN'),
	info: log('INFO'),
	debug: log('DEBUG'),
}