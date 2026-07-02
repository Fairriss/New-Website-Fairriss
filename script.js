'use strict';
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const fmt = (n) => new Intl.NumberFormat('en-US').format(n);
const fmtMoney = (n, cur = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n);
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
  if (m < 2) return 'just now';
  if (m < 60) return m + 'm ago';
  if (h < 24) return h + 'h ago';
  if (d < 7) return d + 'd ago';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const initials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
const escHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const STORE_KEY = 'fairriss_mvp_v2';
const SUGGESTED_WHEELS = [
  { name:'SaaS Founders', category:'Startup', emoji:'S', hex:'#0F1F3D', desc:'A private community for SaaS founders to share playbooks, deals, and referrals.' },
  { name:'AI Startups', category:'Technology', emoji:'A', hex:'#6D28D9', desc:'Founders and builders working on AI products. Share resources, intros, and opportunities.' },
  { name:'Startup Investors', category:'Finance', emoji:'I', hex:'#047857', desc:'Angel investors and VCs sharing deal flow, co-investment opportunities, and insights.' },
  { name:'Toronto Investors', category:'Finance', emoji:'T', hex:'#B45309', desc:'Local investor community in Toronto. Deals, meetups, and co-investment.' },
  { name:'Women Founders', category:'Startup', emoji:'W', hex:'#BE185D', desc:'A supportive network for women building companies. Funding, mentorship, and community.' },
  { name:'Owners', category:'Business', emoji:'O', hex:'#0369A1', desc:'Business owners sharing what works. Operations, hiring, partnerships, and growth.' },
  { name:'Founders', category:'Startup', emoji:'F', hex:'#374151', desc:'Early-stage founders sharing learnings, deals, and introductions.' },
  { name:'Hiring', category:'Talent', emoji:'H', hex:'#065F46', desc:'Post and find vetted roles across startups and growing companies.' },
  { name:'Events', category:'Events', emoji:'E', hex:'#7C3AED', desc:'Discover and host events for your professional community. Tickets, RSVPs, and more.' },
  { name:'Partnerships', category:'Business', emoji:'P', hex:'#C2410C', desc:'Find co-marketing partners, resellers, and strategic alliances.' },
  { name:'Networking', category:'Community', emoji:'N', hex:'#1D4ED8', desc:'General professional networking. Introductions, referrals, and casual connection.' },
];

const DEFAULT_DATA = {
  currentUser: null,
  users: [
    { id:'u1', name:'Alex Chen', username:'alexchen', role:'creator', userType:'Founder', wantTo:['Post Opportunities','Network'], bio:'Business coach and community builder. I help founders scale from 0 to 1.', jobTitle:'Founder and CEO', company:'Founder Collective', location:'San Francisco, CA', skills:['Coaching','Strategy','Fundraising','Community'], availability:'available', trustScore:94, avatar:null, profilePics:[], introVideo:null, resume:null, workHistory:[{ id:'j1', title:'CEO', company:'Founder Collective', from:'2020', to:'Present', desc:'Building community-led businesses.' }], deals:18, revenue:87400, referralsSent:22, referralsConverted:18, reviewAvg:4.9, joinedAt:'2024-01-15T00:00:00Z' },
    { id:'u2', name:'Marcus Osei', username:'marcusosei', role:'member', userType:'Freelancer', wantTo:['Find Work','Network'], bio:'Senior UX designer with 8 years shaping digital products for fintech and consumer apps.', jobTitle:'Senior UX Designer', company:'Self-employed', location:'Lagos, Nigeria', skills:['UX Design','Figma','Design Systems','User Research'], availability:'available', trustScore:87, avatar:null, profilePics:[], introVideo:null, resume:null, workHistory:[{ id:'j2', title:'Senior UX Designer', company:'Verve.io', from:'2021', to:'2024', desc:'Led design for core product.' }], deals:24, revenue:41200, referralsSent:12, referralsConverted:9, reviewAvg:4.9, joinedAt:'2024-02-03T00:00:00Z' },
    { id:'u3', name:'Priya Singh', username:'priyasingh', role:'member', userType:'Freelancer', wantTo:['Find Work','Hire People'], bio:'Full-stack engineer specialising in React, Node.js, and scalable APIs.', jobTitle:'Full-Stack Engineer', company:'Self-employed', location:'Bangalore, India', skills:['React','Node.js','TypeScript','PostgreSQL'], availability:'limited', trustScore:79, avatar:null, profilePics:[], introVideo:null, resume:null, workHistory:[], deals:11, revenue:28600, referralsSent:6, referralsConverted:4, reviewAvg:4.7, joinedAt:'2024-03-12T00:00:00Z' },
    { id:'u4', name:'Jordan Lee', username:'jordanlee', role:'member', userType:'Owner', wantTo:['Hire People','Network'], bio:'Growth marketer obsessed with CAC and retention.', jobTitle:'Head of Growth', company:'Nova SaaS', location:'New York, NY', skills:['Growth','Paid Ads','Analytics','SEO'], availability:'unavailable', trustScore:72, avatar:null, profilePics:[], introVideo:null, resume:null, workHistory:[], deals:8, revenue:19800, referralsSent:14, referralsConverted:7, reviewAvg:4.5, joinedAt:'2024-04-01T00:00:00Z' },
    { id:'u5', name:'Nova SaaS', username:'novasaas', role:'brand', userType:'Owner', wantTo:['Hire People','Post Opportunities'], bio:'B2B workflow automation platform.', jobTitle:'Brand Account', company:'Nova SaaS', location:'Austin, TX', skills:['SaaS','B2B','Automation'], availability:'available', trustScore:83, avatar:null, profilePics:[], introVideo:null, resume:null, workHistory:[], deals:5, revenue:0, referralsSent:2, referralsConverted:1, reviewAvg:4.6, joinedAt:'2024-02-20T00:00:00Z' },
    { id:'u6', name:'Sarah Kim', username:'sarahkim', role:'member', userType:'Freelancer', wantTo:['Find Work','Post Opportunities'], bio:'Brand designer and strategist. I create visual identities that make companies unforgettable.', jobTitle:'Brand Designer', company:'Self-employed', location:'Seoul, South Korea', skills:['Brand Design','Illustration','Motion','Art Direction'], availability:'available', trustScore:91, avatar:null, profilePics:[], introVideo:null, resume:null, workHistory:[], deals:31, revenue:62300, referralsSent:19, referralsConverted:15, reviewAvg:5.0, joinedAt:'2024-01-28T00:00:00Z' },
  ],
  wheels: [
    { id:'w1', name:'The Founders Circle', slug:'founders-circle', creatorId:'u1', description:'A private community for early-stage founders to share deals, referrals, and hard-won insights.', category:'Startup', coverGradient:'linear-gradient(135deg,#0F1F3D,#243B6B)', hexColor:'#0F1F3D', memberCount:142, status:'active', membershipMode:'open', monthlyPrice:0, dealCommission:2.5, isEventWheel:false, createdAt:'2024-01-20T00:00:00Z' },
    { id:'w2', name:'Design Syndicate', slug:'design-syndicate', creatorId:'u6', description:'Designers helping designers. Referrals, collab opportunities, and client leads.', category:'Design', coverGradient:'linear-gradient(135deg,#4C1D95,#7C3AED)', hexColor:'#6D28D9', memberCount:89, status:'active', membershipMode:'open', monthlyPrice:0, dealCommission:1.5, isEventWheel:false, createdAt:'2024-02-10T00:00:00Z' },
    { id:'w3', name:'Toronto Investors', slug:'toronto-investors', creatorId:'u4', description:'Local investor community in Toronto. Deals, meetups, and co-investment.', category:'Finance', coverGradient:'linear-gradient(135deg,#065F46,#059669)', hexColor:'#047857', memberCount:63, status:'active', membershipMode:'open', monthlyPrice:0, dealCommission:2, isEventWheel:false, createdAt:'2024-03-05T00:00:00Z' },
  ],
  wheelMembers: [
    { wheelId:'w1', userId:'u1', status:'active', joinedAt:'2024-01-20T00:00:00Z' },
    { wheelId:'w1', userId:'u2', status:'active', joinedAt:'2024-02-05T00:00:00Z' },
    { wheelId:'w1', userId:'u3', status:'active', joinedAt:'2024-02-18T00:00:00Z' },
    { wheelId:'w1', userId:'u5', status:'active', joinedAt:'2024-03-01T00:00:00Z' },
    { wheelId:'w2', userId:'u6', status:'active', joinedAt:'2024-02-10T00:00:00Z' },
    { wheelId:'w2', userId:'u2', status:'active', joinedAt:'2024-02-20T00:00:00Z' },
    { wheelId:'w3', userId:'u4', status:'active', joinedAt:'2024-03-05T00:00:00Z' },
    { wheelId:'w3', userId:'u3', status:'active', joinedAt:'2024-03-15T00:00:00Z' },
  ],
  opportunities: [
    { id:'o1', creatorId:'u5', wheelIds:['w1'], type:'job', title:'Head of Product', description:'We are looking for a seasoned product leader to own the entire roadmap for Nova SaaS. Remote-first culture.', skills:['Product Management','SaaS','Analytics'], location:'Remote', remoteOk:true, status:'open', metadata:{ salaryMin:140000, salaryMax:180000, type:'full-time' }, viewCount:48, applicationCount:7, expiresAt:'2025-09-01T00:00:00Z', createdAt:'2025-07-01T10:00:00Z' },
    { id:'o2', creatorId:'u2', wheelIds:['w1','w2'], type:'referral', title:'Senior iOS Engineer at Relay', description:'Relay is building the next generation of B2B payments. Great team, solid equity, full remote.', skills:['iOS','Swift','SwiftUI'], location:'Remote', remoteOk:true, status:'open', metadata:{ bonus:500 }, viewCount:31, applicationCount:4, expiresAt:'2025-08-15T00:00:00Z', createdAt:'2025-07-03T14:30:00Z' },
    { id:'o3', creatorId:'u3', wheelIds:['w1'], type:'collaboration', title:'CTO Co-Founder for EdTech Startup', description:'I have a working prototype and an LOI from a school district. Looking for a technical co-founder.', skills:['React Native','Node.js','EdTech'], location:'Remote', remoteOk:true, status:'open', metadata:{ equity:'25-35%' }, viewCount:19, applicationCount:2, expiresAt:'2025-09-30T00:00:00Z', createdAt:'2025-07-04T09:00:00Z' },
    { id:'o4', creatorId:'u1', wheelIds:['w1'], type:'service', title:'Brand Identity Package for Q3 Launch', description:'Looking for a brand designer to create a complete identity: wordmark, icon, color system, type system.', skills:['Brand Design','Logo Design','Typography'], location:'Remote', remoteOk:true, status:'open', metadata:{ budgetMin:2000, budgetMax:4000 }, viewCount:22, applicationCount:5, expiresAt:'2025-07-31T00:00:00Z', createdAt:'2025-07-05T11:00:00Z' },
    { id:'o5', creatorId:'u4', wheelIds:['w3'], type:'partnership', title:'Growth Agency Co-Marketing Partner', description:'We run paid acquisition for 12 DTC brands and want to partner with a complementary agency.', skills:['Marketing','Agency','Partnership'], location:'US-based preferred', remoteOk:true, status:'open', metadata:{}, viewCount:14, applicationCount:3, expiresAt:'2025-08-20T00:00:00Z', createdAt:'2025-07-06T08:30:00Z' },
  ],
  deals: [
    { id:'d1', wheelId:'w2', buyerId:'u5', sellerId:'u2', title:'Website Redesign Project', scope:'Complete redesign of Nova SaaS marketing site (5 core pages) in Figma.', deliverables:[{ id:'del1', title:'Discovery and wireframes', done:true },{ id:'del2', title:'High-fidelity mockups', done:false },{ id:'del3', title:'Developer handoff', done:false }], status:'in_progress', priceCents:450000, currency:'USD', paymentType:'lump_sum', startDate:'2025-07-01', endDate:'2025-08-15', platformFeePct:3, creatorCommissionPct:2.5, messages:[{ id:'m1', senderId:'u5', body:'Hi Marcus, we loved your portfolio. The Nova rebrand is one of our biggest priorities this quarter.', createdAt:'2025-07-01T09:00:00Z' },{ id:'m2', senderId:'u2', body:'Thanks! I went through the brief. I have some questions about the brand voice - can we jump on a quick call?', createdAt:'2025-07-01T10:30:00Z' }], createdAt:'2025-06-28T00:00:00Z' },
    { id:'d2', wheelId:'w1', buyerId:'u1', sellerId:'u3', title:'Member Portal Development', scope:'Build the member dashboard for The Founders Circle - authentication, profile pages, and deal listing MVP.', deliverables:[{ id:'del5', title:'Auth system', done:true },{ id:'del6', title:'Profile CRUD', done:true },{ id:'del7', title:'Deal list views', done:false }], status:'in_progress', priceCents:800000, currency:'USD', paymentType:'milestones', startDate:'2025-06-15', endDate:'2025-08-30', platformFeePct:3, creatorCommissionPct:2, messages:[{ id:'m4', senderId:'u1', body:'Priya, the auth and profile work looks clean. Are we on track for Aug 30?', createdAt:'2025-07-04T14:00:00Z' },{ id:'m5', senderId:'u3', body:'Yes - starting deal views Monday. Should have a preview by end of week.', createdAt:'2025-07-04T14:22:00Z' }], createdAt:'2025-06-12T00:00:00Z' },
    { id:'d3', wheelId:'w1', buyerId:'u2', sellerId:'u6', title:'Brand Identity for Osei Studio', scope:'Complete brand identity: wordmark, icon, color palette, type system, and business card design.', deliverables:[{ id:'del8', title:'Discovery and mood boards', done:true },{ id:'del9', title:'Wordmark concepts', done:true },{ id:'del10', title:'Final identity system', done:true }], status:'paid', priceCents:320000, currency:'USD', paymentType:'lump_sum', startDate:'2025-05-01', endDate:'2025-06-01', platformFeePct:3, creatorCommissionPct:2.5, messages:[], createdAt:'2025-04-28T00:00:00Z' },
  ],
  events: [
    { id:'ev1', wheelId:'w1', creatorId:'u1', title:'Founders Dinner - Toronto', description:'Private dinner for founders in the Toronto area. 20 seats only. Great food, real conversations.', date:'2025-08-15', time:'7:00 PM', location:'Toronto, ON', ticketPrice:75, ticketCount:20, ticketsSold:12, createdAt:'2025-07-01T00:00:00Z' },
  ],
  posts: [
    { id:'p1', wheelId:'w1', authorId:'u1', type:'announcement', body:'Welcome to Q3! We have three open opportunities in the feed this week. Check them out and let us make each other money.', likes:24, createdAt:'2025-07-07T09:00:00Z' },
    { id:'p2', wheelId:'w1', authorId:'u2', type:'referral', body:'Forwarding a senior iOS engineer role at Relay - great team, solid equity, full remote. DM me for the warm intro. Referral bonus: $500 if they get hired.', likes:11, createdAt:'2025-07-07T11:30:00Z' },
    { id:'p3', wheelId:'w1', authorId:'u3', type:'post', body:'PSA: finished the auth module for the portal. Magic link is live on staging. Would love feedback on the UX.', likes:8, createdAt:'2025-07-06T16:00:00Z' },
  ],
  notifications: [
    { id:'n1', userId:'u1', type:'deal_message', text:'<strong>Marcus Osei</strong> sent a message on Website Redesign Project', read:false, createdAt:'2025-07-07T10:30:00Z' },
    { id:'n2', userId:'u1', type:'new_member', text:'<strong>Nova SaaS</strong> joined The Founders Circle', read:false, createdAt:'2025-07-06T15:00:00Z' },
    { id:'n3', userId:'u1', type:'deal_completed', text:'<strong>Brand Identity for Osei Studio</strong> was marked complete', read:true, createdAt:'2025-06-30T09:00:00Z' },
  ],
};

