module.exports = {
  module: {
    test: /\.(?:le|c)ss$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          importLoaderes: 1
        }
      },
      {
        loader: 'less-loader',
        options: {
          importLoaderes: 1
        }
      },
    ]
  },
}