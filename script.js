/* ===========================================================
   FAIRRISS - script.js
   Network-Commerce Platform MVP
=========================================================== */

'use strict';

/*  1. HELPERS  */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const fmt = (n) => new Intl.NumberFormat('en-US').format(n);
const fmtMoney = (n, cur = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n);
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (m < 2) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const initials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/*  2. DATA STORE (localStorage-backed)  */
const STORE_KEY = 'fairriss_mvp_v1';

const DEFAULT_DATA = {
  currentUser: null,
  users: [
    { id: 'u1', name: 'Alex Chen', username: 'alexchen', role: 'creator', bio: 'Business coach & community builder. I help founders scale from 0 to 1.', location: 'San Francisco, CA', skills: ['Coaching', 'Strategy', 'Fundraising', 'Community'], availability: 'available', trustScore: 94, avatar: null, deals: 18, revenue: 87400, referralsSent: 22, referralsConverted: 18, reviewAvg: 4.9, joinedAt: '2024-01-15T00:00:00Z' },
    { id: 'u2', name: 'Marcus Osei', username: 'marcusosei', role: 'member', bio: 'Senior UX designer with 8 years shaping digital products for fintech and consumer apps.', location: 'Lagos, Nigeria', skills: ['UX Design', 'Figma', 'Design Systems', 'User Research', 'Prototyping'], availability: 'available', trustScore: 87, avatar: null, deals: 24, revenue: 41200, referralsSent: 12, referralsConverted: 9, reviewAvg: 4.9, joinedAt: '2024-02-03T00:00:00Z' },
    { id: 'u3', name: 'Priya Singh', username: 'priyasingh', role: 'member', bio: 'Full-stack engineer specialising in React, Node.js, and scalable APIs. Open to contracts.', location: 'Bangalore, India', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'], availability: 'limited', trustScore: 79, avatar: null, deals: 11, revenue: 28600, referralsSent: 6, referralsConverted: 4, reviewAvg: 4.7, joinedAt: '2024-03-12T00:00:00Z' },
    { id: 'u4', name: 'Jordan Lee', username: 'jordanlee', role: 'member', bio: 'Growth marketer obsessed with CAC and retention. Former head of growth at two YC companies.', location: 'New York, NY', skills: ['Growth', 'Paid Ads', 'Analytics', 'SEO', 'Email Marketing'], availability: 'unavailable', trustScore: 72, avatar: null, deals: 8, revenue: 19800, referralsSent: 14, referralsConverted: 7, reviewAvg: 4.5, joinedAt: '2024-04-01T00:00:00Z' },
    { id: 'u5', name: 'Nova SaaS', username: 'novasaas', role: 'brand', bio: 'B2B workflow automation platform. We sponsor Wheels in the startup and ops space.', location: 'Austin, TX', skills: ['SaaS', 'B2B', 'Automation'], availability: 'available', trustScore: 83, avatar: null, deals: 5, revenue: 0, referralsSent: 2, referralsConverted: 1, reviewAvg: 4.6, joinedAt: '2024-02-20T00:00:00Z' },
    { id: 'u6', name: 'Sarah Kim', username: 'sarahkim', role: 'member', bio: 'Brand designer & strategist. I create visual identities that make companies unforgettable.', location: 'Seoul, South Korea', skills: ['Brand Design', 'Illustration', 'Motion', 'Art Direction'], availability: 'available', trustScore: 91, avatar: null, deals: 31, revenue: 62300, referralsSent: 19, referralsConverted: 15, reviewAvg: 5.0, joinedAt: '2024-01-28T00:00:00Z' },
  ],
  wheels: [
    { id: 'w1', name: 'The Founders Circle', slug: 'founders-circle', creatorId: 'u1', description: 'A private community for early-stage founders to share deals, referrals, and hard-won insights. No investors. No noise.', category: 'Startup', coverGradient: 'linear-gradient(135deg,#0F1F3D,#243B6B)', hexColor: '#0F1F3D', accentColor: '#00C9A7', memberCount: 142, status: 'active', membershipMode: 'invite_only', monthlyPrice: 29, dealCommission: 2.5, createdAt: '2024-01-20T00:00:00Z' },
    { id: 'w2', name: 'Design Syndicate', slug: 'design-syndicate', creatorId: 'u6', description: 'Designers helping designers. Referrals, collab opportunities, client leads, and brutally honest critique.', category: 'Design', coverGradient: 'linear-gradient(135deg,#4C1D95,#7C3AED)', hexColor: '#6D28D9', accentColor: '#C4B5FD', memberCount: 89, status: 'active', membershipMode: 'open', monthlyPrice: 0, dealCommission: 1.5, createdAt: '2024-02-10T00:00:00Z' },
    { id: 'w3', name: 'Growth Operators', slug: 'growth-ops', creatorId: 'u4', description: 'Hands-on growth professionals sharing what actually moves the needle. Weekly teardowns, deals, and collab.', category: 'Marketing', coverGradient: 'linear-gradient(135deg,#065F46,#059669)', hexColor: '#047857', accentColor: '#6EE7B7', memberCount: 63, status: 'active', membershipMode: 'open', monthlyPrice: 19, dealCommission: 2, createdAt: '2024-03-05T00:00:00Z' },
  ],
  wheelMembers: [
    { wheelId: 'w1', userId: 'u1', status: 'active', joinedAt: '2024-01-20T00:00:00Z' },
    { wheelId: 'w1', userId: 'u2', status: 'active', joinedAt: '2024-02-05T00:00:00Z' },
    { wheelId: 'w1', userId: 'u3', status: 'active', joinedAt: '2024-02-18T00:00:00Z' },
    { wheelId: 'w1', userId: 'u5', status: 'active', joinedAt: '2024-03-01T00:00:00Z' },
    { wheelId: 'w2', userId: 'u6', status: 'active', joinedAt: '2024-02-10T00:00:00Z' },
    { wheelId: 'w2', userId: 'u2', status: 'active', joinedAt: '2024-02-20T00:00:00Z' },
    { wheelId: 'w3', userId: 'u4', status: 'active', joinedAt: '2024-03-05T00:00:00Z' },
    { wheelId: 'w3', userId: 'u3', status: 'active', joinedAt: '2024-03-15T00:00:00Z' },
  ],
  opportunities: [
    { id: 'o1', creatorId: 'u5', wheelIds: ['w1'], type: 'job', title: 'Head of Product', description: 'We are looking for a seasoned product leader to own the entire roadmap for Nova SaaS. Remote-first, async culture.', skills: ['Product Management', 'SaaS', 'Data Analysis', 'Leadership'], location: 'Remote', remoteOk: true, status: 'open', metadata: { salaryMin: 140000, salaryMax: 180000, type: 'full-time' }, viewCount: 48, applicationCount: 7, expiresAt: '2025-09-01T00:00:00Z', createdAt: '2025-07-01T10:00:00Z' },
    { id: 'o2', creatorId: 'u2', wheelIds: ['w1', 'w2'], type: 'referral', title: 'Senior iOS Engineer @ Relay', description: 'Relay is building the next generation of B2B payments. Great team, great equity. Forwarding from a direct contact on their team.', skills: ['iOS', 'Swift', 'SwiftUI'], location: 'Remote', remoteOk: true, status: 'open', metadata: { bonus: 500, source: 'Remote First Jobs' }, viewCount: 31, applicationCount: 4, expiresAt: '2025-08-15T00:00:00Z', createdAt: '2025-07-03T14:30:00Z' },
    { id: 'o3', creatorId: 'u3', wheelIds: ['w1'], type: 'collaboration', title: 'CTO Co-Founder for EdTech Startup', description: 'I have a working prototype and an LOI from a school district. Looking for a technical co-founder to own the product and engineering side while I handle sales and ops.', skills: ['React Native', 'Node.js', 'EdTech'], location: 'Remote', remoteOk: true, status: 'open', metadata: { equity: '25-35%', commitment: 'Full-time' }, viewCount: 19, applicationCount: 2, expiresAt: '2025-09-30T00:00:00Z', createdAt: '2025-07-04T09:00:00Z' },
    { id: 'o4', creatorId: 'u1', wheelIds: ['w1'], type: 'service', title: 'Brand Identity Package for Q3 Launch', description: 'Looking for a talented brand designer to create a complete identity for a new coaching product: wordmark, icon, color system, type system, and 10 social templates.', skills: ['Brand Design', 'Logo Design', 'Typography'], location: 'Remote', remoteOk: true, status: 'open', metadata: { budgetMin: 2000, budgetMax: 4000 }, viewCount: 22, applicationCount: 5, expiresAt: '2025-07-31T00:00:00Z', createdAt: '2025-07-05T11:00:00Z' },
    { id: 'o5', creatorId: 'u4', wheelIds: ['w3'], type: 'partnership', title: 'Growth Agency Co-Marketing Partner', description: 'We run paid acquisition for 12 DTC brands and want to partner with a complementary agency (email, SEO, CRO) for referral sharing and joint pitches.', skills: ['Marketing', 'Agency', 'Partnership'], location: 'US-based preferred', remoteOk: true, status: 'open', metadata: { equity: null }, viewCount: 14, applicationCount: 3, expiresAt: '2025-08-20T00:00:00Z', createdAt: '2025-07-06T08:30:00Z' },
  ],
  deals: [
    { id: 'd1', wheelId: 'w2', buyerId: 'u5', sellerId: 'u2', title: 'Website Redesign Project', scope: 'Complete redesign of Nova SaaS marketing site (5 core pages) in Figma. Includes discovery, wireframes, high-fidelity mockups, and developer handoff.', deliverables: [ { id: 'del1', title: 'Discovery & wireframes', done: true }, { id: 'del2', title: 'High-fidelity Figma mockups', done: false }, { id: 'del3', title: 'Developer handoff (Zeplin)', done: false }, { id: 'del4', title: 'Revision round (x2)', done: false } ], status: 'in_progress', priceCents: 450000, currency: 'USD', paymentType: 'lump_sum', startDate: '2025-07-01', endDate: '2025-08-15', platformFeePct: 3, creatorCommissionPct: 2.5, messages: [ { id: 'm1', senderId: 'u5', body: 'Hi Marcus, we loved your portfolio. The Nova rebrand is one of our biggest priorities this quarter.', createdAt: '2025-07-01T09:00:00Z' }, { id: 'm2', senderId: 'u2', body: 'Thanks! I went through the brief. I have some questions about the brand voice - can we jump on a quick call?', createdAt: '2025-07-01T10:30:00Z' }, { id: 'm3', senderId: 'u5', body: 'Absolutely. Booking one now. Also just sent the current brand assets to your email.', createdAt: '2025-07-01T10:45:00Z' } ], createdAt: '2025-06-28T00:00:00Z' },
    { id: 'd2', wheelId: 'w1', buyerId: 'u1', sellerId: 'u3', title: 'Member Portal Development', scope: 'Build the member dashboard for The Founders Circle - authentication, profile pages, and deal listing MVP.', deliverables: [ { id: 'del5', title: 'Auth system (magic link)', done: true }, { id: 'del6', title: 'Profile CRUD + avatar upload', done: true }, { id: 'del7', title: 'Deal list + filter views', done: false } ], status: 'in_progress', priceCents: 800000, currency: 'USD', paymentType: 'milestones', startDate: '2025-06-15', endDate: '2025-08-30', platformFeePct: 3, creatorCommissionPct: 2, messages: [ { id: 'm4', senderId: 'u1', body: 'Priya, the auth and profile work looks clean. Deadline for the deal views is still Aug 30 - are we on track?', createdAt: '2025-07-04T14:00:00Z' }, { id: 'm5', senderId: 'u3', body: 'Yes - I am starting deal views Monday. Should have a preview by EOW.', createdAt: '2025-07-04T14:22:00Z' } ], createdAt: '2025-06-12T00:00:00Z' },
    { id: 'd3', wheelId: 'w1', buyerId: 'u2', sellerId: 'u6', title: 'Brand Identity for Osei Studio', scope: 'Complete brand identity for Marcus Osei Design Studio: wordmark, icon, color palette, type system, and business card design.', deliverables: [ { id: 'del8', title: 'Discovery & mood boards', done: true }, { id: 'del9', title: 'Wordmark concepts (x3)', done: true }, { id: 'del10', title: 'Final identity system', done: true }, { id: 'del11', title: 'File handoff', done: true } ], status: 'paid', priceCents: 320000, currency: 'USD', paymentType: 'lump_sum', startDate: '2025-05-01', endDate: '2025-06-01', platformFeePct: 3, creatorCommissionPct: 2.5, messages: [], createdAt: '2025-04-28T00:00:00Z' },
  ],
  posts: [
    { id: 'p1', wheelId: 'w1', authorId: 'u1', type: 'announcement', body: ' Welcome to Q3! This week we have three open opportunities in the feed - a Head of Product role at Nova, an iOS eng referral from Marcus, and a brand identity service request. Check them out. Let\'s make each other money.', likes: 24, createdAt: '2025-07-07T09:00:00Z' },
    { id: 'p2', wheelId: 'w1', authorId: 'u2', type: 'referral', body: 'Forwarding a senior iOS engineer role at Relay - great team, solid equity, full remote. Relay builds B2B payments. DM me for the warm intro if you know someone. Referral bonus: $500 if they get hired.', likes: 11, createdAt: '2025-07-07T11:30:00Z' },
    { id: 'p3', wheelId: 'w1', authorId: 'u3', type: 'post', body: 'PSA: I finished the auth module for the portal. Magic link is live on staging - you can test it at founders.staging.app. Would love feedback on the UX, especially the "verify your email" flow.', likes: 8, createdAt: '2025-07-06T16:00:00Z' },
    { id: 'p4', wheelId: 'w1', authorId: 'u5', type: 'post', body: 'Nova SaaS just crossed 500 paying customers. Hosting a private dinner in SF on July 18 for anyone in this Wheel who\'s in the Bay Area. RSVP in DMs.', likes: 31, createdAt: '2025-07-05T12:00:00Z' },
  ],
  referrals: [
    { id: 'r1', referrerId: 'u2', refereeId: 'u6', wheelId: 'w1', opportunityId: 'o4', note: 'Sarah is one of the best brand designers I\'ve worked with. Her work for Verve was exceptional.', status: 'converted', createdAt: '2025-07-05T10:00:00Z' },
  ],
  notifications: [
    { id: 'n1', userId: 'u1', type: 'deal_message', text: '<strong>Marcus Osei</strong> sent a message on Website Redesign Project', read: false, createdAt: '2025-07-07T10:30:00Z' },
    { id: 'n2', userId: 'u1', type: 'new_member', text: '<strong>Nova SaaS</strong> joined The Founders Circle', read: false, createdAt: '2025-07-06T15:00:00Z' },
    { id: 'n3', userId: 'u1', type: 'deal_completed', text: '<strong>Brand Identity for Osei Studio</strong> was marked complete', read: true, createdAt: '2025-06-30T09:00:00Z' },
    { id: 'n4', userId: 'u1', type: 'new_opportunity', text: '<strong>Jordan Lee</strong> posted a new Partnership opportunity', read: true, createdAt: '2025-07-06T08:30:00Z' },
  ],
};

class Store {
  constructor() {
    this.data = this._load();
  }
  _load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
  _save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); } catch(e) {}
  }
  reset() { this.data = JSON.parse(JSON.stringify(DEFAULT_DATA)); this._save(); }

  get(key) { return this.data[key]; }
  set(key, val) { this.data[key] = val; this._save(); }

  // Auth
  login(userId) { this.data.currentUser = userId; this._save(); }
  logout() { this.data.currentUser = null; this._save(); }
  getMe() { return this.data.users.find(u => u.id === this.data.currentUser) || null; }

  // Users
  getUser(id) { return this.data.users.find(u => u.id === id); }
  updateMe(fields) {
    const idx = this.data.users.findIndex(u => u.id === this.data.currentUser);
    if (idx !== -1) { Object.assign(this.data.users[idx], fields); this._save(); }
  }
  createUser(data) {
    const u = { id: uid(), trustScore: 0, deals: 0, revenue: 0, referralsSent: 0, referralsConverted: 0, reviewAvg: 0, avatar: null, joinedAt: new Date().toISOString(), ...data };
    this.data.users.push(u);
    this._save();
    return u;
  }

  // Wheels
  getMyWheels() {
    const me = this.data.currentUser;
    const memberWheelIds = this.data.wheelMembers.filter(m => m.userId === me && m.status === 'active').map(m => m.wheelId);
    return this.data.wheels.filter(w => memberWheelIds.includes(w.id));
  }
  getWheelMembers(wheelId) {
    const memberIds = this.data.wheelMembers.filter(m => m.wheelId === wheelId && m.status === 'active').map(m => m.userId);
    return this.data.users.filter(u => memberIds.includes(u.id));
  }
  createWheel(data) {
    const w = { id: uid(), creatorId: this.data.currentUser, memberCount: 1, status: 'active', createdAt: new Date().toISOString(), ...data };
    this.data.wheels.push(w);
    this.data.wheelMembers.push({ wheelId: w.id, userId: this.data.currentUser, status: 'active', joinedAt: new Date().toISOString() });
    this._save();
    return w;
  }
  joinWheel(wheelId) {
    const existing = this.data.wheelMembers.find(m => m.wheelId === wheelId && m.userId === this.data.currentUser);
    if (!existing) {
      this.data.wheelMembers.push({ wheelId, userId: this.data.currentUser, status: 'active', joinedAt: new Date().toISOString() });
      const w = this.data.wheels.find(x => x.id === wheelId);
      if (w) w.memberCount++;
      this._save();
    }
  }
  isMember(wheelId) {
    return !!this.data.wheelMembers.find(m => m.wheelId === wheelId && m.userId === this.data.currentUser && m.status === 'active');
  }

  // Opportunities
  getOpportunities(filters = {}) {
    let opps = [...this.data.opportunities];
    if (filters.wheelId) opps = opps.filter(o => o.wheelIds.includes(filters.wheelId));
    if (filters.type && filters.type !== 'all') opps = opps.filter(o => o.type === filters.type);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      opps = opps.filter(o => o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q) || o.skills.some(s => s.toLowerCase().includes(q)));
    }
    return opps.filter(o => o.status === 'open').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  createOpportunity(data) {
    const o = { id: uid(), creatorId: this.data.currentUser, status: 'open', viewCount: 0, applicationCount: 0, createdAt: new Date().toISOString(), ...data };
    this.data.opportunities.push(o);
    this._save();
    return o;
  }

  // Deals
  getMyDeals() {
    const me = this.data.currentUser;
    return this.data.deals.filter(d => d.buyerId === me || d.sellerId === me).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  getDeal(id) { return this.data.deals.find(d => d.id === id); }
  createDeal(data) {
    const d = { id: uid(), buyerId: this.data.currentUser, status: 'proposed', messages: [], deliverables: [], platformFeePct: 3, creatorCommissionPct: 2.5, createdAt: new Date().toISOString(), ...data };
    this.data.deals.push(d);
    this._save();
    return d;
  }
  updateDeal(id, fields) {
    const idx = this.data.deals.findIndex(d => d.id === id);
    if (idx !== -1) { Object.assign(this.data.deals[idx], fields); this._save(); }
    return this.data.deals[idx];
  }
  addDealMessage(dealId, body) {
    const deal = this.getDeal(dealId);
    if (!deal) return;
    const msg = { id: uid(), senderId: this.data.currentUser, body, createdAt: new Date().toISOString() };
    deal.messages.push(msg);
    this._save();
    return msg;
  }

  // Posts
  getPosts(wheelId) {
    return this.data.posts.filter(p => p.wheelId === wheelId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  createPost(data) {
    const p = { id: uid(), authorId: this.data.currentUser, likes: 0, createdAt: new Date().toISOString(), ...data };
    this.data.posts.push(p);
    this._save();
    return p;
  }
  likePost(postId) {
    const p = this.data.posts.find(x => x.id === postId);
    if (p) { p.likes++; this._save(); }
  }

  // Notifications
  getMyNotifs() {
    return (this.data.notifications || []).filter(n => n.userId === this.data.currentUser).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  markNotifRead(id) {
    const n = (this.data.notifications || []).find(x => x.id === id);
    if (n) { n.read = true; this._save(); }
  }
  addNotif(userId, type, text) {
    const n = { id: uid(), userId, type, text, read: false, createdAt: new Date().toISOString() };
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.push(n);
    this._save();
  }
}

const store = new Store();

/*  3. TOAST  */
function toast(msg, type = 'default') {
  const icons = { default: '', success: 'v', error: 'x' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${escHtml(msg)}</span>`;
  const container = $('#toast-container') || (() => { const c = document.createElement('div'); c.id = 'toast-container'; c.className = 'toast-container'; document.body.appendChild(c); return c; })();
  container.appendChild(el);
  setTimeout(() => { el.classList.add('hiding'); setTimeout(() => el.remove(), 300); }, 3200);
}

/*  4. MODAL  */
function openModal(id) { $(`#${id}`)?.classList.add('open'); }
function closeModal(id) { $(`#${id}`)?.classList.remove('open'); }
function closeAllModals() { $$('.modal-overlay').forEach(m => m.classList.remove('open')); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeAllModals();
  if (e.target.classList.contains('modal-close')) closeAllModals();
});

/*  5. ROUTER  */
const PAGES = ['home', 'wheels', 'members', 'opportunities', 'deals', 'profile', 'wheel-detail', 'deal-detail', 'analytics'];
let currentPage = 'home';
let pageParams = {};

function navigate(page, params = {}) {
  currentPage = page;
  pageParams = params;
  renderPage();
  window.scrollTo(0, 0);
}

function renderPage() {
  const me = store.getMe();
  if (!me) { renderAuth(); return; }
  renderShell(me);
  $$('.page').forEach(p => p.classList.remove('active'));
  const target = $(`#page-${currentPage}`);
  if (target) target.classList.add('active');

  // Update nav active state
  $$('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === currentPage);
  });

  // Render page content
  const renders = {
    home: renderHome,
    wheels: renderWheels,
    members: renderMembers,
    opportunities: renderOpportunities,
    deals: renderDeals,
    profile: renderProfile,
    'wheel-detail': renderWheelDetail,
    'deal-detail': renderDealDetail,
    analytics: renderAnalytics,
  };
  renders[currentPage]?.();
}

/*  6. AUTH  */
function renderAuth() {
  document.body.innerHTML = `
  <div class="auth-screen">
    <div class="auth-brand">
      <div class="auth-brand-logo">
        <svg width="36" height="40" viewBox="0 0 36 40" fill="none"><polygon points="18,0 36,10 36,30 18,40 0,30 0,10" fill="currentColor"/><polygon points="18,8 28,14 28,26 18,32 8,26 8,14" fill="#0F1F3D" opacity=".6"/></svg>
        <span class="auth-brand-logo-text">Fairriss</span>
      </div>
      <div class="auth-hex-grid">
        <div class="auth-hex-row">
          <div class="auth-hex-item"></div>
          <div class="auth-hex-item lit"></div>
        </div>
        <div class="auth-hex-row">
          <div class="auth-hex-item lit"></div>
          <div class="auth-hex-item"></div>
          <div class="auth-hex-item lit"></div>
        </div>
        <div class="auth-hex-row">
          <div class="auth-hex-item"></div>
          <div class="auth-hex-item lit"></div>
        </div>
      </div>
      <p class="auth-brand-tagline">The platform where professional networks become commerce engines.</p>
    </div>
    <div class="auth-form-side">
      <h1>Welcome to Fairriss</h1>
      <p class="auth-sub">Join the network where deals get done.</p>
      <div class="auth-tabs">
        <div class="auth-tab active" data-tab="login">Sign In</div>
        <div class="auth-tab" data-tab="signup">Create Account</div>
      </div>
      <div id="auth-login-form">
        <p class="t-body c-text3 mb-4">For the MVP demo, click any user to log in as them:</p>
        <div style="display:flex;flex-direction:column;gap:.5rem;" id="demo-users"></div>
      </div>
      <div id="auth-signup-form" class="hidden">
        <div class="form-stack">
          <div class="auth-role-grid" id="role-selector">
            <div class="auth-role-card selected" data-role="member"><div class="auth-role-icon"></div><div class="auth-role-name">Member</div><div class="auth-role-desc">Join Wheels, post & find opportunities</div></div>
            <div class="auth-role-card" data-role="creator"><div class="auth-role-icon"></div><div class="auth-role-name">Creator</div><div class="auth-role-desc">Build and monetise your own Wheel</div></div>
            <div class="auth-role-card" data-role="brand"><div class="auth-role-icon"></div><div class="auth-role-name">Brand</div><div class="auth-role-desc">Sponsor Wheels, post opportunities</div></div>
            <div class="auth-role-card" data-role="service"><div class="auth-role-icon"></div><div class="auth-role-name">Service Provider</div><div class="auth-role-desc">Offer professional services</div></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-control" id="su-name" placeholder="Alex Chen"></div>
            <div class="form-group"><label class="form-label">Username</label><input class="form-control" id="su-username" placeholder="alexchen"></div>
          </div>
          <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="su-email" type="email" placeholder="alex@example.com"></div>
          <div class="form-group"><label class="form-label">Bio <span>(optional)</span></label><textarea class="form-control" id="su-bio" rows="2" placeholder="What do you do?"></textarea></div>
          <div class="form-group"><label class="form-label">Skills / Focus Areas</label><input class="form-control" id="su-skills" placeholder="e.g. Product, Design, Growth"></div>
          <button class="btn btn-primary w-full" id="create-account-btn" style="justify-content:center;margin-top:.5rem;">Create Account</button>
        </div>
      </div>
    </div>
  </div>`;

  // Render demo users
  const ul = $('#demo-users');
  store.get('users').forEach(u => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline w-full';
    btn.style.justifyContent = 'flex-start';
    btn.style.gap = '.75rem';
    btn.innerHTML = `${avatarHtml(u, 'md')} <div style="text-align:left"><div class="t-body" style="font-weight:600">${escHtml(u.name)}</div><div class="t-small c-text3">${u.role} . Trust ${u.trustScore}</div></div>`;
    btn.addEventListener('click', () => { store.login(u.id); renderPage(); });
    ul.appendChild(btn);
  });

  // Tabs
  $$('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      $('#auth-login-form').classList.toggle('hidden', tab.dataset.tab !== 'login');
      $('#auth-signup-form').classList.toggle('hidden', tab.dataset.tab !== 'signup');
    });
  });

  // Role selector
  $$('[data-role]').forEach(card => {
    card.addEventListener('click', () => {
      $$('[data-role]').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  // Sign up
  $('#create-account-btn').addEventListener('click', () => {
    const name = $('#su-name').value.trim();
    const username = $('#su-username').value.trim();
    const email = $('#su-email').value.trim();
    const skills = $('#su-skills').value.trim().split(',').map(s => s.trim()).filter(Boolean);
    const bio = $('#su-bio').value.trim();
    const role = ($('[data-role].selected')?.dataset.role) || 'member';
    if (!name || !username || !email) { toast('Please fill in name, username and email.', 'error'); return; }
    const u = store.createUser({ name, username, email, role, bio, skills, location: '', availability: 'available' });
    store.login(u.id);
    toast(`Welcome to Fairriss, ${name}!`, 'success');
    renderPage();
  });
}

/*  7. AVATAR HELPERS  */
const PALETTE = ['#0F1F3D','#6D28D9','#047857','#C2410C','#0369A1','#BE185D','#374151'];
function getColor(userId) { return PALETTE[(parseInt(userId.replace(/\D/g,'') || '0') % PALETTE.length)]; }
function avatarHtml(user, size = 'md') {
  if (!user) return `<div class="avatar avatar-${size}" style="background:#ddd"></div>`;
  const col = getColor(user.id);
  return `<div class="avatar avatar-${size}" style="background:${col};color:#fff">${initials(user.name)}</div>`;
}
function hexBadge(wheel, size = 48) {
  const h = Math.round(size * 1.14);
  return `<div class="wheel-hex-mini" style="background:${wheel.hexColor||'#0F1F3D'};width:${size}px;height:${h}px;font-size:${Math.round(size*.35)}px">${wheel.name[0]}</div>`;
}

/*  8. SHELL  */
function renderShell(me) {
  if ($('.shell')) {
    updateShellDynamic(me);
    return;
  }
  document.body.innerHTML = `
  <div class="shell" id="shell">
    <header class="header">
      <div class="header-logo">
        <div class="header-logo-mark" onclick="navigate('home')">F</div>
        <span class="header-logo-text" onclick="navigate('home')" style="cursor:pointer">Fairriss</span>
      </div>
      <div class="header-search">
        <svg class="header-search-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Search members, deals, opportunities..." id="global-search">
      </div>
      <div class="header-actions">
        <div style="position:relative">
          <button class="header-btn" id="notif-btn" title="Notifications">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="notif-dot" id="notif-dot"></span>
          </button>
          <div class="notif-panel" id="notif-panel"></div>
        </div>
        <div class="header-avatar" id="header-avatar" title="My Profile">${initials(me.name)}</div>
      </div>
    </header>
    <aside class="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-label">Navigation</div>
        <nav>
          <div class="nav-item" data-page="home" onclick="navigate('home')">
            ${icon('home')} Home
          </div>
          <div class="nav-item" data-page="wheels" onclick="navigate('wheels')">
            ${icon('wheel')} My Wheels
          </div>
          <div class="nav-item" data-page="opportunities" onclick="navigate('opportunities')">
            ${icon('opp')} Opportunities <span class="nav-badge" id="opp-badge">5</span>
          </div>
          <div class="nav-item" data-page="deals" onclick="navigate('deals')">
            ${icon('deal')} Deals <span class="nav-badge" id="deal-badge"></span>
          </div>
          <div class="nav-item" data-page="members" onclick="navigate('members')">
            ${icon('members')} Members
          </div>
          ${me.role === 'creator' ? `<div class="nav-item" data-page="analytics" onclick="navigate('analytics')">${icon('analytics')} Analytics</div>` : ''}
        </nav>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">My Wheels</div>
        <div class="sidebar-wheels" id="sidebar-wheels"></div>
      </div>
      <div class="sidebar-bottom">
        <div class="sidebar-user" onclick="navigate('profile',{userId:'${me.id}'})">
          ${avatarHtml(me, 'sm')}
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${escHtml(me.name)}</div>
            <div class="sidebar-user-role">${me.role} . Trust ${me.trustScore}</div>
          </div>
          <button class="btn-ghost btn-xs" onclick="event.stopPropagation();store.logout();renderPage();" title="Logout"></button>
        </div>
      </div>
    </aside>
    <main class="main" id="main-content">
      ${PAGES.map(p => `<div class="page fade-in" id="page-${p}"></div>`).join('')}
    </main>
  </div>
  <div id="toast-container" class="toast-container"></div>
  ${buildModals()}`;

  updateShellDynamic(me);
  bindShellEvents();
}

function updateShellDynamic(me) {
  // Sidebar wheels
  const sw = $('#sidebar-wheels');
  if (sw) {
    const wheels = store.getMyWheels();
    sw.innerHTML = wheels.map(w => `
      <div class="sidebar-wheel-item ${pageParams.wheelId === w.id ? 'active' : ''}" onclick="navigate('wheel-detail',{wheelId:'${w.id}'})">
        ${hexBadge(w, 24)}
        <span class="sidebar-wheel-name">${escHtml(w.name)}</span>
        <span class="sidebar-wheel-count">${w.memberCount}</span>
      </div>`).join('') + `<div class="sidebar-wheel-item" onclick="openModal('modal-create-wheel')" style="color:var(--teal);font-weight:600;font-size:.8125rem;padding:.5rem .5rem">
        <span style="font-size:1.125rem;line-height:1">+</span> Create Wheel
      </div>`;
  }

  // Notif dot
  const notifs = store.getMyNotifs();
  const unread = notifs.filter(n => !n.read);
  const dot = $('#notif-dot');
  if (dot) dot.style.display = unread.length ? 'block' : 'none';

  // Deal badge
  const dealBadge = $('#deal-badge');
  if (dealBadge) {
    const active = store.getMyDeals().filter(d => ['proposed','negotiating','in_progress'].includes(d.status));
    dealBadge.textContent = active.length || '';
    dealBadge.style.display = active.length ? 'inline-flex' : 'none';
  }
}

function bindShellEvents() {
  // Notification panel
  $('#notif-btn')?.addEventListener('click', () => {
    const panel = $('#notif-panel');
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) renderNotifPanel();
  });
  $('#header-avatar')?.addEventListener('click', () => {
    navigate('profile', { userId: store.getMe()?.id });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-panel')) {
      $('#notif-panel')?.classList.remove('open');
    }
  });

  // Global search
  let searchTimeout;
  $('#global-search')?.addEventListener('input', e => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (e.target.value.length > 1) navigate('opportunities', { q: e.target.value });
    }, 350);
  });
  $('#global-search')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') navigate('opportunities', { q: e.target.value });
  });

  bindModalForms();
}

