
module.exports = {
  entry: './main.js',
  mode: 'development',
  devServer: {
    //publicPath: '/dist/',
    // host: '192.168.0.104',
    // inline: true,
    port: 8099,
    // colors: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [['@babel/plugin-transform-react-jsx', {pragma: 'createElement'}]]
          }
        }
      },
    ],
  },
}