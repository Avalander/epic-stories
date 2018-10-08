const webpack = require('webpack')
const merge = require('webpack-merge')
const common_config = require('./common')

module.exports = ({ base_dir, folders }) => merge(common_config({ base_dir, folders }), {
	mode: 'development',
	module: {
		rules: [{
			test: /\.scss/,
			use: [ 'style-loader', 'css-loader', {
				loader: 'sass-loader',
				options: {
					includePaths: [ folders.src ]
				}
			}]
		}]
	},
	devtool: 'eval-source-map',
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NamedModulesPlugin(),
		new webpack.SourceMapDevToolPlugin({}),
		new webpack.DefinePlugin({
			VERSION: JSON.stringify(Date.now()),
			$VERSION$: JSON.stringify(Date.now()),
		})
	],
	devServer: {
		contentBase: folders.dist_dev,
		compress: true,
		hot: true,
		stats: 'minimal',
		historyApiFallback: {
			index: '/index.html',
		},
		proxy: {
			'/api': 'http://localhost:3007',
		},
	},
})