function renderNotifPanel() {
  const notifs = store.getMyNotifs();
  const panel = $('#notif-panel');
  panel.innerHTML = `
    <div class="notif-panel-head">
      <span class="notif-panel-title">Notifications</span>
      <button class="btn btn-ghost btn-xs" onclick="store.getMyNotifs().forEach(n=>store.markNotifRead(n.id));renderPage()">Mark all read</button>
    </div>
    ${notifs.length ? notifs.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" onclick="store.markNotifRead('${n.id}');renderPage()">
        <div class="notif-icon">${{deal_message:'',new_member:'',deal_completed:'',new_opportunity:''}[n.type]||''}</div>
        <div>
          <div class="notif-text">${n.text}</div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
      </div>`).join('') : '<div class="empty-state" style="padding:1.5rem"><div>No notifications yet</div></div>'}`;
}

/*  9. ICONS  */
function icon(name) {
  const icons = {
    home: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    wheel: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/></svg>`,
    opp: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`,
    deal: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    members: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    analytics: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    plus: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
    check: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
    clock: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    map: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    star: `<svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    users: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    msg: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    send: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  };
  return icons[name] || '';
}

/*  10. HOME PAGE  */
function renderHome() {
  const me = store.getMe();
  const myDeals = store.getMyDeals();
  const activeDeals = myDeals.filter(d => ['in_progress','accepted'].includes(d.status));
  const wheels = store.getMyWheels();
  const allPosts = wheels.flatMap(w => store.getPosts(w.id)).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const opps = store.getOpportunities().slice(0, 3);

  const totalRevenue = myDeals.filter(d => d.status === 'paid' && d.sellerId === me.id).reduce((s, d) => s + d.priceCents / 100, 0);
  const completedDeals = myDeals.filter(d => d.status === 'paid').length;

  $('#page-home').innerHTML = `
  <div class="page-head">
    <div class="page-head-left">
      <h1 class="page-title">Good morning, ${me.name.split(' ')[0]} </h1>
      <p class="page-sub">Here's what's happening in your network.</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-outline btn-sm" onclick="openModal('modal-create-wheel')">${icon('plus')} New Wheel</button>
      <button class="btn btn-teal btn-sm" onclick="openModal('modal-create-opp')">${icon('plus')} Post Opportunity</button>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-label">Wheels</span>
      <span class="stat-value">${wheels.length}</span>
      <span class="stat-change">Active communities</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Active Deals</span>
      <span class="stat-value">${activeDeals.length}</span>
      <span class="stat-change">In progress</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Trust Score</span>
      <span class="stat-value">${me.trustScore}</span>
      <span class="stat-change">/ 100</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Revenue</span>
      <span class="stat-value">${totalRevenue > 0 ? fmtMoney(totalRevenue) : fmtMoney(me.revenue)}</span>
      <span class="stat-change">${completedDeals || me.deals} deals closed</span>
    </div>
  </div>

  <div class="two-col">
    <div>
      <div class="flex justify-between items-center mb-3">
        <h2 class="t-h2">Network Feed</h2>
        <button class="btn btn-ghost btn-sm" onclick="navigate('wheels')">All Wheels </button>
      </div>
      <div id="home-feed">
        ${allPosts.length ? allPosts.map(p => renderFeedPost(p)).join('') : '<div class="empty-state"><div class="empty-icon"></div><div class="empty-title">Feed is quiet</div><div class="empty-desc">Join Wheels to see posts from your network</div></div>'}
      </div>
    </div>
    <div>
      <div class="flex justify-between items-center mb-3">
        <h2 class="t-h2">Active Deals</h2>
        <button class="btn btn-ghost btn-sm" onclick="navigate('deals')">All Deals </button>
      </div>
      ${activeDeals.length ? activeDeals.map(d => renderDealCardCompact(d)).join('') : `<div class="card"><div class="empty-state" style="padding:1.5rem"><div class="empty-icon"></div><div class="empty-title">No active deals</div><div class="empty-desc">Create a deal with another member to get started</div><button class="btn btn-primary btn-sm" onclick="openModal('modal-create-deal')">Create Deal</button></div></div>`}

      <div class="flex justify-between items-center mt-4 mb-3">
        <h2 class="t-h2">Fresh Opportunities</h2>
        <button class="btn btn-ghost btn-sm" onclick="navigate('opportunities')">All </button>
      </div>
      ${opps.map(o => renderOppCardCompact(o)).join('')}
    </div>
  </div>`;

  // Bind like buttons
  $$('.post-like-btn', $('#page-home')).forEach(btn => {
    btn.addEventListener('click', () => {
      store.likePost(btn.dataset.postId);
      renderHome();
    });
  });
}

