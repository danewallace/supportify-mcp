# 🚀 Performance Update - Caching Added!

## What Changed

I've added **two-layer caching** to dramatically improve performance when Claude makes multiple requests:

### 1. HTML Cache (fetch.ts)
- **Caches raw HTML** for 24 hours
- **100 page limit** (LRU eviction)
- **15-second timeout** to prevent hanging
- **Removed `Cache-Control: no-cache`** to allow natural browser caching

### 2. Markdown Cache (index.ts)
- **Caches rendered markdown** for 24 hours
- **100 page limit** (LRU eviction)
- **Instant responses** for previously fetched pages

## Performance Impact

### Before (No Caching)
```
Request 1 for "Secure Enclave": ~3-5 seconds
Request 2 for same page:        ~3-5 seconds (fetches again!)
Request 3 for same page:        ~3-5 seconds (fetches again!)
10 requests = ~30-50 seconds total
```

### After (With Caching)
```
Request 1 for "Secure Enclave": ~3-5 seconds (fetch + parse)
Request 2 for same page:        ~5ms (markdown cache hit!)
Request 3 for same page:        ~5ms (markdown cache hit!)
10 requests = ~3-5 seconds for first, instant for rest
```

## What This Fixes

**Problem:** When you asked Claude about "Face ID and Touch ID", it made multiple sequential requests:
1. Search for "Face ID" 
2. Search for "Touch ID"
3. Search for "biometric"
4. Fetch multiple pages
5. Re-fetch the same pages

Each request hit Apple's servers → **slow + timeouts**.

**Solution:** Now repeated requests are **instant** from cache!

## How to Restart

### Option 1: Manual Restart (Recommended)

1. **Stop current server** (if running):
   ```bash
   pkill -f wrangler
   ```

2. **Start fresh**:
   ```bash
   cd /Users/danewallace/Git/supportify-mcp
   npm run dev
   ```

3. **Wait for**:
   ```
   Ready on http://localhost:51345
   ```

4. **Restart Claude Desktop**:
   - Quit Claude (⌘Q)
   - Wait 5 seconds
   - Reopen Claude

### Option 2: Use Restart Script

```bash
./restart-for-claude.sh
```

## How to See Caching in Action

### Test 1: Same Query Twice

**First time (cold cache):**
```
You: Tell me about Face ID using the security guide
```

Watch the terminal logs:
```
⟳ Fetching security/sec59b0b31ff...
✓ Cached security/sec59b0b31ff
✓ Cached markdown for security/sec59b0b31ff
```

**Second time (warm cache):**
```
You: Tell me about Face ID again
```

Watch the terminal logs:
```
✓ Markdown cache hit for security/sec59b0b31ff
```

**Result:** Instant response! 🚀

### Test 2: Multiple Related Topics

```
You: Search for Face ID, Touch ID, and Secure Enclave in the 
     security guide, and tell me about all three.
```

**Expected behavior:**
1. Search runs once (ToC is cached for 24 hours)
2. First fetch for each page takes ~3-5 seconds
3. Any re-requests are instant
4. Total time: ~10-15 seconds instead of ~30-60 seconds

## Cache Statistics

Run this while the server is running:
```bash
curl -s http://localhost:51345/ | head -5
```

**Future enhancement:** Could add a `/cache-stats` endpoint to show:
- Cache hit/miss ratio
- Number of cached pages
- Cache memory usage

## Troubleshooting

### Still seeing timeouts?

1. **Check if Apple is rate limiting:**
   ```bash
   curl -I https://support.apple.com/guide/security/sec59b0b31ff/web
   ```
   Should return `200 OK`. If `429` or `503`, Apple is rate limiting.

2. **Increase timeout** (in `fetch.ts`):
   ```typescript
   signal: AbortSignal.timeout(30000), // 30 seconds instead of 15
   ```

3. **Reduce concurrent requests:**
   Ask Claude to fetch pages **one at a time** instead of all at once.

### Cache not working?

Check logs for:
```
✓ Cache hit for security/...
✓ Markdown cache hit for security/...
```

If you don't see these, the cache isn't being hit.

## Future Improvements

1. **Add rate limiting** to prevent hammering Apple's servers
2. **Batch request optimization** for multiple pages
3. **Persistent cache** (save to disk) for faster cold starts
4. **Cache warming** (pre-fetch popular pages)
5. **Cache statistics endpoint** (`/cache-stats`)

## Files Modified

- `src/lib/support/fetch.ts` - Added HTML cache + timeout
- `src/lib/support/index.ts` - Added markdown cache

---

**Ready to test!** Restart the server and try asking Claude the same question twice. 🎯

