const https = require('https')
const { URL } = require('url')


module.exports = ({ REPORT_URL }) => content =>
	(REPORT_URL
		? sendReport(new URL(REPORT_URL), content)
		: Promise.resolve(false)
	)

const sendReport = (url, content) => {
	const body = JSON.stringify(content)

	return new Promise((resolve, reject) => {
		const params = {
			hostname: url.hostname,
			path: url.pathname,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': body.length,
			},
		}
		const report = https.request(
			params,
			response => {
				response.on('error', reject)
				response.on('end', resolve)
			})
		report.write(body)
	})
}