function renderFeedPost(post) {
  const author = store.getUser(post.authorId);
  const wheel = store.get('wheels').find(w => w.id === post.wheelId);
  const typeLabels = { announcement: 'Announcement', referral: 'Referral', post: 'Post' };
  return `
  <div class="feed-post">
    <div class="post-header">
      ${avatarHtml(author, 'md')}
      <div class="post-author-info">
        <div class="post-author-name">${escHtml(author?.name || 'Unknown')}</div>
        <div class="post-meta">
          <span>${timeAgo(post.createdAt)}</span>
          ${wheel ? `<span>.</span><span style="color:var(--teal-dim)">${escHtml(wheel.name)}</span>` : ''}
        </div>
      </div>
      <span class="post-type-pill ${post.type === 'announcement' ? 'post-announce' : post.type === 'referral' ? 'post-referral' : ''} type-badge">${typeLabels[post.type] || post.type}</span>
    </div>
    <div class="post-body">${escHtml(post.body)}</div>
    <div class="post-actions">
      <button class="post-action-btn post-like-btn" data-post-id="${post.id}">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        ${post.likes}
      </button>
      <button class="post-action-btn">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Reply
      </button>
    </div>
  </div>`;
}

function renderDealCardCompact(d) {
  const STAGES = ['proposed','negotiating','accepted','in_progress','completed','paid'];
  const si = STAGES.indexOf(d.status);
  const other = store.getUser(d.buyerId === store.getMe()?.id ? d.sellerId : d.buyerId);
  return `
  <div class="deal-card" onclick="navigate('deal-detail',{dealId:'${d.id}'})">
    <div class="deal-card-top">
      <div>
        <div class="deal-title">${escHtml(d.title)}</div>
        <div class="deal-parties">${avatarHtml(other, 'sm')} ${escHtml(other?.name||'?')}</div>
      </div>
      <div>
        <div class="deal-amount">${fmtMoney(d.priceCents/100, d.currency)}</div>
        ${dealStatusBadge(d.status)}
      </div>
    </div>
    <div class="deal-progress">
      <div class="deal-stages">${STAGES.map((s,i) => `<div class="deal-stage-dot ${i < si ? 'done' : i === si ? 'current' : ''}"></div>`).join('')}</div>
    </div>
    <div class="deal-card-footer">
      <span class="deal-due">${icon('clock')} Due ${d.endDate || 'TBD'}</span>
      <span class="t-micro c-text3">${timeAgo(d.createdAt)}</span>
    </div>
  </div>`;
}

