import * as Path from 'path';
 import { TestKernel } from './DebugClasses';
import {createFolderIfNotExist} from "@grandlinex/core";

const testPathData = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');


createFolderIfNotExist(testPathData);
createFolderIfNotExist(testPath);

const kernel = new TestKernel( testPath );


kernel.start();
