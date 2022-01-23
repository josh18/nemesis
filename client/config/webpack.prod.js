const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const { config, moduleConfig } = require('./webpack.common.js');

module.exports = merge.smart(config, {
    mode: 'production',
    module: moduleConfig(),
    plugins: [
        new ExtractTextPlugin('styles.[contenthash:20].css'),
        new UglifyJSPlugin({
            sourceMap: true
        })
    ],
    devtool: 'source-map'
});
