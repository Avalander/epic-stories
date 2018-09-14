const webpack = require('webpack')
const merge = require('webpack-merge')
const common_config = require('./common')
const { version } = require('../package.json')

const MiniCssPlugin = require('mini-css-extract-plugin')
const OptimiseCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')


module.exports = ({ base_dir, folders }) => merge(common_config({ base_dir, folders }), {
	/*
	entry: {
		sw: path.resolve(base_dir, folders.src, 'init-sw.js'),
	},
	*/
	module: {
		rules: [{
			test: /\.scss/,
			use: [
				MiniCssPlugin.loader,
				'css-loader',
				{
					loader: 'sass-loader',
					options: {
						includePaths: [ folders.web ]
					}
				}
			]
		}]
	},
	plugins: [
		new MiniCssPlugin({
			filename: '[name].[hash].css',
			chunkFilename: '[id].[hash].css',
		}),
		new OptimiseCssAssetsPlugin(),
		new webpack.DefinePlugin({
			VERSION: JSON.stringify(version),
			$VERSION$: JSON.stringify(version),
		})
		/*
		new ServiceWorkerPlugin({
			entry: path.resolve(base_dir, folders.src, 'sw', 'index.js')
		}),
		new PwaManifestPlugin({
			name: 'Task List',
			short_name: 'Task List',
			description: 'Simple tast list by Avalander',
			background_color: '#2db92d',
			theme_color: '#2db92d',
			display: 'standalone',
			orientation: 'portrait',
			start_url: '/',
			icons: [{
				src: path.resolve(base_dir, folders.src, 'icon.png'),
				sizes: [48, 72, 96, 128, 192, 256],
			}],
		}),
		*/
	]
})
