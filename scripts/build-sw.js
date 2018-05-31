const fs = require('fs')
const path = require('path')


console.log('Parsing service worker file.')

const mode = process.argv
	.find(x => x.startsWith('mode='))
	.split('=')[1]

if (!mode || ![ 'development', 'production' ].includes(mode)) {
	console.error(`Missing 'mode' argument. Please, use 'development' or 'production'`)
	process.exit(1)
}

const version =
	(mode === 'production'
		? require('../package.json').version
		: Date.now()
	)
const static_folder =
	(mode === 'production'
		? 'static'
		: 'static-dev'
	)

const base_dir = path.resolve(__dirname, '..')
const origin = path.join(base_dir, 'web', 'service-worker', 'index.js')
const dest = path.join(base_dir, static_folder, 'sw.js')

const service_worker_file = fs.readFileSync(
	origin,
	{ encoding: 'utf8' }
)

const parsed = service_worker_file.replace(/\$\{VERSION\}/gi, version)

fs.writeFileSync(
	dest,
	parsed,
	{ encoding: 'utf8' }
)

console.log(`File generated: '${dest}'.`)
