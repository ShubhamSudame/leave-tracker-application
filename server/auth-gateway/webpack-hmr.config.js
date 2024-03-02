import { HotModuleReplacementPlugin } from 'webpack';
import { join } from 'path';
import nodeExternals from 'webpack-node-externals';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';

export const entry = ['webpack/hot/poll?100', './src/main.ts'];
export const target = 'node';
export const externals = [
  nodeExternals({
    allowlist: ['webpack/hot/poll?100'],
  }),
];
export const module = {
  rules: [
    {
      test: /.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    },
  ],
};
export const mode = 'development';
export const resolve = {
  extensions: ['.tsx', '.ts', '.js'],
};
export const plugins = [
  new HotModuleReplacementPlugin(),
  new RunScriptWebpackPlugin({ name: 'server.js', autoRestart: false }),
];
export const output = {
  path: join(__dirname, 'dist'),
  filename: 'server.js',
};
