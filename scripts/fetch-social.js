#!/usr/bin/env node
import 'dotenv/config';
import fetch from 'node-fetch';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_OUTPUT = path.resolve(process.cwd(), 'data', 'social-pulse.json');
const args = process.argv.slice(2);
const OUT_ARG = args.find(arg => arg.startsWith('--out='));
const OUTPUT_PATH = OUT_ARG ? path.resolve(process.cwd(), OUT_ARG.split('=')[1]) : (process.env.SOCIAL_OUTPUT_PATH ? path.resolve(process.cwd(), process.env.SOCIAL_OUTPUT_PATH) : DEFAULT_OUTPUT);
const LIMIT = Number(process.env.SOCIAL_POST_LIMIT || 5);

const config = {
  facebook: {
    pageId: process.env.FB_PAGE_ID,
    token: process.env.FB_ACCESS_TOKEN,
    limit: Number(process.env.FB_POST_LIMIT || LIMIT)
  },
  instagram: {
    businessId: process.env.IG_BUSINESS_ID,
    token: process.env.IG_ACCESS_TOKEN,
    limit: Number(process.env.IG_POST_LIMIT || LIMIT)
  },
  linkedin: {
    orgId: process.env.LINKEDIN_ORG_ID,
    token: process.env.LINKEDIN_ACCESS_TOKEN,
    limit: Number(process.env.LI_POST_LIMIT || LIMIT)
  }
};

function logStep(message) {
  console.log(`\n➡️  ${message}`);
}

async function safeFetchJson(url, options = {}, label = 'request') {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${label} failed (${res.status}): ${text.slice(0, 200)}`);
    }
    return res.json();
  } catch (error) {
    console.warn(`⚠️  ${label} error:`, error.message);
    return null;
  }
}

function mapFacebookPost(post) {
  return {
    id: post.id,
    platform: 'facebook',
    title: post.message ? post.message.slice(0, 140) : 'Facebook update',
    date: post.created_time,
    link: post.permalink_url,
    engagement: {
      likes: post.likes?.summary?.total_count ?? 0,
      comments: post.comments?.summary?.total_count ?? 0,
      shares: post.shares?.count ?? 0
    }
  };
}

async function fetchFacebookPosts() {
  const { pageId, token, limit } = config.facebook;
  if (!pageId || !token) {
    console.log('Skipping Facebook — provide FB_PAGE_ID & FB_ACCESS_TOKEN');
    return [];
  }
  const fields = ['id', 'message', 'created_time', 'permalink_url', 'shares', 'likes.summary(true)', 'comments.summary(true)'];
  const url = `https://graph.facebook.com/v18.0/${pageId}/posts?fields=${fields.join(',')}&limit=${limit}&access_token=${token}`;
  const data = await safeFetchJson(url, {}, 'Facebook posts');
  return Array.isArray(data?.data) ? data.data.map(mapFacebookPost) : [];
}

function mapInstagramPost(post) {
  return {
    id: post.id,
    platform: 'instagram',
    title: post.caption ? post.caption.slice(0, 140) : 'Instagram post',
    date: post.timestamp,
    link: post.permalink,
    engagement: {
      likes: post.like_count ?? 0,
      comments: post.comments_count ?? 0
    }
  };
}

async function fetchInstagramPosts() {
  const { businessId, token, limit } = config.instagram;
  if (!businessId || !token) {
    console.log('Skipping Instagram — provide IG_BUSINESS_ID & IG_ACCESS_TOKEN');
    return [];
  }
  const fields = ['id', 'caption', 'media_url', 'permalink', 'like_count', 'comments_count', 'timestamp'];
  const url = `https://graph.facebook.com/v18.0/${businessId}/media?fields=${fields.join(',')}&limit=${limit}&access_token=${token}`;
  const data = await safeFetchJson(url, {}, 'Instagram media');
  return Array.isArray(data?.data) ? data.data.map(mapInstagramPost) : [];
}

function mapLinkedInPost(post) {
  const activity = post.activity || post.id;
  const text = post.text?.text || 'LinkedIn update';
  return {
    id: post.id || activity,
    platform: 'linkedin',
    title: text.slice(0, 140),
    date: post.lastModified?.time ? new Date(post.lastModified.time).toISOString() : undefined,
    link: post.permalink ?? `https://www.linkedin.com/feed/update/${activity}`,
    engagement: {
      reactions: post.likesSummary?.totalLikes ?? 0,
      comments: post.commentsSummary?.count ?? 0
    }
  };
}

async function fetchLinkedInPosts() {
  const { orgId, token, limit } = config.linkedin;
  if (!orgId || !token) {
    console.log('Skipping LinkedIn — provide LINKEDIN_ORG_ID & LINKEDIN_ACCESS_TOKEN');
    return [];
  }
  const url = `https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:organization:${orgId}&sharesPerOwner=${limit}`;
  const data = await safeFetchJson(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Restli-Protocol-Version': '2.0.0'
    }
  }, 'LinkedIn shares');
  return Array.isArray(data?.elements) ? data.elements.map(mapLinkedInPost) : [];
}

async function loadExistingPulse(filepath) {
  try {
    const raw = await readFile(filepath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function sortPosts(posts) {
  return posts
    .filter(Boolean)
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
}

async function main() {
  logStep('Fetching latest posts from configured networks');
  const [facebookPosts, instagramPosts, linkedinPosts] = await Promise.all([
    fetchFacebookPosts(),
    fetchInstagramPosts(),
    fetchLinkedInPosts()
  ]);

  const combined = sortPosts([...facebookPosts, ...instagramPosts, ...linkedinPosts]);
  if (!combined.length) {
    console.warn('No posts were retrieved — check credentials and permissions.');
  } else {
    console.log(`Retrieved ${combined.length} total posts.`);
  }

  const existing = await loadExistingPulse(OUTPUT_PATH);
  const payload = {
    fetchedAt: new Date().toISOString(),
    latestPosts: combined,
    alumniSpotlights: existing.alumniSpotlights || []
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2));
  console.log(`\n✅ Social pulse written to ${OUTPUT_PATH}`);
}

main().catch(error => {
  console.error('Social fetch failed:', error);
  process.exitCode = 1;
});
