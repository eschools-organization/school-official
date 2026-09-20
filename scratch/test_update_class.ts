import { getDb } from '../src/lib/db';
import { invalidateCache, getCachedOrFetch } from '../src/lib/cache';

async function testCache() {
  console.log("Testing cache invalidation logic...");
  
  // Set dummy cache
  await getCachedOrFetch('all_classes_formatted', 60000, async () => {
    return [{ test: 1 }];
  });

  // Verify cached value
  let cachedVal = await getCachedOrFetch('all_classes_formatted', 60000, async () => {
    return [{ test: 2 }];
  });
  console.log("Cached value before invalidation:", cachedVal);

  // Invalidate
  invalidateCache();

  // Verify fresh fetch after invalidation
  cachedVal = await getCachedOrFetch('all_classes_formatted', 60000, async () => {
    return [{ test: 2 }];
  });
  console.log("Cached value after invalidation:", cachedVal);
}

testCache().catch(console.error);
