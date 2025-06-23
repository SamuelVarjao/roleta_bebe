const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'public'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,  // JS e JSX
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,   // <-- Adicione isso para o CSS funcionar
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|ico)$/i,
        use: [{
          loader: 'url-loader',
          options: { limit: 10000 }
        }]
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
devServer: {
  static: {
    directory: path.resolve(__dirname, 'public'),
    publicPath: '/',
  },
},
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', globOptions: { ignore: ['**/index.html'] } }
      ]
    }),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
      inject: 'body'
    })
  ]
};


