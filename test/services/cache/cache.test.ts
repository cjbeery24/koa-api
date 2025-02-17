import { useCache } from "@/services/cache/cache";
describe("CacheService", () => {
  it("should return a CacheService object", async () => {
    const cache = useCache();
    expect(cache).toHaveProperty("get");
    expect(cache).toHaveProperty("set");
    expect(cache).toHaveProperty("delete");
  });

  it("should return the value stored in the cache", async () => {
    const cache = useCache();
    const valueToCache = 10;
    cache.set("test", valueToCache);
    const cachedValue = await cache.get("test");
    expect(cachedValue).toBe(valueToCache);
  });

  it("should not return a value that has been deleted from the cache", async () => {
    const cache = useCache();
    const valueToCache = 10;
    cache.set("test", valueToCache);
    await cache.delete("test");
    const deletedValue = await cache.get("test");
    expect(deletedValue).toBeUndefined();
  });
});
