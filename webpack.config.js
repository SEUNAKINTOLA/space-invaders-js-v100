/**
 * @file webpack.config.js
 * @description Webpack configuration for Space Invaders JS V100
 * 
 * Features:
 * - Development and production modes
 * - Asset optimization and bundling
 * - Source maps for debugging
 * - Hot Module Replacement (HMR)
 * - Environment-specific settings
 * - Security hardening
 * 
 * @version 1.0.0
 * @license MIT
 */

const path = require('path');

/**
 * @type {Object.<string, string>}
 * Security headers for development server
 */
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  entry: './src/core/GameLoop.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true
  },

  mode: process.env.NODE_ENV || 'development',

  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',

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
              '@babel/plugin-transform-runtime'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  resolve: {
    extensions: ['.js'],
    alias: {
      '@core': path.resolve(__dirname, 'src/core/'),
      '@config': path.resolve(__dirname, 'src/config/'),
      '@utils': path.resolve(__dirname, 'src/utils/')
    }
  },

  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    headers: securityHeaders,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    historyApiFallback: true,
  },

  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },

  stats: {
    colors: true,
    errorDetails: true
  }
};

// Environment-specific configurations
if (process.env.NODE_ENV === 'production') {
  config.output.filename = '[name].[contenthash].js';
  config.output.chunkFilename = '[name].[contenthash].chunk.js';
}

/**
 * @type {Function}
 * Validates webpack configuration
 * @param {Object} config - Webpack configuration object
 * @throws {Error} If configuration is invalid
 */
function validateConfig(config) {
  const requiredFields = ['entry', 'output', 'module'];
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required webpack configuration field: ${field}`);
    }
  }
}

// Validate configuration before export
validateConfig(config);

module.exports = config;