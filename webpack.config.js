const webpack = require('webpack');
const { resolve } = require('path');

const environment = process.env.NODE_ENV;

const config = {
  entry: resolve('src', 'index.js'),
  output: {
    filename: 'index.js',
    path: resolve('dist'),
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
