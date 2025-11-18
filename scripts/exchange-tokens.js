#!/usr/bin/env node
import 'dotenv/config';
import fetch from 'node-fetch';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const SAVE = args.includes('--save');
const ENV_PATH = path.resolve(process.cwd(), '.env');

function log(msg) { console.log(msg); }
function warn(msg) { console.warn('Warning:', msg); }

async function exchangeFacebookLongLived(appId, appSecret, shortToken) {
  const url = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(shortToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FB token exchange failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function getFacebookPageToken(pageId, userToken) {
  const url = `https://graph.facebook.com/v18.0/${encodeURIComponent(pageId)}?fields=access_token&access_token=${encodeURIComponent(userToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FB page token fetch failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function exchangeLinkedInCode(clientId, clientSecret, code, redirectUri) {
  const url = 'https://www.linkedin.com/oauth/v2/accessToken';
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  });
  const res = await fetch(url, { method: 'POST', body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LinkedIn token exchange failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function setEnvVar(key, value, envPath) {
  let raw = '';
  try {
    raw = await readFile(envPath, 'utf8');
  } catch (err) {
    raw = '';
  }
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const map = {};
  for (const line of lines) {
    const idx = line.indexOf('=');
    if (idx > 0) {
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim();
      map[k] = v;
    }
  }
  map[key] = value;
  const out = Object.entries(map).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
  await writeFile(envPath, out, 'utf8');
}

async function main() {
  log('Starting token exchange helper');

  // Facebook / Instagram exchange
  const FB_APP_ID = process.env.FB_APP_ID;
  const FB_APP_SECRET = process.env.FB_APP_SECRET;
  const FB_SHORT_TOKEN = process.env.FB_SHORT_TOKEN || process.env.FB_USER_ACCESS_TOKEN;
  const FB_PAGE_ID = process.env.FB_PAGE_ID;

  if (FB_APP_ID && FB_APP_SECRET && FB_SHORT_TOKEN) {
    try {
      log('\nFacebook: exchanging short-lived token for long-lived token...');
      const json = await exchangeFacebookLongLived(FB_APP_ID, FB_APP_SECRET, FB_SHORT_TOKEN);
      log('Result:');
      console.log(JSON.stringify(json, null, 2));
      if (json.access_token) {
        log('Long-lived user token ready (will not save unless --save is provided)');
        if (SAVE) {
          await setEnvVar('FB_LONG_LIVED_TOKEN', json.access_token, ENV_PATH);
          log('Saved FB_LONG_LIVED_TOKEN to .env');
        }
        if (FB_PAGE_ID) {
          log('\nFacebook: fetching page access token...');
          const page = await getFacebookPageToken(FB_PAGE_ID, json.access_token);
          console.log(JSON.stringify(page, null, 2));
          if (page.access_token) {
            if (SAVE) {
              await setEnvVar('FB_PAGE_ACCESS_TOKEN', page.access_token, ENV_PATH);
              log('Saved FB_PAGE_ACCESS_TOKEN to .env');
            }
          }
        }
      }
    } catch (err) {
      warn(err.message);
    }
  } else {
    log('\nFacebook: missing FB_APP_ID, FB_APP_SECRET or FB_SHORT_TOKEN — skipping Facebook flow');
  }

  // Instagram: use same exchange endpoint if IG short token present
  const IG_SHORT_TOKEN = process.env.IG_SHORT_TOKEN || process.env.IG_ACCESS_TOKEN;
  if (FB_APP_ID && FB_APP_SECRET && IG_SHORT_TOKEN) {
    try {
      log('\nInstagram: exchanging short-lived IG token for long-lived token (via Facebook exchange)...');
      const json = await exchangeFacebookLongLived(FB_APP_ID, FB_APP_SECRET, IG_SHORT_TOKEN);
      console.log(JSON.stringify(json, null, 2));
      if (json.access_token && SAVE) {
        await setEnvVar('IG_LONG_LIVED_TOKEN', json.access_token, ENV_PATH);
        log('Saved IG_LONG_LIVED_TOKEN to .env');
      }
    } catch (err) {
      warn(err.message);
    }
  } else {
    log('\nInstagram: missing FB_APP_ID/APP_SECRET or IG_SHORT_TOKEN — skipping Instagram flow');
  }

  // LinkedIn: exchange authorization code for access token
  const LI_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const LI_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  const LI_CODE = process.env.LINKEDIN_CODE;
  const LI_REDIRECT = process.env.LINKEDIN_REDIRECT_URI;

  if (LI_CLIENT_ID && LI_CLIENT_SECRET && LI_CODE && LI_REDIRECT) {
    try {
      log('\nLinkedIn: exchanging authorization code for access token...');
      const json = await exchangeLinkedInCode(LI_CLIENT_ID, LI_CLIENT_SECRET, LI_CODE, LI_REDIRECT);
      console.log(JSON.stringify(json, null, 2));
      if (json.access_token && SAVE) {
        await setEnvVar('LINKEDIN_ACCESS_TOKEN', json.access_token, ENV_PATH);
        log('Saved LINKEDIN_ACCESS_TOKEN to .env');
      }
    } catch (err) {
      warn(err.message);
    }
  } else {
    log('\nLinkedIn: missing client_id/client_secret/code/redirect — skipping LinkedIn flow');
  }

  log('\nToken exchange helper finished.');
  if (!SAVE) log('Run with --save to persist resulting tokens into .env (if present).');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
