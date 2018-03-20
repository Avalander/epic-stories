module.exports = (error, req, res, next) => {
	console.error(error.stack)
	if (res.headersSent) return next(error)
	res.status(error.status || 500).json({
		status: error.status || 500,
		message: error.message || 'Something went wrong.',
	})
}