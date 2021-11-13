import CoreKernel, {
  CoreClient,
  CoreCryptoClient,
  CoreKernelModule,
  ICoreCClient,
  OfflineService,
 } from "@grandlinex/core";
import RedisCache from "../src";
import Path from "path";



type TCoreKernel=CoreKernel<ICoreCClient>;

class TestBaseMod extends CoreKernelModule<TCoreKernel,null,null,null,null> {
  beforeServiceStart(): Promise<void> {
    return Promise.resolve( undefined );
  }

  final(): Promise<void> {
    return Promise.resolve( undefined );
  }

  initModule(): Promise<void> {
    return Promise.resolve( undefined );
  }

  startup(): Promise<void> {
    return Promise.resolve( undefined );
  }

}
const msiPath = Path.join(__dirname, '..');
const appName = 'TestKernel';
const appCode = 'tkernel';
class TestKernel extends CoreKernel<ICoreCClient> {
  constructor(testPath:string) {
    super( { appName, appCode, pathOverride:testPath,envFilePath:msiPath });
    this.setBaseModule(new TestBaseMod("testbase2",this));
    this.setCryptoClient(new CoreCryptoClient(CoreCryptoClient.fromPW("testpw")))
    this.addModule(new TestModuel(this));
   }
}



class TestClient extends CoreClient{

}
class TestCache extends RedisCache{

}

class TestModuel extends CoreKernelModule<TCoreKernel,null,TestClient,TestCache,null>{
  constructor(kernel:TCoreKernel) {
    super("testModule",kernel);
    this.addService(new OfflineService(this))
  }
  async initModule(): Promise<void> {
    this.setClient(new TestClient("testc",this))
    this.setCache(new TestCache("redis-cache",this))
    this.log("FirstTHIS")
  }

  startup(): Promise<void> {
    return Promise.resolve( undefined );
  }

  beforeServiceStart(): Promise<void> {
    return Promise.resolve( undefined );
  }

  final(): Promise<void> {
    return Promise.resolve( undefined );
  }

}

export {
  TCoreKernel,
  TestBaseMod,
  TestKernel,
  TestClient,
  TestModuel,
 }