function renderOppCardCompact(o) {
  const creator = store.getUser(o.creatorId);
  const typeColors = { job:'--blue', partnership:'--purple', collaboration:'', investment:'--green', referral:'--teal', service_request:'--amber', service:'--amber' };
  return `
  <div class="card card-sm mb-2" style="cursor:pointer" onclick="openModal('modal-opp-detail');renderOppDetail('${o.id}')">
    <div class="flex gap-3 items-start">
      <div style="width:8px;height:8px;border-radius:50%;background:var(${typeColors[o.type]||'--text-3'});margin-top:6px;flex-shrink:0"></div>
      <div class="flex-1">
        <div class="t-h3 mb-1">${escHtml(o.title)}</div>
        <div class="flex gap-2 items-center">
          <span class="type-badge type-${o.type}">${o.type.replace('_',' ')}</span>
          <span class="t-micro c-text4">${timeAgo(o.createdAt)}</span>
        </div>
      </div>
      <button class="btn btn-teal btn-xs">Apply</button>
    </div>
  </div>`;
}

function dealStatusBadge(status) {
  return `<span class="status-badge status-${status}"><span class="status-dot"></span>${status.replace('_',' ')}</span>`;
}

/*  11. WHEELS PAGE  */
function renderWheels() {
  const myWheels = store.getMyWheels();
  const allWheels = store.get('wheels');
  const discoverWheels = allWheels.filter(w => !store.isMember(w.id));

  $('#page-wheels').innerHTML = `
  <div class="page-head">
    <div class="page-head-left">
      <h1 class="page-title">My Wheels</h1>
      <p class="page-sub">Your private network communities</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-primary" onclick="openModal('modal-create-wheel')">${icon('plus')} Create Wheel</button>
    </div>
  </div>

  ${myWheels.length ? `<div class="wheel-grid">${myWheels.map(w => renderWheelCard(w)).join('')}</div>` : ''}

  ${discoverWheels.length ? `
    <h2 class="t-h2 mb-3 mt-2">Discover Wheels</h2>
    <div class="wheel-grid">${discoverWheels.map(w => renderWheelCard(w, true)).join('')}</div>
  ` : ''}

  ${myWheels.length === 0 && discoverWheels.length === 0 ? `<div class="empty-state"><div class="empty-icon"></div><div class="empty-title">No Wheels yet</div><div class="empty-desc">Create your first Wheel to start building your network commerce community</div><button class="btn btn-primary" onclick="openModal('modal-create-wheel')">Create Your First Wheel</button></div>` : ''}`;

  $$('.wheel-card', $('#page-wheels')).forEach(card => {
    card.addEventListener('click', () => navigate('wheel-detail', { wheelId: card.dataset.wheelId }));
  });
  $$('.join-wheel-btn', $('#page-wheels')).forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const w = store.get('wheels').find(x => x.id === btn.dataset.wheelId);
      if (w.monthlyPrice > 0) { toast(`This is a paid Wheel ($${w.monthlyPrice}/mo). In the MVP, join is free.`, 'default'); }
      store.joinWheel(btn.dataset.wheelId);
      toast(`Joined ${w.name}!`, 'success');
      updateShellDynamic(store.getMe());
      renderWheels();
    });
  });
}

function renderWheelCard(w, discover = false) {
  const creator = store.getUser(w.creatorId);
  const isMember = store.isMember(w.id);
  return `
  <div class="wheel-card" data-wheel-id="${w.id}">
    <div class="wheel-card-cover" style="background:${w.coverGradient||'var(--navy)'}"></div>
    <div class="wheel-card-body">
      ${hexBadge(w, 48)}
      <div class="wheel-card-name">${escHtml(w.name)}</div>
      <div class="wheel-card-desc">${escHtml(w.description)}</div>
      <div class="wheel-card-meta">
        <span class="wheel-meta-item">${icon('users')} ${fmt(w.memberCount)}</span>
        <span class="wheel-meta-item">${icon('map')} ${w.category}</span>
      </div>
    </div>
    <div class="wheel-card-footer">
      <span class="tier-badge ${w.monthlyPrice > 0 ? 'tier-paid' : 'tier-free'}">${w.monthlyPrice > 0 ? `$${w.monthlyPrice}/mo` : 'Free'}</span>
      ${discover && !isMember
        ? `<button class="btn btn-teal btn-sm join-wheel-btn" data-wheel-id="${w.id}">Join</button>`
        : isMember ? `<span class="t-micro c-text3">by ${escHtml(creator?.name||'')}</span>`
        : ''}
    </div>
  </div>`;
}

