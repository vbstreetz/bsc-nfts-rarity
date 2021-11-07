import fetch from 'node-fetch';
import Batch from 'batch';

import { COLLECTIONS } from '../config';
import * as redis from '../utils/redis';
import { getRedisNFTKey } from '../nfts/utils';

async function main(slug: string) {
  const { count } = COLLECTIONS[slug];
  const jobs: any = [];
  for (let i = 1; i <= count; i++) {
    jobs.push(fetchNFT(slug, i));
  }
  return await Promise.all(jobs);
}

async function fetchNFT(slug: string, i: number) {
  const { url } = COLLECTIONS[slug];

  const key = getRedisNFTKey(slug, i);
  if (await redis.exec('get', [key])) return console.log('skipping %s', i);

  console.log('loading %s', i);
  try {
    const nft = await request(url(i));
    await redis.exec('set', [key, JSON.stringify(nft)]);
  } catch (e) {
    console.warn(e);
  }
}

async function request(url: string) {
  const res = await fetch(url, {
    headers: {
      Accepts: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
    },
  });
  return await res.json();
}

export default main;