const Result = {
	ok: data => ({ ok: true, result: data }),
	error: (code, message) => ({ ok: false, error: { code, message }}),
}

const error_codes = {
	OTHER: 1,
	INVALID_DATA: 2,
	INVALID_CREDENTIALS: 3,
	NOT_FOUND: 4,
	INTERNAL_ERROR: 5,
}

Object.keys(error_codes).forEach(e => Result[e] = message => Result.error(error_codes[e], `${e}: ${message}`))

module.exports = {
	Result,
	error_codes,
}