/*  12. WHEEL DETAIL  */
function renderWheelDetail() {
  const wheel = store.get('wheels').find(w => w.id === pageParams.wheelId);
  if (!wheel) { navigate('wheels'); return; }

  const members = store.getWheelMembers(wheel.id);
  const posts = store.getPosts(wheel.id);
  const opps = store.getOpportunities({ wheelId: wheel.id });
  const creator = store.getUser(wheel.creatorId);
  const me = store.getMe();
  const isCreator = wheel.creatorId === me?.id;

  $('#page-wheel-detail').innerHTML = `
  <div class="page-head">
    <div class="flex gap-3 items-center">
      ${hexBadge(wheel, 44)}
      <div>
        <h1 class="page-title" style="margin-bottom:0">${escHtml(wheel.name)}</h1>
        <p class="page-sub">${escHtml(wheel.description)}</p>
      </div>
    </div>
    <div class="page-actions">
      ${isCreator ? `<button class="btn btn-outline btn-sm">Settings</button>` : ''}
      <button class="btn btn-teal btn-sm" onclick="openModal('modal-create-post')">+ Post</button>
    </div>
  </div>

  <div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="stat-card"><span class="stat-label">Members</span><span class="stat-value">${fmt(wheel.memberCount)}</span></div>
    <div class="stat-card"><span class="stat-label">Opportunities</span><span class="stat-value">${opps.length}</span></div>
    <div class="stat-card"><span class="stat-label">Membership</span><span class="stat-value">${wheel.monthlyPrice > 0 ? `$${wheel.monthlyPrice}` : 'Free'}</span></div>
    <div class="stat-card"><span class="stat-label">Commission</span><span class="stat-value">${wheel.dealCommission}%</span></div>
  </div>

  <div class="tabs" id="wheel-tabs">
    <div class="tab-item active" data-tab="feed">Feed</div>
    <div class="tab-item" data-tab="members">Members (${members.length})</div>
    <div class="tab-item" data-tab="opportunities">Opportunities (${opps.length})</div>
  </div>

  <div class="tab-panel active" id="tab-feed">
    ${posts.length ? posts.map(p => renderFeedPost(p)).join('') : '<div class="empty-state"><div class="empty-icon"></div><div class="empty-title">No posts yet</div><div class="empty-desc">Be the first to post in this Wheel</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-post\')">Post Something</button></div>'}
  </div>
  <div class="tab-panel" id="tab-members">
    <div class="member-grid">${members.map(u => renderMemberCard(u)).join('')}</div>
  </div>
  <div class="tab-panel" id="tab-opportunities">
    <div class="flex justify-between items-center mb-3">
      <span class="t-body c-text3">${opps.length} open opportunities</span>
      <button class="btn btn-teal btn-sm" onclick="openModal('modal-create-opp')">${icon('plus')} Post Opportunity</button>
    </div>
    <div class="opp-list">${opps.length ? opps.map(o => renderOppCard(o)).join('') : '<div class="empty-state"><div class="empty-icon"></div><div class="empty-title">No opportunities yet</div><div class="empty-desc">Post the first opportunity in this Wheel</div></div>'}</div>
  </div>`;

  // Tabs
  $$('.tab-item', $('#page-wheel-detail')).forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab-item', $('#page-wheel-detail')).forEach(t => t.classList.remove('active'));
      $$('.tab-panel', $('#page-wheel-detail')).forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      $(`#tab-${tab.dataset.tab}`)?.classList.add('active');
    });
  });

  // Like buttons
  $$('.post-like-btn', $('#page-wheel-detail')).forEach(btn => {
    btn.addEventListener('click', () => { store.likePost(btn.dataset.postId); renderWheelDetail(); });
  });

  // Member cards
  $$('.member-card', $('#page-wheel-detail')).forEach(card => {
    card.addEventListener('click', () => navigate('profile', { userId: card.dataset.userId }));
  });

  // Opp cards
  $$('.opp-card', $('#page-wheel-detail')).forEach(card => {
    card.addEventListener('click', () => { openModal('modal-opp-detail'); renderOppDetail(card.dataset.oppId); });
  });
}

/*  13. MEMBERS PAGE  */
function renderMembers() {
  const me = store.getMe();
  const myWheels = store.getMyWheels();
  // All members across my wheels
  const seen = new Set();
  let allMembers = myWheels.flatMap(w => store.getWheelMembers(w.id)).filter(u => { if (seen.has(u.id)) return false; seen.add(u.id); return true; });

  const q = (pageParams.q || '').toLowerCase();
  const filterAvail = pageParams.avail || 'all';
  const filterSkill = pageParams.skill || '';

  if (q) allMembers = allMembers.filter(u => u.name.toLowerCase().includes(q) || (u.bio||'').toLowerCase().includes(q) || (u.skills||[]).some(s => s.toLowerCase().includes(q)));
  if (filterAvail !== 'all') allMembers = allMembers.filter(u => u.availability === filterAvail);
  if (filterSkill) allMembers = allMembers.filter(u => (u.skills||[]).some(s => s.toLowerCase().includes(filterSkill.toLowerCase())));

  $('#page-members').innerHTML = `
  <div class="page-head">
    <div class="page-head-left">
      <h1 class="page-title">Members</h1>
      <p class="page-sub">${allMembers.length} people across your Wheels</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-teal btn-sm" onclick="openModal('modal-create-deal')">${icon('plus')} Create Deal</button>
    </div>
  </div>
  <div class="filter-bar">
    <div class="filter-input-wrap">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input class="search-input-sm" id="member-search" placeholder="Search members..." value="${escHtml(q)}">
    </div>
    <div class="filter-sep"></div>
    <button class="filter-pill ${filterAvail==='all'?'active':''}" onclick="navigate('members',{avail:'all',q:'${escHtml(q)}'})">All</button>
    <button class="filter-pill ${filterAvail==='available'?'active':''}" onclick="navigate('members',{avail:'available',q:'${escHtml(q)}'})">* Available</button>
    <button class="filter-pill ${filterAvail==='limited'?'active':''}" onclick="navigate('members',{avail:'limited',q:'${escHtml(q)}'})"> Limited</button>
    <button class="filter-pill ${filterAvail==='unavailable'?'active':''}" onclick="navigate('members',{avail:'unavailable',q:'${escHtml(q)}'})"> Unavailable</button>
  </div>
  <div class="member-grid">${allMembers.length ? allMembers.map(u => renderMemberCard(u)).join('') : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon"></div><div class="empty-title">No members match your filters</div></div>'}</div>`;

  let searchTimeout;
  $('#member-search')?.addEventListener('input', e => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => navigate('members', { q: e.target.value, avail: filterAvail }), 300);
  });

  $$('.member-card', $('#page-members')).forEach(card => {
    card.addEventListener('click', () => navigate('profile', { userId: card.dataset.userId }));
  });
}

function renderMemberCard(u) {
  const availDotClass = { available: 'avail-available', limited: 'avail-limited', unavailable: 'avail-unavailable' }[u.availability] || 'avail-unavailable';
  const trustPct = Math.round(u.trustScore || 0);
  return `
  <div class="member-card" data-user-id="${u.id}">
    <div class="member-card-top">
      <div class="member-avatar-wrap">
        ${avatarHtml(u, 'lg')}
        <span class="member-avail-dot ${availDotClass}"></span>
      </div>
      <div class="flex-1">
        <div class="member-name">${escHtml(u.name)}</div>
        <div class="member-title">${escHtml((u.skills||[])[0] || u.role)}</div>
        <div class="member-trust">
          <div class="trust-bar-wrap"><div class="trust-bar-fill" style="width:${trustPct}%"></div></div>
          <span class="trust-score-num">${trustPct}</span>
        </div>
      </div>
    </div>
    ${u.skills?.length ? `<div class="skill-tags">${u.skills.slice(0,4).map((s,i) => `<span class="skill-tag${i===0?' primary':''}">${escHtml(s)}</span>`).join('')}</div>` : ''}
    <div class="member-card-footer">
      <span class="avail-badge ${u.availability||'unavailable'}">${{available:'* Available',limited:' Limited',unavailable:' Unavailable'}[u.availability||'unavailable']}</span>
      <div class="flex gap-1">
        <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();openModal('modal-create-deal')">${icon('deal')} Deal</button>
        <button class="btn btn-outline btn-xs" onclick="event.stopPropagation()">${icon('msg')} Message</button>
      </div>
    </div>
  </div>`;
}

/*  14. OPPORTUNITIES PAGE  */
function renderOpportunities() {
  const filter = pageParams.type || 'all';
  const q = pageParams.q || '';
  const opps = store.getOpportunities({ type: filter, q });
  const types = ['all','job','partnership','collaboration','investment','referral','service'];
  const counts = {};
  types.forEach(t => counts[t] = t === 'all' ? store.getOpportunities().length : store.getOpportunities({ type: t }).length);

  $('#page-opportunities').innerHTML = `
  <div class="page-head">
    <div class="page-head-left">
      <h1 class="page-title">Opportunities</h1>
      <p class="page-sub">${opps.length} open across your Wheels</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-teal" onclick="openModal('modal-create-opp')">${icon('plus')} Post Opportunity</button>
    </div>
  </div>
  <div class="filter-bar">
    ${types.map(t => `<button class="filter-pill ${filter===t?'active':''}" onclick="navigate('opportunities',{type:'${t}',q:'${escHtml(q)}'})">
      ${t==='all'?'All':''}${t!=='all'?`<span class="type-badge type-${t==='service'?'service':t}" style="padding:.1rem .4rem">${t.replace('_',' ')}</span>`:''}
      ${counts[t] > 0 ? `<span style="margin-left:.2rem;opacity:.7">${counts[t]}</span>` : ''}
    </button>`).join('')}
    <div class="filter-sep"></div>
    <div class="filter-input-wrap">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input class="search-input-sm" id="opp-search" placeholder="Search..." value="${escHtml(q)}">
    </div>
  </div>
  <div class="opp-list">${opps.length ? opps.map(o => renderOppCard(o)).join('') : '<div class="empty-state"><div class="empty-icon"></div><div class="empty-title">No opportunities found</div><div class="empty-desc">Be the first to post one</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-opp\')">Post Opportunity</button></div>'}  </div>`;

  let st;
  $('#opp-search')?.addEventListener('input', e => { clearTimeout(st); st = setTimeout(() => navigate('opportunities', { type: filter, q: e.target.value }), 300); });

  $$('.opp-card', $('#page-opportunities')).forEach(card => {
    card.addEventListener('click', () => { openModal('modal-opp-detail'); renderOppDetail(card.dataset.oppId); });
  });
}

function renderOppCard(o) {
  const creator = store.getUser(o.creatorId);
  const META = {
    job: `${fmtMoney(o.metadata?.salaryMin||0)} - ${fmtMoney(o.metadata?.salaryMax||0)} . ${o.metadata?.type||''}`,
    partnership: `Equity: ${o.metadata?.equity||'TBD'}`,
    collaboration: `Commitment: ${o.metadata?.commitment||'TBD'}`,
    investment: `Ticket: ${o.metadata?.ticketSize||'TBD'}`,
    referral: `Bonus: ${o.metadata?.bonus ? fmtMoney(o.metadata.bonus) : 'TBD'}`,
    service: `Budget: ${o.metadata?.budgetMin ? `${fmtMoney(o.metadata.budgetMin)} - ${fmtMoney(o.metadata.budgetMax)}` : 'TBD'}`,
    service_request: `Budget: ${o.metadata?.budgetMin ? `${fmtMoney(o.metadata.budgetMin)} - ${fmtMoney(o.metadata.budgetMax)}` : 'TBD'}`,
  };
  return `
  <div class="opp-card" data-opp-id="${o.id}">
    <div style="width:10px;height:10px;border-radius:50%;margin-top:5px;flex-shrink:0" class="type-dot-${o.type}"></div>
    <div class="opp-main">
      <div class="opp-title">${escHtml(o.title)}</div>
      <div class="opp-meta">
        <span class="type-badge type-${o.type}">${o.type.replace('_',' ')}</span>
        ${avatarHtml(creator, 'sm')}
        <span class="opp-meta-item">${escHtml(creator?.name||'')}</span>
        ${o.remoteOk ? `<span class="opp-meta-item">${icon('map')} Remote OK</span>` : ''}
        <span class="opp-meta-item">${icon('users')} ${o.applicationCount} applied</span>
      </div>
      <div class="opp-desc">${escHtml(o.description)}</div>
      <div class="skill-tags mt-2">${(o.skills||[]).map(s => `<span class="skill-tag">${escHtml(s)}</span>`).join('')}</div>
    </div>
    <div class="opp-right">
      <div class="opp-value">${META[o.type] || ''}</div>
      <div class="opp-posted">${timeAgo(o.createdAt)}</div>
      <button class="btn btn-teal btn-sm mt-2" onclick="event.stopPropagation();toast('Application submitted!','success');this.textContent='Applied v';this.disabled=true">Apply</button>
    </div>
  </div>`;
}

