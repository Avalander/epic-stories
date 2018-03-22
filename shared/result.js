const Result = {
	ok: data => ({ ok: true, result: data }),
	error: (code, message) => ({ ok: false, error: { code, message }}),
}

const error_codes = {
	OTHER: 1,
	INVALID_DATA: 2,
	INVALID_CREDENTIALS: 3,
}

Object.keys(error_codes).forEach(e => Result[e] = message => Result.error(e, `${e}: ${message}`))

module.exports = {
	Result,
	error_codes,
}