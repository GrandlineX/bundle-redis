import { createClient } from 'redis';
import { CoreCache, ICoreKernelModule, IEntity } from '@grandlinex/core';

/**
 * @class RedisCache
 * Multichannel Redis Client
 */
export default abstract class RedisCache extends CoreCache {
  client: ReturnType<typeof createClient>;

  constructor(
    chanel: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(chanel, module);
    const store = this.getModule().getKernel().getConfigStore();
    const pw = store.get('REDIS_PASSWORD');
    const url = store.get('REDIS_URL');
    const port = store.get('REDIS_PORT');
    if (!url || !port) {
      throw new Error('NO REDIS CONFIG FOUND');
    }
    this.client = createClient({
      password: pw,
      socket: {
        host: url,
        port: Number(port),
      },
    });
    this.client.on('error', (err: any) => {
      this.error(`Cant connect to ${url}:${port}`);
      this.error(err);
      throw new Error(err);
    });
  }

  /**
   * Start Redis client
   * @throws Error No Redis config found
   */
  async start(): Promise<void> {
    await this.client.connect();
    this.log('Started');
  }

  async set(key: string, val: string): Promise<void> {
    await this.client.set(this.parseKey(key), val);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(this.parseKey(key));
  }

  async delete(key: string): Promise<void> {
    await this.client.del(this.parseKey(key));
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(this.parseKey(key), seconds);
  }

  async exist(key: string): Promise<boolean> {
    const ex = await this.client.exists(this.parseKey(key));
    return !!ex;
  }

  async clearAll(): Promise<void> {
    await this.client.flushAll();
  }

  getRaw(): any {
    return this.client;
  }

  async stop(): Promise<void> {
    await this.client.disconnect();
  }

  parseKey(key: string): string {
    return `${this.channel}:${key}`;
  }

  async clearAllE(className: string): Promise<void> {
    await this.client.del(`${this.channel}:${className}`);
  }

  async deleteE(className: string, e_id: string): Promise<boolean> {
    try {
      await this.client.del(this.parseEntityKey(className, e_id));
      return true;
    } catch (e) {
      return false;
    }
  }

  parseEntityKey(className: string, e_id: string): string {
    return `${this.channel}:${className}:${e_id}`;
  }

  async getE<R extends IEntity>(
    className: string,
    e_id: string
  ): Promise<R | null> {
    const data = await this.client.get(this.parseEntityKey(className, e_id));
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      this.error(e);
      return null;
    }
  }

  async setE<R extends IEntity>(className: string, val: R): Promise<void> {
    await this.client.set(
      this.parseEntityKey(className, val.e_id),
      JSON.stringify(val)
    );
  }
}