function renderOppDetail(oppId) {
  const o = store.get('opportunities').find(x => x.id === oppId);
  if (!o) return;
  const creator = store.getUser(o.creatorId);
  $('#modal-opp-detail .modal-title').textContent = o.title;
  $('#modal-opp-body').innerHTML = `
    <div class="flex gap-3 items-start mb-4">
      ${avatarHtml(creator, 'md')}
      <div>
        <div class="t-h3">${escHtml(creator?.name||'')}</div>
        <div class="t-small c-text3">${timeAgo(o.createdAt)} . ${o.viewCount} views . ${o.applicationCount} applied</div>
      </div>
      <span class="type-badge type-${o.type}" style="margin-left:auto">${o.type.replace('_',' ')}</span>
    </div>
    <p class="t-body mb-4" style="line-height:1.7">${escHtml(o.description)}</p>
    <div class="skill-tags mb-4">${(o.skills||[]).map(s => `<span class="skill-tag primary">${escHtml(s)}</span>`).join('')}</div>
    <div class="card card-sm" style="background:var(--surface)">
      <div class="form-row">
        <div><div class="t-label c-text4 mb-1">Location</div><div class="t-body">${escHtml(o.location)} ${o.remoteOk?'(Remote OK)':''}</div></div>
        <div><div class="t-label c-text4 mb-1">Expires</div><div class="t-body">${o.expiresAt ? new Date(o.expiresAt).toLocaleDateString() : 'Open'}</div></div>
      </div>
    </div>`;
}

/*  15. DEALS PAGE  */
function renderDeals() {
  const deals = store.getMyDeals();
  const me = store.getMe();
  const filter = pageParams.status || 'all';
  const filtered = filter === 'all' ? deals : deals.filter(d => d.status === filter);
  const STATUSES = ['all','proposed','negotiating','in_progress','completed','paid','disputed'];

  $('#page-deals').innerHTML = `
  <div class="page-head">
    <div class="page-head-left">
      <h1 class="page-title">Deals</h1>
      <p class="page-sub">${deals.length} total deals</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-teal" onclick="openModal('modal-create-deal')">${icon('plus')} Create Deal</button>
    </div>
  </div>
  <div class="filter-bar">
    ${STATUSES.map(s => {
      const cnt = s === 'all' ? deals.length : deals.filter(d => d.status === s).length;
      if (cnt === 0 && s !== 'all') return '';
      return `<button class="filter-pill ${filter===s?'active':''}" onclick="navigate('deals',{status:'${s}'})">${s} ${cnt > 0 ? `(${cnt})` : ''}</button>`;
    }).join('')}
  </div>
  <div class="deal-list">
    ${filtered.length ? filtered.map(d => {
      const other = store.getUser(d.buyerId === me.id ? d.sellerId : d.buyerId);
      const STAGES = ['proposed','negotiating','accepted','in_progress','completed','paid'];
      const si = STAGES.indexOf(d.status);
      return `
      <div class="deal-card" onclick="navigate('deal-detail',{dealId:'${d.id}'})">
        <div class="deal-card-top">
          <div>
            <div class="deal-title">${escHtml(d.title)}</div>
            <div class="deal-parties">${avatarHtml(other,'sm')} with ${escHtml(other?.name||'?')} . ${d.buyerId===me.id?'You are Buyer':'You are Seller'}</div>
          </div>
          <div style="text-align:right">
            <div class="deal-amount">${fmtMoney(d.priceCents/100,d.currency)}</div>
            ${dealStatusBadge(d.status)}
          </div>
        </div>
        <div class="deal-progress">
          <div class="deal-stages">${STAGES.map((s,i) => `<div class="deal-stage-dot ${i<si?'done':i===si?'current':''}"></div>`).join('')}</div>
          <div class="deal-stage-labels">
            ${STAGES.map((s,i) => `<span class="deal-stage-label ${i===si?'active':''}">${s.replace('_',' ')}</span>`).join('')}
          </div>
        </div>
        <div class="deal-card-footer">
          <span class="deal-due">${icon('clock')} ${d.endDate||'TBD'}</span>
          <span class="t-micro c-text3">${d.messages?.length||0} messages</span>
        </div>
      </div>`;
    }).join('') : '<div class="empty-state"><div class="empty-icon"></div><div class="empty-title">No deals yet</div><div class="empty-desc">Create your first deal with another member</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-deal\')">Create Deal</button></div>'}
  </div>`;
}

/*  16. DEAL DETAIL PAGE  */
function renderDealDetail() {
  const deal = store.getDeal(pageParams.dealId);
  if (!deal) { navigate('deals'); return; }
  const me = store.getMe();
  const buyer = store.getUser(deal.buyerId);
  const seller = store.getUser(deal.sellerId);
  const isBuyer = deal.buyerId === me.id;
  const STAGES = ['proposed','negotiating','accepted','in_progress','completed','paid'];
  const si = STAGES.indexOf(deal.status);
  const feeTotal = (deal.platformFeePct + deal.creatorCommissionPct) / 100 * deal.priceCents / 100;
  const sellerReceives = deal.priceCents / 100 - feeTotal;

  const nextActions = {
    proposed: isBuyer ? [] : [{ label: 'Accept Deal', action: `updateDealStatus('${deal.id}','accepted')`, cls: 'btn-teal' }, { label: 'Counter', action: `updateDealStatus('${deal.id}','negotiating')`, cls: 'btn-outline' }],
    negotiating: [{ label: 'Accept Terms', action: `updateDealStatus('${deal.id}','accepted')`, cls: 'btn-teal' }],
    accepted: isBuyer ? [{ label: 'Start Work / Pay', action: `updateDealStatus('${deal.id}','in_progress')`, cls: 'btn-teal' }] : [],
    in_progress: !isBuyer ? [{ label: 'Mark Complete', action: `updateDealStatus('${deal.id}','completed')`, cls: 'btn-primary' }] : [{ label: 'Approve & Release Payment', action: `updateDealStatus('${deal.id}','paid')`, cls: 'btn-teal' }, { label: 'Raise Dispute', action: `updateDealStatus('${deal.id}','disputed')`, cls: 'btn-danger' }],
    completed: isBuyer ? [{ label: 'Approve & Release Payment', action: `updateDealStatus('${deal.id}','paid')`, cls: 'btn-teal' }] : [],
    paid: [],
    disputed: [],
  };

  $('#page-deal-detail').innerHTML = `
  <div class="mb-3">
    <button class="btn btn-ghost btn-sm" onclick="navigate('deals')"> Back to Deals</button>
  </div>
  <div class="deal-detail-header">
    <div class="flex justify-between items-start mb-3">
      <div>
        <div class="deal-detail-title">${escHtml(deal.title)}</div>
        <div class="deal-detail-meta">
          ${dealStatusBadge(deal.status)}
          <span class="t-small c-text3">Created ${timeAgo(deal.createdAt)}</span>
        </div>
      </div>
      <div style="text-align:right">
        <div class="deal-detail-amount">${fmtMoney(deal.priceCents/100,deal.currency)}</div>
        <div class="deal-detail-amount-label">${deal.paymentType?.replace('_',' ')||'lump sum'}</div>
      </div>
    </div>
    <div class="deal-stages mb-2">${STAGES.map((s,i) => `<div class="deal-stage-dot ${i<si?'done':i===si?'current':''}" title="${s}"></div>`).join('')}</div>
    <div class="deal-stage-labels mb-4">${STAGES.map((s,i) => `<span class="deal-stage-label ${i===si?'active':''}">${s.replace('_',' ')}</span>`).join('')}</div>
    <div class="two-col-equal">
      <div class="card card-sm" style="background:var(--surface)">
        <div class="t-label c-text4 mb-2">Buyer</div>
        <div class="flex gap-2 items-center">${avatarHtml(buyer,'md')}<div><div class="t-h3">${escHtml(buyer?.name||'?')}</div><div class="t-small c-text3">${buyer?.role||''}</div></div></div>
      </div>
      <div class="card card-sm" style="background:var(--surface)">
        <div class="t-label c-text4 mb-2">Seller</div>
        <div class="flex gap-2 items-center">${avatarHtml(seller,'md')}<div><div class="t-h3">${escHtml(seller?.name||'?')}</div><div class="t-small c-text3">${seller?.role||''}</div></div></div>
      </div>
    </div>
    ${nextActions[deal.status]?.length ? `
      <div class="flex gap-2 mt-4">
        ${nextActions[deal.status].map(a => `<button class="btn ${a.cls}" onclick="${a.action}">${a.label}</button>`).join('')}
      </div>` : ''}
  </div>

  <div class="two-col">
    <div>
      <div class="card mb-3">
        <h3 class="t-h2 mb-2">Scope</h3>
        <p class="t-body" style="line-height:1.7;color:var(--text-2)">${escHtml(deal.scope)}</p>
        <div class="divider"></div>
        <div class="form-row">
          <div><div class="t-label c-text4 mb-1">Start Date</div><div class="t-body">${deal.startDate||'TBD'}</div></div>
          <div><div class="t-label c-text4 mb-1">End Date</div><div class="t-body">${deal.endDate||'TBD'}</div></div>
        </div>
      </div>
      <div class="card mb-3">
        <h3 class="t-h2 mb-3">Deliverables</h3>
        ${deal.deliverables?.length ? deal.deliverables.map(del => `
          <div class="deliverable-item ${del.done?'done':''}" data-del-id="${del.id}">
            <div class="deliverable-check ${del.done?'checked':''}">
              ${del.done ? icon('check') : ''}
            </div>
            <div>
              <div class="deliverable-title" style="${del.done?'text-decoration:line-through;opacity:.6':''}">${escHtml(del.title)}</div>
            </div>
          </div>`).join('') : '<div class="t-body c-text3">No deliverables defined</div>'}
      </div>
      <div class="card card-sm" style="background:var(--surface)">
        <div class="t-label c-text4 mb-2">Fee Breakdown</div>
        <div class="flex justify-between mb-1"><span class="t-small c-text3">Deal value</span><span class="t-small">${fmtMoney(deal.priceCents/100)}</span></div>
        <div class="flex justify-between mb-1"><span class="t-small c-text3">Platform fee (${deal.platformFeePct}%)</span><span class="t-small c-red">-${fmtMoney(deal.priceCents/100*deal.platformFeePct/100)}</span></div>
        <div class="flex justify-between mb-2"><span class="t-small c-text3">Creator commission (${deal.creatorCommissionPct}%)</span><span class="t-small c-red">-${fmtMoney(deal.priceCents/100*deal.creatorCommissionPct/100)}</span></div>
        <div class="divider" style="margin:.5rem 0"></div>
        <div class="flex justify-between"><span class="t-body" style="font-weight:700">Seller receives</span><span class="t-body c-green" style="font-weight:700">${fmtMoney(sellerReceives)}</span></div>
      </div>
    </div>
    <div>
      <div class="card card-flush">
        <div class="notif-panel-head" style="padding:.875rem 1rem"><h3 class="t-h2">Messages</h3></div>
        <div class="message-thread" id="deal-messages">
          ${deal.messages?.map(msg => {
            const isMe = msg.senderId === me.id;
            const sender = store.getUser(msg.senderId);
            return `<div class="message-item ${isMe?'mine':''}">
              ${!isMe ? avatarHtml(sender,'sm') : ''}
              <div>
                <div class="message-bubble">${escHtml(msg.body)}</div>
                <div class="message-time">${timeAgo(msg.createdAt)}</div>
              </div>
            </div>`;
          }).join('') || '<div class="empty-state" style="padding:1.5rem"><div>No messages yet</div></div>'}
        </div>
        <div class="message-input-row">
          <input class="message-input" id="deal-msg-input" placeholder="Write a message...">
          <button class="btn btn-teal btn-sm" id="deal-msg-send">${icon('send')}</button>
        </div>
      </div>
    </div>
  </div>`;

  // Message send
  const sendMsg = () => {
    const input = $('#deal-msg-input');
    const body = input.value.trim();
    if (!body) return;
    store.addDealMessage(deal.id, body);
    input.value = '';
    renderDealDetail();
    // Scroll to bottom
    const thread = $('#deal-messages');
    if (thread) thread.scrollTop = thread.scrollHeight;
  };
  $('#deal-msg-send')?.addEventListener('click', sendMsg);
  $('#deal-msg-input')?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } });

  // Scroll messages to bottom
  const thread = $('#deal-messages');
  if (thread) thread.scrollTop = thread.scrollHeight;
}

