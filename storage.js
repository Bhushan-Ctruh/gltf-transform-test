import { openDB } from "idb";

export default class Storage {
  constructor() {
    this.dbPromise = openDB("glb-store", 1, {
      upgrade(db) {
        db.createObjectStore("glb");
      },
    });
  }

  async get(key) {
    return (await this.dbPromise).get("glb", key);
  }

  async set(key, val) {
    return (await this.dbPromise).put("glb", val, key);
  }

  async del(key) {
    return (await this.dbPromise).delete("glb", key);
  }

  async clear() {
    return (await this.dbPromise).clear("glb");
  }

  async keys() {
    return (await this.dbPromise).getAllKeys("glb");
  }
}
