var webpack = require('webpack');

const webpackConfig = {
  module: {},
  entry: {
    'swipeable-app': './test/index'
  },

  devtool: 'source-map',

  output: {
    path: './assets',
    filename: '[name].js'
  },

  target: 'web'
}

webpackConfig.module.loaders = [{
  test: /\.(js)$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  query: {
    presets: ['es2015', 'stage-0', 'react']
  }
}];

webpackConfig.devServer = {
  historyApiFallback: true,
  contentBase: './assets',
  port: 8001
}

module.exports = webpackConfig;
