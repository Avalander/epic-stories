const https = require('https')
const { URL } = require('url')

const logger = require('logger')


module.exports = ({ REPORT_URL, Router }) => {
	const api = Router()
	const report_url = new URL(REPORT_URL)

	api.post('/error', (req, res) => {
		const content = makeContent({
			user_agent: req.get('User-Agent'),
			error: req.body,
		})

		logger.debug(content.content)

		sendReport(report_url, content)
		//	.then(() => res.json({ ok: true }))
			.catch(error => logger.error(error))
		res.json({ ok: true })
	})

	return api
}

const makeContent = ({ user_agent, error }) =>
	({
		content: `
**Error reported!**
User Agent: ${user_agent}
Error:
	Message: ${error.message}
	Source: ${error.source}
	Line: ${error.lineno}
	Column: ${error.colno}
	Stack: \`\`\`${error.error.stack}\`\`\`
`
	})

const sendReport = (url, content) => {
	const body = JSON.stringify(content)

	return new Promise((resolve, reject) => {
		const report = https.request({
			hostname: url.hostname,
			path: url.pathname,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': body.length,
			},
		}, response => {
			response.on('error', reject)
			response.on('end', resolve)
		})
		report.write(body)
		report.end()
	})
}