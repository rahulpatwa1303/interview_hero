// next.config.ts
import { NextConfig } from 'next';
// Assuming MonacoWebpackPlugin can be imported like this.
// If not, adjust the import based on the plugin's export type and your tsconfig.json module settings.
// e.g., import MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
// or const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true, // Or your existing configurations
  // experimental: {
  //   turbo: {}, // This object enables specific Turbopack features by default
  // },
  webpack: (config, { isServer, dev }) => { // `nextRuntime` refers to server runtime, not bundler
    // Add your existing webpack modifications here, if any

    // Monaco Editor Webpack Plugin
    // This webpack function is only called when Webpack is the bundler.
    // We apply the plugin for the client-side bundle.
    if (!isServer) {
      config.plugins = config.plugins || []; // Ensure plugins array exists
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: [
            'javascript',
            'typescript',
            'python',
            'java',
            'cpp',
            'csharp',
            'html',
            'css',
            'json',
            'markdown',
            'sql',
          ],
          filename: 'static/monaco/[name].worker.js', // e.g. /_next/static/monaco/editor.worker.js
          publicPath: '_next', // Prepends /_next to the worker assets path
                               // Makes the full path like /_next/static/monaco/editor.worker.js
        })
      );
    }

    return config;
  },
};

export default nextConfig;