window.updateDealStatus = (dealId, newStatus) => {
  store.updateDeal(dealId, { status: newStatus });
  toast(`Deal moved to ${newStatus.replace('_',' ')}`, 'success');
  updateShellDynamic(store.getMe());
  renderDealDetail();
};

/*  17. PROFILE PAGE  */
function renderProfile() {
  const userId = pageParams.userId || store.getMe()?.id;
  const u = store.getUser(userId);
  if (!u) { navigate('home'); return; }
  const me = store.getMe();
  const isMe = u.id === me?.id;
  const trustPct = `${u.trustScore}%`;
  const myDeals = store.get('deals').filter(d => d.sellerId === u.id || d.buyerId === u.id);
  const completedDeals = myDeals.filter(d => d.status === 'paid');

  $('#page-profile').innerHTML = `
  <div class="mb-3">
    <button class="btn btn-ghost btn-sm" onclick="history.back ? history.back() : navigate('members')"> Back</button>
  </div>
  <div class="profile-header">
    <div class="flex justify-between items-start">
      <div>
        <div class="profile-avatar-lg">${initials(u.name)}</div>
        <h1 class="profile-name">${escHtml(u.name)}</h1>
        <p class="profile-title-text">${escHtml((u.skills||[])[0] || u.role)}</p>
        <div class="profile-header-meta">
          ${u.location ? `<span class="profile-meta-item">${icon('map')} ${escHtml(u.location)}</span>` : ''}
          <span class="avail-badge ${u.availability}" style="font-size:.75rem">${{available:'* Available',limited:' Limited Availability',unavailable:' Unavailable'}[u.availability||'unavailable']}</span>
        </div>
      </div>
      <div style="text-align:center">
        <div class="trust-score-circle" style="--pct:${trustPct}">
          <div class="trust-score-inner">
            <div class="trust-score-num-lg">${u.trustScore}</div>
            <div class="trust-score-label">Trust</div>
          </div>
        </div>
        <div class="t-micro c-text4 mt-2" style="color:rgba(255,255,255,.5)">Trust Score</div>
      </div>
    </div>
    <div class="skill-tags mt-4">${(u.skills||[]).map(s => `<span class="skill-tag" style="background:rgba(255,255,255,.1);color:rgba(255,255,255,.8);border-color:rgba(255,255,255,.15)">${escHtml(s)}</span>`).join('')}</div>
  </div>

  ${isMe ? '' : `<div class="flex gap-2 mb-4">
    <button class="btn btn-primary" onclick="openModal('modal-create-deal')">Create Deal</button>
    <button class="btn btn-outline" onclick="toast('Message thread coming in V2','default')">Send Message</button>
    <button class="btn btn-ghost" onclick="toast('Referral sent!','success')">Send Referral</button>
  </div>`}

  <div class="two-col">
    <div>
      <div class="card mb-4">
        <h2 class="t-h2 mb-3">About</h2>
        ${isMe ? `<textarea class="form-control mb-2" id="profile-bio" rows="3">${escHtml(u.bio||'')}</textarea><button class="btn btn-outline btn-sm" onclick="saveProfileBio()">Save</button>` : `<p class="t-body" style="color:var(--text-2);line-height:1.7">${escHtml(u.bio || 'No bio yet.')}</p>`}
      </div>
      <div class="card mb-4">
        <h2 class="t-h2 mb-3">Reputation</h2>
        <div class="reputation-grid">
          <div class="rep-item">
            <div class="rep-value">${u.deals || completedDeals.length}</div>
            <div class="rep-label">Deals Done</div>
          </div>
          <div class="rep-item">
            <div class="rep-value">${fmtMoney(u.revenue||0)}</div>
            <div class="rep-label">Revenue</div>
          </div>
          <div class="rep-item">
            <div class="rep-value">${u.referralsSent||0}</div>
            <div class="rep-label">Referrals Sent</div>
          </div>
          <div class="rep-item">
            <div class="rep-value">${u.referralsConverted||0}</div>
            <div class="rep-label">Converted</div>
          </div>
          <div class="rep-item">
            <div class="rep-value">${u.reviewAvg ? `${u.reviewAvg}*` : '-'}</div>
            <div class="rep-label">Avg Review</div>
          </div>
          <div class="rep-item">
            <div class="rep-value">${u.trustScore}</div>
            <div class="rep-label">Trust Score</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="card mb-4">
        <h2 class="t-h2 mb-3">Skills</h2>
        <div class="skill-tags">${(u.skills||[]).map(s => `<span class="skill-tag primary">${escHtml(s)}</span>`).join('')}</div>
        ${isMe ? `<input class="form-control mt-3" id="profile-skills" placeholder="Add skills, comma-separated" value="${escHtml((u.skills||[]).join(', '))}"><button class="btn btn-outline btn-sm mt-2" onclick="saveProfileSkills()">Update Skills</button>` : ''}
      </div>
      <div class="card">
        <h2 class="t-h2 mb-3">Recent Deals</h2>
        ${myDeals.slice(0,3).length ? myDeals.slice(0,3).map(d => {
          const other = store.getUser(d.buyerId === u.id ? d.sellerId : d.buyerId);
          return `<div class="flex justify-between items-center mb-3">
            <div class="flex gap-2 items-center">${avatarHtml(other,'sm')}<div><div class="t-small" style="font-weight:600">${escHtml(d.title)}</div><div class="t-micro c-text4">${timeAgo(d.createdAt)}</div></div></div>
            <div class="flex gap-2 items-center">${dealStatusBadge(d.status)}</div>
          </div>`;
        }).join('') : '<div class="t-body c-text3">No deals yet</div>'}
      </div>
    </div>
  </div>`;
}

window.saveProfileBio = () => {
  store.updateMe({ bio: $('#profile-bio').value.trim() });
  toast('Bio updated', 'success');
};
window.saveProfileSkills = () => {
  const skills = $('#profile-skills').value.split(',').map(s => s.trim()).filter(Boolean);
  store.updateMe({ skills });
  toast('Skills updated', 'success');
  renderProfile();
};

