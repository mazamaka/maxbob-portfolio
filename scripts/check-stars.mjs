import {build} from 'esbuild';
import assert from 'node:assert/strict';

const built = await build({entryPoints:['src/github-stars.ts'], bundle:true, platform:'node', format:'esm', write:false});
const {createStarsClient, currentStars} = await import(`data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`);
const names = ['octo-mcp', 'claudegate'];
const repo = (name, stars, extra = {}) => ({name, stargazers_count:stars, private:false, owner:{login:'mazamaka'}, ...extra});
const response = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {status, headers});
const memory = () => {
  const values = new Map();
  return {getItem:key => values.get(key) ?? null, setItem:(key,value) => values.set(key,value)};
};
let time = Date.parse('2026-10-04T17:00:00Z'), calls = 0, release;
const storage = memory();
let client = createStarsClient(names, {storage, now:() => time, fetcher:async (url, options) => {
  calls++;
  assert.match(url, /^https:\/\/api.github.com\/users\/mazamaka\/repos\?/);
  assert.equal(options.credentials, 'omit');
  assert.equal(options.cache, 'no-store');
  assert.ok(!options.headers.Authorization);
  await new Promise(resolve => { release = resolve; });
  return response([repo('octo-mcp', 8), repo('claudegate', 1), repo('private-project', 99, {private:true})]);
}});
const first = client.refresh(), duplicate = client.refresh();
assert.equal(first, duplicate, 'Focus and visibility events must share one in-flight request');
release();
let state = await first;
assert.equal(calls, 1);
assert.deepEqual(state.snapshot.counts, {'octo-mcp':8, claudegate:1});
assert.equal(currentStars('OCTO-MCP', 7, state.snapshot), 8);
assert.equal(currentStars(null, 99, state.snapshot), undefined, 'Private entries never get a counter');
await client.refresh(); assert.equal(calls, 1, 'Rapid events are debounced');

client = createStarsClient(names, {storage, now:() => time, fetcher:async () => response([repo('octo-mcp', 7), repo('claudegate', 0)])});
assert.equal(client.getState().snapshot.counts['octo-mcp'], 8, 'Reload can immediately show saved data');
state = await client.refresh();
assert.equal(state.snapshot.counts['octo-mcp'], 7, 'Unstarring decreases the count');
assert.equal(currentStars('claudegate', 1, state.snapshot), 0, 'Zero must not fall back to a stale positive count');
const lastGood = state.snapshot;

time += 4_000;
client = createStarsClient(names, {storage, now:() => time, fetcher:async () => { throw new Error('offline'); }});
state = await client.refresh();
assert.equal(state.status, 'error');
assert.deepEqual(state.snapshot, lastGood, 'Network errors preserve counts and their original timestamp');

time += 61_000; calls = 0;
client = createStarsClient(names, {storage, now:() => time, fetcher:async () => {
  calls++;
  return response({}, 429, {'retry-after':'120'});
}});
state = await client.refresh();
assert.equal(state.status, 'limited');
assert.deepEqual(state.snapshot, lastGood);
await client.refresh(); assert.equal(calls, 1);
const reloadedLimited = createStarsClient(names, {storage, now:() => time, fetcher:async () => { throw new Error('Must not call during cooldown'); }});
assert.equal(reloadedLimited.getState().status, 'limited');
assert.equal((await reloadedLimited.refresh()).retryAt, time + 120_000, 'Retry-After survives reload');

time += 121_000; calls = 0;
client = createStarsClient(names, {storage, now:() => time, fetcher:async () => {
  calls++;
  if(calls === 1) return response([repo('octo-mcp', 10)], 200, {link:'<https://api.github.com/users/mazamaka/repos?page=2>; rel="next"'});
  return response({}, 500);
}});
state = await client.refresh();
assert.equal(calls, 2);
assert.deepEqual(state.snapshot, lastGood, 'A failed second page must not publish a partial snapshot');

time += 61_000; calls = 0;
client = createStarsClient(names, {now:() => time, fetcher:async () => {
  calls++;
  if(calls === 1) return response([repo('octo-mcp', 10)], 200, {link:'<https://api.github.com/users/mazamaka/repos?page=2>; rel="next"'});
  return response([repo('claudegate', 2), repo('octo-mcp', 100, {private:true}), repo('claudegate', 100, {owner:{login:'someone-else'}})]);
}});
state = await client.refresh();
assert.deepEqual(state.snapshot.counts, {'octo-mcp':10, claudegate:2}, 'Pagination includes public projects owned by the correct user only');

calls = 0;
client = createStarsClient(names, {now:() => time, fetcher:async () => {
  calls++; return response([repo('octo-mcp', 10)], 200, {link:'<https://example.com/repos?page=2>; rel="next"'});
}});
assert.equal((await client.refresh()).status, 'error');
assert.equal(calls, 1, 'Do not follow an unexpected pagination origin');

client = createStarsClient(names, {now:() => time, fetcher:async () => response({}, 403, {'x-ratelimit-remaining':'0','x-ratelimit-reset':String(time / 1000 + 3600)})});
assert.ok((await client.refresh()).retryAt > time + 3_600_000, 'Respect the primary reset timestamp');
client = createStarsClient(names, {storage:{getItem:() => '{broken', setItem:() => {throw new Error('blocked');}}, now:() => time, fetcher:async () => response([repo('octo-mcp', 4)])});
assert.equal((await client.refresh()).snapshot.counts['octo-mcp'], 4, 'Storage failure must not block live counts');
client = createStarsClient(names, {now:() => time, fetcher:async () => response([repo('octo-mcp', -1)])});
assert.equal((await client.refresh()).status, 'error', 'Reject malformed counts');
console.log('PASS: live counts; star/unstar/zero; shared requests; reload cache; offline fallback; rate limits; pagination; private guards; blocked storage');
