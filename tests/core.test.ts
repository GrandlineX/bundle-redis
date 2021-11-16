import * as Path from 'path';
import { TestKernel } from './DebugClasses';
 import {
  createFolderIfNotExist,
  removeFolderIfExist,
  sleep
} from "@grandlinex/core";
import RedisCache from "../src";



const msiPath = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');


 createFolderIfNotExist(msiPath);
 createFolderIfNotExist(testPath);


 let kernel = new TestKernel( testPath);

const testText = 'hello_world';

describe('Clean start', () => {
   test('preload', async () => {
    expect(kernel.getState()).toBe('init');
  });
  test('start kernel', async () => {
    const result = await kernel.start();
    expect(result).toBe(true);
    expect(kernel.getModCount()).toBe(1);
    expect(kernel.getState()).toBe('running');
  });})

describe('Cache', () => {
    let cache:RedisCache|null=null;
   test('ist rdy', async () => {
       cache=kernel.getChildModule("testModule")?.getCache()
       await cache?.clearAll()
       expect(cache).not.toBeNull()
       expect(cache?.getRaw()).not.toBeNull()
       expect(cache?.getRaw()).not.toBeUndefined()
  });
   test('exist', async () => {
        expect(await cache?.exist(testText)).toBeFalsy()
  });
   test('simple set & get', async () => {
       await cache?.set(testText,testText)
        expect(await cache?.get(testText)).toBe(testText)
  });

    test('check exist true', async () => {
        expect(await cache?.exist(testText)).toBeTruthy()
    });

    test('clear', async () => {
        await cache?.delete(testText);
    });

    test('check exist false', async () => {
        expect(await cache?.exist(testText)).toBeFalsy()
    });
    test('set expire', async () => {
        await cache?.set(testText,testText)
        expect(await cache?.exist(testText)).toBeTruthy()
        await cache?.expire(testText,2)
        await sleep(1100)
    });
    test('check expire', async () => {
        await sleep(1100)
        expect(await cache?.exist(testText)).toBeFalsy()
    });

})


describe("ShutDown",()=>{

  test('exit kernel', async () => {
    const result = await kernel.stop();
    await sleep(1000);
    expect(kernel.getState()).toBe('exited');
    expect(result).toBeTruthy();
  });

  test('cleanup', async () => {

    expect(removeFolderIfExist(testPath)).not.toBeFalsy()
  });
})