class Store {
  constructor() { this.data = this._load(); }
  _load() { try { const r = localStorage.getItem(STORE_KEY); if (r) return JSON.parse(r); } catch(e) {} return JSON.parse(JSON.stringify(DEFAULT_DATA)); }
  _save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); } catch(e) {} }
  reset() { this.data = JSON.parse(JSON.stringify(DEFAULT_DATA)); this._save(); }
  get(k) { return this.data[k]; }
  set(k,v) { this.data[k]=v; this._save(); }
  login(id) { this.data.currentUser=id; this._save(); }
  logout() { this.data.currentUser=null; this._save(); }
  getMe() { return this.data.users.find(u=>u.id===this.data.currentUser)||null; }
  getUser(id) { return this.data.users.find(u=>u.id===id); }
  updateMe(f) { const i=this.data.users.findIndex(u=>u.id===this.data.currentUser); if(i!==-1){Object.assign(this.data.users[i],f);this._save();} }
  createUser(d) { const u={id:uid(),trustScore:0,deals:0,revenue:0,referralsSent:0,referralsConverted:0,reviewAvg:0,avatar:null,profilePics:[],introVideo:null,resume:null,workHistory:[],joinedAt:new Date().toISOString(),...d}; this.data.users.push(u);this._save();return u; }
  getMyWheels() { const me=this.data.currentUser; const ids=this.data.wheelMembers.filter(m=>m.userId===me&&m.status==='active').map(m=>m.wheelId); return this.data.wheels.filter(w=>ids.includes(w.id)); }
  getWheelMembers(wid) { const ids=this.data.wheelMembers.filter(m=>m.wheelId===wid&&m.status==='active').map(m=>m.userId); return this.data.users.filter(u=>ids.includes(u.id)); }
  createWheel(d) { const w={id:uid(),creatorId:this.data.currentUser,memberCount:1,status:'active',membershipMode:'open',monthlyPrice:0,createdAt:new Date().toISOString(),...d}; this.data.wheels.push(w); this.data.wheelMembers.push({wheelId:w.id,userId:this.data.currentUser,status:'active',joinedAt:new Date().toISOString()}); this._save();return w; }
  joinWheel(wid) { if(!this.data.wheelMembers.find(m=>m.wheelId===wid&&m.userId===this.data.currentUser)){ this.data.wheelMembers.push({wheelId:wid,userId:this.data.currentUser,status:'active',joinedAt:new Date().toISOString()}); const w=this.data.wheels.find(x=>x.id===wid);if(w)w.memberCount++;this._save(); } }
  isMember(wid) { return !!this.data.wheelMembers.find(m=>m.wheelId===wid&&m.userId===this.data.currentUser&&m.status==='active'); }
  getOpportunities(f={}) { let o=[...this.data.opportunities]; if(f.wheelId)o=o.filter(x=>x.wheelIds.includes(f.wheelId)); if(f.type&&f.type!=='all')o=o.filter(x=>x.type===f.type); if(f.q){const q=f.q.toLowerCase();o=o.filter(x=>x.title.toLowerCase().includes(q)||x.description.toLowerCase().includes(q));} return o.filter(x=>x.status==='open').sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); }
  createOpportunity(d) { const o={id:uid(),creatorId:this.data.currentUser,status:'open',viewCount:0,applicationCount:0,createdAt:new Date().toISOString(),...d};this.data.opportunities.push(o);this._save();return o; }
  getMyDeals() { const me=this.data.currentUser; return this.data.deals.filter(d=>d.buyerId===me||d.sellerId===me).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); }
  getDeal(id) { return this.data.deals.find(d=>d.id===id); }
  createDeal(d) { const x={id:uid(),buyerId:this.data.currentUser,status:'proposed',messages:[],deliverables:[],platformFeePct:3,creatorCommissionPct:2.5,createdAt:new Date().toISOString(),...d};this.data.deals.push(x);this._save();return x; }
  updateDeal(id,f) { const i=this.data.deals.findIndex(d=>d.id===id);if(i!==-1){Object.assign(this.data.deals[i],f);this._save();}return this.data.deals[i]; }
  addDealMessage(did,body) { const d=this.getDeal(did);if(!d)return;const m={id:uid(),senderId:this.data.currentUser,body,createdAt:new Date().toISOString()};d.messages.push(m);this._save();return m; }
  getPosts(wid) { return this.data.posts.filter(p=>p.wheelId===wid).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); }
  createPost(d) { const p={id:uid(),authorId:this.data.currentUser,likes:0,createdAt:new Date().toISOString(),...d};this.data.posts.push(p);this._save();return p; }
  likePost(id) { const p=this.data.posts.find(x=>x.id===id);if(p){p.likes++;this._save();} }
  getEvents(wid) { return (this.data.events||[]).filter(e=>e.wheelId===wid); }
  createEvent(d) { const e={id:uid(),creatorId:this.data.currentUser,ticketsSold:0,createdAt:new Date().toISOString(),...d};if(!this.data.events)this.data.events=[];this.data.events.push(e);this._save();return e; }
  buyTicket(eid) { const e=(this.data.events||[]).find(x=>x.id===eid);if(e&&e.ticketsSold<e.ticketCount){e.ticketsSold++;this._save();return true;}return false; }
  getMyNotifs() { return (this.data.notifications||[]).filter(n=>n.userId===this.data.currentUser).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); }
  markNotifsRead() { (this.data.notifications||[]).filter(n=>n.userId===this.data.currentUser).forEach(n=>n.read=true);this._save(); }
  addNotif(uid2,type,text) { if(!this.data.notifications)this.data.notifications=[];this.data.notifications.push({id:uid(),userId:uid2,type,text,read:false,createdAt:new Date().toISOString()});this._save(); }
}
const store = new Store();

function toast(msg, type='default') {
  const el=document.createElement('div'); el.className='toast '+type;
  el.innerHTML='<span>'+(type==='success'?'v':type==='error'?'x':'i')+'</span><span>'+escHtml(msg)+'</span>';
  let c=$('#toast-container');
  if(!c){c=document.createElement('div');c.id='toast-container';c.className='toast-container';document.body.appendChild(c);}
  c.appendChild(el);
  setTimeout(()=>{el.classList.add('hiding');setTimeout(()=>el.remove(),300);},3200);
}
function openModal(id){document.getElementById(id)?.classList.add('open');}
function closeAllModals(){$$('.modal-overlay').forEach(m=>m.classList.remove('open'));}
document.addEventListener('click',e=>{
  if(e.target.classList.contains('modal-overlay'))closeAllModals();
  if(e.target.classList.contains('modal-close'))closeAllModals();
});

const PAGES=['home','wheels','members','opportunities','deals','profile','wheel-detail','deal-detail','analytics'];
let currentPage='home', pageParams={};
function navigate(page,params={}){currentPage=page;pageParams=params;renderPage();window.scrollTo(0,0);}

