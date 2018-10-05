const logger = require('logger')
const { SourceMapConsumer } = require('source-map')
const fs = require('fs')
const path = require('path')


module.exports = ({ Router, report }) => {
	const api = Router()
	const main_map = loadSourcemap('main.bundle.js.map')

	api.post('/error', (req, res) => {
		SourceMapConsumer.with(main_map, null,
			consumer => {
				return consumer.originalPositionFor({
					line: req.body.lineno,
					column: req.body.colno,
				})
			})
			.then(x => {
				logger.info(JSON.stringify(x, null, 2))
				const content = makeContent({
					user_agent: req.get('User-Agent'),
					body: req.body,
					parsed: x
				})
				logger.debug(content.content)
				return content
			})
			.then(report)
			.then(() => logger.debug('Report sent'))
			.catch(logger.error)

		res.json({ ok: true })
	})

	return api
}

const makeContent = ({ user_agent, body, parsed }) =>
	({
		content: `
**Error reported!**
User Agent
\`\`\`${user_agent}\`\`\`
Ref
\`\`\`${body.from}\`\`\`
Raw
\`\`\`${JSON.stringify(body, null, 2)}\`\`\`
Evaluated
\`\`\`${JSON.stringify(parsed, null, 2)}\`\`\`
Stack
\`\`\`${JSON.stringify((body.error.stack || '').split('\n'), null, 2)}\`\`\`
`
	})

const loadSourcemap = file =>
	JSON.parse(
		fs.readFileSync(path.resolve(__dirname, '..', '..', 'static', file)).toString()
	)