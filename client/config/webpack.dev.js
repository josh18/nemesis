const merge = require('webpack-merge');
const webpack = require('webpack');

const { config, moduleConfig } = require('./webpack.common.js');

module.exports = merge.smart(config, {
    mode: 'development',
    output: {
        filename: '[name].js'
    },
    module: moduleConfig(true),
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            '__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })'
        })
    ],
    devtool: 'cheap-module-source-map',
    devServer: {
        clientLogLevel: 'warning',
        contentBase: './dist',
        historyApiFallback: true,
        hot: true
    }
});