function renderPage() {
  const me=store.getMe();
  if(!me){renderAuth();return;}
  if(me.userType===undefined){renderOnboarding();return;}
  renderShell(me);
  $$('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+currentPage)?.classList.add('active');
  $$('.nav-item[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===currentPage));
  const renders={home:renderHome,wheels:renderWheels,members:renderMembers,opportunities:renderOpportunities,deals:renderDeals,profile:renderProfile,'wheel-detail':renderWheelDetail,'deal-detail':renderDealDetail,analytics:renderAnalytics};
  renders[currentPage]?.();
}

function renderAuth() {
  document.body.innerHTML = '<div class="auth-screen"><div class="auth-brand"><div class="auth-brand-logo"><svg width="38" height="38" viewBox="0 0 38 38" fill="none"><circle cx="19" cy="19" r="19" fill="currentColor"/><circle cx="19" cy="19" r="12" fill="#0F1F3D" opacity=".5"/><text x="19" y="24" text-anchor="middle" font-size="14" font-weight="900" fill="currentColor">F</text></svg><span class="auth-brand-logo-text">Fairriss</span></div><div class="auth-hex-grid"><div class="auth-hex-row"><div class="auth-hex-item">&#x1F91D;</div><div class="auth-hex-item lit">&#x1F4A1;</div></div><div class="auth-hex-row"><div class="auth-hex-item lit">&#x26A1;</div><div class="auth-hex-item">&#x1F3AF;</div><div class="auth-hex-item lit">&#x1F4B0;</div></div><div class="auth-hex-row"><div class="auth-hex-item">&#x1F517;</div><div class="auth-hex-item lit">&#x1F680;</div></div></div><p class="auth-brand-tagline">The platform where professional networks become commerce engines.</p></div><div class="auth-form-side"><h1>Welcome to Fairriss</h1><p class="auth-sub">Join the network where deals get done.</p><div class="auth-tabs"><div class="auth-tab active" data-tab="login">Sign In</div><div class="auth-tab" data-tab="signup">Create Account</div></div><div id="auth-login-form"><p class="t-body c-text3 mb-4">Demo: click any user to sign in</p><div style="display:flex;flex-direction:column;gap:.5rem" id="demo-users"></div></div><div id="auth-signup-form" class="hidden"><div class="form-stack"><div class="form-row"><div class="form-group"><label class="form-label">Full Name *</label><input class="form-control" id="su-name" placeholder="Alex Chen"></div><div class="form-group"><label class="form-label">Username *</label><input class="form-control" id="su-username" placeholder="alexchen"></div></div><div class="form-group"><label class="form-label">Email *</label><input class="form-control" id="su-email" type="email" placeholder="alex@example.com"></div><button class="btn btn-primary w-full" id="create-account-btn" style="justify-content:center;margin-top:.5rem">Create Account</button></div></div></div></div>';
  store.get('users').forEach(u=>{
    const btn=document.createElement('button'); btn.className='btn btn-outline w-full'; btn.style.cssText='justify-content:flex-start;gap:.75rem';
    btn.innerHTML=avatarHtml(u,'md')+'<div style="text-align:left"><div class="t-body" style="font-weight:600">'+escHtml(u.name)+'</div><div class="t-small c-text3">'+escHtml(u.userType||u.role)+' - Trust '+u.trustScore+'</div></div>';
    btn.onclick=()=>{store.login(u.id);renderPage();}; $('#demo-users').appendChild(btn);
  });
  $$('.auth-tab').forEach(tab=>{tab.onclick=()=>{$$('.auth-tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');$('#auth-login-form').classList.toggle('hidden',tab.dataset.tab!=='login');$('#auth-signup-form').classList.toggle('hidden',tab.dataset.tab!=='signup');};});
  $('#create-account-btn').onclick=()=>{
    const name=$('#su-name').value.trim(),username=$('#su-username').value.trim(),email=$('#su-email').value.trim();
    if(!name||!username||!email){toast('Please fill in all fields','error');return;}
    const u=store.createUser({name,username,email,role:'member',bio:'',skills:[],location:'',availability:'available'});
    store.login(u.id); renderOnboarding();
  };
}

function renderOnboarding() {
  const step=store.data._obStep||1;
  document.body.innerHTML='<div style="min-height:100vh;background:var(--surface);display:flex;align-items:center;justify-content:center;padding:2rem"><div style="background:var(--white);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);width:100%;max-width:520px;overflow:hidden"><div style="background:var(--navy);padding:1.5rem 2rem;display:flex;align-items:center;gap:.75rem"><div class="header-logo-mark">F</div><span style="color:var(--white);font-weight:800;font-size:1.125rem">Fairriss</span><div style="margin-left:auto;display:flex;gap:.5rem"><div style="width:32px;height:4px;border-radius:99px;background:'+(step>=1?'var(--teal)':'rgba(255,255,255,.2)')+'"></div><div style="width:32px;height:4px;border-radius:99px;background:'+(step>=2?'var(--teal)':'rgba(255,255,255,.2)')+'"></div></div></div><div style="padding:2rem" id="ob-body"></div></div></div>';
  if(step===1){
    $('#ob-body').innerHTML='<h2 class="t-h1 mb-2">What best describes you?</h2><p class="t-body c-text3 mb-4">This helps us personalise your Fairriss experience.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.5rem" id="type-grid">'+
    ['Founder','Freelancer','Owner','Investor','Advisor','Other'].map(t=>'<div class="auth-role-card" data-type="'+t+'" onclick="selectType(this,\''+t+'\')"><div class="auth-role-icon">'+({Founder:'&#x1F680;',Freelancer:'&#x1F4BB;',Owner:'&#x1F3E2;',Investor:'&#x1F4B0;',Advisor:'&#x1F4A1;',Other:'&#x2728;'}[t])+'</div><div class="auth-role-name">'+t+'</div></div>').join('')+
    '</div><button class="btn btn-teal w-full" style="justify-content:center" onclick="ob1Next()">Continue</button>';
  } else {
    $('#ob-body').innerHTML='<h2 class="t-h1 mb-2">What do you want to do?</h2><p class="t-body c-text3 mb-4">Select all that apply.</p><div style="display:flex;flex-direction:column;gap:.625rem;margin-bottom:1.5rem">'+
    ['Hire People','Find Work','Join Communities','Post Opportunities','Network','Other'].map(t=>'<label class="want-lbl" style="display:flex;align-items:center;gap:.875rem;padding:.875rem 1rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);cursor:pointer"><input type="checkbox" value="'+t+'" style="width:18px;height:18px;accent-color:var(--teal)"> <span style="font-size:.9375rem;font-weight:500">'+t+'</span></label>').join('')+
    '</div><div class="form-group mb-3"><label class="form-label">Job Title <span>(optional)</span></label><input class="form-control" id="ob-title" placeholder="CEO, Freelance Designer..."></div><div class="form-group mb-4"><label class="form-label">Company <span>(optional)</span></label><input class="form-control" id="ob-company" placeholder="Acme Corp, Self-employed..."></div><button class="btn btn-teal w-full" style="justify-content:center" onclick="ob2Finish()">Get Started</button>';
  }
}
window.selectType=(el,type)=>{$$('[data-type]').forEach(c=>c.classList.remove('selected'));el.classList.add('selected');store.data._pendingType=type;};
window.ob1Next=()=>{const type=store.data._pendingType;if(!type){toast('Please select what describes you best','error');return;}store.updateMe({userType:type});store.data._obStep=2;renderOnboarding();};
window.ob2Finish=()=>{const wantTo=[...$$('.want-lbl input:checked')].map(i=>i.value);store.updateMe({wantTo,jobTitle:$('#ob-title')?.value.trim()||'',company:$('#ob-company')?.value.trim()||''});store.data._obStep=null;store.data._pendingType=null;store._save();toast('Welcome to Fairriss!','success');navigate('home');};

const PALETTE=['#0F1F3D','#6D28D9','#047857','#C2410C','#0369A1','#BE185D','#374151'];
function getColor(id){return PALETTE[(parseInt(id.replace(/\D/g,'')||'0')%PALETTE.length)];}
function avatarHtml(u,size='md'){
  const px={sm:32,md:44,lg:64,xl:80}[size]||44;
  if(!u)return '<div class="avatar avatar-'+size+'" style="background:#ddd;width:'+px+'px;height:'+px+'px"></div>';
  if(u.profilePics&&u.profilePics[0])return '<img src="'+u.profilePics[0]+'" style="width:'+px+'px;height:'+px+'px;border-radius:50%;object-fit:cover;display:block;flex-shrink:0">';
  return '<div class="avatar avatar-'+size+'" style="background:'+getColor(u.id)+';color:#fff;width:'+px+'px;height:'+px+'px">'+initials(u.name)+'</div>';
}
function profilePhotoHtml(u){
  if(u.profilePics&&u.profilePics[0])return '<img src="'+u.profilePics[0]+'" style="width:130px;height:130px;min-width:130px;min-height:130px;border-radius:50%;object-fit:cover;object-position:center top;border:4px solid rgba(255,255,255,.3);box-shadow:0 6px 24px rgba(0,0,0,.4);display:block">';
  return '<div class="profile-avatar-lg">'+initials(u.name)+'</div>';
}
function hexBadge(w,size=48){return '<div class="wheel-hex-mini" style="background:'+(w.hexColor||'#0F1F3D')+';width:'+size+'px;height:'+size+'px;border-radius:50%;font-size:'+Math.round(size*.38)+'px">'+w.name[0]+'</div>';}
function dealStatusBadge(s){return '<span class="status-badge status-'+s+'"><span class="status-dot"></span>'+s.replace('_',' ')+'</span>';}

function icon(n){
  const icons={
    home:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    wheel:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/></svg>',
    opp:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
    deal:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    members:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    analytics:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    plus:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    check:'<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    clock:'<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    map:'<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    users:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    send:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    ticket:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>',
    video:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    briefcase:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    file:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    camera:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  };
  return icons[n]||'';
}

function renderShell(me) {
  if($('.shell')){updateShellDynamic(me);return;}
  document.body.innerHTML='<div class="shell"><header class="header"><div class="header-logo"><div class="header-logo-mark" onclick="navigate(\'home\')" style="cursor:pointer">F</div><span class="header-logo-text" onclick="navigate(\'home\')" style="cursor:pointer">Fairriss</span></div><div class="header-search"><svg class="header-search-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input type="text" placeholder="Search members, deals, opportunities..." id="global-search"></div><div class="header-actions"><div style="position:relative"><button class="header-btn" id="notif-btn"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span class="notif-dot" id="notif-dot" style="display:none"></span></button><div class="notif-panel" id="notif-panel"></div></div><div class="header-avatar" id="header-avatar" onclick="navigate(\'profile\',{userId:\''+me.id+'\'})">'+initials(me.name)+'</div></div></header><aside class="sidebar"><div class="sidebar-section"><div class="sidebar-label">Navigation</div><nav><div class="nav-item" data-page="home" onclick="navigate(\'home\')">'+icon('home')+' Home</div><div class="nav-item" data-page="wheels" onclick="navigate(\'wheels\')">'+icon('wheel')+' My Wheels</div><div class="nav-item" data-page="opportunities" onclick="navigate(\'opportunities\')">'+icon('opp')+' Opportunities</div><div class="nav-item" data-page="deals" onclick="navigate(\'deals\')">'+icon('deal')+' Deals <span class="nav-badge" id="deal-badge" style="display:none"></span></div><div class="nav-item" data-page="members" onclick="navigate(\'members\')">'+icon('members')+' Members</div><div class="nav-item" data-page="analytics" onclick="navigate(\'analytics\')">'+icon('analytics')+' Analytics</div></nav></div><div class="sidebar-section"><div class="sidebar-label">My Wheels</div><div class="sidebar-wheels" id="sidebar-wheels"></div></div><div class="sidebar-bottom"><div class="sidebar-user" onclick="navigate(\'profile\',{userId:\''+me.id+'\'})">'+avatarHtml(me,'sm')+'<div class="sidebar-user-info"><div class="sidebar-user-name">'+escHtml(me.name)+'</div><div class="sidebar-user-role">'+(me.userType||me.role)+' - Trust '+me.trustScore+'</div></div><button class="btn-ghost btn-xs" onclick="event.stopPropagation();store.logout();renderPage()">exit</button></div></div></aside><main class="main" id="main-content">'+PAGES.map(p=>'<div class="page fade-in" id="page-'+p+'"></div>').join('')+'</main></div><div id="toast-container" class="toast-container"></div>'+buildModals();
  updateShellDynamic(me);
  $('#notif-btn').onclick=()=>{const p=$('#notif-panel');p.classList.toggle('open');if(p.classList.contains('open')){renderNotifPanel();store.markNotifsRead();}};
  document.addEventListener('click',e=>{if(!e.target.closest('#notif-btn')&&!e.target.closest('#notif-panel'))$('#notif-panel')?.classList.remove('open');});
  let st; $('#global-search').oninput=e=>{clearTimeout(st);st=setTimeout(()=>{if(e.target.value.length>1)navigate('opportunities',{q:e.target.value});},350);};
  bindModalForms();
}

function updateShellDynamic(me) {
  const sw=$('#sidebar-wheels');
  if(sw){
    const wheels=store.getMyWheels();
    sw.innerHTML=wheels.map(w=>'<div class="sidebar-wheel-item '+(pageParams.wheelId===w.id?'active':'')+'" onclick="navigate(\'wheel-detail\',{wheelId:\''+w.id+'\'})">'+hexBadge(w,24)+'<span class="sidebar-wheel-name">'+escHtml(w.name)+'</span><span class="sidebar-wheel-count">'+w.memberCount+'</span></div>').join('')+'<div class="sidebar-wheel-item" onclick="openModal(\'modal-create-wheel\')" style="color:var(--teal);font-weight:600;font-size:.8125rem"><span style="font-size:1.125rem">+</span> Create Wheel</div>';
  }
  const dot=$('#notif-dot');if(dot)dot.style.display=store.getMyNotifs().some(n=>!n.read)?'block':'none';
  const db=$('#deal-badge');if(db){const a=store.getMyDeals().filter(d=>['proposed','negotiating','in_progress'].includes(d.status));db.textContent=a.length||'';db.style.display=a.length?'inline-flex':'none';}
}

function renderNotifPanel() {
  const notifs=store.getMyNotifs();
  const icons={deal_message:'&#x1F4AC;',new_member:'&#x1F464;',deal_completed:'&#x2705;',new_opportunity:'&#x1F3AF;'};
  $('#notif-panel').innerHTML='<div class="notif-panel-head"><span class="notif-panel-title">Notifications</span></div>'+
    (notifs.length?notifs.map(n=>'<div class="notif-item '+(n.read?'':'unread')+'"><div class="notif-icon">'+(icons[n.type]||'&#x1F514;')+'</div><div><div class="notif-text">'+n.text+'</div><div class="notif-time">'+timeAgo(n.createdAt)+'</div></div></div>').join(''):'<div class="empty-state" style="padding:1.5rem">No notifications yet</div>');
}

function renderHome() {
  const me=store.getMe(), myDeals=store.getMyDeals(), wheels=store.getMyWheels();
  const activeDeals=myDeals.filter(d=>['in_progress','accepted'].includes(d.status));
  const allPosts=wheels.flatMap(w=>store.getPosts(w.id)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);
  const opps=store.getOpportunities().slice(0,3);
  $('#page-home').innerHTML='<div class="page-head"><div class="page-head-left"><h1 class="page-title">Good to see you, '+escHtml(me.name.split(' ')[0])+' &#x1F44B;</h1><p class="page-sub">Here is what is happening in your network.</p></div><div class="page-actions"><button class="btn btn-outline btn-sm" onclick="openModal(\'modal-create-wheel\')">'+icon('plus')+' New Wheel</button><button class="btn btn-teal btn-sm" onclick="openModal(\'modal-create-opp\')">'+icon('plus')+' Post Opportunity</button></div></div>'+
  '<div class="stats-grid"><div class="stat-card"><span class="stat-label">Wheels</span><span class="stat-value">'+wheels.length+'</span><span class="stat-change">Active communities</span></div><div class="stat-card"><span class="stat-label">Active Deals</span><span class="stat-value">'+activeDeals.length+'</span></div><div class="stat-card"><span class="stat-label">Trust Score</span><span class="stat-value">'+me.trustScore+'</span><span class="stat-change">/ 100</span></div><div class="stat-card"><span class="stat-label">Revenue</span><span class="stat-value">'+fmtMoney(me.revenue||0)+'</span></div></div>'+
  '<div class="two-col"><div><div class="flex justify-between items-center mb-3"><h2 class="t-h2">Network Feed</h2><button class="btn btn-ghost btn-sm" onclick="navigate(\'wheels\')">All Wheels</button></div>'+
  (allPosts.length?allPosts.map(p=>renderFeedPost(p)).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F4EB;</div><div class="empty-title">Feed is quiet</div><div class="empty-desc">Join Wheels to see posts from your network</div></div>')+
  '</div><div><div class="flex justify-between items-center mb-3"><h2 class="t-h2">Active Deals</h2><button class="btn btn-ghost btn-sm" onclick="navigate(\'deals\')">All</button></div>'+
  (activeDeals.length?activeDeals.map(d=>renderDealCardCompact(d)).join(''):'<div class="card"><div class="empty-state" style="padding:1.5rem"><div class="empty-icon">&#x1F91D;</div><div class="empty-title">No active deals</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-deal\')">Create Deal</button></div></div>')+
  '<div class="flex justify-between items-center mt-4 mb-3"><h2 class="t-h2">Fresh Opportunities</h2><button class="btn btn-ghost btn-sm" onclick="navigate(\'opportunities\')">All</button></div>'+
  opps.map(o=>'<div class="card card-sm mb-2" style="cursor:pointer" onclick="openModal(\'modal-opp-detail\');renderOppDetail(\''+o.id+'\')"><div class="flex gap-3 items-start"><div class="flex-1"><div class="t-h3 mb-1">'+escHtml(o.title)+'</div><div class="flex gap-2 items-center"><span class="type-badge type-'+o.type+'">'+o.type.replace('_',' ')+'</span><span class="t-micro c-text4">'+timeAgo(o.createdAt)+'</span></div></div><button class="btn btn-teal btn-xs">Apply</button></div></div>').join('')+
  '</div></div>';
  $$('.post-like-btn',('#page-home')).forEach(btn=>{btn.onclick=()=>{store.likePost(btn.dataset.postId);renderHome();};});
}


function renderPostBody(text) {
  return escHtml(text).replace(/@(\w[\w ]*)/g, '<span style="color:var(--teal);font-weight:600">@$1</span>');
}

function renderFeedPost(post) {
  const author = store.getUser(post.authorId);
  const wheel = store.get('wheels').find(w => w.id === post.wheelId);
  const typeBadge = post.type==='announcement'?'type-job':post.type==='referral'?'type-partnership':'type-service';
  let html = '<div class="feed-post">';
  html += '<div class="post-header">' + avatarHtml(author,'md');
  html += '<div class="post-author-info"><div class="post-author-name">' + escHtml(author?.name||'') + '</div>';
  html += '<div class="post-meta"><span>' + timeAgo(post.createdAt) + '</span>' + (wheel?'<span>-</span><span style="color:var(--teal-dim)">' + escHtml(wheel.name) + '</span>':'') + '</div></div>';
  html += '<span class="type-badge ' + typeBadge + '" style="margin-left:auto">' + post.type + '</span></div>';
  if (post.body) html += '<div class="post-body">' + renderPostBody(post.body) + '</div>';
  if (post.photo) html += '<div style="margin:.75rem 0"><img src="' + post.photo + '" style="width:100%;max-height:360px;object-fit:cover;border-radius:var(--radius-sm);display:block"></div>';
  if (post.video) html += '<div style="margin:.75rem 0"><video src="' + post.video + '" controls style="width:100%;max-height:320px;border-radius:var(--radius-sm);background:#000;display:block"></video></div>';
  if (post.link) {
    const href = post.link.startsWith('http') ? post.link : 'https://' + post.link;
    const label = post.link.replace(/^https?:\/\//,'').replace(/\/$/,'');
    html += '<a href="' + escHtml(href) + '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:.5rem;padding:.625rem .875rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--teal);font-size:.875rem;font-weight:500;text-decoration:none;margin:.75rem 0">';
    html += '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' + escHtml(label) + '</a>';
  }
  html += '<div class="post-actions"><button class="post-action-btn post-like-btn" data-post-id="' + post.id + '">';
  html += '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ' + post.likes + '</button></div>';
  html += '</div>';
  return html;
}

function renderDealCardCompact(d) {
  const STAGES=['proposed','negotiating','accepted','in_progress','completed','paid'], si=STAGES.indexOf(d.status);
  const other=store.getUser(d.buyerId===store.getMe()?.id?d.sellerId:d.buyerId);
  return '<div class="deal-card" onclick="navigate(\'deal-detail\',{dealId:\''+d.id+'\'})"><div class="deal-card-top"><div><div class="deal-title">'+escHtml(d.title)+'</div><div class="deal-parties">'+avatarHtml(other,'sm')+' '+escHtml(other?.name||'?')+'</div></div><div><div class="deal-amount">'+fmtMoney(d.priceCents/100,d.currency)+'</div>'+dealStatusBadge(d.status)+'</div></div><div class="deal-stages">'+STAGES.map((s,i)=>'<div class="deal-stage-dot '+(i<si?'done':i===si?'current':'')+'"></div>').join('')+'</div><div class="deal-card-footer"><span class="deal-due">'+icon('clock')+' '+(d.endDate||'TBD')+'</span><span class="t-micro c-text3">'+timeAgo(d.createdAt)+'</span></div></div>';
}

function renderWheels() {
  const myWheels=store.getMyWheels(), discoverWheels=store.get('wheels').filter(w=>!store.isMember(w.id));
  $('#page-wheels').innerHTML='<div class="page-head"><div class="page-head-left"><h1 class="page-title">My Wheels</h1><p class="page-sub">Your private network communities</p></div><div class="page-actions"><button class="btn btn-primary" onclick="openModal(\'modal-create-wheel\')">'+icon('plus')+' Create Wheel</button></div></div>'+
  (myWheels.length?'<div class="wheel-grid">'+myWheels.map(w=>renderWheelCard(w)).join('')+'</div>':'')+
  (discoverWheels.length?'<h2 class="t-h2 mb-3 mt-2">Discover Wheels</h2><div class="wheel-grid">'+discoverWheels.map(w=>renderWheelCard(w,true)).join('')+'</div>':'')+
  (!myWheels.length&&!discoverWheels.length?'<div class="empty-state"><div class="empty-icon">&#x2B22;</div><div class="empty-title">No Wheels yet</div><button class="btn btn-primary" onclick="openModal(\'modal-create-wheel\')">Create Your First Wheel</button></div>':'');
  $$('.wheel-card',document.getElementById('page-wheels')).forEach(c=>c.onclick=()=>navigate('wheel-detail',{wheelId:c.dataset.wheelId}));
  $$('.join-wheel-btn',document.getElementById('page-wheels')).forEach(btn=>{btn.onclick=e=>{e.stopPropagation();store.joinWheel(btn.dataset.wheelId);const w=store.get('wheels').find(x=>x.id===btn.dataset.wheelId);toast('Joined '+w.name+'!','success');updateShellDynamic(store.getMe());renderWheels();};});
}

function renderWheelCard(w,discover=false) {
  return '<div class="wheel-card" data-wheel-id="'+w.id+'" onclick="navigate(\'wheel-detail\',{wheelId:\''+w.id+'\'})" style="cursor:pointer"><div class="wheel-card-cover" style="background:'+(w.coverGradient||'var(--navy)')+'"></div><div class="wheel-card-body">'+hexBadge(w,48)+'<div class="wheel-card-name">'+escHtml(w.name)+'</div><div class="wheel-card-desc">'+escHtml(w.description)+'</div><div class="wheel-card-meta"><span class="wheel-meta-item">'+icon('users')+' '+fmt(w.memberCount)+'</span><span class="wheel-meta-item">'+escHtml(w.category)+'</span>'+(w.isEventWheel?'<span class="type-badge type-partnership" style="font-size:.6rem">Events</span>':'')+'</div></div><div class="wheel-card-footer"><span class="tier-badge tier-free">Open - Free</span>'+(discover?'<button class="btn btn-teal btn-sm join-wheel-btn" data-wheel-id="'+w.id+'">Join</button>':'')+'</div></div>';
}

function renderWheelDetail() {
  const wheel=store.get('wheels').find(w=>w.id===pageParams.wheelId);
  if(!wheel){navigate('wheels');return;}
  const members=store.getWheelMembers(wheel.id), posts=store.getPosts(wheel.id);
  const opps=store.getOpportunities({wheelId:wheel.id}), events=store.getEvents(wheel.id);
  const isCreator=wheel.creatorId===store.getMe()?.id;
  $('#page-wheel-detail').innerHTML='<div class="page-head"><div class="flex gap-3 items-center">'+hexBadge(wheel,44)+'<div><h1 class="page-title" style="margin-bottom:0">'+escHtml(wheel.name)+'</h1><p class="page-sub">'+escHtml(wheel.description)+'</p></div></div><div class="page-actions">'+(isCreator?'<button class="btn btn-outline btn-sm" onclick="openModal(\'modal-create-event\')">+ Event</button>':'')+'<button class="btn btn-teal btn-sm" onclick="openModal(\'modal-create-post\')">+ Post</button></div></div>'+
  '<div class="stats-grid" style="grid-template-columns:repeat(4,1fr)"><div class="stat-card"><span class="stat-label">Members</span><span class="stat-value">'+fmt(wheel.memberCount)+'</span></div><div class="stat-card"><span class="stat-label">Opportunities</span><span class="stat-value">'+opps.length+'</span></div><div class="stat-card"><span class="stat-label">Events</span><span class="stat-value">'+events.length+'</span></div><div class="stat-card"><span class="stat-label">Commission</span><span class="stat-value">'+wheel.dealCommission+'%</span></div></div>'+
  '<div class="tabs"><div class="tab-item active" data-tab="feed">Feed</div><div class="tab-item" data-tab="members">Members ('+members.length+')</div><div class="tab-item" data-tab="opportunities">Opportunities ('+opps.length+')</div><div class="tab-item" data-tab="events">Events ('+events.length+')</div></div>'+
  '<div class="tab-panel active" id="tab-feed">'+(posts.length?posts.map(p=>renderFeedPost(p)).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F4DD;</div><div class="empty-title">No posts yet</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-post\')">Post Something</button></div>')+'</div>'+
  '<div class="tab-panel" id="tab-members"><div class="member-grid">'+members.map(u=>renderMemberCard(u)).join('')+'</div></div>'+
  '<div class="tab-panel" id="tab-opportunities"><div class="flex justify-between items-center mb-3"><span class="t-body c-text3">'+opps.length+' open</span><button class="btn btn-teal btn-sm" onclick="openModal(\'modal-create-opp\')">'+icon('plus')+' Post</button></div><div class="opp-list">'+(opps.length?opps.map(o=>renderOppCard(o)).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F3AF;</div><div class="empty-title">No opportunities yet</div></div>')+'</div></div>'+
  '<div class="tab-panel" id="tab-events"><div class="flex justify-between items-center mb-3"><span class="t-body c-text3">'+events.length+' events</span>'+(isCreator?'<button class="btn btn-teal btn-sm" onclick="openModal(\'modal-create-event\')">'+icon('plus')+' Create Event</button>':'')+'</div>'+(events.length?events.map(ev=>renderEventCard(ev)).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F39F;</div><div class="empty-title">No events yet</div></div>')+'</div>';
  $$('.tab-item',document.getElementById('page-wheel-detail')).forEach(tab=>{tab.onclick=()=>{$$('.tab-item',document.getElementById('page-wheel-detail')).forEach(t=>t.classList.remove('active'));$$('.tab-panel',document.getElementById('page-wheel-detail')).forEach(p=>p.classList.remove('active'));tab.classList.add('active');document.getElementById('tab-'+tab.dataset.tab)?.classList.add('active');};});
  $$('.post-like-btn',document.getElementById('page-wheel-detail')).forEach(btn=>{btn.onclick=()=>{store.likePost(btn.dataset.postId);renderWheelDetail();};});
  $$('.member-card',document.getElementById('page-wheel-detail')).forEach(c=>c.onclick=()=>navigate('profile',{userId:c.dataset.userId}));
  $$('.opp-card',document.getElementById('page-wheel-detail')).forEach(c=>c.onclick=()=>{openModal('modal-opp-detail');renderOppDetail(c.dataset.oppId);});
}

function renderEventCard(ev) {
  const sold = ev.ticketsSold || 0;
  const rem = ev.ticketCount - sold;
  const pct = Math.round((sold / ev.ticketCount) * 100);
  const price = ev.ticketPrice > 0 ? fmtMoney(ev.ticketPrice) : 'Free';
  const btnLabel = rem === 0 ? 'Sold Out' : icon('ticket') + ' Buy Ticket - ' + price;
  const soldOut = rem === 0 ? 'disabled style="opacity:.5"' : '';
  const remColor = rem < 5 ? 'var(--red)' : 'var(--green)';
  return [
    '<div class="card mb-3">',
    '<div class="flex justify-between items-start mb-3">',
    '<div>',
    '<div class="t-h2 mb-1">' + escHtml(ev.title) + '</div>',
    '<div class="t-small c-text3 mb-1">' + icon('clock') + ' ' + escHtml(ev.date) + ' at ' + escHtml(ev.time) + '</div>',
    '<div class="t-small c-text3">' + icon('map') + ' ' + escHtml(ev.location) + '</div>',
    '</div>',
    '<div style="text-align:right">',
    '<div style="font-size:1.5rem;font-weight:900;color:var(--navy)">' + price + '</div>',
    '<div class="t-micro c-text4">per ticket</div>',
    '</div></div>',
    '<p class="t-body mb-3" style="color:var(--text-2)">' + escHtml(ev.description) + '</p>',
    '<div class="mb-3">',
    '<div class="flex justify-between mb-1">',
    '<span class="t-small c-text3">' + sold + ' / ' + ev.ticketCount + ' tickets sold</span>',
    '<span class="t-small" style="font-weight:600;color:' + remColor + '">' + rem + ' left</span>',
    '</div>',
    '<div style="height:6px;background:var(--surface-2);border-radius:99px;overflow:hidden">',
    '<div style="height:100%;width:' + pct + '%;background:var(--teal);border-radius:99px"></div>',
    '</div></div>',
    '<button class="btn btn-teal" onclick="buyTicket(' + JSON.stringify(ev.id) + ')" ' + soldOut + '>' + btnLabel + '</button>',
    '</div>'
  ].join('');
}
window.buyTicket=(eid)=>{if(store.buyTicket(eid)){toast('Ticket purchased! Check your email for confirmation.','success');renderWheelDetail();}else toast('Sorry, this event is sold out.','error');};

function renderMembers() {
  const q=(pageParams.q||'').toLowerCase(), filterAvail=pageParams.avail||'all';
  const seen=new Set();
  let members=store.getMyWheels().flatMap(w=>store.getWheelMembers(w.id)).filter(u=>{if(seen.has(u.id))return false;seen.add(u.id);return true;});
  if(q)members=members.filter(u=>u.name.toLowerCase().includes(q)||(u.bio||'').toLowerCase().includes(q)||(u.skills||[]).some(s=>s.toLowerCase().includes(q)));
  if(filterAvail!=='all')members=members.filter(u=>u.availability===filterAvail);
  $('#page-members').innerHTML='<div class="page-head"><div class="page-head-left"><h1 class="page-title">Members</h1><p class="page-sub">'+members.length+' people across your Wheels</p></div><div class="page-actions"><button class="btn btn-teal btn-sm" onclick="openModal(\'modal-create-deal\')">'+icon('plus')+' Create Deal</button></div></div>'+
  '<div class="filter-bar"><div class="filter-input-wrap"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="search-input-sm" id="member-search" placeholder="Search members..." value="'+escHtml(q)+'"></div><div class="filter-sep"></div><button class="filter-pill '+(filterAvail==='all'?'active':'')+'" onclick="navigate(\'members\',{avail:\'all\'})">All</button><button class="filter-pill '+(filterAvail==='available'?'active':'')+'" onclick="navigate(\'members\',{avail:\'available\'})">Available</button><button class="filter-pill '+(filterAvail==='limited'?'active':'')+'" onclick="navigate(\'members\',{avail:\'limited\'})">Limited</button></div>'+
  '<div class="member-grid">'+(members.length?members.map(u=>renderMemberCard(u)).join(''):'<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">&#x1F50D;</div><div class="empty-title">No members match</div></div>')+'</div>';
  let st; $('#member-search').oninput=e=>{clearTimeout(st);st=setTimeout(()=>navigate('members',{q:e.target.value,avail:filterAvail}),300);};
  $$('.member-card',document.getElementById('page-members')).forEach(c=>c.onclick=()=>navigate('profile',{userId:c.dataset.userId}));
}

function renderMemberCard(u) {
  const dotClass={available:'avail-available',limited:'avail-limited',unavailable:'avail-unavailable'}[u.availability]||'avail-unavailable';
  return '<div class="member-card" data-user-id="'+u.id+'"><div class="member-card-top"><div class="member-avatar-wrap">'+avatarHtml(u,'lg')+'<span class="member-avail-dot '+dotClass+'"></span></div><div class="flex-1"><div class="member-name">'+escHtml(u.name)+'</div><div class="member-title">'+escHtml(u.jobTitle||(u.skills||[])[0]||u.role)+'</div>'+(u.company?'<div class="t-micro c-text4">'+escHtml(u.company)+'</div>':'')+'<div class="member-trust"><div class="trust-bar-wrap"><div class="trust-bar-fill" style="width:'+u.trustScore+'%"></div></div><span class="trust-score-num">'+u.trustScore+'</span></div></div></div>'+(u.skills?.length?'<div class="skill-tags">'+u.skills.slice(0,4).map((s,i)=>'<span class="skill-tag'+(i===0?' primary':'')+'">'+escHtml(s)+'</span>').join('')+'</div>':'')+'<div class="member-card-footer"><span class="avail-badge '+(u.availability||'unavailable')+'">'+(u.availability==='available'?'Available':u.availability==='limited'?'Limited':'Unavailable')+'</span><button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();openModal(\'modal-create-deal\')">Deal</button></div></div>';
}

function renderOpportunities() {
  const filter=pageParams.type||'all', q=pageParams.q||'', opps=store.getOpportunities({type:filter,q});
  $('#page-opportunities').innerHTML='<div class="page-head"><div class="page-head-left"><h1 class="page-title">Opportunities</h1><p class="page-sub">'+opps.length+' open across your Wheels</p></div><div class="page-actions"><button class="btn btn-teal" onclick="openModal(\'modal-create-opp\')">'+icon('plus')+' Post Opportunity</button></div></div>'+
  '<div class="filter-bar">'+['all','job','partnership','collaboration','investment','referral','service'].map(t=>'<button class="filter-pill '+(filter===t?'active':'')+'" onclick="navigate(\'opportunities\',{type:\''+t+'\',q:\''+escHtml(q)+'\'})"><span class="type-badge type-'+t+'" style="'+(t==='all'?'background:none;color:inherit;font-size:.8125rem;font-weight:500;padding:0':'')+'">'+t.replace('_',' ')+'</span></button>').join('')+'<div class="filter-input-wrap" style="margin-left:auto"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="search-input-sm" id="opp-search" placeholder="Search..." value="'+escHtml(q)+'"></div></div>'+
  '<div class="opp-list">'+(opps.length?opps.map(o=>renderOppCard(o)).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F3AF;</div><div class="empty-title">No opportunities found</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-opp\')">Post One</button></div>')+'</div>';
  let st; $('#opp-search').oninput=e=>{clearTimeout(st);st=setTimeout(()=>navigate('opportunities',{type:filter,q:e.target.value}),300);};
  $$('.opp-card',document.getElementById('page-opportunities')).forEach(c=>c.onclick=()=>{openModal('modal-opp-detail');renderOppDetail(c.dataset.oppId);});
}

function renderOppCard(o) {
  const creator=store.getUser(o.creatorId);
  const valMap={job:fmtMoney(o.metadata?.salaryMin||0)+' - '+fmtMoney(o.metadata?.salaryMax||0),partnership:'Equity: '+(o.metadata?.equity||'TBD'),collaboration:'Equity: '+(o.metadata?.equity||'TBD'),investment:'Ticket: '+(o.metadata?.ticketSize||'TBD'),referral:'Bonus: '+(o.metadata?.bonus?fmtMoney(o.metadata.bonus):'TBD'),service:'Budget: '+(o.metadata?.budgetMin?fmtMoney(o.metadata.budgetMin)+' - '+fmtMoney(o.metadata.budgetMax):'TBD'),service_request:'Budget: TBD'};
  return '<div class="opp-card" data-opp-id="'+o.id+'"><div class="opp-main"><div class="opp-title">'+escHtml(o.title)+'</div><div class="opp-meta"><span class="type-badge type-'+o.type+'">'+o.type.replace('_',' ')+'</span>'+avatarHtml(creator,'sm')+'<span class="opp-meta-item">'+escHtml(creator?.name||'')+'</span>'+(o.remoteOk?'<span class="opp-meta-item">Remote OK</span>':'')+'<span class="opp-meta-item">'+o.applicationCount+' applied</span></div><div class="opp-desc">'+escHtml(o.description)+'</div><div class="skill-tags mt-2">'+(o.skills||[]).map(s=>'<span class="skill-tag">'+escHtml(s)+'</span>').join('')+'</div></div><div class="opp-right"><div class="opp-value">'+(valMap[o.type]||'')+'</div><div class="opp-posted">'+timeAgo(o.createdAt)+'</div><button class="btn btn-teal btn-sm mt-2" onclick="event.stopPropagation();toast(\'Application submitted!\',\'success\');this.textContent=\'Applied\';this.disabled=true">Apply</button></div></div>';
}

function renderOppDetail(oppId) {
  const o=store.get('opportunities').find(x=>x.id===oppId); if(!o)return;
  const creator=store.getUser(o.creatorId);
  $('#modal-opp-detail .modal-title').textContent=o.title;
  $('#modal-opp-body').innerHTML='<div class="flex gap-3 items-start mb-4">'+avatarHtml(creator,'md')+'<div><div class="t-h3">'+escHtml(creator?.name||'')+'</div><div class="t-small c-text3">'+timeAgo(o.createdAt)+' - '+o.applicationCount+' applied</div></div><span class="type-badge type-'+o.type+'" style="margin-left:auto">'+o.type.replace('_',' ')+'</span></div><p class="t-body mb-4" style="line-height:1.7">'+escHtml(o.description)+'</p><div class="skill-tags mb-4">'+(o.skills||[]).map(s=>'<span class="skill-tag primary">'+escHtml(s)+'</span>').join('')+'</div><div class="card card-sm" style="background:var(--surface)"><div class="form-row"><div><div class="t-label c-text4 mb-1">Location</div><div class="t-body">'+escHtml(o.location)+(o.remoteOk?' (Remote OK)':'')+'</div></div><div><div class="t-label c-text4 mb-1">Expires</div><div class="t-body">'+(o.expiresAt?new Date(o.expiresAt).toLocaleDateString():'Open')+'</div></div></div></div>';
}

function renderDeals() {
  const deals=store.getMyDeals(), me=store.getMe(), filter=pageParams.status||'all';
  const filtered=filter==='all'?deals:deals.filter(d=>d.status===filter);
  const STAGES=['proposed','negotiating','accepted','in_progress','completed','paid'];
  $('#page-deals').innerHTML='<div class="page-head"><div class="page-head-left"><h1 class="page-title">Deals</h1><p class="page-sub">'+deals.length+' total</p></div><div class="page-actions"><button class="btn btn-teal" onclick="openModal(\'modal-create-deal\')">'+icon('plus')+' Create Deal</button></div></div>'+
  '<div class="filter-bar">'+['all','proposed','in_progress','completed','paid'].map(s=>{const cnt=s==='all'?deals.length:deals.filter(d=>d.status===s).length;return cnt>0||s==='all'?'<button class="filter-pill '+(filter===s?'active':'')+'" onclick="navigate(\'deals\',{status:\''+s+'\'})">'+s.replace('_',' ')+' ('+cnt+')</button>':'';}).join('')+'</div>'+
  '<div class="deal-list">'+(filtered.length?filtered.map(d=>{const other=store.getUser(d.buyerId===me.id?d.sellerId:d.buyerId),si=STAGES.indexOf(d.status);return '<div class="deal-card" onclick="navigate(\'deal-detail\',{dealId:\''+d.id+'\'})"><div class="deal-card-top"><div><div class="deal-title">'+escHtml(d.title)+'</div><div class="deal-parties">'+avatarHtml(other,'sm')+' '+escHtml(other?.name||'?')+' - '+(d.buyerId===me.id?'You are Buyer':'You are Seller')+'</div></div><div style="text-align:right"><div class="deal-amount">'+fmtMoney(d.priceCents/100,d.currency)+'</div>'+dealStatusBadge(d.status)+'</div></div><div class="deal-stages">'+STAGES.map((s,i)=>'<div class="deal-stage-dot '+(i<si?'done':i===si?'current':'')+'"></div>').join('')+'</div><div class="deal-card-footer"><span class="deal-due">'+icon('clock')+' '+(d.endDate||'TBD')+'</span><span class="t-micro c-text3">'+(d.messages?.length||0)+' messages</span></div></div>';}).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F91D;</div><div class="empty-title">No deals yet</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-deal\')">Create Deal</button></div>')+'</div>';
}

function renderDealDetail() {
  const deal=store.getDeal(pageParams.dealId); if(!deal){navigate('deals');return;}
  const me=store.getMe(), buyer=store.getUser(deal.buyerId), seller=store.getUser(deal.sellerId), isBuyer=deal.buyerId===me.id;
  const STAGES=['proposed','negotiating','accepted','in_progress','completed','paid'], si=STAGES.indexOf(deal.status);
  const fees=(deal.platformFeePct+deal.creatorCommissionPct)/100*deal.priceCents/100, sellerGets=deal.priceCents/100-fees;
  const actions={proposed:isBuyer?[]:[{label:'Accept Deal',action:"updateDealStatus('"+deal.id+"','accepted')",cls:'btn-teal'},{label:'Counter',action:"updateDealStatus('"+deal.id+"','negotiating')",cls:'btn-outline'}],negotiating:[{label:'Accept Terms',action:"updateDealStatus('"+deal.id+"','accepted')",cls:'btn-teal'}],accepted:isBuyer?[{label:'Start Work',action:"updateDealStatus('"+deal.id+"','in_progress')",cls:'btn-teal'}]:[],in_progress:!isBuyer?[{label:'Mark Complete',action:"updateDealStatus('"+deal.id+"','completed')",cls:'btn-primary'}]:[{label:'Approve and Release Payment',action:"updateDealStatus('"+deal.id+"','paid')",cls:'btn-teal'},{label:'Raise Dispute',action:"updateDealStatus('"+deal.id+"','disputed')",cls:'btn-danger'}],completed:isBuyer?[{label:'Approve and Release Payment',action:"updateDealStatus('"+deal.id+"','paid')",cls:'btn-teal'}]:[],paid:[],disputed:[]};
  $('#page-deal-detail').innerHTML='<div class="mb-3"><button class="btn btn-ghost btn-sm" onclick="navigate(\'deals\')">Back to Deals</button></div>'+
  '<div class="deal-detail-header"><div class="flex justify-between items-start mb-3"><div><div class="deal-detail-title">'+escHtml(deal.title)+'</div><div class="deal-detail-meta">'+dealStatusBadge(deal.status)+'<span class="t-small c-text3">Created '+timeAgo(deal.createdAt)+'</span></div></div><div style="text-align:right"><div class="deal-detail-amount">'+fmtMoney(deal.priceCents/100,deal.currency)+'</div><div class="deal-detail-amount-label">'+(deal.paymentType||'lump sum').replace('_',' ')+'</div></div></div>'+
  '<div class="deal-stages mb-4">'+STAGES.map((s,i)=>'<div class="deal-stage-dot '+(i<si?'done':i===si?'current':'')+'" title="'+s+'"></div>').join('')+'</div>'+
  '<div class="two-col-equal"><div class="card card-sm" style="background:var(--surface)"><div class="t-label c-text4 mb-2">Buyer</div><div class="flex gap-2 items-center">'+avatarHtml(buyer,'md')+'<div class="t-h3">'+escHtml(buyer?.name||'?')+'</div></div></div><div class="card card-sm" style="background:var(--surface)"><div class="t-label c-text4 mb-2">Seller</div><div class="flex gap-2 items-center">'+avatarHtml(seller,'md')+'<div class="t-h3">'+escHtml(seller?.name||'?')+'</div></div></div></div>'+
  (actions[deal.status]?.length?'<div class="flex gap-2 mt-4">'+actions[deal.status].map(a=>'<button class="btn '+a.cls+'" onclick="'+a.action+'">'+a.label+'</button>').join('')+'</div>':'')+'</div>'+
  '<div class="two-col"><div><div class="card mb-3"><h3 class="t-h2 mb-2">Scope</h3><p class="t-body" style="line-height:1.7;color:var(--text-2)">'+escHtml(deal.scope)+'</p></div><div class="card mb-3"><h3 class="t-h2 mb-3">Deliverables</h3>'+(deal.deliverables?.map(del=>'<div class="deliverable-item '+(del.done?'done':'')+'"><div class="deliverable-check '+(del.done?'checked':'')+'">'+( del.done?icon('check'):'')+'</div><div class="deliverable-title" style="'+(del.done?'text-decoration:line-through;opacity:.6':'')+'">'+escHtml(del.title)+'</div></div>').join('')||'<div class="t-body c-text3">No deliverables</div>')+'</div>'+
  '<div class="card card-sm" style="background:var(--surface)"><div class="t-label c-text4 mb-2">Fee Breakdown</div><div class="flex justify-between mb-1"><span class="t-small c-text3">Deal value</span><span class="t-small">'+fmtMoney(deal.priceCents/100)+'</span></div><div class="flex justify-between mb-1"><span class="t-small c-text3">Platform fee ('+deal.platformFeePct+'%)</span><span class="t-small c-red">-'+fmtMoney(deal.priceCents/100*deal.platformFeePct/100)+'</span></div><div class="flex justify-between mb-2"><span class="t-small c-text3">Creator commission ('+deal.creatorCommissionPct+'%)</span><span class="t-small c-red">-'+fmtMoney(deal.priceCents/100*deal.creatorCommissionPct/100)+'</span></div><div class="divider" style="margin:.5rem 0"></div><div class="flex justify-between"><span class="t-body" style="font-weight:700">Seller receives</span><span class="t-body c-green" style="font-weight:700">'+fmtMoney(sellerGets)+'</span></div></div></div>'+
  '<div><div class="card card-flush"><div class="notif-panel-head" style="padding:.875rem 1rem"><h3 class="t-h2">Messages</h3></div><div class="message-thread" id="deal-messages">'+(deal.messages?.map(msg=>{const isMe2=msg.senderId===me.id,sender=store.getUser(msg.senderId);return '<div class="message-item '+(isMe2?'mine':'')+'">'+(!isMe2?avatarHtml(sender,'sm'):'')+'<div><div class="message-bubble">'+escHtml(msg.body)+'</div><div class="message-time">'+timeAgo(msg.createdAt)+'</div></div></div>';}).join('')||'<div class="empty-state" style="padding:1.5rem">No messages yet</div>')+'</div><div class="message-input-row"><input class="message-input" id="deal-msg-input" placeholder="Write a message..."><button class="btn btn-teal btn-sm" id="deal-msg-send">'+icon('send')+'</button></div></div></div></div>';
  const sendMsg=()=>{const input=$('#deal-msg-input'),body=input.value.trim();if(!body)return;store.addDealMessage(deal.id,body);input.value='';renderDealDetail();const t=$('#deal-messages');if(t)t.scrollTop=t.scrollHeight;};
  $('#deal-msg-send').onclick=sendMsg; $('#deal-msg-input').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}};
  const t=$('#deal-messages');if(t)t.scrollTop=t.scrollHeight;
}
window.updateDealStatus=(id,status)=>{store.updateDeal(id,{status});toast('Deal moved to '+status.replace('_',' '),'success');updateShellDynamic(store.getMe());renderDealDetail();};


function renderAboutCard(u, isMe) {
  let html = '<div class="card mb-4"><h2 class="t-h2 mb-3">About</h2>';
  if (isMe) {
    html += '<textarea class="form-control mb-2" id="profile-bio" rows="3">' + escHtml(u.bio||'') + '</textarea>';
    html += '<div class="form-row mb-2">';
    html += '<div class="form-group"><label class="form-label">Job Title</label><input class="form-control" id="profile-title" value="' + escHtml(u.jobTitle||'') + '" placeholder="CEO, Designer..."></div>';
    html += '<div class="form-group"><label class="form-label">Company</label><input class="form-control" id="profile-company" value="' + escHtml(u.company||'') + '" placeholder="Acme Corp..."></div>';
    html += '</div>';
    html += '<div class="form-group mb-3"><label class="form-label">Website / Link</label><input class="form-control" id="profile-website" value="' + escHtml(u.website||'') + '" placeholder="yoursite.com or linkedin.com/in/you"></div>';
    html += '<div class="form-group mb-3"><label class="form-label">Additional Links <span>(portfolio, social, etc.)</span></label>';
    html += '<div id="profile-links-list" style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:.625rem">';
    (u.links||[]).forEach((lnk,i) => {
      html += '<div style="display:flex;gap:.5rem;align-items:center"><input class="form-control profile-link-input" value="' + escHtml(lnk) + '" placeholder="https://..." style="flex:1"><button class="btn btn-ghost btn-xs" onclick="removeLink(' + i + ')" style="color:var(--red)">Remove</button></div>';
    });
    html += '</div><button class="btn btn-outline btn-xs" onclick="addLinkField()">+ Add Link</button></div>';
    html += '<button class="btn btn-outline btn-sm" onclick="saveProfileInfo()">Save</button>';
  } else {
    html += '<p class="t-body mb-3" style="color:var(--text-2);line-height:1.7">' + escHtml(u.bio||'No bio yet.') + '</p>';
    const links = (u.links||[]).filter(Boolean);
    if (links.length) {
      html += '<div style="display:flex;flex-direction:column;gap:.5rem">';
      links.forEach(lnk => {
        const href = lnk.startsWith('http') ? lnk : 'https://' + lnk;
        const label = lnk.replace(/^https?:\/\//,'').replace(/\/$/,'');
        html += '<a href="' + escHtml(href) + '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:.5rem;color:var(--teal);font-size:.875rem;font-weight:500;text-decoration:none">';
        html += '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
        html += escHtml(label) + '</a>';
      });
      html += '</div>';
    }
  }
  html += '</div>';
  return html;
}

window.addLinkField = () => {
  const list = document.getElementById('profile-links-list');
  if (!list) return;
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:.5rem;align-items:center';
  const idx = list.children.length;
  div.innerHTML = '<input class="form-control profile-link-input" placeholder="https://..." style="flex:1"><button class="btn btn-ghost btn-xs" onclick="this.parentElement.remove()" style="color:var(--red)">Remove</button>';
  list.appendChild(div);
};

window.removeLink = (i) => {
  const me = store.getMe();
  const links = [...(me.links||[])];
  links.splice(i, 1);
  store.updateMe({links});
  toast('Link removed', 'success');
  renderProfile();
};

function renderProfile() {
  const userId=pageParams.userId||store.getMe()?.id, u=store.getUser(userId);
  if(!u){navigate('home');return;}
  const me=store.getMe(), isMe=u.id===me?.id;
  const myDeals=store.get('deals').filter(d=>d.sellerId===u.id||d.buyerId===u.id);

  const picSection = isMe ? (
    '<div style="display:flex;gap:.625rem;margin-top:1rem;flex-wrap:wrap">' +
    [0,1,2,3,4].map(i => {
      const pic = (u.profilePics||[])[i];
      if(pic) return '<div style="position:relative"><img src="'+pic+'" style="width:150px;height:160px;border-radius:var(--radius-sm);object-fit:cover;border:3px solid rgba(255,255,255,.25);box-shadow:0 4px 16px rgba(0,0,0,.3)"><label style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.4);border-radius:var(--radius-sm);opacity:0;cursor:pointer;transition:.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0">'+icon('camera')+'<input type="file" accept="image/*" style="display:none" onchange="uploadPic(event,'+i+')"></label></div>';
      return '<label style="width:150px;height:160px;border-radius:var(--radius-sm);border:2px dashed rgba(255,255,255,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,.5);font-size:.625rem;gap:.25rem">'+icon('camera')+'Photo '+(i+1)+'<input type="file" accept="image/*" style="display:none" onchange="uploadPic(event,'+i+')"></label>';
    }).join('') + '</div>'
  ) : ((u.profilePics||[]).filter(Boolean).length > 1 ?
    '<div style="display:flex;gap:.5rem;margin-top:1rem;flex-wrap:wrap">'+(u.profilePics||[]).slice(1).filter(Boolean).map(p=>'<img src="'+p+'" style="width:150px;height:160px;border-radius:var(--radius-sm);object-fit:cover">').join('')+'</div>' : '');

  $('#page-profile').innerHTML='<div class="mb-3"><button class="btn btn-ghost btn-sm" onclick="navigate(\'members\')">Back</button></div>'+
  '<div class="profile-header" style="padding:1.75rem 2rem">'+
  // Top row: photo + name/info side by side + trust score on far right
  '<div style="display:flex;align-items:center;gap:1.75rem;flex-wrap:wrap">'+

  // Photo with upload button
  '<div style="position:relative;flex-shrink:0">'+
  profilePhotoHtml(u)+
  (isMe?'<label style="position:absolute;bottom:4px;right:4px;width:32px;height:32px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--navy);box-shadow:0 2px 8px rgba(0,0,0,.4)">'+icon('camera')+'<input type="file" accept="image/*" style="display:none" onchange="uploadPic(event,0)"></label>':'')+
  '</div>'+

  // Name + info block
  '<div style="flex:1;min-width:180px">'+
  '<h1 class="profile-name" style="font-size:1.75rem;margin-bottom:.25rem;line-height:1.1">'+escHtml(u.name)+'</h1>'+
  (u.jobTitle?'<div style="color:rgba(255,255,255,.9);font-size:1rem;font-weight:600;margin-bottom:.2rem">'+escHtml(u.jobTitle)+(u.company?' at '+escHtml(u.company):'')+'</div>':'')+
  '<div style="color:rgba(255,255,255,.55);font-size:.8125rem;margin-bottom:.75rem">'+escHtml(u.userType||u.role)+'</div>'+
  '<div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">'+
  (u.location?'<span style="color:rgba(255,255,255,.6);font-size:.8125rem;display:flex;align-items:center;gap:.3rem">'+icon('map')+' '+escHtml(u.location)+'</span>':'')+
  '<span class="avail-badge '+(u.availability||'unavailable')+'" style="font-size:.75rem">'+(u.availability==='available'?'Available':u.availability==='limited'?'Limited':'Unavailable')+'</span>'+
  (u.website?'<a href="'+(u.website.startsWith('http')?u.website:'https://'+u.website)+'" target="_blank" rel="noopener" style="color:var(--teal);font-size:.8125rem;display:flex;align-items:center;gap:.3rem;text-decoration:none;font-weight:500">'+
  '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'+
  escHtml(u.website.replace(/^https?:\/\//,'').replace(/\/$/,''))+'</a>':'')+
  '</div>'+
  '</div>'+

  // Trust score on the right
  '<div style="flex-shrink:0;text-align:center;margin-left:auto">'+
  '<div class="trust-score-circle" style="--pct:'+u.trustScore+'%;width:76px;height:76px">'+
  '<div class="trust-score-inner" style="width:58px;height:58px">'+
  '<div class="trust-score-num-lg" style="font-size:1.25rem">'+u.trustScore+'</div>'+
  '<div class="trust-score-label">Trust</div>'+
  '</div></div>'+
  '<div style="color:rgba(255,255,255,.4);font-size:.625rem;margin-top:.25rem;text-transform:uppercase;letter-spacing:.06em">Score</div>'+
  '</div>'+
  '</div>'+

  // Additional photos row below
  (picSection?'<div style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,.1)">'+
  '<div style="font-size:.6875rem;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:.07em;text-transform:uppercase;margin-bottom:.625rem">Photos</div>'+
  '<div style="display:flex;gap:.625rem;flex-wrap:wrap">'+
  [1,2,3,4].map(i => {
    const pic = (u.profilePics||[])[i];
    if(pic) return '<div style="position:relative"><img src="'+pic+'" style="width:90px;height:90px;border-radius:var(--radius-sm);object-fit:cover;border:2px solid rgba(255,255,255,.2)"><label style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);border-radius:var(--radius-sm);opacity:0;cursor:pointer;transition:.15s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0">'+icon('camera')+'<input type="file" accept="image/*" style="display:none" onchange="uploadPic(event,'+i+')"></label></div>';
    return isMe?'<label style="width:90px;height:90px;border-radius:var(--radius-sm);border:2px dashed rgba(255,255,255,.25);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,.4);font-size:.625rem;gap:.25rem;transition:.15s">'+icon('camera')+'<span>Photo '+(i+1)+'</span><input type="file" accept="image/*" style="display:none" onchange="uploadPic(event,'+i+')"></label>':'';
  }).join('')+
  '</div></div>':'')+
  '</div>'+
  (!isMe?'<div class="flex gap-2 mb-4"><button class="btn btn-primary" onclick="openModal(\'modal-create-deal\')">Create Deal</button><button class="btn btn-outline" onclick="toast(\'Messaging coming in V2\',\'default\')">Message</button><button class="btn btn-ghost" onclick="toast(\'Referral sent!\',\'success\')">Refer</button></div>':'')+
  '<div class="two-col"><div>'+
  renderAboutCard(u, isMe)+  (u.introVideo?'<div class="card mb-4"><h2 class="t-h2 mb-3">'+icon('video')+' Intro Video</h2><video src="'+u.introVideo+'" controls style="width:100%;border-radius:var(--radius-sm);background:#000;max-height:240px"></video>'+(isMe?'<div class="mt-2"><label class="btn btn-ghost btn-sm" style="cursor:pointer">Replace Video<input type="file" accept="video/*" style="display:none" onchange="uploadVideo(event)"></label></div>':'')+'</div>':
  (isMe?'<div class="card mb-4"><h2 class="t-h2 mb-3">'+icon('video')+' Intro Video</h2><p class="t-small c-text3 mb-3">Add a short video so people can get to know you before reaching out.</p><label class="btn btn-outline btn-sm" style="cursor:pointer">'+icon('video')+' Upload Intro Video<input type="file" accept="video/*" style="display:none" onchange="uploadVideo(event)"></label></div>':''))+
  '<div class="card mb-4"><h2 class="t-h2 mb-3">'+icon('briefcase')+' Work History</h2>'+
  (u.workHistory||[]).map((j,i)=>'<div style="padding:.875rem;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:.625rem"><div class="flex justify-between items-start"><div><div class="t-h3">'+escHtml(j.title)+'</div><div class="t-small c-text3">'+escHtml(j.company)+' - '+escHtml(j.from)+' to '+escHtml(j.to)+'</div></div>'+(isMe?'<button class="btn btn-ghost btn-xs" onclick="removeJob('+i+')">Remove</button>':'')+'</div>'+(j.desc?'<p class="t-small c-text3 mt-1">'+escHtml(j.desc)+'</p>':'')+'</div>').join('')+
  (isMe?'<div style="border:1.5px dashed var(--border);border-radius:var(--radius-sm);padding:.875rem;margin-top:.5rem"><div class="form-row mb-2"><div class="form-group"><label class="form-label">Title</label><input class="form-control" id="job-title" placeholder="Product Manager"></div><div class="form-group"><label class="form-label">Company</label><input class="form-control" id="job-company" placeholder="Acme Corp"></div></div><div class="form-row mb-2"><div class="form-group"><label class="form-label">From</label><input class="form-control" id="job-from" placeholder="2022"></div><div class="form-group"><label class="form-label">To</label><input class="form-control" id="job-to" placeholder="Present"></div></div><div class="form-group mb-2"><label class="form-label">Description</label><input class="form-control" id="job-desc" placeholder="What did you do?"></div><button class="btn btn-outline btn-sm" onclick="addJob()">+ Add Position</button></div>':'')+'</div>'+
  (isMe||u.resume?'<div class="card mb-4"><h2 class="t-h2 mb-3">'+icon('file')+' Resume</h2>'+(u.resume?'<div class="flex gap-2 items-center"><span class="t-small c-green">Resume uploaded</span><a href="'+u.resume+'" target="_blank" class="btn btn-outline btn-sm">View</a>'+(isMe?'<label class="btn btn-ghost btn-sm" style="cursor:pointer">Replace<input type="file" accept=".pdf,.doc,.docx" style="display:none" onchange="uploadResume(event)"></label>':'')+'</div>':'<p class="t-small c-text3 mb-3">Upload your resume so members can learn more about you.</p><label class="btn btn-outline btn-sm" style="cursor:pointer">'+icon('file')+' Upload Resume<input type="file" accept=".pdf,.doc,.docx" style="display:none" onchange="uploadResume(event)"></label>')+'</div>':'')+
  '</div><div>'+
  '<div class="card mb-4"><h2 class="t-h2 mb-3">Reputation</h2><div class="reputation-grid"><div class="rep-item"><div class="rep-value">'+(u.deals||0)+'</div><div class="rep-label">Deals Done</div></div>'+(isMe?'<div class="rep-item"><div class="rep-value">'+fmtMoney(u.revenue||0)+'</div><div class="rep-label">Revenue</div></div>':'')+'<div class="rep-item"><div class="rep-value">'+(u.referralsSent||0)+'</div><div class="rep-label">Referrals</div></div><div class="rep-item"><div class="rep-value">'+(u.referralsConverted||0)+'</div><div class="rep-label">Converted</div></div><div class="rep-item"><div class="rep-value">'+(u.reviewAvg?u.reviewAvg+'*':'-')+'</div><div class="rep-label">Avg Review</div></div><div class="rep-item"><div class="rep-value">'+u.trustScore+'</div><div class="rep-label">Trust Score</div></div></div></div>'+
  '<div class="card mb-4"><h2 class="t-h2 mb-3">Skills</h2><div class="skill-tags">'+(u.skills||[]).map(s=>'<span class="skill-tag primary">'+escHtml(s)+'</span>').join('')+'</div>'+(isMe?'<input class="form-control mt-3" id="profile-skills" placeholder="Add skills, comma-separated" value="'+escHtml((u.skills||[]).join(', '))+'" style="margin-top:.75rem"><button class="btn btn-outline btn-sm mt-2" onclick="saveSkills()">Update Skills</button>':'')+'</div>'+
  '<div class="card"><h2 class="t-h2 mb-3">Recent Deals</h2>'+
  (myDeals.slice(0,3).length?myDeals.slice(0,3).map(d=>{const other=store.getUser(d.buyerId===u.id?d.sellerId:d.buyerId);return '<div class="flex justify-between items-center mb-3">'+avatarHtml(other,'sm')+'<div class="flex-1" style="margin-left:.5rem"><div class="t-small" style="font-weight:600">'+escHtml(d.title)+'</div><div class="t-micro c-text4">'+timeAgo(d.createdAt)+'</div></div>'+dealStatusBadge(d.status)+'</div>';}).join(''):'<div class="t-body c-text3">No deals yet</div>')+
  '</div></div></div>';
}

window.saveProfileInfo=()=>{
  const links = [...$$('.profile-link-input')].map(i=>i.value.trim()).filter(Boolean);
  store.updateMe({
    bio:$('#profile-bio').value.trim(),
    jobTitle:$('#profile-title').value.trim(),
    company:$('#profile-company').value.trim(),
    website:$('#profile-website')?.value.trim()||'',
    links
  });
  toast('Profile updated','success');
};
window.saveSkills=()=>{store.updateMe({skills:$('#profile-skills').value.split(',').map(s=>s.trim()).filter(Boolean)});toast('Skills updated','success');renderProfile();};
window.addJob=()=>{
  const title=$('#job-title').value.trim(),company=$('#job-company').value.trim();
  if(!title||!company){toast('Title and company required','error');return;}
  const me=store.getMe(),history=[...(me.workHistory||[]),{id:uid(),title,company,from:$('#job-from').value.trim()||'',to:$('#job-to').value.trim()||'Present',desc:$('#job-desc').value.trim()}];
  store.updateMe({workHistory:history});toast('Position added','success');renderProfile();
};
window.removeJob=(i)=>{const me=store.getMe(),history=[...(me.workHistory||[])];history.splice(i,1);store.updateMe({workHistory:history});toast('Removed','success');renderProfile();};
window.uploadPic=(e,slot)=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>{const me=store.getMe(),pics=[...(me.profilePics||[])];pics[slot]=ev.target.result;store.updateMe({profilePics:pics});toast('Photo uploaded','success');renderProfile();};r.readAsDataURL(file);};
window.uploadVideo=(e)=>{const file=e.target.files[0];if(!file)return;if(file.size>50*1024*1024){toast('Video must be under 50MB','error');return;}const r=new FileReader();r.onload=ev=>{store.updateMe({introVideo:ev.target.result});toast('Video uploaded','success');renderProfile();};r.readAsDataURL(file);};
window.uploadResume=(e)=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>{store.updateMe({resume:ev.target.result});toast('Resume uploaded','success');renderProfile();};r.readAsDataURL(file);};

function renderAnalytics() {
  const me=store.getMe(),myWheels=store.getMyWheels(),allDeals=store.get('deals').filter(d=>myWheels.some(w=>w.id===d.wheelId));
  const paid=allDeals.filter(d=>d.status==='paid'),gmv=paid.reduce((s,d)=>s+d.priceCents/100,0),fees=paid.reduce((s,d)=>s+d.priceCents/100*(d.creatorCommissionPct/100),0);
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul'],rev=[1200,2100,1800,3400,2800,4200,5100],maxRev=Math.max(...rev);
  $('#page-analytics').innerHTML='<div class="page-head"><div class="page-head-left"><h1 class="page-title">Analytics</h1><p class="page-sub">Your network at a glance</p></div></div>'+
  '<div class="stats-grid"><div class="stat-card"><span class="stat-label">Total Members</span><span class="stat-value">'+fmt(myWheels.reduce((s,w)=>s+w.memberCount,0))+'</span></div><div class="stat-card"><span class="stat-label">GMV</span><span class="stat-value">'+fmtMoney(gmv)+'</span></div><div class="stat-card"><span class="stat-label">Commission Earned</span><span class="stat-value">'+fmtMoney(fees)+'</span></div><div class="stat-card"><span class="stat-label">Active Deals</span><span class="stat-value">'+allDeals.filter(d=>d.status==='in_progress').length+'</span></div></div>'+
  '<div class="two-col"><div><div class="analytics-chart"><h3 class="t-h2 mb-3">Revenue (Monthly)</h3><div class="chart-bars">'+months.map((m,i)=>'<div class="chart-bar-group"><div class="chart-bar-val">'+fmtMoney(rev[i])+'</div><div class="chart-bar" style="height:'+Math.round(rev[i]/maxRev*100)+'%;background:'+(i===months.length-1?'var(--teal)':'var(--navy)')+'"></div><div class="chart-bar-label">'+m+'</div></div>').join('')+'</div></div></div>'+
  '<div><div class="card"><h3 class="t-h2 mb-3">Top Members by Trust</h3>'+myWheels.flatMap(w=>store.getWheelMembers(w.id)).filter((u,i,a)=>a.findIndex(x=>x.id===u.id)===i).sort((a,b)=>b.trustScore-a.trustScore).slice(0,5).map(u=>'<div class="flex gap-2 items-center mb-3">'+avatarHtml(u,'sm')+'<div class="flex-1"><div class="t-small" style="font-weight:600">'+escHtml(u.name)+'</div></div><div class="trust-bar-wrap" style="width:80px"><div class="trust-bar-fill" style="width:'+u.trustScore+'%"></div></div><span class="trust-score-num">'+u.trustScore+'</span></div>').join('')+'</div></div></div>';
}

function buildModals() {
  const templateGrid=SUGGESTED_WHEELS.map(w=>'<div class="auth-role-card" data-tpl=\''+JSON.stringify(w)+'\' onclick="applyTemplate(this)" style="padding:.625rem;text-align:center"><div style="width:28px;height:32px;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);background:'+w.hex+';display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:.75rem;margin:0 auto .375rem">'+w.emoji+'</div><div style="font-size:.6875rem;font-weight:600">'+w.name+'</div></div>').join('');
  return '<div class="modal-overlay" id="modal-create-wheel"><div class="modal modal-lg"><div class="modal-header"><span class="modal-title">Create a Wheel</span><button class="modal-close">x</button></div><div class="modal-body"><p class="t-small c-text3 mb-3">All Wheels on Fairriss are open and free to join.</p><div class="form-group mb-3"><label class="form-label">Start from a template:</label><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-top:.5rem" id="wheel-templates">'+templateGrid+'</div></div><div class="divider"></div><div class="form-stack"><div class="form-group"><label class="form-label">Wheel Name *</label><input class="form-control" id="cw-name" placeholder="The Founders Circle"></div><div class="form-group"><label class="form-label">Description *</label><textarea class="form-control" id="cw-desc" rows="3" placeholder="What is this Wheel about?"></textarea></div><div class="form-row"><div class="form-group"><label class="form-label">Category</label><select class="form-control" id="cw-cat"><option>Startup</option><option>Design</option><option>Marketing</option><option>Technology</option><option>Finance</option><option>Business</option><option>Events</option><option>Community</option><option>Talent</option><option>Other</option></select></div><div class="form-group"><label class="form-label">Deal Commission (%)</label><input class="form-control" id="cw-commission" type="number" min="0" max="15" step="0.5" placeholder="2.5"></div></div><div class="form-group"><label class="form-label">Accent Color</label><input class="form-control" id="cw-color" type="color" value="#00C9A7" style="height:40px;cursor:pointer"></div><label style="display:flex;align-items:center;gap:.625rem;cursor:pointer"><input type="checkbox" id="cw-is-event" style="width:18px;height:18px;accent-color:var(--teal)"><span class="t-body">This is an Event Wheel (enables ticket selling)</span></label></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="create-wheel-btn">Create Wheel</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-create-opp"><div class="modal modal-lg"><div class="modal-header"><span class="modal-title">Post an Opportunity</span><button class="modal-close">x</button></div><div class="modal-body"><div class="form-stack"><div class="form-group"><label class="form-label">Type *</label><select class="form-control" id="co-type"><option value="job">Job</option><option value="partnership">Partnership</option><option value="collaboration">Collaboration</option><option value="investment">Investment</option><option value="referral">Referral</option><option value="service">Service Request</option></select></div><div class="form-group"><label class="form-label">Title *</label><input class="form-control" id="co-title" placeholder="Head of Product at Acme Corp"></div><div class="form-group"><label class="form-label">Description *</label><textarea class="form-control" id="co-desc" rows="4" placeholder="Tell members about this opportunity..."></textarea></div><div class="form-row"><div class="form-group"><label class="form-label">Location</label><input class="form-control" id="co-location" placeholder="Remote, New York..."></div><div class="form-group"><label class="form-label">Skills Required</label><input class="form-control" id="co-skills" placeholder="React, Design, Growth..."></div></div><div class="form-group"><label class="form-label">Compensation</label><input class="form-control" id="co-comp" placeholder="$120k - $150k or $500 bonus..."></div></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="create-opp-btn">Post Opportunity</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-create-deal"><div class="modal modal-lg"><div class="modal-header"><span class="modal-title">Create a Deal</span><button class="modal-close">x</button></div><div class="modal-body"><div class="form-stack"><div class="form-group"><label class="form-label">Deal Title *</label><input class="form-control" id="cd-title" placeholder="Website Redesign Project"></div><div class="form-group"><label class="form-label">Counterparty (Seller) *</label><select class="form-control" id="cd-seller"><option value="">Select member...</option></select></div><div class="form-group"><label class="form-label">Scope *</label><textarea class="form-control" id="cd-scope" rows="3" placeholder="Describe what you are buying..."></textarea></div><div class="form-row"><div class="form-group"><label class="form-label">Price ($) *</label><input class="form-control" id="cd-price" type="number" min="1" placeholder="5000"></div><div class="form-group"><label class="form-label">Payment Type</label><select class="form-control" id="cd-payment-type"><option value="lump_sum">Lump Sum</option><option value="milestones">Milestones</option></select></div></div><div class="form-row"><div class="form-group"><label class="form-label">Start Date</label><input class="form-control" id="cd-start" type="date"></div><div class="form-group"><label class="form-label">End Date</label><input class="form-control" id="cd-end" type="date"></div></div><div class="form-group"><label class="form-label">Deliverables <span>one per line</span></label><textarea class="form-control" id="cd-deliverables" rows="3" placeholder="Discovery and wireframes&#10;High-fidelity mockups&#10;Developer handoff"></textarea></div><div class="form-group"><label class="form-label">Wheel</label><select class="form-control" id="cd-wheel"><option value="">None (direct deal)</option></select></div></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="create-deal-btn">Propose Deal</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-create-post"><div class="modal"><div class="modal-header"><span class="modal-title">New Post</span><button class="modal-close">x</button></div><div class="modal-body"><div class="form-stack"><div class="form-group"><label class="form-label">Type</label><select class="form-control" id="cp-type"><option value="post">Post</option><option value="announcement">Announcement</option><option value="referral">Referral</option></select></div><div class="form-group"><label class="form-label">Message</label><textarea class="form-control" id="cp-body" rows="3" placeholder="Share something with your Wheel... Use @name to mention someone"></textarea></div><div class="form-group"><label class="form-label">Link <span>(optional)</span></label><input class="form-control" id="cp-link" placeholder="https://..."></div><div class="form-group"><label class="form-label">Photo <span>(optional)</span></label><input type="file" id="cp-photo" accept="image/*" class="form-control" style="padding:.375rem"><div id="cp-photo-preview" style="margin-top:.5rem"></div></div><div class="form-group"><label class="form-label">Video <span>(optional)</span></label><input type="file" id="cp-video" accept="video/*" class="form-control" style="padding:.375rem"><div id="cp-video-preview" style="margin-top:.5rem"></div></div></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="create-post-btn">Publish</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-create-event"><div class="modal"><div class="modal-header"><span class="modal-title">Create Event</span><button class="modal-close">x</button></div><div class="modal-body"><div class="form-stack"><div class="form-group"><label class="form-label">Event Title *</label><input class="form-control" id="ev-title" placeholder="Founders Dinner - Toronto"></div><div class="form-group"><label class="form-label">Description *</label><textarea class="form-control" id="ev-desc" rows="3" placeholder="What is this event about?"></textarea></div><div class="form-row"><div class="form-group"><label class="form-label">Date *</label><input class="form-control" id="ev-date" type="date"></div><div class="form-group"><label class="form-label">Time</label><input class="form-control" id="ev-time" type="time"></div></div><div class="form-group"><label class="form-label">Location *</label><input class="form-control" id="ev-location" placeholder="Toronto, ON or Virtual"></div><div class="form-row"><div class="form-group"><label class="form-label">Ticket Price ($) <span>0 = Free</span></label><input class="form-control" id="ev-price" type="number" min="0" placeholder="75"></div><div class="form-group"><label class="form-label">Total Tickets *</label><input class="form-control" id="ev-count" type="number" min="1" placeholder="50"></div></div></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="create-event-btn">Create Event</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-opp-detail"><div class="modal modal-lg"><div class="modal-header"><span class="modal-title" id="modal-opp-title">Opportunity</span><button class="modal-close">x</button></div><div class="modal-body" id="modal-opp-body"></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Close</button><button class="btn btn-teal" onclick="toast(\'Application submitted!\',\'success\');closeAllModals()">Apply Now</button></div></div></div>';
}


// ---- @MENTION AUTOCOMPLETE ----
function initMentionAutocomplete(textareaId, wheelId) {
  const ta = document.getElementById(textareaId);
  if (!ta) return;
  let dropdown = document.getElementById('mention-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'mention-dropdown';
    dropdown.style.cssText = 'position:fixed;background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-lg);z-index:9999;min-width:220px;max-height:200px;overflow-y:auto;display:none';
    document.body.appendChild(dropdown);
  }
  ta.addEventListener('input', () => {
    const val = ta.value, pos = ta.selectionStart;
    const before = val.slice(0, pos);
    const match = before.match(/@(\w*)$/);
    if (!match) { dropdown.style.display = 'none'; return; }
    const members = wheelId ? store.getWheelMembers(wheelId) : store.getMyWheels().flatMap(w => store.getWheelMembers(w.id));
    const seen = new Set();
    const unique = members.filter(u => { if(seen.has(u.id)) return false; seen.add(u.id); return true; });
    const q = match[1].toLowerCase();
    const filtered = unique.filter(u => u.id !== store.getMe()?.id && (u.name.toLowerCase().includes(q) || (u.username||'').toLowerCase().includes(q))).slice(0, 6);
    if (!filtered.length) { dropdown.style.display = 'none'; return; }
    const rect = ta.getBoundingClientRect();
    dropdown.style.left = rect.left + 'px';
    dropdown.style.top = (rect.top + rect.height + 4) + 'px';
    dropdown.style.display = 'block';
    dropdown.innerHTML = filtered.map(u =>
      '<div style="display:flex;align-items:center;gap:.625rem;padding:.625rem 1rem;cursor:pointer;transition:background .15s" onmouseover="this.style.background=\'var(--surface)\'" onmouseout="this.style.background=\'\'" onclick="insertMention(\'' + textareaId + '\',\'' + escHtml(u.name) + '\')">' +
      avatarHtml(u,'sm') +
      '<div><div style="font-size:.875rem;font-weight:600;color:var(--navy)">' + escHtml(u.name) + '</div>' +
      '<div style="font-size:.75rem;color:var(--text-3)">@' + escHtml(u.username||u.name.split(' ')[0].toLowerCase()) + '</div></div></div>'
    ).join('');
  });
  ta.addEventListener('keydown', e => {
    if (e.key === 'Escape') dropdown.style.display = 'none';
  });
}

window.insertMention = (textareaId, name) => {
  const ta = document.getElementById(textareaId); if (!ta) return;
  const val = ta.value, pos = ta.selectionStart;
  const before = val.slice(0, pos), after = val.slice(pos);
  const atIdx = before.lastIndexOf('@');
  ta.value = before.slice(0, atIdx) + '@' + name + ' ' + after;
  ta.focus();
  const newPos = atIdx + name.length + 2;
  ta.setSelectionRange(newPos, newPos);
  const dd = document.getElementById('mention-dropdown');
  if (dd) dd.style.display = 'none';
};

window.applyTemplate=(el)=>{
  $$('#wheel-templates .auth-role-card').forEach(c=>c.classList.remove('selected')); el.classList.add('selected');
  const t=JSON.parse(el.dataset.tpl);
  const n=$('#cw-name'),d=$('#cw-desc'),c=$('#cw-color');
  if(n)n.value=t.name; if(d)d.value=t.desc; if(c)c.value=t.hex;
  const cat=$('#cw-cat'); if(cat){for(let o of cat.options){if(o.value===t.category){o.selected=true;break;}}}
};

function bindModalForms() {
  $('#create-wheel-btn')?.addEventListener('click',()=>{
    const name=$('#cw-name').value.trim(),desc=$('#cw-desc').value.trim();
    if(!name){toast('Wheel name is required','error');return;}
    const color=$('#cw-color').value;
    const w=store.createWheel({name,slug:name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''),description:desc,category:$('#cw-cat').value,dealCommission:parseFloat($('#cw-commission').value)||2.5,hexColor:color,coverGradient:'linear-gradient(135deg,'+color+'cc,'+color+')',isEventWheel:$('#cw-is-event').checked});
    toast('Wheel "'+name+'" created!','success'); closeAllModals(); updateShellDynamic(store.getMe()); navigate('wheel-detail',{wheelId:w.id});
  });
  $('#create-opp-btn')?.addEventListener('click',()=>{
    const title=$('#co-title').value.trim(),desc=$('#co-desc').value.trim();
    if(!title||!desc){toast('Title and description are required','error');return;}
    store.createOpportunity({type:$('#co-type').value,title,description:desc,skills:$('#co-skills').value.split(',').map(s=>s.trim()).filter(Boolean),location:$('#co-location').value.trim()||'Remote',remoteOk:true,wheelIds:store.getMyWheels().map(w=>w.id),metadata:{value:$('#co-comp').value.trim()},expiresAt:null});
    toast('Opportunity posted!','success'); closeAllModals(); navigate('opportunities');
  });
  $('#create-deal-btn')?.addEventListener('click',()=>{
    const title=$('#cd-title').value.trim(),scope=$('#cd-scope').value.trim(),price=parseInt($('#cd-price').value)||0,sellerId=$('#cd-seller').value;
    if(!title||!scope||!price||!sellerId){toast('Please fill all required fields','error');return;}
    const deliverables=$('#cd-deliverables').value.trim().split('\n').filter(Boolean).map(l=>({id:uid(),title:l.trim(),done:false}));
    const d=store.createDeal({title,scope,sellerId,priceCents:price*100,currency:'USD',paymentType:$('#cd-payment-type').value,startDate:$('#cd-start').value,endDate:$('#cd-end').value,wheelId:$('#cd-wheel').value||null,deliverables});
    store.addNotif(sellerId,'deal_message','<strong>'+store.getMe().name+'</strong> proposed a deal: '+escHtml(title));
    toast('Deal proposed!','success'); closeAllModals(); navigate('deal-detail',{dealId:d.id});
  });
  // init @mention + reset previews when modal opens
  document.getElementById('modal-create-post')?.addEventListener('click', () => {
    setTimeout(() => {
      initMentionAutocomplete('cp-body', pageParams.wheelId||null);
      const pp = document.getElementById('cp-photo-preview'), vp = document.getElementById('cp-video-preview');
      // don't reset if already open
    }, 50);
  });
  // photo/video preview
  document.getElementById('cp-photo')?.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const preview = document.getElementById('cp-photo-preview');
      if (preview) preview.innerHTML = '<img src="' + ev.target.result + '" style="max-width:100%;max-height:200px;border-radius:var(--radius-sm);object-fit:cover">';
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('cp-video')?.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const preview = document.getElementById('cp-video-preview');
      if (preview) preview.innerHTML = '<video src="' + ev.target.result + '" controls style="max-width:100%;max-height:180px;border-radius:var(--radius-sm)"></video>';
    };
    reader.readAsDataURL(file);
  });

  $('#create-post-btn')?.addEventListener('click', () => {
    const body = $('#cp-body')?.value.trim() || '';
    const link = $('#cp-link')?.value.trim() || '';
    const photoFile = document.getElementById('cp-photo')?.files[0];
    const videoFile = document.getElementById('cp-video')?.files[0];
    if (!body && !link && !photoFile && !videoFile) { toast('Add a message, link, photo or video', 'error'); return; }
    const wheelId = pageParams.wheelId || store.getMyWheels()[0]?.id;
    if (!wheelId) { toast('Join a Wheel first', 'error'); return; }

    const readAndPost = (photoData, videoData) => {
      store.createPost({ wheelId, body, type: $('#cp-type').value, link: link||null, photo: photoData||null, video: videoData||null });
      const mentions = [...body.matchAll(/@(\w+)/g)].map(m => m[1].toLowerCase());
      if (mentions.length) {
        const members = store.getWheelMembers(wheelId);
        members.forEach(m => {
          if (mentions.includes(m.username?.toLowerCase()||m.name.split(' ')[0].toLowerCase())) {
            if (m.id !== store.getMe().id) store.addNotif(m.id,'mention','<strong>'+escHtml(store.getMe().name)+'</strong> mentioned you in a post: "'+escHtml(body.slice(0,60))+(body.length>60?'...':'')+'"');
          }
        });
      }
      toast('Post published!', 'success'); closeAllModals(); renderWheelDetail();
    };

    if (photoFile) {
      const r = new FileReader();
      r.onload = ev => {
        if (videoFile) { const r2 = new FileReader(); r2.onload = ev2 => readAndPost(ev.target.result, ev2.target.result); r2.readAsDataURL(videoFile); }
        else readAndPost(ev.target.result, null);
      };
      r.readAsDataURL(photoFile);
    } else if (videoFile) {
      const r = new FileReader(); r.onload = ev => readAndPost(null, ev.target.result); r.readAsDataURL(videoFile);
    } else {
      readAndPost(null, null);
    }
  });
  $('#create-event-btn')?.addEventListener('click',()=>{
    const title=$('#ev-title').value.trim(),desc=$('#ev-desc').value.trim(),date=$('#ev-date').value,location=$('#ev-location').value.trim();
    if(!title||!desc||!date||!location){toast('Please fill all required fields','error');return;}
    const wheelId=pageParams.wheelId||store.getMyWheels()[0]?.id;
    if(!wheelId){toast('Open a Wheel first','error');return;}
    store.createEvent({wheelId,title,description:desc,date,time:$('#ev-time').value||'7:00 PM',location,ticketPrice:parseInt($('#ev-price').value)||0,ticketCount:parseInt($('#ev-count').value)||50});
    toast('Event created!','success'); closeAllModals(); renderWheelDetail();
  });
  document.getElementById('modal-create-deal')?.addEventListener('click',()=>{
    const sel=$('#cd-seller'),wsel=$('#cd-wheel');
    if(!sel||sel.options.length>1)return;
    store.get('users').filter(u=>u.id!==store.getMe()?.id).forEach(u=>sel.options.add(new Option(u.name,u.id)));
    store.getMyWheels().forEach(w=>wsel.options.add(new Option(w.name,w.id)));
  });
}

window.navigate=navigate; window.openModal=openModal; window.closeAllModals=closeAllModals;
window.store=store; window.toast=toast;
window.renderHome=renderHome; window.renderProfile=renderProfile;
window.renderWheelDetail=renderWheelDetail; window.renderDealDetail=renderDealDetail;
window.renderOppDetail=renderOppDetail;

document.addEventListener('DOMContentLoaded',()=>{ renderPage(); });
