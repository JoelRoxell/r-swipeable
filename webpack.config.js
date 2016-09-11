var webpack = require('webpack');

const webpackConfig = {
  module: {},
  devtool: 'source-map',
  modulesDirectories: ['node_modules', 'src'],
  target: 'web'
}

webpackConfig.entry =  {
  'swipeable-app': './test/index'
},

webpackConfig.output = {
  path: './assets',
  filename: '[name].js'
},

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
  port: 8001,
  stats: {
    chunks: false,
    chunkModules: false,
    colors: true,
    quiet: false,
    noInfo: false,
    lazy: false,
  }
}

module.exports = webpackConfig;
