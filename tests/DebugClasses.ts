import CoreKernel, {
  Column,
  CoreClient,
  CoreCryptoClient,
  CoreEntity,
  CoreKernelModule,
  Entity,
  ICoreCClient,
  OfflineService,
  EProperties,
} from '@grandlinex/core';
import Path from 'path';
import RedisCache from '../src';

type TCoreKernel = CoreKernel<ICoreCClient>;

class TestBaseMod extends CoreKernelModule<
  TCoreKernel,
  null,
  null,
  null,
  null
> {
  beforeServiceStart(): Promise<void> {
    return Promise.resolve(undefined);
  }

  final(): Promise<void> {
    return Promise.resolve(undefined);
  }

  initModule(): Promise<void> {
    return Promise.resolve(undefined);
  }

  startup(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
const msiPath = Path.join(__dirname, '..');
const appName = 'TestKernel';
const appCode = 'tkernel';
class TestKernel extends CoreKernel<ICoreCClient> {
  constructor(testPath: string) {
    super({ appName, appCode, pathOverride: testPath, envFilePath: msiPath });
    this.setBaseModule(new TestBaseMod('testbase2', this));
    this.setCryptoClient(
      new CoreCryptoClient(this, CoreCryptoClient.fromPW('testpw'))
    );
    this.addModule(new TestModuel(this));
  }
}

class TestClient extends CoreClient {}
class TestCache extends RedisCache {}

@Entity('TestEntity')
class TestEntity extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  txt: string;

  @Column({
    dataType: 'int',
  })
  num: number;

  constructor(prop?: EProperties<TestEntity>) {
    super();
    this.txt = prop?.txt || '';
    this.num = prop?.num || 0;
  }
}
class TestModuel extends CoreKernelModule<
  TCoreKernel,
  null,
  TestClient,
  TestCache,
  null
> {
  constructor(kernel: TCoreKernel) {
    super('testModule', kernel);
    this.addService(new OfflineService(this));
    this.setCache(new TestCache('redis-cache', this));
  }

  async initModule(): Promise<void> {
    this.setClient(new TestClient('testc', this));
    this.log('FirstTHIS');
  }

  startup(): Promise<void> {
    return Promise.resolve(undefined);
  }

  beforeServiceStart(): Promise<void> {
    return Promise.resolve(undefined);
  }

  final(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export {
  TCoreKernel,
  TestBaseMod,
  TestKernel,
  TestClient,
  TestModuel,
  TestEntity,
};
