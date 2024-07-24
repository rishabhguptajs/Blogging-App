import path from 'path';

export default {
  entry: './src/server.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(process.cwd(), 'dist'),
  },
  mode: 'development',
  watch: true, 
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', 
        },
      },
    ],
  },
};
