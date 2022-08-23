import * as Path from 'path';

import { XUtil } from '@grandlinex/core';
import { TestKernel } from './DebugClasses';

const testPathData = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');

XUtil.createFolderIfNotExist(testPathData);
XUtil.createFolderIfNotExist(testPath);

const kernel = new TestKernel(testPath);

kernel.start();