/*  18. ANALYTICS PAGE  */
function renderAnalytics() {
  const me = store.getMe();
  const myWheels = store.getMyWheels().filter(w => w.creatorId === me.id);
  const allDeals = store.get('deals').filter(d => myWheels.some(w => w.id === d.wheelId));
  const paid = allDeals.filter(d => d.status === 'paid');
  const gmv = paid.reduce((s,d) => s + d.priceCents/100, 0);
  const fees = paid.reduce((s,d) => s + d.priceCents/100 * (d.creatorCommissionPct/100), 0);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  const mockRevenue = [1200,2100,1800,3400,2800,4200,5100];
  const maxRev = Math.max(...mockRevenue);

  $('#page-analytics').innerHTML = `
  <div class="page-head">
    <div class="page-head-left"><h1 class="page-title">Analytics</h1><p class="page-sub">Creator dashboard across your Wheels</p></div>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><span class="stat-label">Total Members</span><span class="stat-value">${fmt(myWheels.reduce((s,w)=>s+w.memberCount,0))}</span><span class="stat-change">across ${myWheels.length} Wheels</span></div>
    <div class="stat-card"><span class="stat-label">GMV</span><span class="stat-value">${fmtMoney(gmv)}</span><span class="stat-change">deals in your Wheels</span></div>
    <div class="stat-card"><span class="stat-label">Commission Earned</span><span class="stat-value">${fmtMoney(fees)}</span><span class="stat-change">from deal fees</span></div>
    <div class="stat-card"><span class="stat-label">Active Deals</span><span class="stat-value">${allDeals.filter(d=>d.status==='in_progress').length}</span><span class="stat-change">in progress</span></div>
  </div>

  <div class="two-col">
    <div>
      <div class="analytics-chart">
        <h3 class="t-h2 mb-3">Revenue (Monthly)</h3>
        <div class="chart-bars">
          ${months.map((m,i) => `
            <div class="chart-bar-group">
              <div class="chart-bar-val">${fmtMoney(mockRevenue[i])}</div>
              <div class="chart-bar" style="height:${Math.round(mockRevenue[i]/maxRev*100)}%;background:${i===months.length-1?'var(--teal)':'var(--navy)'}"></div>
              <div class="chart-bar-label">${m}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <h3 class="t-h2 mb-3">Wheels Performance</h3>
        ${myWheels.map(w => {
          const wDeals = allDeals.filter(d => d.wheelId === w.id);
          return `<div class="flex justify-between items-center mb-3">
            <div class="flex gap-2 items-center">${hexBadge(w, 32)}<div><div class="t-small" style="font-weight:600">${escHtml(w.name)}</div><div class="t-micro c-text4">${w.memberCount} members</div></div></div>
            <div style="text-align:right"><div class="t-small" style="font-weight:700">${wDeals.length} deals</div><div class="t-micro c-text4">${fmtMoney(wDeals.reduce((s,d)=>s+d.priceCents/100*(d.creatorCommissionPct/100),0))} earned</div></div>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div>
      <div class="card mb-3">
        <h3 class="t-h2 mb-3">Recent Deal Activity</h3>
        ${allDeals.slice(0,5).map(d => {
          const buyer = store.getUser(d.buyerId), seller = store.getUser(d.sellerId);
          return `<div class="flex gap-2 items-center mb-3">
            <div class="flex-1"><div class="t-small" style="font-weight:600">${escHtml(d.title)}</div><div class="t-micro c-text4">${escHtml(buyer?.name||'?')}  ${escHtml(seller?.name||'?')}</div></div>
            <div style="text-align:right">${dealStatusBadge(d.status)}<div class="t-micro c-text4 mt-1">${fmtMoney(d.priceCents/100)}</div></div>
          </div>`;
        }).join('') || '<div class="t-body c-text3">No deals yet in your Wheels</div>'}
      </div>
      <div class="card">
        <h3 class="t-h2 mb-3">Top Members by Trust</h3>
        ${store.getMyWheels().flatMap(w => store.getWheelMembers(w.id)).sort((a,b) => b.trustScore - a.trustScore).filter((u,i,arr) => arr.findIndex(x=>x.id===u.id)===i).slice(0,5).map(u => `
          <div class="flex gap-2 items-center mb-3">
            ${avatarHtml(u,'sm')}
            <div class="flex-1"><div class="t-small" style="font-weight:600">${escHtml(u.name)}</div></div>
            <div class="trust-bar-wrap" style="width:80px"><div class="trust-bar-fill" style="width:${u.trustScore}%"></div></div>
            <span class="trust-score-num">${u.trustScore}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

/*  19. MODALS  */
function buildModals() {
  return `
  <!-- Create Wheel -->
  <div class="modal-overlay" id="modal-create-wheel">
    <div class="modal">
      <div class="modal-header"><span class="modal-title">Create a Wheel</span><button class="modal-close"></button></div>
      <div class="modal-body">
        <div class="form-stack">
          <div class="form-group"><label class="form-label">Wheel Name *</label><input class="form-control" id="cw-name" placeholder="The Founders Circle"></div>
          <div class="form-group"><label class="form-label">Slug *</label><input class="form-control" id="cw-slug" placeholder="founders-circle"><div class="form-hint">fairriss.com/wheels/founders-circle</div></div>
          <div class="form-group"><label class="form-label">Description *</label><textarea class="form-control" id="cw-desc" rows="3" placeholder="What's this Wheel about?"></textarea></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Category</label>
              <select class="form-control" id="cw-cat">
                <option>Startup</option><option>Design</option><option>Marketing</option><option>Technology</option><option>Finance</option><option>Creative</option><option>Operations</option><option>Other</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Membership</label>
              <select class="form-control" id="cw-mode">
                <option value="open">Open</option><option value="invite_only">Invite Only</option><option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Monthly Price ($) <span>0 = Free</span></label><input class="form-control" id="cw-price" type="number" min="0" placeholder="29"></div>
            <div class="form-group"><label class="form-label">Deal Commission (%)</label><input class="form-control" id="cw-commission" type="number" min="0" max="15" step="0.5" placeholder="2.5"></div>
          </div>
          <div class="form-group"><label class="form-label">Accent Color</label><input class="form-control" id="cw-color" type="color" value="#00C9A7" style="height:40px;cursor:pointer"></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeAllModals()">Cancel</button>
        <button class="btn btn-teal" id="create-wheel-btn">Create Wheel</button>
      </div>
    </div>
  </div>

  <!-- Create Opportunity -->
  <div class="modal-overlay" id="modal-create-opp">
    <div class="modal modal-lg">
      <div class="modal-header"><span class="modal-title">Post an Opportunity</span><button class="modal-close"></button></div>
      <div class="modal-body">
        <div class="form-stack">
          <div class="form-group"><label class="form-label">Type *</label>
            <select class="form-control" id="co-type">
              <option value="job">Job</option><option value="partnership">Partnership</option><option value="collaboration">Collaboration</option><option value="investment">Investment</option><option value="referral">Referral</option><option value="service">Service Request</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Title *</label><input class="form-control" id="co-title" placeholder="Head of Product at Acme Corp"></div>
          <div class="form-group"><label class="form-label">Description *</label><textarea class="form-control" id="co-desc" rows="4" placeholder="Tell members about this opportunity..."></textarea></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Location</label><input class="form-control" id="co-location" placeholder="Remote, New York, etc."></div>
            <div class="form-group"><label class="form-label">Skills Required</label><input class="form-control" id="co-skills" placeholder="React, Design, Growth..."></div>
          </div>
          <div class="form-group"><label class="form-label">Compensation / Value</label><input class="form-control" id="co-comp" placeholder="$120k-$150k / $500 bonus / 25% equity..."></div>
          <div class="form-group"><label class="form-label">Post to Wheels</label>
            <div id="co-wheel-selector" style="display:flex;flex-direction:column;gap:.5rem;margin-top:.375rem"></div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeAllModals()">Cancel</button>
        <button class="btn btn-teal" id="create-opp-btn">Post Opportunity</button>
      </div>
    </div>
  </div>

  <!-- Create Deal -->
  <div class="modal-overlay" id="modal-create-deal">
    <div class="modal modal-lg">
      <div class="modal-header"><span class="modal-title">Create a Deal</span><button class="modal-close"></button></div>
      <div class="modal-body">
        <div class="form-stack">
          <div class="form-group"><label class="form-label">Deal Title *</label><input class="form-control" id="cd-title" placeholder="Website Redesign Project"></div>
          <div class="form-group"><label class="form-label">Counterparty (Seller) *</label>
            <select class="form-control" id="cd-seller">
              <option value="">Select member...</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Scope *</label><textarea class="form-control" id="cd-scope" rows="3" placeholder="Describe what you are buying/selling..."></textarea></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Price ($) *</label><input class="form-control" id="cd-price" type="number" min="1" placeholder="5000"></div>
            <div class="form-group"><label class="form-label">Payment Type</label>
              <select class="form-control" id="cd-payment-type">
                <option value="lump_sum">Lump Sum</option><option value="milestones">Milestones</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Start Date</label><input class="form-control" id="cd-start" type="date"></div>
            <div class="form-group"><label class="form-label">End Date</label><input class="form-control" id="cd-end" type="date"></div>
          </div>
          <div class="form-group"><label class="form-label">Deliverables <span>one per line</span></label><textarea class="form-control" id="cd-deliverables" rows="3" placeholder="Discovery & wireframes&#10;High-fidelity mockups&#10;Developer handoff"></textarea></div>
          <div class="form-group"><label class="form-label">Wheel <span>(for commission tracking)</span></label>
            <select class="form-control" id="cd-wheel">
              <option value="">None (direct deal)</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeAllModals()">Cancel</button>
        <button class="btn btn-teal" id="create-deal-btn">Propose Deal</button>
      </div>
    </div>
  </div>

  <!-- Create Post -->
  <div class="modal-overlay" id="modal-create-post">
    <div class="modal">
      <div class="modal-header"><span class="modal-title">New Post</span><button class="modal-close"></button></div>
      <div class="modal-body">
        <div class="form-stack">
          <div class="form-group"><label class="form-label">Type</label>
            <select class="form-control" id="cp-type"><option value="post">Post</option><option value="announcement">Announcement</option><option value="referral">Referral</option></select>
          </div>
          <div class="form-group"><label class="form-label">Message *</label><textarea class="form-control" id="cp-body" rows="4" placeholder="Share something with your Wheel..."></textarea></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeAllModals()">Cancel</button>
        <button class="btn btn-teal" id="create-post-btn">Publish</button>
      </div>
    </div>
  </div>

  <!-- Opp Detail -->
  <div class="modal-overlay" id="modal-opp-detail">
    <div class="modal modal-lg">
      <div class="modal-header"><span class="modal-title" id="modal-opp-title">Opportunity</span><button class="modal-close"></button></div>
      <div class="modal-body" id="modal-opp-body"></div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeAllModals()">Close</button>
        <button class="btn btn-teal" onclick="toast('Application submitted!','success');closeAllModals()">Apply Now</button>
      </div>
    </div>
  </div>`;
}

function bindModalForms() {
  // Create Wheel
  $('#create-wheel-btn')?.addEventListener('click', () => {
    const name = $('#cw-name').value.trim();
    const slug = $('#cw-slug').value.trim().toLowerCase().replace(/\s+/g,'-');
    const desc = $('#cw-desc').value.trim();
    if (!name || !slug) { toast('Wheel name and slug are required', 'error'); return; }
    const color = $('#cw-color').value;
    const w = store.createWheel({
      name, slug, description: desc,
      category: $('#cw-cat').value,
      membershipMode: $('#cw-mode').value,
      monthlyPrice: parseInt($('#cw-price').value) || 0,
      dealCommission: parseFloat($('#cw-commission').value) || 2.5,
      hexColor: color,
      coverGradient: `linear-gradient(135deg,${color}cc,${color})`,
      accentColor: color,
    });
    toast(`Wheel "${name}" created!`, 'success');
    closeAllModals();
    updateShellDynamic(store.getMe());
    navigate('wheel-detail', { wheelId: w.id });
  });

  // Opp wheel selector
  $('#modal-create-opp')?.addEventListener('click', () => {
    const sel = $('#co-wheel-selector');
    if (!sel || sel.children.length) return;
    store.getMyWheels().forEach(w => {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:.5rem;font-size:.875rem;cursor:pointer';
      label.innerHTML = `<input type="checkbox" value="${w.id}" checked style="width:16px;height:16px"> ${escHtml(w.name)}`;
      sel.appendChild(label);
    });
  });

  // Create Opportunity
  $('#create-opp-btn')?.addEventListener('click', () => {
    const title = $('#co-title').value.trim();
    const desc = $('#co-desc').value.trim();
    if (!title || !desc) { toast('Title and description are required', 'error'); return; }
    const wheelIds = [...$$('#co-wheel-selector input:checked')].map(i => i.value);
    const comp = $('#co-comp').value.trim();
    const type = $('#co-type').value;
    const meta = {};
    if (comp) { if (type === 'job') { meta.salaryMin = 0; meta.salaryMax = 0; } else meta.value = comp; }
    const o = store.createOpportunity({
      type, title, description: desc,
      skills: $('#co-skills').value.split(',').map(s=>s.trim()).filter(Boolean),
      location: $('#co-location').value.trim() || 'Remote',
      remoteOk: true,
      wheelIds: wheelIds.length ? wheelIds : store.getMyWheels().map(w=>w.id),
      metadata: meta,
      expiresAt: null,
    });
    toast('Opportunity posted!', 'success');
    closeAllModals();
    navigate('opportunities');
  });

  // Create Deal - populate selects
  $('#modal-create-deal')?.addEventListener('click', () => {
    const sel = $('#cd-seller');
    const wsel = $('#cd-wheel');
    if (!sel || sel.options.length > 1) return;
    store.get('users').filter(u => u.id !== store.getMe()?.id).forEach(u => {
      sel.options.add(new Option(u.name, u.id));
    });
    store.getMyWheels().forEach(w => {
      wsel.options.add(new Option(w.name, w.id));
    });
  });

  $('#create-deal-btn')?.addEventListener('click', () => {
    const title = $('#cd-title').value.trim();
    const scope = $('#cd-scope').value.trim();
    const price = parseInt($('#cd-price').value) || 0;
    const sellerId = $('#cd-seller').value;
    if (!title || !scope || !price || !sellerId) { toast('Please fill all required fields', 'error'); return; }
    const delivLines = $('#cd-deliverables').value.trim().split('\n').filter(Boolean);
    const deliverables = delivLines.map(l => ({ id: uid(), title: l.trim(), done: false }));
    const d = store.createDeal({
      title, scope, sellerId,
      priceCents: price * 100,
      currency: 'USD',
      paymentType: $('#cd-payment-type').value,
      startDate: $('#cd-start').value,
      endDate: $('#cd-end').value,
      wheelId: $('#cd-wheel').value || null,
      deliverables,
    });
    store.addNotif(sellerId, 'deal_message', `<strong>${store.getMe().name}</strong> proposed a deal: ${escHtml(title)}`);
    toast('Deal proposed!', 'success');
    closeAllModals();
    navigate('deal-detail', { dealId: d.id });
  });

  // Create Post
  $('#create-post-btn')?.addEventListener('click', () => {
    const body = $('#cp-body').value.trim();
    if (!body) { toast('Post body is required', 'error'); return; }
    const wheelId = pageParams.wheelId || store.getMyWheels()[0]?.id;
    if (!wheelId) { toast('Join a Wheel first', 'error'); return; }
    store.createPost({ wheelId, body, type: $('#cp-type').value });
    toast('Post published!', 'success');
    closeAllModals();
    renderWheelDetail();
  });
}

/*  20. BOOT  */
window.navigate = navigate;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.store = store;
window.toast = toast;
window.renderHome = renderHome;
window.renderProfile = renderProfile;
window.renderWheelDetail = renderWheelDetail;
window.renderDealDetail = renderDealDetail;
window.renderOppDetail = renderOppDetail;

// Boot
document.addEventListener('DOMContentLoaded', () => {
  renderPage();
});
