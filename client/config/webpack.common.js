const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function moduleConfig(dev) {
    let lessLoaders = [];

    if (dev) {
        lessLoaders.push(
            {
                loader: 'style-loader',
            }
        );
    }

    lessLoaders.push(
        {
            loader: 'css-loader',
            options: {
                minimize: !!dev,
                modules: true,
                localIdentName: '[local]__[path][name]__[hash:base64:5]'
            }
        },
        {
            loader: 'less-loader',
            options: {
                strictMath: true
            }
        },
        {
            loader: 'prepend-loader',
            options: {
                text: "@import '{root}/src/styles/variables.less';" // eslint-disable-line quotes
            }
        }
    );

    if (!dev) {
        lessLoaders = ExtractTextPlugin.extract({
            use: lessLoaders
        });
    }

    return {
        rules: [
            {
                test: /\.jsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                'react',
                                ['env', {
                                    targets: {
                                        browsers: [
                                            'last 1 Chrome versions',
                                            'last 1 Firefox versions'
                                        ]
                                    },
                                    include: dev ? ['transform-es2015-classes'] : []
                                }]
                            ],
                            plugins: [
                                'transform-class-properties',
                                'transform-function-bind',
                                'transform-object-rest-spread',
                                'react-hot-loader/babel',
                                ['react-css-modules', {
                                    filetypes: {
                                        '.less': {
                                            syntax: 'postcss-less'
                                        }
                                    },
                                    generateScopedName: dev ? '[local]__[path][name]__[hash:base64:5]' : '[hash:base64]',
                                    handleMissingStyleName: dev ? 'ignore' : 'throw',
                                    webpackHotModuleReloading: !!dev
                                }]
                            ]
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                use: lessLoaders
            }
        ]
    };
}

const config = {
    entry: [
        './src/entry.jsx'
    ],
    output: {
        filename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, '../dist'),
        publicPath: '/'
    },
    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: path.resolve(__dirname, '../')
        }),
        new HtmlWebpackPlugin({
            minify: {
                collapseWhitespace: true
            },
            template: './src/index.html'
        })
    ],
    resolve: {
        extensions: [
            '.js',
            '.jsx'
        ],
        modules: [
            path.resolve(__dirname, '../src'),
            'node_modules'
        ]
    },
    resolveLoader: {
        modules: [
            __dirname,
            'node_modules'
        ]
    }
};

module.exports = {
    config,
    moduleConfig
};
