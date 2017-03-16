const webpack = require('webpack');
const path = require('path');
const dist = path.resolve('./dist/');
const PACKAGE = require('./package.json');

const banner = 
	'Animator.js' + ' - v' + PACKAGE.version + ' | ' +
	PACKAGE.author + ' | ' +
	PACKAGE.license + ' | ' +
	PACKAGE.homepage;

module.exports = {
	context: path.resolve('./src/'),
	entry: {
		'animator': './index',
		'animator.min': './index'
	},
	output: {
		filename: '/[name].js',
		path: dist,
		library: ['Animator'],
		libraryTarget: 'umd'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [ 
					{
						loader: 'babel-loader',
						query: {
							presets: [ 'es2015' ]
						}
					}
				]
			}
		]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			include: /\.min\.js$/,
			minimize: true
		}),
		new webpack.BannerPlugin(banner)
	]
};