const path = require('path');

module.exports = {
  entry: './src/mapbox-scalebar.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'mapbox-scalebar.js',
    library: 'MapboxScalebar',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  externals: {
    'mapbox-gl': {
      commonjs: 'mapbox-gl',
      commonjs2: 'mapbox-gl',
      amd: 'mapbox-gl',
      root: 'mapboxgl'
    }
  }
};