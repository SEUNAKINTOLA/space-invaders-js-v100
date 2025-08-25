/**
 * @file webpack.config.js
 * @description Webpack configuration for Space Invaders JS V100
 */

const path = require('path');
const webpack = require('webpack');

// Safely import webpack plugins with fallbacks
let TerserPlugin, HtmlWebpackPlugin, MiniCssExtractPlugin, CleanWebpackPlugin, CopyWebpackPlugin;

try {
  // Import required plugins with error handling
  TerserPlugin = require('terser-webpack-plugin');
  HtmlWebpackPlugin = require('html-webpack-plugin');
  MiniCssExtractPlugin = require('mini-css-extract-plugin');
  CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
  CopyWebpackPlugin = require('copy-webpack-plugin');
} catch (error) {
  console.error('Missing required webpack plugins. Please run: npm install --save-dev terser-webpack-plugin html-webpack-plugin mini-css-extract-plugin clean-webpack-plugin copy-webpack-plugin');
  process.exit(1);
}

// Environment configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

// Utility function to create safe plugin instances
const createSafePlugin = (Plugin, options = {}, pluginName) => {
  try {
    return new Plugin(options);
  } catch (error) {
    console.error(`Failed to initialize ${pluginName}:`, error);
    return null;
  }
};

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  mode: isDevelopment ? 'development' : 'production',
  
  entry: {
    main: './src/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
    publicPath: '/',
    clean: true,
    crossOriginLoading: 'anonymous',
  },

  devtool: isDevelopment ? 'eval-source-map' : 'source-map',

  devServer: {
    static: './dist', // Updated from contentBase for webpack 5
    hot: true,
    port: 3000,
    historyApiFallback: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-runtime',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif|mp3)$/,
        type: 'asset/resource', // Updated for webpack 5
      },
    ],
  },

  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      createSafePlugin(TerserPlugin, {
        terserOptions: {
          compress: {
            drop_console: !isDevelopment,
            dead_code: true,
          },
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }, 'TerserPlugin'),
    ].filter(Boolean),
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  },

  plugins: [
    createSafePlugin(CleanWebpackPlugin, {}, 'CleanWebpackPlugin'),
    createSafePlugin(HtmlWebpackPlugin, {
      template: './src/index.html',
      minify: !isDevelopment && {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
      },
    }, 'HtmlWebpackPlugin'),
    createSafePlugin(MiniCssExtractPlugin, {
      filename: isDevelopment ? '[name].css' : '[name].[contenthash].css',
    }, 'MiniCssExtractPlugin'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VERSION': JSON.stringify(require('./package.json').version),
    }),
    ...(isDevelopment ? [new webpack.HotModuleReplacementPlugin()] : []),
  ].filter(Boolean),

  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },

  stats: {
    colors: true,
    errorDetails: true,
    children: false,
  },
};

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Build error:', error);
  process.exit(1);
});

// Validate configuration before export
try {
  // Basic validation of required fields
  const requiredFields = ['entry', 'output', 'module'];
  requiredFields.forEach(field => {
    if (!config[field]) {
      throw new Error(`Missing required webpack configuration field: ${field}`);
    }
  });
  
  module.exports = config;
} catch (error) {
  console.error('Invalid webpack configuration:', error);
  process.exit(1);
}