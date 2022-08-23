import * as Path from 'path';
import { getEntityMeta, XUtil } from '@grandlinex/core';
import { TestEntity, TestKernel, TestModuel } from './DebugClasses';

const msiPath = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');

XUtil.createFolderIfNotExist(msiPath);
XUtil.createFolderIfNotExist(testPath);

const kernel = new TestKernel(testPath);
const module = kernel.getChildModule('testModule') as TestModuel;
const cache = module.getCache();
const testText = 'hello_world';

const e1 = new TestEntity();
const e2 = new TestEntity();

describe('Clean start', () => {
  test('preload', async () => {
    expect(kernel.getState()).toBe('init');
  });
  test('start kernel', async () => {
    const result = await kernel.start();
    expect(result).toBe(true);
    expect(kernel.getModCount()).toBe(1);
    expect(kernel.getState()).toBe('running');
  });
});

describe('Cache', () => {
  test('ist rdy', async () => {
    await cache.clearAll();
    expect(cache).not.toBeNull();
    expect(cache.getRaw()).not.toBeNull();
    expect(cache.getRaw()).not.toBeUndefined();
  });
  test('exist', async () => {
    expect(await cache.exist(testText)).toBeFalsy();
  });
  test('simple set & get', async () => {
    await cache.set(testText, testText);
    expect(await cache.get(testText)).toBe(testText);
  });

  test('check exist true', async () => {
    expect(await cache.exist(testText)).toBeTruthy();
  });

  test('clear', async () => {
    await cache.delete(testText);
  });

  test('check exist false', async () => {
    expect(await cache.exist(testText)).toBeFalsy();
  });
  test('set expire', async () => {
    await cache.set(testText, testText);
    expect(await cache.exist(testText)).toBeTruthy();
    await cache.expire(testText, 2);
    await XUtil.sleep(1100);
  });
  test('check expire', async () => {
    await XUtil.sleep(1100);
    expect(await cache.exist(testText)).toBeFalsy();
  });

  test('set e1', async () => {
    await cache.setE(getEntityMeta(e1)?.name || '', e1);
    await cache.setE(getEntityMeta(e2)?.name || '', e2);
  });
  test('check e1', async () => {
    expect(
      await cache.getE(getEntityMeta(e1)?.name || '', e1.e_id)
    ).toBeDefined();
  });
  test('check e2', async () => {
    expect(
      await cache.getE(getEntityMeta(e2)?.name || '', e2.e_id)
    ).toBeDefined();
  });
  test('delete e', async () => {
    await cache.clearAllE(getEntityMeta(e2)?.name || '');
  });
  test('check e1', async () => {
    expect(
      await cache.getE(getEntityMeta(e1)?.name || '', e1.e_id)
    ).not.toBeDefined();
  });
  test('check e2', async () => {
    expect(
      await cache.getE(getEntityMeta(e2)?.name || '', e2.e_id)
    ).not.toBeDefined();
  });
});

describe('ShutDown', () => {
  test('exit kernel', async () => {
    const result = await kernel.stop();
    await XUtil.sleep(1000);
    expect(kernel.getState()).toBe('exited');
    expect(result).toBeTruthy();
  });

  test('cleanup', async () => {
    expect(XUtil.removeFolderIfExist(testPath)).not.toBeFalsy();
  });
});
