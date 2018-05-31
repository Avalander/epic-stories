const path = require('path')

module.exports = env => require(`./webpack/${env}`)({
	base_dir: path.resolve(__dirname),
	folders: {
		src: path.resolve(__dirname, 'web'),
		shared: path.resolve(__dirname, 'shared'),
		dist: path.resolve(__dirname, 'static'),
		dist_dev: path.resolve(__dirname, 'static-dev'),
		sw: path.resolve(__dirname, 'web', 'service-worker'),
	},
})