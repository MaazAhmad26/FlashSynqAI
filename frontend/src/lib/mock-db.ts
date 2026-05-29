/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class MockDB {
  private static getStore(key: string): any[] {
    const data = localStorage.getItem(`flashsynq_${key}`);
    return data ? JSON.parse(data) : [];
  }

  private static setStore(key: string, data: any[]) {
    localStorage.setItem(`flashsynq_${key}`, JSON.stringify(data));
  }

  static async add(collection: string, data: any): Promise<string> {
    const id = Math.random().toString(36).substring(2, 11);
    const store = this.getStore(collection);
    const newItem = { id, ...data, createdAt: data.createdAt || new Date().toISOString() };
    this.setStore(collection, [...store, newItem]);
    return id;
  }

  static async list(collection: string, filter?: { field: string; value: any }): Promise<any[]> {
    let store = this.getStore(collection);
    if (filter) {
      store = store.filter(item => item[filter.field] === filter.value);
    }
    // Sort by createdAt desc by default
    return store.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async get(collection: string, id: string): Promise<any | null> {
    const store = this.getStore(collection);
    return store.find(item => item.id === id) || null;
  }

  static async delete(collection: string, id: string): Promise<void> {
    const store = this.getStore(collection);
    this.setStore(collection, store.filter(item => item.id !== id));
  }

  static async update(collection: string, id: string, data: any): Promise<void> {
    const store = this.getStore(collection);
    this.setStore(collection, store.map(item => item.id === id ? { ...item, ...data } : item));
  }
}
