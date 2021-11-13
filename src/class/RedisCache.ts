import { createClient} from 'redis';
import {CoreCache, ICoreKernelModule, IStore} from "@grandlinex/core";
import { RedisClientType } from 'redis/dist/lib/client';


type RedisClient = RedisClientType<any, any> | null;
/**
 * @class RedisCache
 * Multichannel Redis Client
 */
export default abstract class RedisCache extends CoreCache {
  client: RedisClient;

  constructor(
    chanel: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(chanel, module);
    this.client = null;
  }

  /**
   * Start Redis client
   * @throws Error No Redis config found
   */
  async start(): Promise<void> {
    const store = this.getModule().getKernel().getConfigStore() as IStore;
    const pw=store.get("REDIS_PASSWORD");
    const url=store.get("REDIS_URL");
    const port=store.get("REDIS_PORT");
    if (!url||!port) {
      throw new Error('NO REDIS CONFIG FOUND');
    }
    this.client = createClient({
      password: pw,
      socket: {
        host: url,
        port: Number(port),
      },
    });
    this.client.on('error', (err) => {
      this.error(`Cant connect to ${url}:${port}`);
      this.error(err);
      throw new Error(err);
    });
    await this.client.connect();
    this.log('Started');
  }

  async set(key: string, val: string): Promise<void> {
    await this.client?.set(this.parseKey(key), val);
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      return this.client.get(this.parseKey(key));
    }
    return null;
  }

  async delete(key: string): Promise<void> {
    await this.client?.del(this.parseKey(key));
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client?.expire(this.parseKey(key), seconds);
  }

  async exist(key: string): Promise<boolean> {
    const ex = await this.client?.exists(this.parseKey(key));
    return !!ex;
  }

  async clearAll(): Promise<void> {
    await this.client?.flushAll();
  }

  getRaw(): RedisClient {
    return this.client;
  }

  async stop(): Promise<void> {
    await this.client?.disconnect();
  }

  private parseKey(key: string): string {
    return `${this.chanel}:${key}`;
  }
}
