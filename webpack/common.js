const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = ({ base_dir, folders }) => ({
	entry: {
		main: path.resolve(folders.src, 'app', 'index.js'),
		register: path.resolve(folders.src, 'register.js'),
		login: path.resolve(folders.src, 'login.js'),
	},
	output: {
		path: folders.dist,
		filename: '[name].bundle.js',
	},
	module: {
		rules: [{
			test: /\.js/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: [[ 'env', {
						targets: {
							browsers: [ 'last 2 versions' ],
						}
					}]],
					plugins: [
						['transform-object-rest-spread', { useBuiltIns: true }]
					]
				},
			}
		}, {
			test: /\.png/,
			use: {
				loader: 'file-loader',
				options: {
					name: '[name].[ext]',
					outputPath: 'images/',
				}
			}
		}, {
			test: /\.woff(2?)/,
			use: {
				loader: 'url-loader',
				options: {
					limit: 10000,
					mimetype: 'application/font-woff'
				}
			}
		}, {
			test: /\.ttf/,
			use: {
				loader: 'url-loader',
				options: {
					limit: 10000,
					mimetype: 'application/octet-stream'
				}
			}
		}, {
			test: /\.eot/,
			use: {
				loader: 'file-loader',
			}
		}, {
			test: /\.svg/,
			use: {
				loader: 'url-loader',
				options: {
					limit: 10000,
					mimetype: 'image/svg+xml'
				}
			}
		}]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(folders.src, 'app', 'index.html'),
			filename: 'index.html',
			chunks: [ 'main' ],
		}),
		new HtmlWebpackPlugin({
			template: path.join(folders.src, 'register.html'),
			filename: 'register.html',
			chunks: [ 'register' ],
		}),
		new HtmlWebpackPlugin({
			template: path.join(folders.src, 'login.html'),
			filename: 'login.html',
			chunks: [ 'login' ],
		}),
	],
	resolve: {
		modules: [
			folders.src,
			folders.shared,
			'node_modules',
		]
	},
})