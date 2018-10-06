const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = ({ base_dir, folders }) => ({
	entry: {
		report: path.resolve(folders.src, 'report.js'),
		main: path.resolve(folders.src, 'app', 'main.js'),
		register: path.resolve(folders.src, 'register.js'),
		login: path.resolve(folders.src, 'login.js'),
		offline: path.resolve(folders.src, 'offline.js'),
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
					presets: [[ '@babel/env', {
						targets: {
							chrome: 59,
							firefox: 60,
						}
					}]],
					plugins: [
						[ '@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
						[ '@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
					],
					babelrc: false,
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
			chunks: [ 'report', 'main' ],
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
		new HtmlWebpackPlugin({
			template: path.join(folders.src, 'offline.html'),
			filename: 'offline.html',
			chunks: [ 'offline' ],
		})
	],
	resolve: {
		modules: [
			folders.src,
			folders.shared,
			'node_modules',
		],
		alias: {
			App: path.join(folders.src, 'app'),
			Shared: folders.shared,
		}
	},
})