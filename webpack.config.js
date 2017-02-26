const path = require('path');

const webpackConfig = {
  module: {},
  devtool: 'source-map',
  modulesDirectories: ['node_modules', 'src'],
  target: 'web'
};

webpackConfig.entry = {
  'swipeable-app': './test/index'
};

webpackConfig.output = {
  filename: '[name].js',
  path: path.resolve(__dirname, 'build'),
  publicPath: '/assets/'
};

webpackConfig.module.loaders = [{
  test: /\.(js)$/,
  exclude: /node_modules/,
  loader: 'babel-loader'
}];

webpackConfig.devServer = {
  historyApiFallback: true,
  contentBase: './assets/',
  stats: {
    chunks: false,
    chunkModules: false,
    colors: true,
    quiet: false,
    noInfo: false,
    lazy: false
  }
};

module.exports = webpackConfig;
