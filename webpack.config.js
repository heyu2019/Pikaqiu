const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry:{
    app: './src/js/test.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname,'dist')
  },
  module: {
    rules: [
      {
        test:/\.css$/,
        use:[
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Output Management",
    })
  ]
}