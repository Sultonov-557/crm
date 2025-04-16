import { resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({
  path: resolve(__dirname, '../.env.test'),
});

// Set up module resolution
process.env.NODE_PATH = resolve(__dirname, '..');
require('module').Module._initPaths();
