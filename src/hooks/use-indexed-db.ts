// This is a slightly modified and stripped down version of the code from:
// https://github.com/hc-oss/use-indexeddb/

import { useMemo } from "react";

type IDBObjectStore<T> = Omit<globalThis.IDBObjectStore, "get"> & {
	get: (query: IDBValidKey | IDBKeyRange) => IDBRequest<T>;
};

type IDBTransaction<T> = Omit<globalThis.IDBTransaction, "objectStore"> & {
	objectStore: (name: string) => IDBObjectStore<T>;
};

type IDBDatabase<T> = Omit<globalThis.IDBDatabase, "transaction"> & {
	transaction(
		storeNames: string | Iterable<string>,
		mode?: IDBTransactionMode,
		options?: IDBTransactionOptions
	): IDBTransaction<T>;
};

type IDBOpenDBRequest<T = any> = Omit<
	globalThis.IDBOpenDBRequest,
	"onerror" | "onupgradeneeded"
> & {
	onerror:
		| ((
				this: globalThis.IDBOpenDBRequest,
				ev: Event & { target: EventTarget & IDBRequest<T> }
		  ) => any)
		| null;
	onupgradeneeded:
		| ((
				this: globalThis.IDBOpenDBRequest,
				ev: Omit<IDBVersionChangeEvent, "target"> & {
					target: EventTarget & { result: IDBDatabase<T> };
				}
		  ) => any)
		| null;
};

export type IDBConfig = {
	name: string;
	version: number;
	stores: Array<{
		name: string;
		id?: IDBObjectStoreParameters;
		indices: Array<{
			name: string;
			keyPath: string;
			options?: IDBIndexParameters;
		}>;
	}>;
};

declare global {
	interface Window {
		__idb: {
			config: IDBConfig;
		};
	}
}

export function setupIndexedDB(config: IDBConfig) {
	return new Promise<void>(async (resolve) => {
		await getConnection(config);
		window.__idb = { config };
		resolve();
	});
}

export function useIndexedDB<T>(name: string) {
	return useMemo(() => getActions<T>(name), [name]);
}

function getConnection<T>(config: IDBConfig = window.__idb.config) {
	return new Promise<IDBDatabase<T>>((resolve, reject) => {
		const request: IDBOpenDBRequest<T> = window.indexedDB.open(
			config.name,
			config.version
		);

		request.onsuccess = () => resolve(request.result);
		request.onerror = (event) => reject(event.target?.error?.name);
		request.onupgradeneeded = (event) => {
			const db = event.target?.result;

			config.stores.map((store) => {
				if (db.objectStoreNames.contains(store.name)) {
					return;
				}

				const objectStore = db.createObjectStore(store.name, store.id);
				store.indices.map(({ name, keyPath, options }) => {
					objectStore.createIndex(name, keyPath, options);
				});
			});
		};
	});
}

function createTransaction<T>(
	db: IDBDatabase<T>,
	name: string,
	mode: IDBTransactionMode
) {
	const tx = db.transaction(name, mode);
	const store = tx.objectStore(name);
	return { tx, store };
}

function getActions<T>(name: string) {
	return {
		getById: (key: IDBValidKey) => {
			return new Promise<T>((resolve, reject) => {
				getConnection<T>()
					.then((db) => {
						const { store } = createTransaction(db, name, "readonly");
						const request = store.get(key);
						request.onsuccess = () => {
							resolve(request.result);
						};
					})
					.catch(reject);
			});
		},
		addOrUpdate: (value: T, key?: IDBValidKey | undefined) => {
			return new Promise<IDBValidKey>((resolve, reject) => {
				getConnection()
					.then((db) => {
						const { tx, store } = createTransaction(db, name, "readwrite");
						const request = store.put(value, key);
						request.onsuccess = () => {
							tx.commit();
							resolve(request.result);
						};
					})
					.catch(reject);
			});
		},
		deleteById: (key: IDBValidKey) => {
			return new Promise<Event>((resolve, reject) => {
				getConnection()
					.then((db) => {
						const { tx, store } = createTransaction(db, name, "readwrite");
						const request = store.delete(key);
						request.onsuccess = (event) => {
							tx.commit();
							resolve(event);
						};
					})
					.catch(reject);
			});
		},
	};
}
