const webpack = require('webpack');
const { resolve } = require('path');

const environment = process.env.NODE_ENV;

const config = {
  entry: resolve('src', 'index.js'),
  output: {
    filename: 'index.js',
    path: resolve('dist'),
    library: 'ReactiveSearch',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'react'],
          },
        }],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(environment),
      },
    }),
  ],
};

if (environment === 'production') {
  config.plugins = [
    ...config.plugins,
    new webpack.optimize.UglifyJsPlugin(),
  ];
}

module.exports = config;
