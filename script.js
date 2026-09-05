'use strict';
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2)+Date.now().toString(36);
const fmt = n => new Intl.NumberFormat('en-US').format(n);
const fmtMoney = (n,cur='USD') => new Intl.NumberFormat('en-US',{style:'currency',currency:cur,maximumFractionDigits:0}).format(n);
const fullDateTime = iso => new Date(iso).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
const timeAgo = iso => {
  const diff=Date.now()-new Date(iso).getTime(),m=Math.floor(diff/60000),h=Math.floor(m/60),d=Math.floor(h/24);
  if(m<2)return 'just now';if(m<60)return m+'m ago';if(h<24)return h+'h ago';if(d<7)return d+'d ago';
  return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric'});
};
const initials = n => n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
const escHtml = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const STORE_KEY='fairriss_mvp_v5';
const SUGGESTED_WHEELS=[
  {name:'SaaS Founders',category:'Startup',emoji:'S',hex:'#0F1F3D',desc:'A private community for SaaS founders to share playbooks, deals, and referrals.'},
  {name:'AI Startups',category:'Technology',emoji:'A',hex:'#6D28D9',desc:'Founders and builders working on AI products. Share resources, intros, and opportunities.'},
  {name:'Startup Investors',category:'Finance',emoji:'I',hex:'#047857',desc:'Angel investors and VCs sharing deal flow, co-investment opportunities, and insights.'},
  {name:'Toronto Investors',category:'Finance',emoji:'T',hex:'#B45309',desc:'Local investor community in Toronto. Deals, meetups, and co-investment.'},
  {name:'Women Founders',category:'Startup',emoji:'W',hex:'#BE185D',desc:'A supportive network for women building companies. Funding, mentorship, and community.'},
  {name:'Owners',category:'Business',emoji:'O',hex:'#0369A1',desc:'Business owners sharing what works. Operations, hiring, partnerships, and growth.'},
  {name:'Founders',category:'Startup',emoji:'F',hex:'#374151',desc:'Early-stage founders sharing learnings, deals, and introductions.'},
  {name:'Hiring',category:'Talent',emoji:'H',hex:'#065F46',desc:'Post and find vetted roles across startups and growing companies.'},
  {name:'Events',category:'Events',emoji:'E',hex:'#7C3AED',desc:'Discover and host events for your community. Tickets, RSVPs, and more.'},
  {name:'Partnerships',category:'Business',emoji:'P',hex:'#C2410C',desc:'Find co-marketing partners, resellers, and strategic alliances.'},
  {name:'Networking',category:'Community',emoji:'N',hex:'#1D4ED8',desc:'General professional networking. Introductions, referrals, and casual connection.'},
];

const DEFAULT_DATA={
  currentUser:null,
  users:[
    {id:'u1',name:'Alex Chen',username:'alexchen',role:'creator',userType:'Founder',wantTo:['Post Opportunities','Network'],bio:'Business coach and community builder. I help founders scale from 0 to 1.',jobTitle:'Founder and CEO',company:'Founder Collective',location:'San Francisco, CA',website:'founderco.com',skills:['Coaching','Strategy','Fundraising','Community'],links:[],availability:'available',avatar:null,profilePics:[],introVideo:null,resume:null,workHistory:[{id:'j1',title:'CEO',company:'Founder Collective',from:'2020',to:'Present',desc:'Building community-led businesses.'}],deals:18,revenue:87400,referralsSent:22,referralsConverted:18,reviewAvg:4.9,joinedAt:'2024-01-15T00:00:00Z'},
    {id:'u2',name:'Marcus Osei',username:'marcusosei',role:'member',userType:'Freelancer',wantTo:['Find Work','Network'],bio:'Senior UX designer with 8 years shaping digital products for fintech and consumer apps.',jobTitle:'Senior UX Designer',company:'Self-employed',location:'Lagos, Nigeria',website:'marcus.design',skills:['UX Design','Figma','Design Systems','User Research'],links:['behance.net/marcusosei','linkedin.com/in/marcusosei'],availability:'available',avatar:null,profilePics:[],introVideo:null,resume:null,workHistory:[{id:'j2',title:'Senior UX Designer',company:'Verve.io',from:'2021',to:'2024',desc:'Led design for core product.'}],deals:24,revenue:41200,referralsSent:12,referralsConverted:9,reviewAvg:4.9,joinedAt:'2024-02-03T00:00:00Z'},
    {id:'u3',name:'Priya Singh',username:'priyasingh',role:'member',userType:'Freelancer',wantTo:['Find Work','Hire People'],bio:'Full-stack engineer specialising in React, Node.js, and scalable APIs.',jobTitle:'Full-Stack Engineer',company:'Self-employed',location:'Bangalore, India',website:'',skills:['React','Node.js','TypeScript','PostgreSQL'],links:[],availability:'limited',avatar:null,profilePics:[],introVideo:null,resume:null,workHistory:[],deals:11,revenue:28600,referralsSent:6,referralsConverted:4,reviewAvg:4.7,joinedAt:'2024-03-12T00:00:00Z'},
    {id:'u4',name:'Jordan Lee',username:'jordanlee',role:'member',userType:'Owner',wantTo:['Hire People','Network'],bio:'Growth marketer obsessed with CAC and retention.',jobTitle:'Head of Growth',company:'Nova SaaS',location:'New York, NY',website:'',skills:['Growth','Paid Ads','Analytics','SEO'],links:[],availability:'unavailable',avatar:null,profilePics:[],introVideo:null,resume:null,workHistory:[],deals:8,revenue:19800,referralsSent:14,referralsConverted:7,reviewAvg:4.5,joinedAt:'2024-04-01T00:00:00Z'},
    {id:'u5',name:'Nova SaaS',username:'novasaas',role:'brand',userType:'Owner',wantTo:['Hire People','Post Opportunities'],bio:'B2B workflow automation platform.',jobTitle:'Brand Account',company:'Nova SaaS',location:'Austin, TX',website:'novasaas.io',skills:['SaaS','B2B','Automation'],links:[],availability:'available',avatar:null,profilePics:[],introVideo:null,resume:null,workHistory:[],deals:5,revenue:0,referralsSent:2,referralsConverted:1,reviewAvg:4.6,joinedAt:'2024-02-20T00:00:00Z'},
    {id:'u6',name:'Sarah Kim',username:'sarahkim',role:'member',userType:'Freelancer',wantTo:['Find Work','Post Opportunities'],bio:'Brand designer and strategist. I create visual identities that make companies unforgettable.',jobTitle:'Brand Designer',company:'Self-employed',location:'Seoul, South Korea',website:'sarahkim.co',skills:['Brand Design','Illustration','Motion','Art Direction'],links:['dribbble.com/sarahkim'],availability:'available',avatar:null,profilePics:[],introVideo:null,resume:null,workHistory:[],deals:31,revenue:62300,referralsSent:19,referralsConverted:15,reviewAvg:5.0,joinedAt:'2024-01-28T00:00:00Z'},
  ],
  wheels:[
    {id:'w1',name:'The Founders Circle',slug:'founders-circle',creatorId:'u1',description:'A private community for early-stage founders to share deals, referrals, and hard-won insights.',category:'Startup',coverGradient:'linear-gradient(135deg,#0F1F3D,#243B6B)',hexColor:'#0F1F3D',memberCount:142,status:'active',membershipMode:'open',monthlyPrice:0,dealCommission:2.5,isEventWheel:false,createdAt:'2024-01-20T00:00:00Z'},
    {id:'w2',name:'Design Syndicate',slug:'design-syndicate',creatorId:'u6',description:'Designers helping designers. Referrals, collab opportunities, and client leads.',category:'Design',coverGradient:'linear-gradient(135deg,#4C1D95,#7C3AED)',hexColor:'#6D28D9',memberCount:89,status:'active',membershipMode:'open',monthlyPrice:0,dealCommission:1.5,isEventWheel:false,createdAt:'2024-02-10T00:00:00Z'},
    {id:'w3',name:'Toronto Investors',slug:'toronto-investors',creatorId:'u4',description:'Local investor community in Toronto. Deals, meetups, and co-investment.',category:'Finance',coverGradient:'linear-gradient(135deg,#065F46,#059669)',hexColor:'#047857',memberCount:63,status:'active',membershipMode:'open',monthlyPrice:0,dealCommission:2,isEventWheel:false,createdAt:'2024-03-05T00:00:00Z'},
  ],
  wheelMembers:[
    {wheelId:'w1',userId:'u1',status:'active',joinedAt:'2024-01-20T00:00:00Z'},
    {wheelId:'w1',userId:'u2',status:'active',joinedAt:'2024-02-05T00:00:00Z'},
    {wheelId:'w1',userId:'u3',status:'active',joinedAt:'2024-02-18T00:00:00Z'},
    {wheelId:'w1',userId:'u5',status:'active',joinedAt:'2024-03-01T00:00:00Z'},
    {wheelId:'w2',userId:'u6',status:'active',joinedAt:'2024-02-10T00:00:00Z'},
    {wheelId:'w2',userId:'u2',status:'active',joinedAt:'2024-02-20T00:00:00Z'},
    {wheelId:'w3',userId:'u4',status:'active',joinedAt:'2024-03-05T00:00:00Z'},
    {wheelId:'w3',userId:'u3',status:'active',joinedAt:'2024-03-15T00:00:00Z'},
  ],
  opportunities:[
    {id:'o1',creatorId:'u5',wheelIds:['w1'],type:'job',title:'Head of Product — Nova SaaS',description:'We are looking for a seasoned product leader to own the entire roadmap for Nova SaaS. Remote-first, great team, strong equity package.',skills:['Product Management','SaaS','Analytics','Roadmapping'],location:'Remote',remoteOk:true,status:'open',metadata:{salaryMin:140000,salaryMax:180000,type:'full-time'},viewCount:48,applicationCount:7,expiresAt:'2026-09-01T00:00:00Z',createdAt:'2026-07-01T10:00:00Z'},
    {id:'o1b',creatorId:'u5',wheelIds:['w1'],type:'job',title:'Head of Product',description:'We are looking for a seasoned product leader to own the entire roadmap for Nova SaaS. Remote-first culture.',skills:['Product Management','SaaS','Analytics'],location:'Remote',remoteOk:true,status:'open',metadata:{salaryMin:140000,salaryMax:180000,type:'full-time'},viewCount:48,applicationCount:7,expiresAt:'2025-09-01T00:00:00Z',createdAt:'2025-07-01T10:00:00Z'},
    {id:'o2',creatorId:'u2',wheelIds:['w1','w2'],type:'referral',title:'Senior iOS Engineer at Relay',description:'Relay is building the next generation of B2B payments. Great team, solid equity, full remote.',skills:['iOS','Swift','SwiftUI'],location:'Remote',remoteOk:true,status:'open',metadata:{bonus:500},viewCount:31,applicationCount:4,expiresAt:'2025-08-15T00:00:00Z',createdAt:'2025-07-03T14:30:00Z'},
    {id:'o3',creatorId:'u3',wheelIds:['w1'],type:'collaboration',title:'CTO Co-Founder for EdTech Startup',description:'I have a working prototype and an LOI from a school district. Looking for a technical co-founder.',skills:['React Native','Node.js','EdTech'],location:'Remote',remoteOk:true,status:'open',metadata:{equity:'25-35%'},viewCount:19,applicationCount:2,expiresAt:'2025-09-30T00:00:00Z',createdAt:'2025-07-04T09:00:00Z'},
    {id:'o4',creatorId:'u1',wheelIds:['w1'],type:'service',title:'Brand Identity Package for Q3 Launch',description:'Looking for a brand designer to create a complete identity: wordmark, icon, color system, type system.',skills:['Brand Design','Logo Design','Typography'],location:'Remote',remoteOk:true,status:'open',metadata:{budgetMin:2000,budgetMax:4000},viewCount:22,applicationCount:5,expiresAt:'2025-07-31T00:00:00Z',createdAt:'2025-07-05T11:00:00Z'},
    {id:'o5',creatorId:'u4',wheelIds:['w3'],type:'partnership',title:'Growth Agency Co-Marketing Partner',description:'We run paid acquisition for 12 DTC brands and want to partner with a complementary agency.',skills:['Marketing','Agency','Partnership'],location:'US-based preferred',remoteOk:true,status:'open',metadata:{},viewCount:14,applicationCount:3,expiresAt:'2025-08-20T00:00:00Z',createdAt:'2025-07-06T08:30:00Z'},
  ],
  deals:[
    {id:'d1',wheelId:'w2',buyerId:'u5',sellerId:'u2',title:'Website Redesign Project',scope:'Complete redesign of Nova SaaS marketing site (5 core pages) in Figma.',deliverables:[{id:'del1',title:'Discovery and wireframes',done:true},{id:'del2',title:'High-fidelity mockups',done:false},{id:'del3',title:'Developer handoff',done:false}],status:'in_progress',priceCents:450000,currency:'USD',paymentType:'lump_sum',startDate:'2025-07-01',endDate:'2025-08-15',platformFeePct:3,creatorCommissionPct:2.5,messages:[{id:'m1',senderId:'u5',body:'Hi Marcus, we loved your portfolio. The Nova rebrand is one of our biggest priorities this quarter.',createdAt:'2025-07-01T09:00:00Z'},{id:'m2',senderId:'u2',body:'Thanks! I went through the brief. I have some questions about the brand voice - can we jump on a quick call?',createdAt:'2025-07-01T10:30:00Z'}],createdAt:'2025-06-28T00:00:00Z'},
    {id:'d2',wheelId:'w1',buyerId:'u1',sellerId:'u3',title:'Member Portal Development',scope:'Build the member dashboard for The Founders Circle - authentication, profile pages, and deal listing.',deliverables:[{id:'del5',title:'Auth system',done:true},{id:'del6',title:'Profile CRUD',done:true},{id:'del7',title:'Deal list views',done:false}],status:'in_progress',priceCents:800000,currency:'USD',paymentType:'milestones',startDate:'2025-06-15',endDate:'2025-08-30',platformFeePct:3,creatorCommissionPct:2,messages:[{id:'m4',senderId:'u1',body:'Priya, the auth and profile work looks clean. Are we on track for Aug 30?',createdAt:'2025-07-04T14:00:00Z'},{id:'m5',senderId:'u3',body:'Yes - starting deal views Monday. Should have a preview by end of week.',createdAt:'2025-07-04T14:22:00Z'}],createdAt:'2025-06-12T00:00:00Z'},
    {id:'d3',wheelId:'w1',buyerId:'u2',sellerId:'u6',title:'Brand Identity for Osei Studio',scope:'Complete brand identity: wordmark, icon, color palette, type system, and business card design.',deliverables:[{id:'del8',title:'Discovery and mood boards',done:true},{id:'del9',title:'Wordmark concepts',done:true},{id:'del10',title:'Final identity system',done:true}],status:'paid',priceCents:320000,currency:'USD',paymentType:'lump_sum',startDate:'2025-05-01',endDate:'2025-06-01',platformFeePct:3,creatorCommissionPct:2.5,messages:[],createdAt:'2025-04-28T00:00:00Z'},
  ],
  events:[
    {id:'ev1',wheelId:'w1',creatorId:'u1',title:'Founders Dinner - Toronto',description:'Private dinner for founders in the Toronto area. 20 seats only.',date:'2025-08-15',time:'7:00 PM',location:'Toronto, ON',ticketPrice:75,ticketCount:20,ticketsSold:12,createdAt:'2025-07-01T00:00:00Z'},
  ],
  posts:[
    {id:'p1',wheelId:'w1',authorId:'u1',type:'announcement',body:'Welcome to Q3! We have three open opportunities in the feed this week. Check them out and let us make each other money.',likes:24,photo:null,video:null,link:null,createdAt:'2025-07-07T09:00:00Z'},
    {id:'p2',wheelId:'w1',authorId:'u2',type:'referral',body:'Forwarding a senior iOS engineer role at Relay - great team, solid equity, full remote. DM me for the warm intro. Referral bonus: $500 if they get hired.',likes:11,photo:null,video:null,link:null,createdAt:'2025-07-07T11:30:00Z'},
    {id:'p3',wheelId:'w1',authorId:'u3',type:'post',body:'PSA: finished the auth module for the portal. Magic link is live on staging. Would love feedback on the UX.',likes:8,photo:null,video:null,link:null,createdAt:'2025-07-06T16:00:00Z'},
  ],
  notifications:[
    {id:'n1',userId:'u1',type:'deal_message',text:'<strong>Marcus Osei</strong> sent a message on Website Redesign Project',read:false,createdAt:'2025-07-07T10:30:00Z'},
    {id:'n2',userId:'u1',type:'new_member',text:'<strong>Nova SaaS</strong> joined The Founders Circle',read:false,createdAt:'2025-07-06T15:00:00Z'},
    {id:'n3',userId:'u1',type:'deal_completed',text:'<strong>Brand Identity for Osei Studio</strong> was marked complete',read:true,createdAt:'2025-06-30T09:00:00Z'},
  ],
};

class Store {
  constructor(){this.data=this._load();}
  _load(){try{const r=localStorage.getItem(STORE_KEY);if(r)return JSON.parse(r);}catch(e){}return JSON.parse(JSON.stringify(DEFAULT_DATA));}
  _save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(this.data));}catch(e){}}
  reset(){this.data=JSON.parse(JSON.stringify(DEFAULT_DATA));this._save();}
  get(k){return this.data[k];}
  getMe(){return this.data.users.find(u=>u.id===this.data.currentUser)||null;}
  getUser(id){return this.data.users.find(u=>u.id===id);}
  login(id){this.data.currentUser=id;this._save();}
  logout(){this.data.currentUser=null;this._save();}
  updateMe(f){const i=this.data.users.findIndex(u=>u.id===this.data.currentUser);if(i!==-1){Object.assign(this.data.users[i],f);this._save();}}
  createUser(d){const u={id:uid(),deals:0,revenue:0,referralsSent:0,referralsConverted:0,reviewAvg:0,avatar:null,profilePics:[],introVideo:null,resume:null,workHistory:[],links:[],website:'',joinedAt:new Date().toISOString(),...d};this.data.users.push(u);this._save();return u;}
  getMyWheels(){const me=this.data.currentUser;const ids=this.data.wheelMembers.filter(m=>m.userId===me&&m.status==='active').map(m=>m.wheelId);return this.data.wheels.filter(w=>ids.includes(w.id));}
  getWheelMembers(wid){const ids=this.data.wheelMembers.filter(m=>m.wheelId===wid&&m.status==='active').map(m=>m.userId);return this.data.users.filter(u=>ids.includes(u.id));}
  createWheel(d){const w={id:uid(),creatorId:this.data.currentUser,memberCount:1,status:'active',membershipMode:'open',monthlyPrice:0,createdAt:new Date().toISOString(),...d};this.data.wheels.push(w);this.data.wheelMembers.push({wheelId:w.id,userId:this.data.currentUser,status:'active',joinedAt:new Date().toISOString()});this._save();return w;}
  joinWheel(wid){if(!this.data.wheelMembers.find(m=>m.wheelId===wid&&m.userId===this.data.currentUser)){this.data.wheelMembers.push({wheelId:wid,userId:this.data.currentUser,status:'active',joinedAt:new Date().toISOString()});const w=this.data.wheels.find(x=>x.id===wid);if(w)w.memberCount++;this._save();}}
  isMember(wid){return!!this.data.wheelMembers.find(m=>m.wheelId===wid&&m.userId===this.data.currentUser&&m.status==='active');}
  getOpportunities(f={}){let o=[...this.data.opportunities];if(f.wheelId)o=o.filter(x=>x.wheelIds.includes(f.wheelId));if(f.type&&f.type!=='all')o=o.filter(x=>x.type===f.type);if(f.q){const q=f.q.toLowerCase();o=o.filter(x=>x.title.toLowerCase().includes(q)||x.description.toLowerCase().includes(q));}return o.filter(x=>x.status==='open').sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));}
  createOpportunity(d){const o={id:uid(),creatorId:this.data.currentUser,status:'open',viewCount:0,applicationCount:0,createdAt:new Date().toISOString(),...d};this.data.opportunities.push(o);this._save();return o;}
  getMyDeals(){const me=this.data.currentUser;return this.data.deals.filter(d=>d.buyerId===me||d.sellerId===me).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));}
  getDeal(id){return this.data.deals.find(d=>d.id===id);}
  createDeal(d){const x={id:uid(),buyerId:this.data.currentUser,status:'proposed',messages:[],deliverables:[],platformFeePct:3,creatorCommissionPct:2.5,createdAt:new Date().toISOString(),...d};this.data.deals.push(x);this._save();return x;}
  updateDeal(id,f){const i=this.data.deals.findIndex(d=>d.id===id);if(i!==-1){Object.assign(this.data.deals[i],f);this._save();}return this.data.deals[i];}
  addDealMessage(did,body){const d=this.getDeal(did);if(!d)return;const m={id:uid(),senderId:this.data.currentUser,body,createdAt:new Date().toISOString()};d.messages.push(m);this._save();return m;}
  getPosts(wid){return this.data.posts.filter(p=>p.wheelId===wid).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));}
  createPost(d){const p={id:uid(),authorId:this.data.currentUser,likes:0,photo:null,video:null,link:null,createdAt:new Date().toISOString(),...d};this.data.posts.push(p);this._save();return p;}
  likePost(id){const p=this.data.posts.find(x=>x.id===id);if(p){p.likes++;this._save();}}
  getEvents(wid){return(this.data.events||[]).filter(e=>e.wheelId===wid);}
  createEvent(d){const e={id:uid(),creatorId:this.data.currentUser,ticketsSold:0,createdAt:new Date().toISOString(),...d};if(!this.data.events)this.data.events=[];this.data.events.push(e);this._save();return e;}
  buyTicket(eid){const e=(this.data.events||[]).find(x=>x.id===eid);if(e&&e.ticketsSold<e.ticketCount){e.ticketsSold++;this._save();return true;}return false;}
  getMyNotifs(){return(this.data.notifications||[]).filter(n=>n.userId===this.data.currentUser).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));}
  markNotifsRead(){(this.data.notifications||[]).filter(n=>n.userId===this.data.currentUser).forEach(n=>n.read=true);this._save();}
  addNotif(uid2,type,text){if(!this.data.notifications)this.data.notifications=[];this.data.notifications.push({id:uid(),userId:uid2,type,text,read:false,createdAt:new Date().toISOString()});this._save();}
}
const store=new Store();

// ── Utilities ──────────────────────────────────────────────────────────────
function toast(msg,type='default'){
  const el=document.createElement('div');el.className='toast '+type;
  el.innerHTML='<span>'+(type==='success'?'v':type==='error'?'x':'i')+'</span><span>'+escHtml(msg)+'</span>';
  let c=$('#toast-container');
  if(!c){c=document.createElement('div');c.id='toast-container';c.className='toast-container';document.body.appendChild(c);}
  c.appendChild(el);setTimeout(()=>{el.classList.add('hiding');setTimeout(()=>el.remove(),300);},3200);
}
function openModal(id){document.getElementById(id)?.classList.add('open');}
function closeAllModals(){$$('.modal-overlay').forEach(m=>m.classList.remove('open'));}
document.addEventListener('click',e=>{
  if(e.target.classList.contains('modal-overlay'))closeAllModals();
  if(e.target.classList.contains('modal-close'))closeAllModals();
});

const PAGES=['home','wheels','members','opportunities','deals','profile','wheel-detail','deal-detail','analytics','admin','support','messages'];
let currentPage='home',pageParams={};
function navigate(page,params={}){currentPage=page;pageParams=params;renderPage();window.scrollTo(0,0);}

function renderPage(){
  const me=store.getMe();
  if(!me){renderAuth();return;}
  if(me.userType===undefined){renderOnboarding();return;}
  renderShell(me);
  $$('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+currentPage)?.classList.add('active');
  const activeGroups={wheels:['wheels','wheel-detail'],deals:['deals','deal-detail']};
  $$('.nav-item[data-page], .mobile-nav-item[data-page]').forEach(el=>{
    const p=el.dataset.page;
    const isActive = (activeGroups[p]||[p]).includes(currentPage);
    el.classList.toggle('active', isActive);
  });
  const renders={home:renderHome,wheels:renderWheels,members:renderMembers,opportunities:renderOpportunities,deals:renderDeals,profile:renderProfile,'wheel-detail':renderWheelDetail,'deal-detail':renderDealDetail,analytics:renderAnalytics,admin:renderAdmin,support:renderSupport,messages:renderMessages};
  renders[currentPage]?.();
}

// ── Icons ──────────────────────────────────────────────────────────────────
function icon(n){
  const I={
    home:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    wheel:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
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
    camera:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    link:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    search:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  };
  return I[n]||'';
}

// ── Avatars & Badges ───────────────────────────────────────────────────────
const PALETTE=['#0F1F3D','#6D28D9','#047857','#C2410C','#0369A1','#BE185D','#374151'];
function getColor(id){if(!id)return PALETTE[0];return PALETTE[(parseInt((id+'').replace(/\D/g,'')||'0'))%PALETTE.length];}
async function usersByIdMap(ids){
  const unique=[...new Set(ids.filter(Boolean))];
  const map={};
  await Promise.all(unique.map(async id=>{
    try{ map[id]=await store.getUser(id); }catch(e){ map[id]=null; }
  }));
  return map;
}

function avatarHtml(u,size='md'){
  const px={sm:32,md:44,lg:64,xl:80}[size]||44;
  if(!u||!u.id)return '<div class="avatar avatar-'+size+'" style="background:#ddd;width:'+px+'px;height:'+px+'px"></div>';
  if(u.profilePics&&u.profilePics[0])return '<img src="'+u.profilePics[0]+'" style="width:'+px+'px;height:'+px+'px;border-radius:50%;object-fit:cover;display:block;flex-shrink:0">';
  return '<div class="avatar avatar-'+size+'" style="background:'+getColor(u.id)+';color:#fff;width:'+px+'px;height:'+px+'px">'+initials(u.name||'?')+'</div>';
}
function starIcon(filled){return '<svg width="14" height="14" viewBox="0 0 24 24" fill="'+(filled?'var(--amber)':'none')+'" stroke="var(--amber)" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';}
function starRow(avg,size){
  const s=size||14;
  let out='<span style="display:inline-flex;gap:1px;vertical-align:middle">';
  for(let i=1;i<=5;i++){
    const filled=avg>=i-0.25;
    out+='<span style="display:inline-flex">'+starIcon(filled).replace('width="14" height="14"','width="'+s+'" height="'+s+'"')+'</span>';
  }
  return out+'</span>';
}
function reviewSummaryHtml(avg,count){
  if(!count) return '<span class="t-micro c-text4">No reviews yet</span>';
  return starRow(avg)+' <span style="font-weight:600;margin-left:2px">'+avg+'</span> <span class="t-micro c-text4">('+count+' review'+(count===1?'':'s')+')</span>';
}
function profilePhotoHtml(u){
  if(u.profilePics&&u.profilePics[0])return '<img src="'+u.profilePics[0]+'" style="width:130px;height:130px;min-width:130px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,.3);box-shadow:0 6px 24px rgba(0,0,0,.4);display:block;cursor:pointer" onclick="openLightbox(\''+u.profilePics[0]+'\')">';
  return '<div class="profile-avatar-lg">'+initials(u.name)+'</div>';
}
function hexBadge(w,size=48){
  return '<div style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:'+(w.hexColor||'#0F1F3D')+';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:'+Math.round(size*.38)+'px;flex-shrink:0">'+w.name[0]+'</div>';
}
function dealStatusBadge(s){return '<span class="status-badge status-'+s+'"><span class="status-dot"></span>'+s.replace('_',' ')+'</span>';}
function renderPostBody(text){return escHtml(text).replace(/@(\w[\w ]*)/g,'<span style="color:var(--teal);font-weight:600">@$1</span>');}


// ── Reset Password Page ───────────────────────────────────────
function renderResetPassword(){
  document.body.innerHTML =
  '<div style="min-height:100vh;background:var(--surface);display:flex;align-items:center;justify-content:center;padding:1.5rem">'+
  '<div style="background:var(--white);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);width:100%;max-width:420px;overflow:hidden">'+
  '<div style="background:var(--navy);padding:1.5rem 2rem;text-align:center">'+
  '<h1 style="color:var(--teal);font-size:1.75rem;margin:0;letter-spacing:-.03em">Fairriss</h1>'+
  '<p style="color:rgba(255,255,255,.6);margin:.375rem 0 0;font-size:.875rem">Set a new password</p>'+
  '</div>'+
  '<div style="padding:2rem">'+
  '<div class="form-stack">'+
  '<div class="form-group"><label class="form-label">New Password</label><div style="position:relative"><input class="form-control" id="rp-password" type="password" placeholder="Min 6 characters" style="padding-right:2.75rem"><button type="button" onclick="togglePw(\'rp-password\',this)" style="position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:.6rem .5rem;margin:-.6rem -.5rem;color:#94A3B8;font-size:.8125rem;font-weight:600;-webkit-tap-highlight-color:transparent">Show</button></div></div>'+
  '<div class="form-group"><label class="form-label">Confirm Password</label><div style="position:relative"><input class="form-control" id="rp-confirm" type="password" placeholder="Repeat your password" style="padding-right:2.75rem"><button type="button" onclick="togglePw(\'rp-confirm\',this)" style="position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:.6rem .5rem;margin:-.6rem -.5rem;color:#94A3B8;font-size:.8125rem;font-weight:600;-webkit-tap-highlight-color:transparent">Show</button></div></div>'+
  '<div id="rp-error" style="color:var(--red);font-size:.875rem;display:none"></div>'+
  '<button class="btn btn-primary w-full" id="rp-btn" style="justify-content:center;margin-top:.5rem">Set New Password</button>'+
  '</div></div></div></div>';

  $('#rp-btn').onclick = async () => {
    const password = $('#rp-password').value.trim();
    const confirm  = $('#rp-confirm').value.trim();
    const errEl    = document.getElementById('rp-error');

    if(!password || password.length < 6){
      errEl.textContent = 'Password must be at least 6 characters.';
      errEl.style.display = 'block'; return;
    }
    if(password !== confirm){
      errEl.textContent = 'Passwords do not match.';
      errEl.style.display = 'block'; return;
    }

    $('#rp-btn').textContent = 'Updating...';
    $('#rp-btn').disabled = true;

    try {
      const { error } = await window._supabase.auth.updateUser({ password });
      if(error) throw error;
      // Clear hash from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Show success then redirect to login
      document.body.innerHTML =
        '<div style="min-height:100vh;background:var(--surface);display:flex;align-items:center;justify-content:center;padding:1.5rem">'+
        '<div style="background:var(--white);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);width:100%;max-width:420px;padding:2rem;text-align:center">'+
        '<div style="font-size:3rem;margin-bottom:1rem">&#x2705;</div>'+
        '<h2 style="color:var(--navy);margin:0 0 .75rem">Password updated!</h2>'+
        '<p style="color:var(--text-3);margin:0 0 1.5rem">Your password has been changed successfully.</p>'+
        '<button class="btn btn-primary" onclick="renderPage()" style="justify-content:center;width:100%">Sign In</button>'+
        '</div></div>';
    } catch(e){
      errEl.textContent = e.message || 'Failed to update password. Please try again.';
      errEl.style.display = 'block';
      $('#rp-btn').textContent = 'Set New Password';
      $('#rp-btn').disabled = false;
    }
  };

  // Allow Enter key
  $('#rp-confirm')?.addEventListener('keydown', e => { if(e.key==='Enter') $('#rp-btn').click(); });
}


// ── Terms of Service ──────────────────────────────────────────
function renderTerms(){
  document.body.innerHTML='<div style="max-width:800px;margin:0 auto;padding:2rem;font-family:Arial,sans-serif">'+
  '<div style="background:#0F1F3D;border-radius:12px;padding:1.5rem 2rem;margin-bottom:2rem;display:flex;align-items:center;gap:1rem">'+
  '<span style="color:#00C9A7;font-size:1.5rem;font-weight:900;cursor:pointer" onclick="renderPage()">Fairriss</span>'+
  '<span style="color:rgba(255,255,255,.4)">|</span>'+
  '<span style="color:rgba(255,255,255,.7);font-size:.9375rem">Terms of Service</span>'+
  '<button onclick="renderPage()" style="margin-left:auto;background:rgba(255,255,255,.1);border:none;color:#fff;padding:.5rem 1rem;border-radius:6px;cursor:pointer">Back to Fairriss</button>'+
  '</div>'+
  '<h1 style="color:#0F1F3D;margin-bottom:.5rem">Terms of Service</h1>'+
  '<p style="color:#64748B;margin-bottom:2rem">Last updated: '+new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})+'</p>'+
  '<div style="line-height:1.8;color:#374151">'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">1. Acceptance of Terms</h2>'+
  '<p>By accessing or using Fairriss ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">2. Description of Service</h2>'+
  '<p>Fairriss is a network-commerce platform that enables professionals to create communities called "Wheels," post opportunities, and transact with each other through our escrow-based deal system.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">3. User Accounts</h2>'+
  '<p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">4. Payments and Fees</h2>'+
  '<p>Fairriss charges a 10% platform fee on all completed deals. Payments are processed through Stripe and held in escrow until the buyer approves the completed work. All fees are non-refundable except in cases of dispute resolution in your favour.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">5. Prohibited Conduct</h2>'+
  '<p>You may not use the Platform to: (a) violate any law or regulation; (b) post false or misleading content; (c) harass or harm other users; (d) circumvent the platform fee by transacting off-platform; (e) create multiple accounts to abuse the system.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">6. Disputes</h2>'+
  '<p>In the event of a dispute between buyer and seller, Fairriss will review the evidence provided by both parties and make a final determination. Fairriss reserves the right to issue refunds or release funds at its sole discretion.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">7. Intellectual Property</h2>'+
  '<p>You retain ownership of content you post. By posting, you grant Fairriss a non-exclusive license to display your content on the Platform.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">8. Termination</h2>'+
  '<p>Fairriss reserves the right to suspend or terminate any account that violates these terms, with or without notice.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">9. Limitation of Liability</h2>'+
  '<p>Fairriss is not liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">10. Contact</h2>'+
  '<p>For questions about these terms, contact us at <a href="mailto:hello@fairriss.com" style="color:#00C9A7">hello@fairriss.com</a></p>'+
  '</div>'+
  '<div style="margin-top:3rem;padding-top:1.5rem;border-top:1px solid #E2E8F0;text-align:center;color:#94A3B8;font-size:.875rem">'+
  '&copy; '+new Date().getFullYear()+' Fairriss. All rights reserved. &nbsp;|&nbsp; <a href="#" onclick="renderPrivacy()" style="color:#00C9A7">Privacy Policy</a>'+
  '</div></div>';
}

// ── Privacy Policy ────────────────────────────────────────────
function renderPrivacy(){
  document.body.innerHTML='<div style="max-width:800px;margin:0 auto;padding:2rem;font-family:Arial,sans-serif">'+
  '<div style="background:#0F1F3D;border-radius:12px;padding:1.5rem 2rem;margin-bottom:2rem;display:flex;align-items:center;gap:1rem">'+
  '<span style="color:#00C9A7;font-size:1.5rem;font-weight:900;cursor:pointer" onclick="renderPage()">Fairriss</span>'+
  '<span style="color:rgba(255,255,255,.4)">|</span>'+
  '<span style="color:rgba(255,255,255,.7);font-size:.9375rem">Privacy Policy</span>'+
  '<button onclick="renderPage()" style="margin-left:auto;background:rgba(255,255,255,.1);border:none;color:#fff;padding:.5rem 1rem;border-radius:6px;cursor:pointer">Back to Fairriss</button>'+
  '</div>'+
  '<h1 style="color:#0F1F3D;margin-bottom:.5rem">Privacy Policy</h1>'+
  '<p style="color:#64748B;margin-bottom:2rem">Last updated: '+new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})+'</p>'+
  '<div style="line-height:1.8;color:#374151">'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">1. Information We Collect</h2>'+
  '<p>We collect information you provide directly: name, email, profile details, skills, and location. We also collect usage data such as pages visited, deals created, and interactions on the Platform.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">2. How We Use Your Information</h2>'+
  '<p>We use your information to: operate and improve the Platform; process payments; send transactional emails (confirmations, deal updates, password resets); and show your profile to other members.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">3. Information Sharing</h2>'+
  '<p>We do not sell your personal data. We share information with: Stripe (payment processing); Supabase (database hosting); Resend (email delivery). All third parties are bound by their own privacy policies.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">4. Profile Visibility</h2>'+
  '<p>Your name, profile photo, job title, skills, and location are visible to other Fairriss members. Your email address and revenue are never shown to other users.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">5. Data Security</h2>'+
  '<p>We use industry-standard security including encrypted connections (HTTPS), Row Level Security on our database, and secure payment processing through Stripe. We never store payment card details.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">6. Data Retention</h2>'+
  '<p>We retain your data for as long as your account is active. You may request deletion of your account and data by emailing hello@fairriss.com.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">7. Cookies</h2>'+
  '<p>We use essential cookies for authentication. We do not use advertising or tracking cookies.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">8. Your Rights</h2>'+
  '<p>You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:hello@fairriss.com" style="color:#00C9A7">hello@fairriss.com</a> to exercise these rights.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">9. Changes to This Policy</h2>'+
  '<p>We may update this policy from time to time. We will notify you of significant changes by email.</p>'+
  '<h2 style="color:#0F1F3D;margin-top:2rem">10. Contact</h2>'+
  '<p>For privacy questions, contact us at <a href="mailto:hello@fairriss.com" style="color:#00C9A7">hello@fairriss.com</a></p>'+
  '</div>'+
  '<div style="margin-top:3rem;padding-top:1.5rem;border-top:1px solid #E2E8F0;text-align:center;color:#94A3B8;font-size:.875rem">'+
  '&copy; '+new Date().getFullYear()+' Fairriss. All rights reserved. &nbsp;|&nbsp; <a href="#" onclick="renderTerms()" style="color:#00C9A7">Terms of Service</a>'+
  '</div></div>';
}


function showAuthError(id, msg){
  const el=document.getElementById(id);
  if(el){el.textContent=msg;el.style.display='block';el.style.color='#EF4444';}
}

function sbToLocal(p){
  if(!p)return null;
  return {
    id:p.id, name:p.name||'', username:p.username||'', email:p.email||'',
    bio:p.bio||'', jobTitle:p.job_title||'', company:p.company||'',
    location:p.location||'', website:p.website||'',
    userType:p.user_type||'member', role:p.role||'member',
    availability:p.availability||'available',
    skills:p.skills||[], links:p.links||[], wantTo:p.want_to||[],
    profilePics:p.profile_pics||[], introVideo:p.intro_video||'',
    videos:p.videos||[], featuredPhotos:p.featured_photos||[], contactEmail:p.contact_email||'',
    resume:p.resume||'',
    deals:p.deals_count||0, revenue:p.revenue||0,
    referralsSent:p.referrals_sent||0, referralsConverted:p.referrals_converted||0,
    reviewAvg:p.review_avg||0, reviewCount:0, workHistory:p.work_history||[],
    stripeAccountId:p.stripe_account_id||'',
    joinedAt:p.created_at
  };
}

// ── Auth / Landing Page ──────────────────────────────────────────────────────
// ── Public Profile (shareable, no login required) ─────────────────────────
async function renderPublicProfile(username){
  document.body.innerHTML = '<div style="min-height:100vh;background:var(--surface);display:flex;align-items:center;justify-content:center;padding:1.5rem"><div style="text-align:center;color:var(--text-3)">Loading profile...</div></div>';
  let u = null;
  try {
    const sb = getSb() || (window._supabase);
    if(sb){
      const { data } = await sb.from('public_profiles').select('*').eq('username', username).single();
      if(data) u = data;
    }
  } catch(e){ console.warn('Public profile fetch failed:', e.message); }

  if(!u){
    document.body.innerHTML = '<div style="min-height:100vh;background:var(--surface);display:flex;align-items:center;justify-content:center;padding:1.5rem"><div style="text-align:center"><h2 style="color:var(--navy)">Profile not found</h2><p class="t-body c-text3 mb-4">This profile doesn\'t exist or the link is incorrect.</p><a href="'+window.location.pathname+'" class="btn btn-primary">Go to Fairriss</a></div></div>';
    return;
  }
  let reviewAvg=0, reviewCount=0;
  try{
    const stats = await (window.LiveStore?.getReviewStats?.([u.id]) || {});
    const s = stats[u.id];
    if(s){ reviewAvg=s.avg; reviewCount=s.count; }
  }catch(e){}

  const initialsStr = (u.name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const photoHtml = (u.profile_pics && u.profile_pics[0])
    ? '<img src="'+u.profile_pics[0]+'" style="width:130px;height:130px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,.3);box-shadow:0 6px 24px rgba(0,0,0,.4);display:block">'
    : '<div class="profile-avatar-lg">'+initialsStr+'</div>';

  document.body.innerHTML =
  '<div style="min-height:100vh;background:var(--surface)">'+
  '<div class="profile-header" style="padding:2rem;max-width:720px;margin:0 auto">'+
  '<div style="display:flex;align-items:center;gap:1.75rem;flex-wrap:wrap">'+
  photoHtml+
  '<div style="flex:1;min-width:180px">'+
  '<h1 class="profile-name" style="font-size:1.75rem;margin-bottom:.25rem">'+escHtml(u.name)+'</h1>'+
  (u.job_title?'<div style="color:rgba(255,255,255,.9);font-size:1rem;font-weight:600;margin-bottom:.2rem">'+escHtml(u.job_title)+(u.company?' at '+escHtml(u.company):'')+'</div>':'')+
  (u.user_type?'<div style="color:rgba(255,255,255,.55);font-size:.8125rem;margin-bottom:.75rem">'+escHtml(u.user_type)+'</div>':'')+
  (u.location?'<span style="color:rgba(255,255,255,.6);font-size:.8125rem">'+icon('map')+' '+escHtml(u.location)+'</span>':'')+
  '</div>'+
  '<div style="text-align:center;color:rgba(255,255,255,.9)">'+(reviewCount?starRow(reviewAvg)+' <div style="font-size:.8125rem;margin-top:.25rem">'+reviewAvg+' ('+reviewCount+')</div>':'<div style="font-size:.75rem;opacity:.7">No reviews yet</div>')+'</div>'+
  '</div></div>'+
  '<div style="max-width:720px;margin:0 auto;padding:1.5rem">'+
  (u.bio?'<div class="card mb-4"><h2 class="t-h2 mb-3">About</h2><p class="t-body" style="color:var(--text-2);line-height:1.7">'+escHtml(u.bio)+'</p></div>':'')+
  '<div class="card mb-4"><h2 class="t-h2 mb-3">Reputation</h2><div class="reputation-grid"><div class="rep-item"><div class="rep-value">'+(u.deals_count||0)+'</div><div class="rep-label">Deals Done</div></div><div class="rep-item"><div class="rep-value">'+(u.referrals_sent||0)+'</div><div class="rep-label">Referrals</div></div><div class="rep-item"><div class="rep-value">'+(u.referrals_converted||0)+'</div><div class="rep-label">Converted</div></div><div class="rep-item"><div class="rep-value">'+(reviewCount?reviewAvg:'-')+'</div><div class="rep-label">Avg Review</div></div></div></div>'+
  (u.skills&&u.skills.length?'<div class="card mb-4"><h2 class="t-h2 mb-3">Skills</h2><div class="skill-tags">'+u.skills.map(s=>'<span class="skill-tag primary">'+escHtml(s)+'</span>').join('')+'</div></div>':'')+
  '<div class="card" style="text-align:center;background:var(--navy)"><h2 style="color:var(--teal);margin-bottom:.5rem">Join Fairriss to connect with '+escHtml(u.name.split(' ')[0])+'</h2><p style="color:rgba(255,255,255,.7);margin-bottom:1.25rem">The platform where professional networks become commerce engines.</p><button class="btn btn-teal" style="justify-content:center;width:100%" onclick="window.location.href=window.location.pathname">Join Fairriss</button></div>'+
  '</div></div>';
}

// ── Public Wheel preview (shareable, no login required) ───────────────────
async function renderPublicWheel(slug){
  document.body.innerHTML = '<div style="min-height:100vh;background:var(--surface);display:flex;align-items:center;justify-content:center;padding:1.5rem"><div style="text-align:center;color:var(--text-3)">Loading...</div></div>';
  let w = null;
  try {
    const sb = getSb() || window._supabase;
    if(sb){
      const { data } = await sb.from('public_wheels').select('*').eq('slug', slug).single();
      if(data) w = data;
    }
  } catch(e){ console.warn('Public wheel fetch failed:', e.message); }

  if(!w){
    document.body.innerHTML = '<div style="min-height:100vh;background:var(--surface);display:flex;align-items:center;justify-content:center;padding:1.5rem"><div style="text-align:center"><h2 style="color:var(--navy)">This Wheel is no longer available</h2><p class="t-body c-text3 mb-4">It may have been deleted, or the link is incorrect.</p><a href="'+window.location.pathname+'" class="btn btn-primary">Go to Fairriss</a></div></div>';
    return;
  }

  document.body.innerHTML =
  '<div style="min-height:100vh;background:var(--surface)">'+
  '<div style="background:'+(w.cover_gradient||'var(--navy)')+';padding:3rem 1.5rem;text-align:center">'+
  '<div style="width:76px;height:76px;border-radius:50%;background:'+(w.hex_color||'#0F1F3D')+';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.75rem;margin:0 auto 1rem;box-shadow:0 6px 24px rgba(0,0,0,.3)">'+escHtml(w.name[0])+'</div>'+
  '<h1 style="color:#fff;font-size:1.75rem;margin-bottom:.375rem">'+escHtml(w.name)+'</h1>'+
  '<div style="color:rgba(255,255,255,.6);font-size:.875rem">'+fmt(w.member_count||0)+' members &middot; '+escHtml(w.category||'Community')+'</div>'+
  '</div>'+
  '<div style="max-width:560px;margin:0 auto;padding:2rem 1.5rem">'+
  '<div class="card mb-4"><p class="t-body" style="color:var(--text-2);line-height:1.7">'+escHtml(w.description)+'</p></div>'+
  '<div class="card" style="text-align:center;background:var(--navy)"><h2 style="color:var(--teal);margin-bottom:.5rem">Join Fairriss to see what\'s happening in '+escHtml(w.name)+'</h2><p style="color:rgba(255,255,255,.7);margin-bottom:1.25rem">Members, posts, opportunities, and deals are only visible once you join.</p><button class="btn btn-teal" style="justify-content:center;width:100%" onclick="window.location.href=window.location.pathname">Join Fairriss</button></div>'+
  '</div></div>';
}

function renderAuth(){
  document.body.innerHTML = `
    <style>
      .lp-nav { position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-bottom:1px solid #e8e8e8;padding:0 2rem;height:64px;display:flex;align-items:center;justify-content:space-between; }
      .lp-hero { min-height:100vh;position:relative;display:flex;align-items:center;overflow:hidden;padding-top:64px; }
      .lp-hero-content { position:relative;z-index:1;max-width:680px;padding:4rem 3rem; }
      .lp-hero h1 { color:#fff;font-size:3.5rem;font-weight:900;line-height:1.1;margin:0 0 1.25rem;letter-spacing:-.03em; }
      .lp-grid-3 { display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;max-width:960px;margin:0 auto; }
      .lp-grid-6 { display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem; }
      .lp-grid-4 { display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem; }
      .lp-stats { display:flex;gap:2.5rem;margin-top:2.5rem;flex-wrap:wrap; }
      .lp-btns { display:flex;gap:1rem;flex-wrap:wrap; }
      .lp-section { padding:6rem 2rem; }
      .lp-modal-grid { display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem; }
      @media(max-width:768px){
        .lp-nav { padding:0 1rem; }
        .lp-nav .nav-links span { display:none; }
        .lp-hero-content { padding:2rem 1.5rem; }
        .lp-hero h1 { font-size:2.25rem; }
        .lp-grid-3 { grid-template-columns:1fr; }
        .lp-grid-6 { grid-template-columns:1fr 1fr; }
        .lp-grid-4 { grid-template-columns:1fr 1fr; }
        .lp-stats { gap:1.5rem; }
        .lp-btns { flex-direction:column; }
        .lp-btns button { width:100%;text-align:center; }
        .lp-section { padding:3.5rem 1.25rem; }
        .lp-section h2 { font-size:1.875rem !important; }
        .lp-modal-grid { grid-template-columns:1fr; }
        .lp-cta h2 { font-size:2rem !important; }
      }
    </style>
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;background:#fff;overflow-x:hidden">

      <nav class="lp-nav">
        <div style="display:flex;align-items:center;gap:.625rem">
          <img src="fairriss-logo.png" style="height:36px;width:auto">
          <span style="font-weight:800;font-size:1.25rem;color:#0F1F3D">Fairriss</span>
        </div>
        <div style="display:flex;align-items:center;gap:1rem">
          <button onclick="showAuthModal('login')" style="background:none;border:none;font-size:.9375rem;font-weight:600;color:#0F1F3D;cursor:pointer;padding:.5rem 1rem">Sign In</button>
          <button onclick="showAuthModal('signup')" style="background:#0F1F3D;color:#fff;border:none;border-radius:8px;padding:.625rem 1.25rem;font-size:.9375rem;font-weight:700;cursor:pointer">Join Free</button>
        </div>
      </nav>

      <section class="lp-hero">
        <img src="fairriss-art.png?v=2" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(15,31,61,.92) 0%,rgba(15,31,61,.75) 50%,rgba(15,31,61,.4) 100%)"></div>
        <div class="lp-hero-content">
          <div style="display:inline-flex;align-items:center;gap:.5rem;background:rgba(0,201,167,.15);border:1px solid rgba(0,201,167,.4);border-radius:99px;padding:.375rem 1rem;margin-bottom:1.5rem">
            <span style="width:8px;height:8px;border-radius:50%;background:#00C9A7;display:inline-block"></span>
            <span style="color:#00C9A7;font-size:.8125rem;font-weight:600">The Network-Commerce Platform</span>
          </div>
          <h1>Your Network.<br>Your Community.<br><span style="color:#00C9A7">Your Income.</span></h1>
          <p style="color:rgba(255,255,255,.8);font-size:1.1875rem;line-height:1.65;margin:0 0 2.5rem;max-width:520px">Build Wheels where your network becomes your net worth. Post opportunities, close deals, and get paid all in one place.</p>
          <div class="lp-btns">
            <button onclick="showAuthModal('signup')" style="background:#00C9A7;color:#0F1F3D;border:none;border-radius:10px;padding:1rem 2rem;font-size:1.0625rem;font-weight:800;cursor:pointer">Get Started Free</button>
            <button onclick="showAuthModal('login')" style="background:rgba(255,255,255,.1);color:#fff;border:1.5px solid rgba(255,255,255,.3);border-radius:10px;padding:1rem 2rem;font-size:1.0625rem;font-weight:700;cursor:pointer">Sign In</button>
          </div>
          <div class="lp-stats">
            <div style="display:flex;align-items:center;gap:.5rem"><span style="width:8px;height:8px;border-radius:50%;background:#00C9A7;display:inline-block"></span><span style="color:rgba(255,255,255,.85);font-size:.9375rem;font-weight:600">Professionals</span></div>
            <div style="display:flex;align-items:center;gap:.5rem"><span style="width:8px;height:8px;border-radius:50%;background:#00C9A7;display:inline-block"></span><span style="color:rgba(255,255,255,.85);font-size:.9375rem;font-weight:600">Deals Closed</span></div>
            <div style="display:flex;align-items:center;gap:.5rem"><span style="width:8px;height:8px;border-radius:50%;background:#00C9A7;display:inline-block"></span><span style="color:rgba(255,255,255,.85);font-size:.9375rem;font-weight:600">Active Wheels</span></div>
          </div>
        </div>
      </section>

      <section class="lp-section" style="background:#f8f9fc;text-align:center">
        <p style="color:#00C9A7;font-weight:700;font-size:.875rem;letter-spacing:.08em;text-transform:uppercase;margin:0 0 .75rem">How It Works</p>
        <h2 style="color:#0F1F3D;font-size:2.5rem;font-weight:900;margin:0 0 1rem;letter-spacing:-.02em">Three steps to get paid</h2>
        <p style="color:#64748B;font-size:1.0625rem;max-width:520px;margin:0 auto 4rem;line-height:1.6">Fairriss combines community, opportunities, and payments in one seamless platform.</p>
        <div class="lp-grid-3">
          <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,31,61,.06);text-align:left;position:relative">
            <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80" style="width:100%;height:180px;object-fit:cover;display:block">
            <div style="padding:1.75rem 2rem;position:relative">
              <div style="position:absolute;top:1rem;right:1.5rem;font-size:3rem;font-weight:900;color:rgba(15,31,61,.06);line-height:1">1</div>
              <h3 style="color:#0F1F3D;font-size:1.1875rem;font-weight:800;margin:0 0 .625rem">Create or Join a Wheel</h3>
              <p style="color:#64748B;line-height:1.6;margin:0;font-size:.9375rem">Build your own community or join an existing one. Wheels are spaces where real deals happen.</p>
            </div>
          </div>
          <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,31,61,.06);text-align:left;position:relative">
            <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80" style="width:100%;height:180px;object-fit:cover;display:block">
            <div style="padding:1.75rem 2rem;position:relative">
              <div style="position:absolute;top:1rem;right:1.5rem;font-size:3rem;font-weight:900;color:rgba(15,31,61,.06);line-height:1">2</div>
              <h3 style="color:#0F1F3D;font-size:1.1875rem;font-weight:800;margin:0 0 .625rem">Post Opportunities</h3>
              <p style="color:#64748B;line-height:1.6;margin:0;font-size:.9375rem">Share jobs, partnerships, referrals, and collaboration requests. Your network sees it first.</p>
            </div>
          </div>
          <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,31,61,.06);text-align:left;position:relative">
            <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80" style="width:100%;height:180px;object-fit:cover;display:block">
            <div style="padding:1.75rem 2rem;position:relative">
              <div style="position:absolute;top:1rem;right:1.5rem;font-size:3rem;font-weight:900;color:rgba(15,31,61,.06);line-height:1">3</div>
              <h3 style="color:#0F1F3D;font-size:1.1875rem;font-weight:800;margin:0 0 .625rem">Close Deals and Get Paid</h3>
              <p style="color:#64748B;line-height:1.6;margin:0;font-size:.9375rem">Propose deals, agree on terms, and get paid through secure escrow. Fairriss takes just 10%.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- POPULAR SERVICES -->
      <section class="lp-section" style="background:#f8f9fc">
        <div style="max-width:1100px;margin:0 auto">
          <p style="color:#00C9A7;font-weight:700;font-size:.875rem;letter-spacing:.08em;text-transform:uppercase;margin:0 0 .75rem">What People Do Here</p>
          <h2 style="color:#0F1F3D;font-size:2.5rem;font-weight:900;margin:0 0 .75rem;letter-spacing:-.02em">Popular Services</h2>
          <p style="color:#64748B;font-size:1rem;margin:0 0 2.5rem">Hire talented professionals or offer your own skills across these in-demand categories.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem">
            ${ [
              {label:'Web Development', color:'#0F1F3D', img:'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80'},
              {label:'Graphic Design', color:'#6D28D9', img:'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80'},
              {label:'Video Editing', color:'#BE185D', img:'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80'},
              {label:'Marketing', color:'#047857', img:'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=80'},
              {label:'Copywriting', color:'#B45309', img:'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80'},
              {label:'Software Dev', color:'#0369A1', img:'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80'},
            ].map(s => `
              <div style="border-radius:12px;overflow:hidden;position:relative;cursor:pointer" onclick="showAuthModal('signup')">
                <img src="${s.img}" style="width:100%;height:130px;object-fit:cover;display:block">
                <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7),transparent)"></div>
                <div style="position:absolute;bottom:.75rem;left:.75rem;color:#fff;font-weight:700;font-size:.9375rem">${s.label}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- FREELANCERS -->
      <section class="lp-section" style="background:#fff">
        <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center" class="lp-freelance-grid">
          <div>
            <p style="color:#00C9A7;font-weight:700;font-size:.875rem;letter-spacing:.08em;text-transform:uppercase;margin:0 0 .75rem">For Freelancers</p>
            <h2 style="color:#0F1F3D;font-size:2.25rem;font-weight:900;margin:0 0 1rem;letter-spacing:-.02em">Get hired. Get paid. Build your reputation.</h2>
            <p style="color:#64748B;font-size:1rem;line-height:1.7;margin:0 0 1.5rem">Fairriss connects you directly with businesses and founders in Wheels. No bidding wars. No race to the bottom. Just real opportunities from real people in your network.</p>
            <div style="display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem">
              <div style="display:flex;align-items:center;gap:.75rem"><span style="width:24px;height:24px;border-radius:50%;background:#00C9A7;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#0F1F3D;font-weight:900;font-size:.75rem">&#x2713;</span><span style="color:#374151;font-size:.9375rem">Secure payments held in escrow</span></div>
              <div style="display:flex;align-items:center;gap:.75rem"><span style="width:24px;height:24px;border-radius:50%;background:#00C9A7;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#0F1F3D;font-weight:900;font-size:.75rem">&#x2713;</span><span style="color:#374151;font-size:.9375rem">Build your Trust Score with every deal</span></div>
              <div style="display:flex;align-items:center;gap:.75rem"><span style="width:24px;height:24px;border-radius:50%;background:#00C9A7;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#0F1F3D;font-weight:900;font-size:.75rem">&#x2713;</span><span style="color:#374151;font-size:.9375rem">Join Wheels in your niche and get discovered</span></div>
              <div style="display:flex;align-items:center;gap:.75rem"><span style="width:24px;height:24px;border-radius:50%;background:#00C9A7;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#0F1F3D;font-weight:900;font-size:.75rem">&#x2713;</span><span style="color:#374151;font-size:.9375rem">Only 10% platform fee — keep more of what you earn</span></div>
            </div>
            <button onclick="showAuthModal('signup')" style="background:#0F1F3D;color:#fff;border:none;border-radius:10px;padding:.875rem 2rem;font-size:1rem;font-weight:700;cursor:pointer">Start as a Freelancer</button>
          </div>
          <div style="border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(15,31,61,.12)">
            <img src="https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=800&q=80" style="width:100%;height:400px;object-fit:cover;display:block">
          </div>
        </div>
      </section>

      <section class="lp-section" style="background:#fff">
        <div style="max-width:1100px;margin:0 auto">
          <div style="text-align:center;margin-bottom:4rem">
            <p style="color:#00C9A7;font-weight:700;font-size:.875rem;letter-spacing:.08em;text-transform:uppercase;margin:0 0 .75rem">Everything You Need</p>
            <h2 style="color:#0F1F3D;font-size:2.5rem;font-weight:900;margin:0;letter-spacing:-.02em">Built for serious professionals</h2>
          </div>
          <div class="lp-grid-6">
            <div style="border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(15,31,61,.08)">
              <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80" style="width:100%;height:200px;object-fit:cover;display:block">
              <div style="padding:1.5rem"><h3 style="color:#0F1F3D;font-size:1.0625rem;font-weight:700;margin:0 0 .5rem">Wheels</h3><p style="color:#64748B;font-size:.9rem;line-height:1.6;margin:0">Create communities for your network. Anyone can join, or ask to be invited.</p></div>
            </div>
            <div style="border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(15,31,61,.08)">
              <img src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&q=80" style="width:100%;height:200px;object-fit:cover;display:block">
              <div style="padding:1.5rem"><h3 style="color:#0F1F3D;font-size:1.0625rem;font-weight:700;margin:0 0 .5rem">Deal Pipeline</h3><p style="color:#64748B;font-size:.9rem;line-height:1.6;margin:0">Propose, negotiate, and close deals with built-in escrow protection.</p></div>
            </div>
            <div style="border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(15,31,61,.08)">
              <img src="https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=600&q=80" style="width:100%;height:200px;object-fit:cover;display:block">
              <div style="padding:1.5rem"><h3 style="color:#0F1F3D;font-size:1.0625rem;font-weight:700;margin:0 0 .5rem">Secure Payments</h3><p style="color:#64748B;font-size:.9rem;line-height:1.6;margin:0">Card, Apple Pay, and Google Pay. Money held in escrow until work is approved.</p></div>
            </div>
            <div style="border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(15,31,61,.08)">
              <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80" style="width:100%;height:200px;object-fit:cover;display:block">
              <div style="padding:1.5rem"><h3 style="color:#0F1F3D;font-size:1.0625rem;font-weight:700;margin:0 0 .5rem">Opportunities</h3><p style="color:#64748B;font-size:.9rem;line-height:1.6;margin:0">Post jobs, partnerships, referrals, and collaborations to your Wheel.</p></div>
            </div>
            <div style="border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(15,31,61,.08)">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80" style="width:100%;height:200px;object-fit:cover;display:block">
              <div style="padding:1.5rem"><h3 style="color:#0F1F3D;font-size:1.0625rem;font-weight:700;margin:0 0 .5rem">Find People</h3><p style="color:#64748B;font-size:.9rem;line-height:1.6;margin:0">Search professionals by skill, location, and availability across the platform.</p></div>
            </div>
            <div style="border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(15,31,61,.08)">
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80" style="width:100%;height:200px;object-fit:cover;display:block">
              <div style="padding:1.5rem"><h3 style="color:#0F1F3D;font-size:1.0625rem;font-weight:700;margin:0 0 .5rem">Trust Score</h3><p style="color:#64748B;font-size:.9rem;line-height:1.6;margin:0">Build your reputation with every completed deal. Trust Score grows with you.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section class="lp-section" style="background:#0F1F3D">
        <div style="max-width:1100px;margin:0 auto;text-align:center">
          <p style="color:#00C9A7;font-weight:700;font-size:.875rem;letter-spacing:.08em;text-transform:uppercase;margin:0 0 .75rem">Who It Is For</p>
          <h2 style="color:#fff;font-size:2.5rem;font-weight:900;margin:0 0 3rem;letter-spacing:-.02em">Built for every professional</h2>
          <div class="lp-grid-4">
            <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:2rem 1.5rem"><h3 style="color:#fff;font-size:1.0625rem;font-weight:700;margin:0 0 .5rem">Founders</h3><p style="color:rgba(255,255,255,.6);font-size:.875rem;line-height:1.6;margin:0">Share deal flow, co-invest, and find your next hire.</p></div>
            <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:2rem 1.5rem"><h3 style="color:#fff;font-size:1.0625rem;font-weight:700;margin:0 0 .5rem">Freelancers</h3><p style="color:rgba(255,255,255,.6);font-size:.875rem;line-height:1.6;margin:0">Get hired, get paid, build your reputation.</p></div>
            <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:2rem 1.5rem"><h3 style="color:#fff;font-size:1.0625rem;font-weight:700;margin:0 0 .5rem">Business Owners</h3><p style="color:rgba(255,255,255,.6);font-size:.875rem;line-height:1.6;margin:0">Find partners, contractors, and opportunities.</p></div>
            <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:2rem 1.5rem"><h3 style="color:#fff;font-size:1.0625rem;font-weight:700;margin:0 0 .5rem">Investors</h3><p style="color:rgba(255,255,255,.6);font-size:.875rem;line-height:1.6;margin:0">Access curated deal flow from trusted networks.</p></div>
          </div>
        </div>
      </section>

      <section class="lp-section lp-cta" style="background:linear-gradient(135deg,#00C9A7 0%,#0F1F3D 100%);text-align:center">
        <div style="display:flex;align-items:center;justify-content:center;gap:1.25rem;flex-wrap:wrap;margin-bottom:1rem">
          <img src="fairriss-logo.png" style="height:70px;width:auto;flex-shrink:0">
          <h2 style="color:#fff;font-size:3rem;font-weight:900;margin:0;letter-spacing:-.03em">Ready to grow your network?</h2>
        </div>
        <p style="color:rgba(255,255,255,.8);font-size:1.125rem;margin:0 0 2.5rem">Join thousands of professionals already on Fairriss. Free to join.</p>
        <button onclick="showAuthModal('signup')" style="background:#fff;color:#0F1F3D;border:none;border-radius:10px;padding:1.125rem 2.5rem;font-size:1.125rem;font-weight:800;cursor:pointer">Get Started Free</button>
      </section>

      <footer style="background:#0F1F3D;padding:2rem;text-align:center">
        <div style="display:flex;align-items:center;justify-content:center;gap:.625rem;margin-bottom:1rem">
          <img src="fairriss-logo.png" style="height:32px;width:auto">
          <span style="color:#fff;font-weight:800">Fairriss</span>
        </div>
        <div style="display:flex;gap:2rem;justify-content:center;margin-bottom:1rem">
          <a href="#" onclick="renderTerms()" style="color:rgba(255,255,255,.5);font-size:.875rem;text-decoration:none">Terms</a>
          <a href="#" onclick="renderPrivacy()" style="color:rgba(255,255,255,.5);font-size:.875rem;text-decoration:none">Privacy</a>
          <a href="mailto:hello@fairriss.com" style="color:rgba(255,255,255,.5);font-size:.875rem;text-decoration:none">Contact</a>
        </div>
        <p style="color:rgba(255,255,255,.3);font-size:.8125rem;margin:0">&copy; 2026 Fairriss. All rights reserved.</p>
      </footer>

      <div id="auth-modal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(15,31,61,.7);backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:1rem">
        <div style="background:#fff;border-radius:16px;width:100%;max-width:440px;padding:2.5rem;position:relative;box-shadow:0 24px 64px rgba(15,31,61,.25);max-height:90vh;overflow-y:auto">
          <button onclick="closeAuthModal()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.25rem;cursor:pointer;color:#94A3B8;line-height:1">&#x2715;</button>
          <div style="display:flex;align-items:center;gap:.625rem;margin-bottom:1.5rem">
            <img src="fairriss-logo.png" style="height:34px;width:auto">
            <span style="font-weight:800;font-size:1.125rem;color:#0F1F3D">Fairriss</span>
          </div>
          <div style="display:flex;border:1.5px solid #E2E8F0;border-radius:8px;margin-bottom:1.5rem;overflow:hidden">
            <button id="modal-tab-login" onclick="authTab('login')" style="flex:1;padding:.75rem;border:none;background:#0F1F3D;color:#fff;font-weight:700;font-size:.9375rem;cursor:pointer">Sign In</button>
            <button id="modal-tab-signup" onclick="authTab('signup')" style="flex:1;padding:.75rem;border:none;background:#fff;color:#64748B;font-weight:700;font-size:.9375rem;cursor:pointer">Create Account</button>
          </div>
          <div id="auth-login-form">
            <div style="margin-bottom:1rem"><label style="display:block;font-size:.875rem;font-weight:600;color:#0F1F3D;margin-bottom:.375rem">Email</label><input id="li-email" type="email" placeholder="you@example.com" style="width:100%;padding:.75rem 1rem;border:1.5px solid #E2E8F0;border-radius:8px;font-size:.9375rem;box-sizing:border-box;outline:none"></div>
            <div style="margin-bottom:1rem"><label style="display:block;font-size:.875rem;font-weight:600;color:#0F1F3D;margin-bottom:.375rem">Password</label><div style="position:relative"><input id="li-password" type="password" placeholder="Your password" style="width:100%;padding:.75rem 2.75rem .75rem 1rem;border:1.5px solid #E2E8F0;border-radius:8px;font-size:.9375rem;box-sizing:border-box;outline:none"><button type="button" onclick="togglePw('li-password',this)" style="position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:.6rem .5rem;margin:-.6rem -.5rem;color:#94A3B8;font-size:.8125rem;font-weight:600;-webkit-tap-highlight-color:transparent">Show</button></div></div>
            <div id="auth-error" style="color:#EF4444;font-size:.875rem;margin-bottom:.75rem;display:none"></div>
            <button id="signin-btn" style="width:100%;padding:.875rem;background:#0F1F3D;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;margin-bottom:1rem">Sign In</button>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <button id="magic-link-btn" style="background:none;border:none;color:#64748B;font-size:.875rem;cursor:pointer;padding:0">Sign in without a password</button>
              <a href="#" id="forgot-password-link" style="color:#00C9A7;font-size:.875rem;font-weight:600;text-decoration:none">Forgot password?</a>
            </div>
          </div>
          <div id="auth-signup-form" style="display:none">
            <div class="lp-modal-grid">
              <div><label style="display:block;font-size:.875rem;font-weight:600;color:#0F1F3D;margin-bottom:.375rem">Full Name *</label><input id="su-name" placeholder="Alex Chen" style="width:100%;padding:.75rem 1rem;border:1.5px solid #E2E8F0;border-radius:8px;font-size:.9375rem;box-sizing:border-box;outline:none"></div>
              <div><label style="display:block;font-size:.875rem;font-weight:600;color:#0F1F3D;margin-bottom:.375rem">Username *</label><input id="su-username" placeholder="alexchen" style="width:100%;padding:.75rem 1rem;border:1.5px solid #E2E8F0;border-radius:8px;font-size:.9375rem;box-sizing:border-box;outline:none"></div>
            </div>
            <div style="margin-bottom:1rem"><label style="display:block;font-size:.875rem;font-weight:600;color:#0F1F3D;margin-bottom:.375rem">Email *</label><input id="su-email" type="email" placeholder="alex@example.com" style="width:100%;padding:.75rem 1rem;border:1.5px solid #E2E8F0;border-radius:8px;font-size:.9375rem;box-sizing:border-box;outline:none"></div>
            <div style="margin-bottom:1rem"><label style="display:block;font-size:.875rem;font-weight:600;color:#0F1F3D;margin-bottom:.375rem">Password *</label><div style="position:relative"><input id="su-password" type="password" placeholder="Min 6 characters" style="width:100%;padding:.75rem 2.75rem .75rem 1rem;border:1.5px solid #E2E8F0;border-radius:8px;font-size:.9375rem;box-sizing:border-box;outline:none"><button type="button" onclick="togglePw('su-password',this)" style="position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:.6rem .5rem;margin:-.6rem -.5rem;color:#94A3B8;font-size:.8125rem;font-weight:600;-webkit-tap-highlight-color:transparent">Show</button></div></div>
            <div id="signup-error" style="color:#EF4444;font-size:.875rem;margin-bottom:.75rem;display:none"></div>
            <button id="create-account-btn" style="width:100%;padding:.875rem;background:#0F1F3D;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;margin-bottom:1rem">Create Account</button>
            <p style="font-size:.75rem;color:#94A3B8;text-align:center;margin:0">By signing up you agree to our <a href="#" onclick="renderTerms()" style="color:#00C9A7">Terms</a> and <a href="#" onclick="renderPrivacy()" style="color:#00C9A7">Privacy Policy</a></p>
          </div>
        </div>
      </div>
    </div>
  `;

  window.togglePw = (inputId, btn) => {
    const input = document.getElementById(inputId);
    if(!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? 'Hide' : 'Show';
  };
  window.showAuthModal = (tab) => {
    const modal = document.getElementById('auth-modal');
    modal.style.display = 'flex';
    authTab(tab);
  };
  window.closeAuthModal = () => {
    document.getElementById('auth-modal').style.display = 'none';
  };
  document.getElementById('auth-modal').onclick = (e) => {
    if(e.target === document.getElementById('auth-modal')) closeAuthModal();
  };

  window.authTab = (tab) => {
    const lf = document.getElementById('auth-login-form');
    const sf = document.getElementById('auth-signup-form');
    const lb = document.getElementById('modal-tab-login');
    const sb = document.getElementById('modal-tab-signup');
    if(!lf) return;
    if(tab === 'login'){
      lf.style.display='block'; sf.style.display='none';
      if(lb){lb.style.background='#0F1F3D';lb.style.color='#fff';}
      if(sb){sb.style.background='#fff';sb.style.color='#64748B';}
    } else {
      lf.style.display='none'; sf.style.display='block';
      if(sb){sb.style.background='#0F1F3D';sb.style.color='#fff';}
      if(lb){lb.style.background='#fff';lb.style.color='#64748B';}
    }
  };

  document.getElementById('signin-btn').onclick = async () => {
    const email = document.getElementById('li-email').value.trim();
    const password = document.getElementById('li-password').value.trim();
    if(!email||!password){showAuthError('auth-error','Please enter your email and password.');return;}
    const btn = document.getElementById('signin-btn');
    btn.textContent='Signing in...';btn.disabled=true;

    // Safety timeout - reset button if stuck after 10 seconds
    const timeout = setTimeout(()=>{
      btn.textContent='Sign In';btn.disabled=false;
      showAuthError('auth-error','Sign in timed out. Please try again.');
    }, 10000);

    try {
      // Sign in directly with Supabase
      const { data, error } = await window._supabase.auth.signInWithPassword({ email, password });
      if(error) throw error;
      const user = data.user;
      if(!user) throw new Error('No user returned. Please try again.');

      // Load profile from DB
      const { data: profile, error: profileError } = await window._supabase
        .from('users').select('*').eq('id', user.id).single();

      clearTimeout(timeout);

      if(profileError || !profile){
        // Profile doesn't exist yet - create it
        const newProfile = {
          id: user.id, name: email.split('@')[0], username: email.split('@')[0],
          email, role: 'member', bio: '', skills: [], location: '', availability: 'available'
        };
        store.data.users.push(newProfile);
        store.data.currentUser = user.id;
        store._save();
        renderOnboarding();
        return;
      }

      const localProfile = sbToLocal(profile);
      store.data.currentUser = user.id;
      const existing = store.data.users.find(u=>u.id===user.id);
      if(!existing) store.data.users.push(localProfile);
      else Object.assign(existing, localProfile);
      store._save();

      if(window.LiveStore){
        window.LiveStore._currentUserId = user.id;
        window.LiveStore._profile = localProfile;
        window.LiveStore._loaded = true;
      }

      if(!profile.user_type) renderOnboarding();
      else renderPage();
    } catch(e){
      clearTimeout(timeout);
      const msg = (e.message||'').toLowerCase();
      if(msg.includes('invalid login credentials')){
        showAuthError('auth-error', "That's not the right password.");
      } else {
        showAuthError('auth-error', e.message||'Sign in failed. Check your email and password.');
      }
      btn.textContent='Sign In';btn.disabled=false;
    }
  };
  document.getElementById('li-password').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('signin-btn').click();});

  document.getElementById('magic-link-btn').onclick = async () => {
    const email=document.getElementById('li-email').value.trim();
    if(!email){showAuthError('auth-error','Enter your email first.');return;}
    try {
      await window.Auth.sendMagicLink(email);
      const el=document.getElementById('auth-error');
      el.textContent='Magic link sent! Check your email.';el.style.color='#10B981';el.style.display='block';
    } catch(e){showAuthError('auth-error',e.message);}
  };

  document.getElementById('forgot-password-link').onclick = async (e) => {
    e.preventDefault();
    const email=document.getElementById('li-email').value.trim();
    if(!email){showAuthError('auth-error','Enter your email address first.');return;}
    try {
      await window._supabase.auth.resetPasswordForEmail(email,{redirectTo:'https://fairriss.com'});
      const el=document.getElementById('auth-error');
      el.textContent='Password reset email sent! Check your inbox.';el.style.color='#10B981';el.style.display='block';
    } catch(e){showAuthError('auth-error',e.message);}
  };

  document.getElementById('create-account-btn').onclick = async () => {
    const name=document.getElementById('su-name').value.trim();
    const username=document.getElementById('su-username').value.trim();
    const email=document.getElementById('su-email').value.trim();
    const password=document.getElementById('su-password').value.trim();
    if(!name||!username||!email||!password){showAuthError('signup-error','Please fill in all fields.');return;}
    if(password.length<6){showAuthError('signup-error','Password must be at least 6 characters.');return;}
    const btn=document.getElementById('create-account-btn');
    btn.textContent='Creating account...';btn.disabled=true;
    try {
      const user=await window.Auth.signUp(email,password,name,username);
      if(user){
        store.createUser({id:user.id,name,username,email,role:'member',bio:'',skills:[],location:'',availability:'available'});
        store.data.currentUser=user.id;store._save();
        if(window._supabase){setTimeout(async()=>{try{await window._supabase.from('notifications').insert({user_id:user.id,type:'welcome',text:'Welcome to Fairriss, '+escHtml(name)+'! Start by creating or joining a Wheel.'});}catch(e){}},2000);}
        toast('Account created! Check your email to verify.','success');
        renderOnboarding();
      }
    } catch(e){
      showAuthError('signup-error',e.message||'Sign up failed. Try a different email.');
      btn.textContent='Create Account';btn.disabled=false;
    }
  };
  document.getElementById('su-password').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('create-account-btn').click();});
}


// ── Onboarding ─────────────────────────────────────────────────────────────
function renderOnboarding(){
  const step=store.data._obStep||1;
  document.body.innerHTML='<div style="min-height:100vh;background:var(--surface);display:flex;align-items:center;justify-content:center;padding:2rem"><div style="background:var(--white);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);width:100%;max-width:520px;overflow:hidden"><div style="background:var(--navy);padding:1.5rem 2rem;display:flex;align-items:center;gap:.75rem"><div style="width:34px;height:34px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;font-weight:900;color:var(--navy)">F</div><span style="color:var(--white);font-weight:800;font-size:1.125rem">Fairriss</span><div style="margin-left:auto;display:flex;gap:.5rem"><div style="width:32px;height:4px;border-radius:99px;background:'+(step>=1?'var(--teal)':'rgba(255,255,255,.2)')+'"></div><div style="width:32px;height:4px;border-radius:99px;background:'+(step>=2?'var(--teal)':'rgba(255,255,255,.2)')+'"></div></div></div><div style="padding:2rem" id="ob-body"></div></div></div>';
  if(step===1){
    $('#ob-body').innerHTML='<h2 class="t-h1 mb-2">What best describes you?</h2><p class="t-body c-text3 mb-4">This helps us personalise your Fairriss experience.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.5rem">'+
    ['Founder','Freelancer','Owner','Investor','Advisor','Other'].map(t=>'<div class="auth-role-card" data-type="'+t+'" onclick="obSelectType(this,\''+t+'\')"><div class="auth-role-icon">'+({'Founder':'&#x1F680;','Freelancer':'&#x1F4BB;','Owner':'&#x1F3E2;','Investor':'&#x1F4B0;','Advisor':'&#x1F4A1;','Other':'&#x2728;'}[t])+'</div><div class="auth-role-name">'+t+'</div></div>').join('')+
    '</div><div class="form-group mb-3" id="ob-other-row" style="display:none"><label class="form-label">Tell us what you do</label><input class="form-control" id="ob-other-input" placeholder="e.g. Consultant, Student, Recruiter..."></div><button class="btn btn-teal w-full" style="justify-content:center" onclick="ob1Next()">Continue</button>';
  }else{
    $('#ob-body').innerHTML='<h2 class="t-h1 mb-2">What do you want to do?</h2><p class="t-body c-text3 mb-4">Select all that apply.</p><div style="display:flex;flex-direction:column;gap:.625rem;margin-bottom:1.5rem">'+
    ['Hire People','Find Work','Join Communities','Post Opportunities','Network','Other'].map(t=>'<label style="display:flex;align-items:center;gap:.875rem;padding:.875rem 1rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);cursor:pointer"><input type="checkbox" value="'+t+'" style="width:18px;height:18px;accent-color:var(--teal)"> <span style="font-size:.9375rem;font-weight:500">'+t+'</span></label>').join('')+
    '</div><div class="form-row mb-3"><div class="form-group"><label class="form-label">Job Title</label><input class="form-control" id="ob-title" placeholder="CEO, Freelance Designer..."></div><div class="form-group"><label class="form-label">Company</label><input class="form-control" id="ob-company" placeholder="Acme Corp, Self-employed..."></div></div>'+
    '<button class="btn btn-teal w-full" style="justify-content:center" onclick="ob2Finish()">Get Started</button>';
  }
}
window.obSelectType=(el,type)=>{$$('[data-type]').forEach(c=>c.classList.remove('selected'));el.classList.add('selected');store.data._pendingType=type;const row=document.getElementById('ob-other-row');if(row)row.style.display=(type==='Other')?'block':'none';};
window.ob1Next=()=>{
  let type=store.data._pendingType;
  if(!type){toast('Please select what describes you','error');return;}
  if(type==='Other'){
    const custom=$('#ob-other-input')?.value.trim();
    if(!custom){toast('Please tell us what you do','error');return;}
    type=custom;
  }
  store.updateMe({userType:type});store.data._obStep=2;renderOnboarding();
};
window.ob2Finish=()=>{const wantTo=[...$$('label input[type=checkbox]:checked')].map(i=>i.value);store.updateMe({wantTo,jobTitle:$('#ob-title')?.value.trim()||'',company:$('#ob-company')?.value.trim()||''});store.data._obStep=null;store.data._pendingType=null;store._save();toast('Welcome to Fairriss!','success');navigate('home');};

// ── Shell ──────────────────────────────────────────────────────────────────
function renderShell(me){
  if($('.shell')){updateShellDynamic(me);return;}
  document.body.innerHTML='<div class="shell"><header class="header"><div class="header-logo"><div class="header-logo-mark" onclick="navigate(\'home\')" style="cursor:pointer">F</div><span class="header-logo-text" onclick="navigate(\'home\')" style="cursor:pointer">Fairriss</span></div><div class="header-search"><svg class="header-search-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input type="text" placeholder="Search members, deals, opportunities..." id="global-search"></div><div class="header-actions"><button class="header-btn mobile-search-btn" onclick="navigate(\'members\',{focus:true})" aria-label="Search"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></button><div style="position:relative"><button class="header-btn" id="notif-btn"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span class="notif-dot" id="notif-dot" style="display:none"></span></button><div class="notif-panel" id="notif-panel"></div></div><div class="header-avatar" id="header-avatar" onclick="navigate(\'profile\',{userId:\''+me.id+'\'})">'+initials(me.name)+'</div></div></header><aside class="sidebar"><div class="sidebar-section"><div class="sidebar-label">Navigation</div><nav><div class="nav-item" data-page="home" onclick="navigate(\'home\')">'+icon('home')+' Home</div><div class="nav-item" data-page="wheels" onclick="navigate(\'wheels\')">'+icon('wheel')+' My Wheels</div><div class="nav-item" data-page="opportunities" onclick="navigate(\'opportunities\')">'+icon('opp')+' Opportunities</div><div class="nav-item" data-page="deals" onclick="navigate(\'deals\')">'+icon('deal')+' Deals <span class="nav-badge" id="deal-badge" style="display:none"></span></div><div class="nav-item" data-page="messages" onclick="navigate(\'messages\')"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Inbox <span class="nav-badge" id="dm-badge" style="display:none"></span></div><div class="nav-item" data-page="members" onclick="navigate(\'members\')">'+icon('members')+' Find People</div><div class="nav-item" data-page="analytics" onclick="navigate(\'analytics\')">'+icon('analytics')+' Analytics</div>'+'<div class="nav-item" data-page="support" onclick="navigate(\'support\')"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Support</div>'+'<div class="nav-item" onclick="handleLogout()" style="color:var(--red)"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Log Out</div></nav></div><div class="sidebar-section"><div class="sidebar-label">My Wheels</div><div class="sidebar-wheels" id="sidebar-wheels"></div></div><div class="sidebar-bottom"><div class="sidebar-user" onclick="navigate(\'profile\',{userId:\''+me.id+'\'})">'+avatarHtml(me,'sm')+'<div class="sidebar-user-info"><div class="sidebar-user-name">'+escHtml(me.name)+'</div><div class="sidebar-user-role">'+(me.userType||me.role)+(me.reviewCount?' - '+me.reviewAvg+' \u2605 ('+me.reviewCount+')':'')+'</div></div></div><div style="padding:.625rem 1.25rem;border-top:1px solid var(--border);display:flex;gap:1rem"><a href="#" onclick="renderTerms()" style="font-size:.6875rem;color:var(--text-4);text-decoration:none">Terms</a><a href="#" onclick="renderPrivacy()" style="font-size:.6875rem;color:var(--text-4);text-decoration:none">Privacy</a></div></div></aside><main class="main" id="main-content">'+PAGES.map(p=>'<div class="page fade-in" id="page-'+p+'"></div>').join('')+'</main>'+
  // Mobile bottom navigation
  '<nav class="mobile-nav" style="display:none" id="mobile-nav">'+
  '<div class="mobile-nav-item" data-page="home" onclick="navigate(\'home\')">'+
  '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Home</div>'+
  '<div class="mobile-nav-item" data-page="wheels" onclick="navigate(\'wheels\')">'+
  '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/></svg>Wheels</div>'+
  '<div class="mobile-nav-item" data-page="opportunities" onclick="navigate(\'opportunities\')">'+
  '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>Opps</div>'+
  '<div class="mobile-nav-item" data-page="deals" onclick="navigate(\'deals\')">'+
  '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>Deals</div>'+
  '<div class="mobile-nav-item" data-page="messages" onclick="navigate(\'messages\')">'+
  '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Inbox</div>'+
  '<div class="mobile-nav-item" data-page="members" onclick="navigate(\'members\')">'+
  '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>People</div>'+
  '<div class="mobile-nav-item" data-page="profile" onclick="goProfile()">'+ '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Me</div>'+
  '</nav>'+
  '</div><div id="toast-container" class="toast-container"></div>'+buildModals();
  updateShellDynamic(me);
  $('#notif-btn').onclick=()=>{const p=$('#notif-panel');p.classList.toggle('open');if(p.classList.contains('open')){renderNotifPanel();store.markNotifsRead();}};
  document.addEventListener('click',e=>{if(!e.target.closest('#notif-btn')&&!e.target.closest('#notif-panel'))$('#notif-panel')?.classList.remove('open');});
  let st;$('#global-search').oninput=e=>{clearTimeout(st);st=setTimeout(()=>{if(e.target.value.length>1)navigate('members',{q:e.target.value});},350);};
  bindModalForms();
}

async function updateShellDynamic(me){
  const sw=$('#sidebar-wheels');
  if(sw){
    const wheels=await store.getMyWheels();
    sw.innerHTML=wheels.map(w=>'<div class="sidebar-wheel-item '+(pageParams.wheelId===w.id?'active':'')+'" onclick="navigate(\'wheel-detail\',{wheelId:\''+w.id+'\'})">'+hexBadge(w,24)+'<span class="sidebar-wheel-name">'+escHtml(w.name)+'</span><span class="sidebar-wheel-count">'+w.memberCount+'</span></div>').join('')+
    '<div class="sidebar-wheel-item" onclick="openModal(\'modal-create-wheel\')" style="color:var(--teal);font-weight:600;font-size:.8125rem"><span style="font-size:1.125rem">+</span> Create Wheel</div>';
  }
  // Add admin link if user is admin
  const adminLink = document.querySelector('[data-page="admin"]');
  if(me && me.role === 'admin' && !adminLink){
    const nav = document.querySelector('.sidebar nav');
    if(nav){
      const div = document.createElement('div');
      div.className = 'nav-item';
      div.dataset.page = 'admin';
      div.innerHTML = '&#x1F6E1; Admin';
      div.onclick = () => navigate('admin');
      nav.appendChild(div);
    }
  }
  const dot=$('#notif-dot');
  if(dot){try{const notifs=await store.getMyNotifs();dot.style.display=notifs.some(n=>!n.read)?'block':'none';}catch(e){}}
  const db=$('#deal-badge');
  if(db){try{const deals=await store.getMyDeals();const a=deals.filter(d=>['proposed','negotiating','in_progress'].includes(d.status));db.textContent=a.length||'';db.style.display=a.length?'inline-flex':'none';}catch(e){}}
}

function renderNotifPanel(){
  const notifs=store.getMyNotifs();
  const icons={deal_message:'&#x1F4AC;',new_member:'&#x1F464;',deal_completed:'&#x2705;',new_opportunity:'&#x1F3AF;',wheel_invite:'&#x1F517;',mention:'@',event_reminder:'&#x1F39F;',dm:'&#x2709;'};
  $('#notif-panel').innerHTML='<div class="notif-panel-head"><span class="notif-panel-title">Notifications</span></div>'+
  (notifs.length?notifs.map(n=>'<div class="notif-item '+(n.read?'':'unread')+'"><div class="notif-icon">'+(icons[n.type]||'&#x1F514;')+'</div><div><div class="notif-text">'+n.text+'</div><div class="notif-time">'+timeAgo(n.createdAt)+'</div></div></div>').join(''):'<div class="empty-state" style="padding:1.5rem">No notifications yet</div>');
}

// ── Home ───────────────────────────────────────────────────────────────────
async function renderHome(){
  const me=store.getMe();
  if(!me)return;
  const [myDeals, wheels, opps] = await Promise.all([
    store.getMyDeals(),
    store.getMyWheels(),
    store.getOpportunities ? store.getOpportunities({}) : Promise.resolve([])
  ]);
  const activeDeals=(myDeals||[]).filter(d=>['in_progress','accepted'].includes(d.status));
  const postArrays = await Promise.all((wheels||[]).map(w=>store.getPosts(w.id)));
  const allPosts = postArrays.flat().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);
  const likedIds = await fetchMyLikedPostIds(allPosts.map(p=>p.id));
  const postAuthors = await usersByIdMap(allPosts.map(p=>p.authorId));
  const topOpps=(opps||[]).slice(0,3);
  const el=document.getElementById('page-home');
  el.innerHTML=
    '<div class="page-head"><div class="page-head-left"><h1 class="page-title">Good to see you, '+escHtml(me.name.split(' ')[0])+' &#x1F44B;</h1><p class="page-sub">Here is what is happening in your network.</p></div><div class="page-actions"><button class="btn btn-outline btn-sm" onclick="openModal(\'modal-create-wheel\')">'+icon('plus')+' New Wheel</button><button class="btn btn-teal btn-sm" onclick="openModal(\'modal-create-opp\')">'+icon('plus')+' Post Opportunity</button></div></div>'+
    '<div class="stats-grid"><div class="stat-card"><span class="stat-label">Wheels</span><span class="stat-value">'+wheels.length+'</span><span class="stat-change">Active communities</span></div><div class="stat-card"><span class="stat-label">Active Deals</span><span class="stat-value">'+activeDeals.length+'</span></div><div class="stat-card"><span class="stat-label">Reviews</span><span class="stat-value">'+(me.reviewCount?me.reviewAvg:'-')+'</span><span class="stat-change">'+(me.reviewCount?me.reviewCount+' review'+(me.reviewCount===1?'':'s'):'No reviews yet')+'</span></div><div class="stat-card"><span class="stat-label">Revenue</span><span class="stat-value">'+fmtMoney(me.revenue||0)+'</span></div></div>'+
    '<div class="two-col"><div><div class="flex justify-between items-center mb-3"><h2 class="t-h2">Network Feed</h2><button class="btn btn-ghost btn-sm" onclick="navigate(\'wheels\')">All Wheels</button></div>'+
    (allPosts.length?allPosts.map(p=>renderFeedPost(p, likedIds.has(p.id), postAuthors)).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F4EB;</div><div class="empty-title">Feed is quiet</div><div class="empty-desc">Join Wheels to see posts from your network</div></div>')+
    '</div><div><div class="flex justify-between items-center mb-3"><h2 class="t-h2">Active Deals</h2><button class="btn btn-ghost btn-sm" onclick="navigate(\'deals\')">All</button></div>'+
    (activeDeals.length?activeDeals.map(renderDealCardCompact).join(''):'<div class="card"><div class="empty-state" style="padding:1.5rem"><div class="empty-icon">&#x1F91D;</div><div class="empty-title">No active deals</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-deal\')">Create Deal</button></div></div>')+
    '<div class="flex justify-between items-center mt-4 mb-3"><h2 class="t-h2">Fresh Opportunities</h2><button class="btn btn-ghost btn-sm" onclick="navigate(\'opportunities\')">All</button></div>'+
    topOpps.map(o=>'<div class="card card-sm mb-2" style="cursor:pointer" onclick="openModal(\'modal-opp-detail\');renderOppDetail(\''+o.id+'\')"><div class="flex gap-3 items-start"><div class="flex-1"><div class="t-h3 mb-1">'+escHtml(o.title)+'</div><div class="flex gap-2 items-center"><span class="type-badge type-'+o.type+'">'+o.type.replace('_',' ')+'</span><span class="t-micro c-text4">'+timeAgo(o.createdAt)+'</span></div></div><button class="btn btn-teal btn-xs" onclick="event.stopPropagation();applyToOpportunity(\''+o.id+'\',this)">Apply</button></div></div>').join('')+
    '</div></div>';
  $$('.post-like-btn',el).forEach(btn=>btn.onclick=()=>togglePostLike(btn.dataset.postId, btn));
}

function renderFeedPost(post, iLiked, usersById){
  const author=(usersById&&usersById[post.authorId])||null,wheel=store.get('wheels').find(w=>w.id===post.wheelId);
  let h='<div class="feed-post" data-post-wheel-id="'+(post.wheelId||'')+'"><div class="post-header">'+avatarHtml(author,'md')+'<div class="post-author-info"><div class="post-author-name">'+escHtml(author?.name||'')+'</div><div class="post-meta"><span>'+timeAgo(post.createdAt)+'</span>'+(wheel?'<span> - </span><span style="color:var(--teal-dim)">'+escHtml(wheel.name)+'</span>':'')+'</div></div><span class="type-badge '+(post.type==='announcement'?'type-job':post.type==='referral'?'type-partnership':'type-service')+'" style="margin-left:auto">'+post.type+'</span></div>';
  if(post.body)h+='<div class="post-body">'+renderPostBody(post.body)+'</div>';
  if(post.photo)h+='<div style="margin:.75rem 0"><img src="'+post.photo+'" style="width:100%;max-height:360px;object-fit:cover;border-radius:var(--radius-sm);display:block"></div>';
  if(post.video)h+='<div style="margin:.75rem 0"><video src="'+post.video+'" controls style="width:100%;max-height:320px;border-radius:var(--radius-sm);background:#000;display:block"></video></div>';
  if(post.link){const href=post.link.startsWith('http')?post.link:'https://'+post.link;const label=post.link.replace(/^https?:\/\//,'').replace(/\/$/,'');h+='<a href="'+escHtml(href)+'" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:.5rem;padding:.625rem .875rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--teal);font-size:.875rem;font-weight:500;text-decoration:none;margin:.75rem 0">'+icon('link')+escHtml(label)+'</a>';}
  h+='<div class="post-actions"><button class="post-action-btn post-like-btn" data-post-id="'+post.id+'" data-liked="'+(iLiked?'1':'0')+'" style="'+(iLiked?'color:var(--red)':'')+'"><svg width="14" height="14" fill="'+(iLiked?'currentColor':'none')+'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>'+(post.likes>0?'<span class="post-action-btn" style="cursor:pointer" onclick="showPostLikers(\''+post.id+'\')">'+post.likes+' like'+(post.likes===1?'':'s')+'</span>':'<span class="post-action-btn" style="opacity:.5">0 likes</span>')+'<button class="post-action-btn reply-toggle-btn" data-post-id="'+post.id+'" onclick="togglePostReplies(\''+post.id+'\')"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Reply</button></div>'+
  '<div class="post-replies" id="post-replies-'+post.id+'" style="display:none"></div>'+
  '</div>';
  return h;
}

async function togglePostReplies(postId){
  const container = document.getElementById('post-replies-'+postId);
  if(!container) return;
  const isOpen = container.style.display !== 'none';
  if(isOpen){ container.style.display='none'; return; }
  container.style.display='block';
  if(container.dataset.loaded === '1') return; // already loaded once, just re-showing
  container.dataset.loaded = '1';
  const postEl = container.closest('.feed-post');
  const wheelId = postEl?.dataset.postWheelId || '';
  container.innerHTML = '<div class="t-small c-text3" style="padding:.75rem">Loading replies...</div>';
  const sb = getSb();
  let replies = [];
  try {
    const { data, error } = await sb.from('post_replies').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    if(error) throw error;
    replies = data || [];
  } catch(e){ console.warn('Replies fetch failed:', e.message); }
  const authors = await Promise.all(replies.map(r=>dmGetUser(r.author_id)));
  const replyInputId = 'reply-input-'+postId;
  container.innerHTML =
    '<div style="border-top:1px solid var(--border);margin-top:.75rem;padding-top:.75rem">'+
    (replies.length ? replies.map((r,i)=>'<div class="flex gap-2 items-start mb-2">'+avatarHtml(authors[i],'sm')+'<div class="flex-1" style="background:var(--surface);border-radius:8px;padding:.5rem .75rem"><div class="t-small" style="font-weight:600">'+escHtml(authors[i]?.name||'Unknown')+'</div><div class="t-small" style="color:var(--text-2)">'+renderPostBody(r.body)+'</div><div class="t-micro c-text4 mt-1">'+timeAgo(r.created_at)+'</div></div></div>').join('') : '<div class="t-small c-text4 mb-2">No replies yet</div>')+
    '<div style="display:flex;gap:.5rem;align-items:flex-end;margin-top:.5rem"><input class="form-control" id="'+replyInputId+'" placeholder="Write a reply... use @name to mention someone" style="flex:1"><button class="btn btn-teal btn-sm" onclick="submitPostReply(\''+postId+'\',\''+wheelId+'\')">Send</button></div>'+
    '</div>';
  initMentionAutocomplete(replyInputId, wheelId || null);
  document.getElementById(replyInputId)?.addEventListener('keydown', e => { if(e.key==='Enter') submitPostReply(postId, wheelId); });
}

window.submitPostReply = async (postId, wheelId) => {
  const me = store.getMe();
  const sb = getSb();
  const input = document.getElementById('reply-input-'+postId);
  const body = input?.value.trim();
  if(!body || !me || !sb) return;
  input.disabled = true;
  try {
    const { error } = await sb.from('post_replies').insert({ post_id: postId, author_id: me.id, body });
    if(error) throw error;
    // Notify any @mentioned wheel members, same pattern used for post creation
    const mentions = [...body.matchAll(/@(\w+)/g)].map(m=>m[1].toLowerCase());
    if(mentions.length && wheelId){
      const members = store.getWheelMembers ? await store.getWheelMembers(wheelId) : [];
      (members||[]).forEach(m=>{
        if(mentions.includes((m.username||m.name.split(' ')[0]).toLowerCase()) && m.id!==me.id){
          notifyUser(m.id, 'mention', '<strong>'+escHtml(me.name)+'</strong> mentioned you in a reply');
        }
      });
    }
    const container = document.getElementById('post-replies-'+postId);
    if(container){ container.dataset.loaded='0'; container.style.display='none'; togglePostReplies(postId); }
  } catch(e){ toast('Failed to reply: '+e.message, 'error'); input.disabled=false; }
};

function renderDealCardCompact(d, otherUser){
  const STAGES=['proposed','negotiating','accepted','in_progress','completed','paid'],si=STAGES.indexOf(d.status);
  const other=otherUser;
  return '<div class="deal-card" onclick="navigate(\'deal-detail\',{dealId:\''+d.id+'\'})"><div class="deal-card-top"><div><div class="deal-title">'+escHtml(d.title)+'</div><div class="deal-parties">'+avatarHtml(other,'sm')+' '+escHtml(other?.name||'?')+'</div></div><div><div class="deal-amount">'+fmtMoney(d.priceCents/100,d.currency)+'</div>'+dealStatusBadge(d.status)+'</div></div><div class="deal-stages">'+STAGES.map((s,i)=>'<div class="deal-stage-dot '+(i<si?'done':i===si?'current':'')+'"></div>').join('')+'</div><div class="deal-card-footer"><span class="deal-due">'+icon('clock')+' '+(d.endDate||'TBD')+'</span><span class="t-micro c-text3">'+timeAgo(d.createdAt)+'</span></div></div>';
}

// ── Wheels ─────────────────────────────────────────────────────────────────
async function renderWheels(){
  const [myWheels, allWheels] = await Promise.all([
    store.getMyWheels ? store.getMyWheels() : Promise.resolve([]),
    store.getAllWheels ? store.getAllWheels() : Promise.resolve(store.get('wheels')||[])
  ]);
  const myWheelIds = (myWheels||[]).map(w=>w.id);
  let discoverWheels = (allWheels||[]).filter(w=>!myWheelIds.includes(w.id));
  const q = (pageParams.q||'').toLowerCase();
  const catFilter = pageParams.cat||'all';
  if(q){
    discoverWheels = discoverWheels.filter(w=>
      w.name.toLowerCase().includes(q) ||
      (w.description||'').toLowerCase().includes(q) ||
      (w.location||'').toLowerCase().includes(q) ||
      (w.category||'').toLowerCase().includes(q)
    );
  }
  if(catFilter!=='all'){
    discoverWheels = discoverWheels.filter(w=>w.category===catFilter);
  }
  const existingNames = (allWheels||[]).map(w=>w.name.toLowerCase());
  const popular=(q||catFilter!=='all')?[]:SUGGESTED_WHEELS.filter(s=>!existingNames.includes(s.name.toLowerCase())).slice(0,4);
  const allCategories=['Startup','Design','Marketing','Technology','Finance','Business','Events','Community','Talent','Other'];
  const creatorIds=[...new Set([...(myWheels||[]),...discoverWheels].map(w=>w.creatorId).filter(Boolean))];
  const creators={};
  (await Promise.all(creatorIds.map(id=>dmGetUser(id)))).forEach((u,i)=>{ if(u) creators[creatorIds[i]]=u; });
  const el=document.getElementById('page-wheels');
  let html='<div class="page-head"><div class="page-head-left"><h1 class="page-title">My Wheels</h1><p class="page-sub">Your network communities</p></div><div class="page-actions"><button class="btn btn-primary" onclick="openModal(\'modal-create-wheel\')">'+icon('plus')+' Create Wheel</button></div></div>';
  if(myWheels.length)html+='<div class="wheel-grid">'+myWheels.map(w=>renderWheelCard(w,false,creators[w.creatorId])).join('')+'</div>';

  html+='<div class="filter-bar mt-4"><select class="form-control" id="wheel-cat-filter" style="width:auto"><option value="all">All categories</option>'+allCategories.map(c=>'<option value="'+c+'"'+(catFilter===c?' selected':'')+'>'+c+'</option>').join('')+'</select><div style="position:relative;margin-left:auto"><svg style="position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:var(--text-4);pointer-events:none" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="form-control" id="wheel-search" placeholder="Search name, category, or city..." value="'+escHtml(pageParams.q||'')+'" style="padding-left:2.25rem;width:240px"></div></div>';

  // Popular suggested wheels
  if(popular.length){
    html+='<h2 class="t-h2 mb-1 mt-4">Popular Wheels to Join</h2><p class="t-small c-text3 mb-3">Suggested communities based on what people are building</p><div class="wheel-grid">';
    popular.forEach((s,idx)=>{
      html+='<div class="wheel-card popular-card" data-sidx="'+idx+'" style="cursor:pointer"><div class="wheel-card-cover" style="background:linear-gradient(135deg,'+s.hex+'cc,'+s.hex+')"></div><div class="wheel-card-body"><div style="width:48px;height:48px;border-radius:50%;background:'+s.hex+';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.25rem;margin-top:-1.5rem;margin-bottom:.75rem;box-shadow:0 4px 12px rgba(0,0,0,.25)">'+s.emoji+'</div><div class="wheel-card-name">'+escHtml(s.name)+'</div><div class="wheel-card-desc">'+escHtml(s.desc)+'</div><div class="wheel-card-meta"><span class="wheel-meta-item">'+s.category+'</span></div></div><div class="wheel-card-footer"><span class="tier-badge tier-free">Open</span><button class="btn btn-teal btn-sm pop-create-btn" data-sidx="'+idx+'">Create</button></div></div>';
    });
    html+='</div>';
  }

  if(discoverWheels.length)html+='<h2 class="t-h2 mb-3 mt-4">Discover Wheels</h2><div class="wheel-grid">'+discoverWheels.map(w=>renderWheelCard(w,true,creators[w.creatorId])).join('')+'</div>';
  else if(q||catFilter!=='all')html+='<div class="empty-state"><div class="empty-icon">&#x1F50D;</div><div class="empty-title">No Wheels found</div><div class="empty-desc">Try a different search or category</div></div>';
  if(!myWheels.length&&!discoverWheels.length&&!popular.length&&!q&&catFilter==='all')html+='<div class="empty-state"><div class="empty-icon">&#x2B22;</div><div class="empty-title">No Wheels yet</div><button class="btn btn-primary" onclick="openModal(\'modal-create-wheel\')">Create Your First Wheel</button></div>';
  el.innerHTML=html;

  let st;
  $('#wheel-search')?.addEventListener('input',e=>{clearTimeout(st);st=setTimeout(()=>navigate('wheels',{q:e.target.value,cat:catFilter}),300);});
  $('#wheel-cat-filter')?.addEventListener('change',e=>navigate('wheels',{q:pageParams.q||'',cat:e.target.value}));

  $$('.wheel-card',el).forEach(c=>{
    if(c.dataset.wheelId)c.onclick=()=>navigate('wheel-detail',{wheelId:c.dataset.wheelId});
  });
  $$('.pop-create-btn',el).forEach(btn=>{
    btn.onclick=e=>{e.stopPropagation();const s=SUGGESTED_WHEELS.filter(x=>!store.get('wheels').map(w=>w.name.toLowerCase()).includes(x.name.toLowerCase()))[parseInt(btn.dataset.sidx)];if(s)createFromTemplate(s);};
  });
  $$('.join-wheel-btn',el).forEach(btn=>{
    btn.onclick=e=>{e.stopPropagation();store.joinWheel(btn.dataset.wheelId);const w=store.get('wheels').find(x=>x.id===btn.dataset.wheelId);toast('Joined '+w.name+'!','success');updateShellDynamic(store.getMe());renderWheels();};
  });
}

function createFromTemplate(s){
  const color=s.hex||'#0F1F3D';
  const w=store.createWheel({name:s.name,slug:s.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''),description:s.desc,category:s.category,dealCommission:2.5,hexColor:color,coverGradient:'linear-gradient(135deg,'+color+'cc,'+color+')',isEventWheel:s.category==='Events'});
  toast('Wheel "'+s.name+'" created!','success');updateShellDynamic(store.getMe());navigate('wheel-detail',{wheelId:w.id});
}

function renderWheelCard(w,discover=false,creator=null){
  return '<div class="wheel-card" data-wheel-id="'+w.id+'"><div class="wheel-card-cover" style="background:'+(w.coverGradient||'var(--navy)')+'"></div><div class="wheel-card-body">'+hexBadge(w,48)+'<div class="wheel-card-name">'+escHtml(w.name)+'</div><div class="wheel-card-desc">'+escHtml(w.description)+'</div>'+(creator&&creator.role!=='admin'?'<div class="t-small c-text3 mt-1" style="font-weight:600">By '+escHtml(creator.name)+'</div>':'')+'<div class="wheel-card-meta"><span class="wheel-meta-item">'+icon('users')+' '+fmt(w.memberCount)+'</span><span class="wheel-meta-item">'+escHtml(w.category)+'</span>'+(w.location?'<span class="wheel-meta-item">'+icon('map')+' '+escHtml(w.location)+'</span>':'')+(w.isEventWheel?'<span class="type-badge type-partnership" style="font-size:.6rem">Events</span>':'')+'</div></div><div class="wheel-card-footer"><span class="tier-badge tier-free">Open</span>'+(discover?'<button class="btn btn-teal btn-sm join-wheel-btn" data-wheel-id="'+w.id+'">Join</button>':'')+'</div></div>';
}

// ── Wheel Detail ───────────────────────────────────────────────────────────
async function renderWheelDetail(){
  const allWheels = store.getAllWheels ? await store.getAllWheels() : (store.get('wheels')||[]);
  const wheel = allWheels.find(w=>w.id===pageParams.wheelId);
  if(!wheel){navigate('wheels');return;}
  const [members, posts, opps, events] = await Promise.all([
    store.getWheelMembers ? store.getWheelMembers(wheel.id) : Promise.resolve([]),
    store.getPosts ? store.getPosts(wheel.id) : Promise.resolve([]),
    store.getOpportunities ? store.getOpportunities({wheelId:wheel.id}) : Promise.resolve([]),
    store.getEvents ? store.getEvents(wheel.id) : Promise.resolve([]),
  ]);
  const attendeesByEvent = await fetchAttendeesForEvents(events.map(e=>e.id));
  const attendeeUsers = await usersByIdMap(Object.values(attendeesByEvent).flat());
  const likedIds = await fetchMyLikedPostIds(posts.map(p=>p.id));
  const postAuthors = await usersByIdMap(posts.map(p=>p.authorId));
  const isCreator=wheel.creatorId===store.getMe()?.id;
  const isMember=store.isMember(wheel.id);
  const creatorUser = await dmGetUser(wheel.creatorId);
  const el=document.getElementById('page-wheel-detail');
  el.innerHTML=
    '<div class="page-head"><div class="flex gap-3 items-center">'+hexBadge(wheel,44)+'<div><h1 class="page-title" style="margin-bottom:0">'+escHtml(wheel.name)+'</h1><p class="page-sub">'+escHtml(wheel.description)+'</p>'+(creatorUser&&creatorUser.role!=='admin'?'<p class="t-body c-text2 mt-1">Created by <a href="javascript:void(0)" onclick="navigate(\'profile\',{userId:\''+creatorUser.id+'\'})" style="color:var(--teal);font-weight:700;text-decoration:none">'+escHtml(creatorUser.name)+'</a></p>':'')+'</div></div><div class="page-actions">'+(isCreator?'<button class="btn btn-outline btn-sm" onclick="openInviteModal(\''+wheel.id+'\')">'+icon('users')+' Invite</button><button class="btn btn-outline btn-sm" onclick="openModal(\'modal-create-event\')">+ Event</button>':'')+(isCreator||isMember?'<button class="btn btn-outline btn-sm" onclick="shareWheel(\''+escHtml(wheel.slug||'')+'\',\''+escHtml(wheel.name).replace(/'/g,"\\\\'")+'\')">'+icon('link')+' Share Wheel</button>':'')+(isCreator?'<button class="btn btn-ghost btn-sm delete-wheel-btn" style="color:var(--red)" data-wheel-id="'+wheel.id+'" data-wheel-name="'+escHtml(wheel.name)+'">Delete Wheel</button>':(isMember?'<button class="btn btn-ghost btn-sm leave-wheel-btn" style="color:var(--red)" data-wheel-id="'+wheel.id+'" data-wheel-name="'+escHtml(wheel.name)+'">Leave Wheel</button>':''))+'<button class="btn btn-teal btn-sm" onclick="handlePostClick(\''+wheel.id+'\')">'+ icon('plus') +' Post</button></div></div>'+
    '<div class="stats-grid" style="grid-template-columns:repeat(3,1fr)"><div class="stat-card"><span class="stat-label">Members</span><span class="stat-value">'+fmt(wheel.memberCount)+'</span></div><div class="stat-card"><span class="stat-label">Opportunities</span><span class="stat-value">'+opps.length+'</span></div><div class="stat-card"><span class="stat-label">Events</span><span class="stat-value">'+events.length+'</span></div></div>'+
    '<div class="tabs"><div class="tab-item active" data-tab="feed">Feed</div><div class="tab-item" data-tab="members">Members ('+members.length+')</div><div class="tab-item" data-tab="opportunities">Opportunities ('+opps.length+')</div><div class="tab-item" data-tab="events">Events ('+events.length+')</div></div>'+
    '<div class="tab-panel active" id="tab-feed">'+(posts.length?posts.map(p=>renderFeedPost(p, likedIds.has(p.id), postAuthors)).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F4DD;</div><div class="empty-title">No posts yet</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-post\')">Post Something</button></div>')+'</div>'+
    '<div class="tab-panel" id="tab-members"><div class="member-grid">'+members.map(u=>renderMemberCard(u)).join('')+'</div></div>'+
    '<div class="tab-panel" id="tab-opportunities"><div class="flex justify-between items-center mb-3"><span class="t-body c-text3">'+opps.length+' open</span><button class="btn btn-teal btn-sm" onclick="openModal(\'modal-create-opp\')">'+icon('plus')+' Post</button></div><div class="opp-list">'+(opps.length?opps.map(renderOppCard).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F3AF;</div><div class="empty-title">No opportunities yet</div></div>')+'</div></div>'+
    '<div class="tab-panel" id="tab-events"><div class="flex justify-between items-center mb-3"><span class="t-body c-text3">'+events.length+' events</span>'+(isCreator?'<button class="btn btn-teal btn-sm" onclick="openModal(\'modal-create-event\')">'+icon('plus')+' Create Event</button>':'')+'</div>'+(events.length?events.map(ev=>renderEventCard(ev, attendeesByEvent[ev.id]||[], attendeeUsers)).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F39F;</div><div class="empty-title">No events yet</div></div>')+'</div>';
  $$('.tab-item',el).forEach(tab=>tab.onclick=()=>{$$('.tab-item',el).forEach(t=>t.classList.remove('active'));$$('.tab-panel',el).forEach(p=>p.classList.remove('active'));tab.classList.add('active');document.getElementById('tab-'+tab.dataset.tab)?.classList.add('active');});
  $$('.post-like-btn',el).forEach(btn=>btn.onclick=()=>togglePostLike(btn.dataset.postId, btn));
  $$('.member-card',el).forEach(c=>c.onclick=()=>navigate('profile',{userId:c.dataset.userId}));
  $$('.opp-card',el).forEach(c=>c.onclick=()=>{openModal('modal-opp-detail');renderOppDetail(c.dataset.oppId);});
  $$('.delete-opp-btn',el).forEach(btn=>btn.onclick=()=>deleteOpportunityAction(btn.dataset.oppId, btn.dataset.oppTitle));
  $$('.delete-wheel-btn',el).forEach(btn=>btn.onclick=()=>deleteWheelAction(btn.dataset.wheelId, btn.dataset.wheelName));
  $$('.leave-wheel-btn',el).forEach(btn=>btn.onclick=()=>leaveWheelAction(btn.dataset.wheelId, btn.dataset.wheelName));
}

async function fetchAttendeesForEvents(eventIds){
  const sb = getSb();
  const result = {};
  eventIds.forEach(id=>result[id]=[]);
  if(!sb || !eventIds.length) return result;
  try {
    const { data, error } = await sb.from('event_attendees').select('event_id, user_id').in('event_id', eventIds);
    if(error) throw error;
    for(const row of (data||[])){
      if(!result[row.event_id]) result[row.event_id]=[];
      result[row.event_id].push(row.user_id);
    }
  } catch(e){ console.warn('Attendee fetch failed:', e.message); }
  return result;
}

function renderEventCard(ev, attendeeIds, usersById){
  attendeeIds = attendeeIds || [];
  usersById = usersById || {};
  const me = store.getMe();
  const isGoing = me && attendeeIds.includes(me.id);
  const cap = ev.ticketCount || null;
  const full = cap && attendeeIds.length >= cap;
  const attendees = attendeeIds.slice(0, 6).map(id=>usersById[id]).filter(Boolean);
  const avatarsHtml = attendees.length
    ? '<div style="display:flex;align-items:center;flex-shrink:0">'+attendees.map((u,i)=>'<div style="margin-left:'+(i?'-.5rem':'0')+';border-radius:50%;border:2px solid var(--white)">'+avatarHtml(u,'sm')+'</div>').join('')+'</div>'
    : '<span class="t-small c-text4">No one yet — be the first!</span>';
  let h='<div class="card mb-3">';
  if(ev.imageUrl) h+='<div style="margin:-1.25rem -1.25rem .875rem"><img src="'+escHtml(ev.imageUrl)+'" style="width:100%;max-height:220px;object-fit:cover;border-radius:var(--radius) var(--radius) 0 0;display:block"></div>';
  h+='<div class="flex justify-between items-start mb-3"><div><div class="t-h2 mb-1">'+escHtml(ev.title)+'</div><div class="t-small c-text3 mb-1">'+icon('clock')+' '+escHtml(ev.date)+' at '+escHtml(ev.time)+'</div><div class="t-small c-text3">'+icon('map')+' '+escHtml(ev.location)+'</div></div><div style="text-align:right"><div style="font-size:1.5rem;font-weight:900;color:var(--navy)">'+attendeeIds.length+(cap?'/'+cap:'')+'</div><div class="t-micro c-text4">attending</div></div></div>';
  h+='<p class="t-body mb-3" style="color:var(--text-2)">'+escHtml(ev.description)+'</p>';
  if(ev.links && ev.links.length){
    h+='<div class="mb-3" style="display:flex;flex-direction:column;gap:.375rem">'+ev.links.map(lnk=>{
      const href=lnk.startsWith('http')?lnk:'https://'+lnk;
      const label=lnk.replace(/^https?:\/\//,'').replace(/\/$/,'');
      return '<a href="'+escHtml(href)+'" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:.5rem;color:var(--teal);font-size:.8125rem;font-weight:500;text-decoration:none">'+icon('link')+escHtml(label)+'</a>';
    }).join('')+'</div>';
  }
  h+='<div class="mb-3" style="display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;row-gap:.375rem"'+(attendeeIds.length?' onclick="showEventAttendees(\''+ev.id+'\',\''+escHtml(ev.title).replace(/'/g,"\\\\'")+'\')" role="button"':'')+'>'+avatarsHtml+(attendeeIds.length>6?'<span class="t-micro c-text4">+'+(attendeeIds.length-6)+' more</span>':'')+(attendeeIds.length?'<span class="t-micro" style="color:var(--teal);font-weight:600;cursor:pointer">See all</span>':'')+'</div>';
  if(isGoing){
    h+='<button class="btn btn-outline" style="color:var(--red);border-color:var(--red)" onclick="cancelRsvpAction(\''+ev.id+'\')">'+icon('check')+' Going &mdash; Cancel RSVP</button>';
  } else {
    h+='<button class="btn btn-teal" onclick="rsvpToEvent(\''+ev.id+'\')" '+(full?'disabled style="opacity:.5"':'')+'>'+icon('ticket')+' '+(full?'Event Full':'RSVP')+'</button>';
  }
  if(me && ev.creatorId===me.id){
    h+='<button class="btn btn-ghost btn-sm" style="color:var(--red);margin-left:.5rem" onclick="deleteEventAction(\''+ev.id+'\',\''+escHtml(ev.title).replace(/'/g,"\\\\'")+'\')">Delete Event</button>';
  }
  h+='</div>';
  return h;
}

async function fetchMyLikedPostIds(postIds){
  const me = store.getMe();
  const sb = getSb();
  if(!me || !sb || !postIds.length) return new Set();
  try {
    const { data, error } = await sb.from('post_likes').select('post_id').eq('user_id', me.id).in('post_id', postIds);
    if(error) throw error;
    return new Set((data||[]).map(r=>r.post_id));
  } catch(e){ console.warn('Liked-posts fetch failed:', e.message); return new Set(); }
}

window.togglePostLike = async (postId, btnEl) => {
  const me = store.getMe();
  const sb = getSb();
  if(!me || !sb) return;
  const wasLiked = btnEl.dataset.liked === '1';
  const countEl = btnEl.nextElementSibling;
  try {
    if(wasLiked){
      await sb.from('post_likes').delete().eq('post_id', postId).eq('user_id', me.id);
      await sb.rpc('decrement_post_likes', { post_id_param: postId });
    } else {
      await sb.from('post_likes').upsert({ post_id: postId, user_id: me.id });
      await sb.rpc('increment_post_likes', { post_id_param: postId });
    }
    // Reflect the change immediately without a full re-render
    btnEl.dataset.liked = wasLiked ? '0' : '1';
    btnEl.style.color = wasLiked ? '' : 'var(--red)';
    const svg = btnEl.querySelector('svg');
    if(svg) svg.setAttribute('fill', wasLiked ? 'none' : 'currentColor');
    if(countEl && countEl.classList.contains('post-action-btn')){
      const current = parseInt(countEl.textContent) || 0;
      const next = wasLiked ? Math.max(0, current-1) : current+1;
      countEl.textContent = next + ' like' + (next===1?'':'s');
      countEl.style.opacity = next>0 ? '1' : '.5';
      countEl.style.cursor = next>0 ? 'pointer' : 'default';
      countEl.onclick = next>0 ? (()=>showPostLikers(postId)) : null;
    }
  } catch(e){ toast('Failed to update like: '+e.message, 'error'); }
};

window.showPostLikers = async (postId) => {
  openModal('modal-post-likers');
  const bodyEl = document.getElementById('post-likers-body');
  bodyEl.innerHTML = '<div class="t-small c-text3" style="padding:1rem">Loading...</div>';
  const sb = getSb();
  if(!sb) return;
  try {
    const { data, error } = await sb.from('post_likes').select('user_id').eq('post_id', postId);
    if(error) throw error;
    if(!data || !data.length){
      bodyEl.innerHTML = '<div class="empty-state" style="padding:1.5rem"><div class="empty-title">No likes yet</div></div>';
      return;
    }
    const users = await Promise.all(data.map(row=>dmGetUser(row.user_id)));
    bodyEl.innerHTML = users.map(u=>'<div class="flex items-center gap-3 mb-2" style="padding:.625rem;border:1px solid var(--border);border-radius:var(--radius-sm)">'+avatarHtml(u,'sm')+'<div class="flex-1"><div class="t-small" style="font-weight:600">'+escHtml(u?.name||'Unknown')+'</div></div></div>').join('');
  } catch(e){ bodyEl.innerHTML = '<div class="t-small c-red" style="padding:1rem">Failed to load likes.</div>'; }
};


window.showEventAttendees = async (eventId, eventTitle) => {
  openModal('modal-event-attendees');
  $('#modal-event-attendees .modal-title').textContent = 'Attending: '+(eventTitle||'Event');
  const bodyEl = document.getElementById('event-attendees-body');
  bodyEl.innerHTML = '<div class="t-small c-text3" style="padding:1rem">Loading...</div>';
  const sb = getSb();
  if(!sb) return;
  try {
    const { data, error } = await sb.from('event_attendees').select('user_id, rsvp_at').eq('event_id', eventId).order('rsvp_at', { ascending: true });
    if(error) throw error;
    if(!data || !data.length){
      bodyEl.innerHTML = '<div class="empty-state" style="padding:1.5rem"><div class="empty-title">No one has RSVP\'d yet</div></div>';
      return;
    }
    const users = await Promise.all(data.map(row=>dmGetUser(row.user_id)));
    bodyEl.innerHTML = data.map((row,i)=>{
      const u = users[i];
      return '<div class="flex items-center gap-3 mb-2" style="padding:.625rem;border:1px solid var(--border);border-radius:var(--radius-sm)">'+avatarHtml(u,'sm')+'<div class="flex-1"><div class="t-small" style="font-weight:600">'+escHtml(u?.name||'Unknown')+'</div></div><button class="btn btn-ghost btn-xs" onclick="closeAllModals();openDM(\''+(u?.id||'')+'\')">Message</button></div>';
    }).join('');
  } catch(e){ bodyEl.innerHTML = '<div class="t-small c-red" style="padding:1rem">Failed to load attendees.</div>'; }
};

window.rsvpToEvent = async (eventId) => {
  const me = store.getMe();
  const sb = getSb();
  if(!me || !sb) return;
  try {
    const { error } = await sb.from('event_attendees').insert({ event_id: eventId, user_id: me.id });
    if(error && error.code !== '23505') throw error;
    toast("You're on the list!", 'success');
    renderWheelDetail();
  } catch(e){ toast('Failed to RSVP: '+e.message, 'error'); }
};

window.cancelRsvpAction = async (eventId) => {
  const me = store.getMe();
  const sb = getSb();
  if(!me || !sb) return;
  if(!confirm('Cancel your RSVP for this event?')) return;
  try {
    const { error } = await sb.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', me.id);
    if(error) throw error;
    toast('RSVP cancelled', 'success');
    renderWheelDetail();
  } catch(e){ toast('Failed to cancel: '+e.message, 'error'); }
};

// In-platform reminders: on app load, check the current user's upcoming RSVPs
// and post a one-time notification for anything happening within 48 hours.
async function checkEventReminders(){
  const me = store.getMe();
  const sb = getSb();
  if(!me || !sb) return;
  try {
    const { data, error } = await sb.from('event_attendees').select('event_id, events(*)').eq('user_id', me.id).eq('reminder_sent', false);
    if(error || !data) return;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const windowEnd = new Date(todayStart.getTime() + 2*24*60*60*1000);
    for(const row of data){
      const ev = row.events;
      if(!ev || !ev.event_date) continue;
      const evDate = new Date(ev.event_date+'T00:00:00');
      if(evDate >= todayStart && evDate <= windowEnd){
        await sb.from('notifications').insert({
          user_id: me.id, type: 'event_reminder', read: false,
          text: 'Reminder: <strong>'+escHtml(ev.title)+'</strong> is coming up on '+escHtml(ev.event_date)+(ev.event_time?' at '+escHtml(ev.event_time):'')+'.'
        });
        await sb.from('event_attendees').update({ reminder_sent: true }).eq('event_id', ev.id).eq('user_id', me.id);
        updateShellDynamic(me);
      }
    }
  } catch(e){ console.warn('Event reminder check failed:', e.message); }
}

// ── Members / Find People ──────────────────────────────────────────────────
async function renderMembers(){
  const q=(pageParams.q||'').toLowerCase();
  const filterAvail=pageParams.avail||'all';
  const filterLoc=(pageParams.loc||'').toLowerCase();
  let members;
  try {
    if(window.LiveStore && window.LiveStore.isReady()){
      members = await window.LiveStore.searchUsers(q, filterLoc);
      members = members.filter(u=>u.id!==store.getMe()?.id);
      if(filterAvail!=='all') members=members.filter(u=>u.availability===filterAvail);
    } else {
      members=[...store.get('users')].filter(u=>u.id!==store.getMe()?.id);
      if(q) members=members.filter(u=>u.name.toLowerCase().includes(q)||(u.bio||'').toLowerCase().includes(q)||(u.skills||[]).some(s=>s.toLowerCase().includes(q))||(u.jobTitle||'').toLowerCase().includes(q));
      if(filterAvail!=='all') members=members.filter(u=>u.availability===filterAvail);
      if(filterLoc) members=members.filter(u=>(u.location||'').toLowerCase().includes(filterLoc));
    }
  } catch(e){ members=[...store.get('users')].filter(u=>u.id!==store.getMe()?.id); }
  // Admin accounts stay logged-in and fully functional, but don't surface
  // in general member discovery/search.
  members = members.filter(u=>u.role!=='admin');
  if(q)members=members.filter(u=>
    u.name.toLowerCase().includes(q)||
    (u.bio||'').toLowerCase().includes(q)||
    (u.skills||[]).some(s=>s.toLowerCase().includes(q))||
    (u.jobTitle||'').toLowerCase().includes(q)||
    (u.userType||'').toLowerCase().includes(q)
  );
  if(filterAvail!=='all')members=members.filter(u=>u.availability===filterAvail);
  if(filterLoc)members=members.filter(u=>(u.location||'').toLowerCase().includes(filterLoc));
  const allLocs=[...new Set(store.get('users').map(u=>(u.location||'').split(',')[0].trim()).filter(Boolean))];

  // Featured Services section — shows real open service listings once people
  // start posting them. Until then, shows realistic placeholder examples so
  // the section isn't empty and gives a preview of how it'll look.
  // Selection: prioritize freelancers near the viewer's own location, then
  // sort by highest star rating within that.
  const myLocation = (store.getMe()?.location||'').split(',')[0].trim().toLowerCase();
  let realServices=[];
  try{ realServices = await fetchServices(''); }catch(e){ realServices=[]; }
  const usingPlaceholders = realServices.length===0;
  let featuredCards=[];
  if(usingPlaceholders){
    const placeholders=[
      {name:'Jordan Sato',jobTitle:'Full-Stack Developer',location:'Austin, TX',title:'Full-Stack Web Development',description:'I build fast, responsive web apps end to end \u2014 React, Node, and everything in between.',priceLabel:'$75/hr',rating:4.9,reviewCount:58},
      {name:'Priya Mehta',jobTitle:'Graphic Designer',location:'Bangalore, India',title:'Brand Identity & Logo Design',description:'Complete brand identity packages: logo, color palette, and a type system you can grow into.',priceLabel:'$450',rating:4.8,reviewCount:122},
      {name:'Marcus Owusu',jobTitle:'Copywriter',location:'Lagos, Nigeria',title:'Copywriting & Content Strategy',description:'Website copy, email sequences, and content strategy that actually converts.',priceLabel:'$0.50/word',rating:5.0,reviewCount:34},
      {name:'Alex Torres',jobTitle:'Video Editor',location:'New York, NY',title:'Video Editing & Motion Graphics',description:'Polished edits and motion graphics for social, ads, and product launches.',priceLabel:'$200',rating:4.7,reviewCount:89},
      {name:'Sofia Rossi',jobTitle:'Social Media Manager',location:'San Francisco, CA',title:'Social Media Management & Strategy',description:'Content calendars, community management, and growth strategy for brands that want to actually show up online.',priceLabel:'$600/mo',rating:4.8,reviewCount:41},
      {name:'David Okafor',jobTitle:'Business Consultant',location:'Toronto, ON',title:'Startup Strategy & Fundraising Prep',description:'I help early-stage founders sharpen their pitch, model, and go-to-market before they talk to investors.',priceLabel:'$150/hr',rating:4.9,reviewCount:27},
    ];
    featuredCards = placeholders.map((p,i)=>({
      creator:{id:'demo-'+i,name:p.name,jobTitle:p.jobTitle,location:p.location,profilePics:[]},
      title:p.title, description:p.description, priceLabel:p.priceLabel,
      rating:p.rating, reviewCount:p.reviewCount, isFake:true
    }));
  } else {
    const creatorsById = await usersByIdMap(realServices.map(s=>s.creator_id));
    featuredCards = realServices.map(s=>{
      const creator=creatorsById[s.creator_id]||{id:s.creator_id,name:'Fairriss user',profilePics:[]};
      return {
        creator, title:s.title, description:s.description,
        priceLabel: s.price_cents ? fmtMoney(s.price_cents/100)+(s.price_type==='hourly'?'/hr':'') : 'Rate on request',
        rating:creator.reviewAvg||0, reviewCount:creator.reviewCount||0, isFake:false
      };
    });
  }
  featuredCards.sort((a,b)=>{
    const aMatch = myLocation && (a.creator.location||'').toLowerCase().includes(myLocation) ? 1 : 0;
    const bMatch = myLocation && (b.creator.location||'').toLowerCase().includes(myLocation) ? 1 : 0;
    if(aMatch!==bMatch) return bMatch-aMatch;
    return (b.rating||0)-(a.rating||0);
  });
  featuredCards = featuredCards.slice(0,6);
  const el=document.getElementById('page-members');
  el.innerHTML=
    '<div class="page-head"><div class="page-head-left"><h1 class="page-title">Find People</h1><p class="page-sub">'+members.length+' '+(q||filterLoc?'results found':'professionals on Fairriss')+'</p></div><div class="page-actions"><button class="btn btn-teal btn-sm" onclick="openModal(\'modal-create-deal\')">'+icon('plus')+' Create Deal</button></div></div>'+
    '<div style="background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem;margin-bottom:1.25rem;box-shadow:var(--shadow-sm)">'+
    '<div style="display:flex;gap:.75rem;flex-wrap:wrap;align-items:flex-end">'+
    '<div style="flex:2;min-width:200px"><label style="font-size:.8125rem;font-weight:600;color:var(--text-2);display:block;margin-bottom:.375rem">Role, skill or name</label><div style="position:relative">'+icon('search')+'<input class="form-control" id="member-search" placeholder="e.g. Graphic Designer, Developer, Marcus..." value="'+escHtml(q)+'" style="padding-left:2.25rem"></div></div>'+
    '<div style="flex:1;min-width:150px"><label style="font-size:.8125rem;font-weight:600;color:var(--text-2);display:block;margin-bottom:.375rem">Location</label><input class="form-control" id="loc-search" placeholder="City, country or town..." value="'+escHtml(filterLoc)+'"></div>'+
    '<div><label style="font-size:.8125rem;font-weight:600;color:var(--text-2);display:block;margin-bottom:.375rem">Availability</label><div style="display:flex;gap:.375rem">'+
    '<button class="filter-pill '+(filterAvail==='all'?'active':'')+'" id="avail-all">All</button>'+
    '<button class="filter-pill '+(filterAvail==='available'?'active':'')+'" id="avail-avail">Available</button>'+
    '<button class="filter-pill '+(filterAvail==='limited'?'active':'')+'" id="avail-lim">Limited</button>'+
    '</div></div></div>'+
    (allLocs.length&&!filterLoc?'<div style="margin-top:.875rem;display:flex;gap:.375rem;flex-wrap:wrap;align-items:center"><span style="font-size:.75rem;color:var(--text-4);font-weight:600;margin-right:.25rem">Browse by city:</span>'+allLocs.slice(0,8).map(l=>'<button class="filter-pill city-pill" data-loc="'+escHtml(l)+'" style="font-size:.75rem;padding:.2rem .625rem">'+escHtml(l)+'</button>').join('')+'</div>':'')+'</div>'+
    (members.length?'<div class="member-grid">'+members.map(u=>renderMemberCard(u)).join('')+'</div>':
    '<div class="empty-state"><div class="empty-icon">&#x1F50D;</div><div class="empty-title">No results found</div><div class="empty-desc">Try a different skill, name, or location</div></div>')+
    '<div class="mb-3" style="margin-top:2rem"><h2 class="t-h1" style="font-size:1.375rem">Freelancers offering services</h2><p class="t-body c-text3">Browse what people in your network can do for you</p></div>'+
    '<div class="service-feature-grid">'+featuredCards.map(renderFeaturedServiceCard).join('')+'</div>';

  let st,st2;
  const ms=$('#member-search'),ls=$('#loc-search');
  if(pageParams.focus && ms) ms.focus();
  if(ms)ms.oninput=e=>{clearTimeout(st);st=setTimeout(()=>navigate('members',{q:e.target.value,avail:filterAvail,loc:filterLoc}),300);};
  if(ls)ls.oninput=e=>{clearTimeout(st2);st2=setTimeout(()=>navigate('members',{q,avail:filterAvail,loc:e.target.value}),300);};
  $('#avail-all')?.addEventListener('click',()=>navigate('members',{q,avail:'all',loc:filterLoc}));
  $('#avail-avail')?.addEventListener('click',()=>navigate('members',{q,avail:'available',loc:filterLoc}));
  $('#avail-lim')?.addEventListener('click',()=>navigate('members',{q,avail:'limited',loc:filterLoc}));
  $$('.city-pill',el).forEach(btn=>btn.addEventListener('click',()=>navigate('members',{q,avail:filterAvail,loc:btn.dataset.loc})));
  $$('.member-card',el).forEach(c=>c.onclick=()=>navigate('profile',{userId:c.dataset.userId}));
}

function renderMemberCard(u){
  const dotClass={available:'avail-available',limited:'avail-limited',unavailable:'avail-unavailable'}[u.availability]||'avail-unavailable';
  return '<div class="member-card" data-user-id="'+u.id+'"><div class="member-card-top"><div class="member-avatar-wrap">'+avatarHtml(u,'lg')+'<span class="member-avail-dot '+dotClass+'"></span></div><div class="flex-1"><div class="member-name">'+escHtml(u.name)+'</div><div class="member-title">'+escHtml(u.jobTitle||(u.skills||[])[0]||u.role)+'</div>'+(u.company?'<div class="t-micro c-text4">'+escHtml(u.company)+'</div>':'')+(u.location?'<div class="t-micro c-text4">'+icon('map')+' '+escHtml(u.location)+'</div>':'')+'<div class="member-trust">'+reviewSummaryHtml(u.reviewAvg||0,u.reviewCount||0)+'</div></div></div>'+(u.skills?.length?'<div class="skill-tags">'+u.skills.slice(0,4).map((s,i)=>'<span class="skill-tag'+(i===0?' primary':'')+'">'+escHtml(s)+'</span>').join('')+'</div>':'')+'<div class="member-card-footer"><span class="avail-badge '+(u.availability||'unavailable')+'">'+(u.availability==='available'?'Available':u.availability==='limited'?'Limited':'Unavailable')+'</span><button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();openModal(\'modal-create-deal\')">Deal</button></div></div>';
}

function renderFeaturedServiceCard(fc){
  const clickAction = fc.isFake
    ? "toast('Real freelancers will show up here once they start posting services!','success')"
    : "navigate('profile',{userId:'"+fc.creator.id+"'})";
  return '<div class="service-feature-card" onclick="'+clickAction+'">'+
    avatarHtml(fc.creator,'xl')+
    '<div class="service-feature-name">'+escHtml(fc.creator.name)+'</div>'+
    (fc.creator.jobTitle?'<div class="t-small c-text3">'+escHtml(fc.creator.jobTitle)+'</div>':'')+
    '<div style="margin-top:.375rem">'+reviewSummaryHtml(fc.rating,fc.reviewCount)+'</div>'+
    '<div class="service-feature-title">'+escHtml(fc.title)+'</div>'+
    '<p class="t-small c-text3" style="line-height:1.5">'+escHtml(fc.description)+'</p>'+
    '<div class="service-feature-price">'+fc.priceLabel+'</div>'+
  '</div>';
}

// ── Opportunities ──────────────────────────────────────────────────────────
async function renderOpportunities(){
  const view = pageParams.view || 'requests';
  const el=document.getElementById('page-opportunities');

  if(view === 'services'){
    await renderServicesTab(el);
    return;
  }

  const filter=pageParams.type||'all',q=pageParams.q||'';
  let opps=[];
  // Fetch by type only — do our own text+location matching client-side so
  // searching "Toronto" also matches the location field, not just title/description.
  try { opps=await store.getOpportunities({type:filter}); } catch(e){ opps=[]; }
  if(q){
    const ql=q.toLowerCase();
    opps=opps.filter(o=>
      (o.title||'').toLowerCase().includes(ql) ||
      (o.description||'').toLowerCase().includes(ql) ||
      (o.location||'').toLowerCase().includes(ql)
    );
  }
  const oppCreators = await usersByIdMap(opps.map(o=>o.creatorId));
  el.innerHTML='<div class="page-head"><div class="page-head-left"><h1 class="page-title">Opportunities</h1><p class="page-sub">'+opps.length+' open across your Wheels</p></div><div class="page-actions"><button class="btn btn-teal" onclick="openModal(\'modal-create-opp\')">'+icon('plus')+' Post Opportunity</button></div></div>'+
  '<div class="tabs"><div class="tab-item active" onclick="navigate(\'opportunities\',{view:\'requests\'})">Requests</div><div class="tab-item" onclick="navigate(\'opportunities\',{view:\'services\'})">Services</div></div>'+
  '<div class="filter-bar">'+['all','job','collaboration','investment','service'].map(t=>'<button class="filter-pill opp-filter-btn '+(filter===t?'active':'')+'" data-type="'+t+'"><span class="type-badge type-'+t+'" style="'+(t==='all'?'background:none;color:inherit;font-size:.8125rem;font-weight:500;padding:0':'')+'">'+t.replace('_',' ')+'</span></button>').join('')+'<div style="position:relative;margin-left:auto"><svg style="position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:var(--text-4);pointer-events:none" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="form-control" id="opp-search" placeholder="Search title, description, or city..." value="'+escHtml(q)+'" style="padding-left:2.25rem;width:220px"></div></div>'+
  '<div class="opp-list">'+(opps.length?opps.map(o=>renderOppCard(o,oppCreators)).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F3AF;</div><div class="empty-title">No opportunities found</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-opp\')">Post One</button></div>')+'</div>';
  let st;$('#opp-search')?.addEventListener('input',e=>{clearTimeout(st);st=setTimeout(()=>navigate('opportunities',{type:filter,q:e.target.value}),300);});
  $$('.opp-filter-btn',el).forEach(btn=>btn.addEventListener('click',()=>navigate('opportunities',{type:btn.dataset.type,q})));
  $$('.opp-card',el).forEach(c=>c.onclick=()=>{openModal('modal-opp-detail');renderOppDetail(c.dataset.oppId);});
  $$('.delete-opp-btn',el).forEach(btn=>btn.onclick=()=>deleteOpportunityAction(btn.dataset.oppId, btn.dataset.oppTitle));
}

async function fetchServices(q){
  const sb = getSb();
  if(!sb) return [];
  try {
    let query = sb.from('services').select('*').eq('status','open').order('created_at',{ascending:false});
    const { data, error } = await query;
    if(error) throw error;
    let rows = data||[];
    if(q){
      const ql = q.toLowerCase();
      rows = rows.filter(s=>s.title.toLowerCase().includes(ql) || (s.description||'').toLowerCase().includes(ql) || (s.skills||[]).some(sk=>sk.toLowerCase().includes(ql)) || (s.location||'').toLowerCase().includes(ql));
    }
    return rows;
  } catch(e){ console.warn('Services fetch failed:', e.message); return []; }
}

function renderServiceCard(s, creator){
  const me = store.getMe();
  const isOwner = me && s.creator_id===me.id;
  const priceLabel = s.price_cents ? fmtMoney(s.price_cents/100) + (s.price_type==='hourly'?'/hr':'') : 'Rate on request';
  return '<div class="opp-card" data-service-id="'+s.id+'"><div class="opp-main"><div class="opp-title">'+escHtml(s.title)+'</div><div class="opp-meta">'+avatarHtml(creator,'sm')+'<span class="opp-meta-item">'+escHtml(creator?.name||'')+'</span>'+(s.location?'<span class="opp-meta-item">'+icon('map')+' '+escHtml(s.location)+'</span>':'')+(s.delivery_days?'<span class="opp-meta-item">'+s.delivery_days+' day delivery</span>':'')+'</div><div class="opp-desc">'+escHtml(s.description)+'</div><div class="skill-tags mt-2">'+(s.skills||[]).map(sk=>'<span class="skill-tag">'+escHtml(sk)+'</span>').join('')+'</div></div><div class="opp-right"><div class="opp-value">'+priceLabel+'</div><div class="opp-posted">'+timeAgo(s.created_at)+'</div>'+(isOwner?'<button class="btn btn-ghost btn-xs mt-2" style="color:var(--red)" onclick="event.stopPropagation();deleteServiceAction(\''+s.id+'\',\''+escHtml(s.title).replace(/'/g,"\\\\'")+'\')">Delete</button>':'<button class="btn btn-teal btn-sm mt-2" onclick="event.stopPropagation();openDM(\''+s.creator_id+'\')">Message</button>')+'</div></div>';
}

async function renderServicesTab(el){
  const q = pageParams.q || '';
  const services = await fetchServices(q);
  const creators = await Promise.all(services.map(s=>dmGetUser(s.creator_id)));
  el.innerHTML='<div class="page-head"><div class="page-head-left"><h1 class="page-title">Opportunities</h1><p class="page-sub">'+services.length+' service'+(services.length===1?'':'s')+' offered</p></div><div class="page-actions"><button class="btn btn-teal" onclick="openModal(\'modal-create-service\')">'+icon('plus')+' Post a Service</button></div></div>'+
  '<div class="tabs"><div class="tab-item" onclick="navigate(\'opportunities\',{view:\'requests\'})">Requests</div><div class="tab-item active" onclick="navigate(\'opportunities\',{view:\'services\'})">Services</div></div>'+
  '<div class="filter-bar"><div style="position:relative;margin-left:auto"><svg style="position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:var(--text-4);pointer-events:none" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="form-control" id="svc-search" placeholder="Search title, skill, or city..." value="'+escHtml(q)+'" style="padding-left:2.25rem;width:220px"></div></div>'+
  '<div class="opp-list">'+(services.length?services.map((s,i)=>renderServiceCard(s,creators[i])).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F6E0;</div><div class="empty-title">No services listed yet</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-service\')">Post a Service</button></div>')+'</div>';
  let st;$('#svc-search')?.addEventListener('input',e=>{clearTimeout(st);st=setTimeout(()=>navigate('opportunities',{view:'services',q:e.target.value}),300);});
}

window.deleteServiceAction = async (serviceId, serviceTitle) => {
  if(!confirm('Delete "'+(serviceTitle||'this service')+'"? This cannot be undone.')) return;
  const sb = getSb();
  try {
    const { error } = await sb.from('services').delete().eq('id', serviceId);
    if(error) throw error;
    toast('Service deleted', 'success');
    navigate('opportunities', { view: 'services' });
  } catch(e){ toast('Failed to delete: '+e.message, 'error'); }
};


function renderOppCard(o, usersById){
  const creator=(usersById&&usersById[o.creatorId])||null;
  const isCreator = store.getMe()?.id === o.creatorId;
  const valMap={job:(o.metadata?.value?o.metadata.value:'TBD'),partnership:'Equity: '+(o.metadata?.equity||'TBD'),collaboration:'Equity: '+(o.metadata?.equity||'TBD'),investment:'Ticket: '+(o.metadata?.ticketSize||'TBD'),referral:'Bonus: '+(o.metadata?.bonus?fmtMoney(o.metadata.bonus):'TBD'),service:'Budget: '+(o.metadata?.budgetMin?fmtMoney(o.metadata.budgetMin)+' - '+fmtMoney(o.metadata.budgetMax):'TBD'),service_request:'TBD'};
  return '<div class="opp-card" data-opp-id="'+o.id+'"><div class="opp-main"><div class="opp-title">'+escHtml(o.title)+'</div><div class="opp-meta"><span class="type-badge type-'+o.type+'">'+o.type.replace('_',' ')+'</span>'+avatarHtml(creator,'sm')+'<span class="opp-meta-item">'+escHtml(creator?.name||'')+'</span>'+(o.remoteOk?'<span class="opp-meta-item">Remote OK</span>':'')+'<span class="opp-meta-item">'+o.applicationCount+' applied</span></div><div class="opp-desc">'+escHtml(o.description)+'</div><div class="skill-tags mt-2">'+(o.skills||[]).map(s=>'<span class="skill-tag">'+escHtml(s)+'</span>').join('')+'</div></div><div class="opp-right"><div class="opp-value">'+(valMap[o.type]||'')+'</div><div class="opp-posted">'+timeAgo(o.createdAt)+'</div>'+(isCreator?'<button class="btn btn-ghost btn-xs mt-2 delete-opp-btn" style="color:var(--red)" data-opp-id="'+o.id+'" data-opp-title="'+escHtml(o.title)+'" onclick="event.stopPropagation()">Delete</button>':'<button class="btn btn-teal btn-sm mt-2" onclick="event.stopPropagation();applyToOpportunity(\''+o.id+'\',this)">Apply</button>')+'</div></div>';
}

let _activeOppId = null;

async function appFetchApplications(oppId){
  const sb = getSb();
  if(!sb) return [];
  const { data, error } = await sb.from('opportunity_applications').select('*').eq('opportunity_id', oppId).order('created_at', { ascending: false });
  if(error){ console.warn('Applications fetch failed:', error.message); return []; }
  return data || [];
}

window.applyToOpportunity = async (oppId, btnEl) => {
  const me = store.getMe();
  if(!me) return;
  const opp = store.get('opportunities').find(o=>o.id===oppId);
  if(!opp) return;
  const requiresResume = opp.type==='job' && opp.metadata?.requireResume !== false;
  if(requiresResume && !me.resume){
    toast('Add a resume to your profile before applying to jobs.', 'error');
    closeAllModals();
    navigate('profile', { userId: me.id });
    return;
  }
  const sb = getSb();
  if(btnEl){ btnEl.disabled=true; btnEl.textContent='Applying...'; }
  try {
    if(sb){
      const { error } = await sb.from('opportunity_applications').insert({
        opportunity_id: oppId, applicant_id: me.id,
        resume_url: me.resume || null, message: ''
      });
      if(error && error.code !== '23505') throw error; // 23505 = already applied, treat as success
    }
    opp.applicationCount = (opp.applicationCount||0) + 1;
    store._save();
    toast('Application submitted!', 'success');
    if(btnEl){ btnEl.textContent='Applied'; }
    if($('#modal-opp-detail')?.classList.contains('open')) renderOppDetail(oppId);
  } catch(e){
    toast('Failed to apply: '+e.message, 'error');
    if(btnEl){ btnEl.disabled=false; btnEl.textContent='Apply'; }
  }
};

async function renderOppDetail(oppId){
  const o=store.get('opportunities').find(x=>x.id===oppId);if(!o)return;
  _activeOppId = oppId;
  const creator=await store.getUser(o.creatorId);
  const me=store.getMe();
  const isCreator = me && o.creatorId===me.id;
  $('#modal-opp-detail .modal-title').textContent=o.title;
  let html='<div class="flex gap-3 items-start mb-4">'+avatarHtml(creator,'md')+'<div><div class="t-h3">'+escHtml(creator?.name||'')+'</div><div class="t-small c-text3">'+timeAgo(o.createdAt)+' - '+o.applicationCount+' applied</div></div><span class="type-badge type-'+o.type+'" style="margin-left:auto">'+o.type.replace('_',' ')+'</span></div><p class="t-body mb-4" style="line-height:1.7">'+escHtml(o.description)+'</p><div class="skill-tags mb-4">'+(o.skills||[]).map(s=>'<span class="skill-tag primary">'+escHtml(s)+'</span>').join('')+'</div><div class="card card-sm" style="background:var(--surface)"><div class="form-row"><div><div class="t-label c-text4 mb-1">Location</div><div class="t-body">'+escHtml(o.location)+(o.remoteOk?' (Remote OK)':'')+'</div></div><div><div class="t-label c-text4 mb-1">Expires</div><div class="t-body">'+(o.expiresAt?new Date(o.expiresAt).toLocaleDateString():'Open')+'</div></div></div></div>';

  if(isCreator){
    html += '<div class="mt-4"><div class="flex justify-between items-center mb-2"><h3 class="t-h2" style="margin:0">Applicants</h3><button class="btn btn-ghost btn-xs" style="color:var(--red)" onclick="deleteOpportunityAction(getActiveOppId(),\''+escHtml(o.title).replace(/'/g,"\\\\'")+'\')">Delete Posting</button></div><div id="opp-applicants-list"><div class="t-small c-text3" style="padding:1rem">Loading...</div></div></div>';
  }
  $('#modal-opp-body').innerHTML = html;
  const footerBtn = $('#modal-opp-detail .modal-footer .btn-teal');
  if(footerBtn){
    if(isCreator){ footerBtn.style.display='none'; }
    else { footerBtn.style.display=''; footerBtn.textContent='Apply Now'; footerBtn.disabled=false; }
  }

  if(isCreator){
    const apps = await appFetchApplications(oppId);
    const listEl = document.getElementById('opp-applicants-list');
    if(!listEl) return;
    if(!apps.length){
      listEl.innerHTML = '<div class="empty-state" style="padding:1.5rem"><div class="empty-icon">&#x1F4E5;</div><div class="empty-title">No applicants yet</div></div>';
      return;
    }
    const applicants = await Promise.all(apps.map(a=>dmGetUser(a.applicant_id)));
    listEl.innerHTML = apps.map((a,i)=>{
      const u = applicants[i];
      const resumeUrl = a.resume_url || u?.resume;
      return '<div class="card card-sm mb-2" style="display:flex;align-items:center;gap:.75rem">'+avatarHtml(u,'sm')+'<div class="flex-1"><div class="t-small" style="font-weight:600">'+escHtml(u?.name||'Unknown')+'</div><div class="t-micro c-text4">Applied '+timeAgo(a.created_at)+'</div></div>'+(resumeUrl?'<a href="'+escHtml(resumeUrl)+'" target="_blank" rel="noopener" class="btn btn-outline btn-xs">'+icon('file')+' Resume</a>':'<span class="t-micro c-text4">No resume</span>')+'<button class="btn btn-ghost btn-xs" onclick="openDM(\''+(u?.id||'')+'\')">Message</button></div>';
    }).join('');
  }
}
window.getActiveOppId = () => _activeOppId;

window.deleteWheelAction = async (wheelId, wheelName) => {
  if(!confirm('Delete "'+(wheelName||'this Wheel')+'"? This cannot be undone. All posts, opportunities, and events in this Wheel will be removed.')) return;
  const sb = getSb();
  try {
    if(sb){
      // Opportunities can belong to multiple wheels (wheel_ids array) — unlink rather than
      // blindly deleting, and only delete the opportunity itself if this was its only wheel.
      try {
        const { data: opps } = await sb.from('opportunities').select('id, wheel_ids').contains('wheel_ids', [wheelId]);
        for(const o of (opps||[])){
          const remaining = (o.wheel_ids||[]).filter(id=>id!==wheelId);
          if(remaining.length){
            await sb.from('opportunities').update({ wheel_ids: remaining }).eq('id', o.id);
          } else {
            await sb.from('opportunity_applications').delete().eq('opportunity_id', o.id).then(()=>{}, ()=>{});
            await sb.from('opportunities').delete().eq('id', o.id);
          }
        }
      } catch(e){ console.warn('Opportunity cleanup skipped:', e.message); }

      // Deals carry real payment history — unlink from the wheel instead of deleting them.
      try { await sb.from('deals').update({ wheel_id: null }).eq('wheel_id', wheelId); }
      catch(e){ console.warn('Deal unlink skipped:', e.message); }

      await sb.from('wheel_members').delete().eq('wheel_id', wheelId);
      await sb.from('posts').delete().eq('wheel_id', wheelId);
      await sb.from('events').delete().eq('wheel_id', wheelId);
      const { error } = await sb.from('wheels').delete().eq('id', wheelId);
      if(error) throw error;
    }
    store.data.wheels = store.data.wheels.filter(w=>w.id!==wheelId);
    store.data.wheelMembers = store.data.wheelMembers.filter(m=>m.wheelId!==wheelId);
    store._save();
    toast('Wheel deleted', 'success');
    updateShellDynamic(store.getMe());
    navigate('wheels');
  } catch(e){ toast('Failed to delete: '+e.message, 'error'); }
};

window.leaveWheelAction = async (wheelId, wheelName) => {
  if(!confirm('Leave "'+(wheelName||'this Wheel')+'"? You can rejoin later if it stays open.')) return;
  const me = store.getMe();
  const sb = getSb();
  try {
    if(sb){
      const { error } = await sb.from('wheel_members').delete().eq('wheel_id', wheelId).eq('user_id', me.id);
      if(error) throw error;
    }
    store.data.wheelMembers = store.data.wheelMembers.filter(m=>!(m.wheelId===wheelId && m.userId===me.id));
    store._save();
    toast('You left '+(wheelName||'the Wheel'), 'success');
    updateShellDynamic(me);
    navigate('wheels');
  } catch(e){ toast('Failed to leave: '+e.message, 'error'); }
};

window.deleteOpportunityAction = async (oppId, oppTitle) => {
  if(!confirm('Delete "'+(oppTitle||'this posting')+'"? This cannot be undone and all applications to it will be removed.')) return;
  const sb = getSb();
  try {
    if(sb){
      await sb.from('opportunity_applications').delete().eq('opportunity_id', oppId).then(()=>{}, ()=>{});
      const { error } = await sb.from('opportunities').delete().eq('id', oppId);
      if(error) throw error;
    }
    store.data.opportunities = (store.data.opportunities||[]).filter(o=>o.id!==oppId);
    store._save();
    toast('Posting deleted', 'success');
    closeAllModals();
    if(currentPage==='wheel-detail') renderWheelDetail();
    else navigate('opportunities');
  } catch(e){ toast('Failed to delete: '+e.message, 'error'); }
};

window.deleteDealAction = async (dealId, dealTitle) => {
  if(!confirm('Delete "'+(dealTitle||'this deal')+'"? This removes it from your Deals list and message history. Any real Stripe payment record stays in your Stripe dashboard regardless.')) return;
  const sb = getSb();
  try {
    if(sb){
      await sb.from('deal_messages').delete().eq('deal_id', dealId).then(()=>{}, ()=>{});
      const { error } = await sb.from('deals').delete().eq('id', dealId);
      if(error) throw error;
    }
    store.data.deals = (store.data.deals||[]).filter(d=>d.id!==dealId);
    store._save();
    toast('Deal deleted', 'success');
    if(currentPage==='deal-detail') navigate('deals'); else renderDeals();
  } catch(e){ toast('Failed to delete: '+e.message, 'error'); }
};

window.deleteEventAction = async (eventId, eventTitle) => {
  if(!confirm('Delete "'+(eventTitle||'this event')+'"? This cannot be undone and everyone\'s RSVPs will be removed.')) return;
  const sb = getSb();
  try {
    if(sb){
      await sb.from('event_attendees').delete().eq('event_id', eventId).then(()=>{}, ()=>{});
      const { error } = await sb.from('events').delete().eq('id', eventId);
      if(error) throw error;
    }
    toast('Event deleted', 'success');
    renderWheelDetail();
  } catch(e){ toast('Failed to delete: '+e.message, 'error'); }
};


// ── Deals ──────────────────────────────────────────────────────────────────
async function renderDeals(){
  let deals=[];
  try { deals=await store.getMyDeals(); } catch(e){ deals=[]; }
  const me=store.getMe(),filter=pageParams.status||'all';
  const filtered=filter==='all'?deals:deals.filter(d=>d.status===filter);
  const STAGES=['proposed','negotiating','accepted','in_progress','completed','paid'];
  const dealUsers = await usersByIdMap(filtered.map(d=>d.buyerId===me.id?d.sellerId:d.buyerId));
  const el=document.getElementById('page-deals');
  el.innerHTML='<div class="page-head"><div class="page-head-left"><h1 class="page-title">Deals</h1><p class="page-sub">'+deals.length+' total</p></div><div class="page-actions"><button class="btn btn-teal" onclick="openModal(\'modal-create-deal\')">'+icon('plus')+' Create Deal</button></div></div>'+
  '<div class="filter-bar">'+['all','proposed','in_progress','completed','paid'].map(s=>{const cnt=s==='all'?deals.length:deals.filter(d=>d.status===s).length;return cnt>0||s==='all'?'<button class="filter-pill deal-filter-btn '+(filter===s?'active':'')+'" data-status="'+s+'">'+s.replace('_',' ')+' ('+cnt+')</button>':'';}).join('')+'</div>'+
  '<div class="deal-list">'+(filtered.length?filtered.map(d=>{
    const other=dealUsers[d.buyerId===me.id?d.sellerId:d.buyerId],si=STAGES.indexOf(d.status);
    const isDone = d.status==='paid' || d.status==='completed';
    return '<div class="deal-card" data-deal-id="'+d.id+'" onclick="navigate(\'deal-detail\',{dealId:\''+d.id+'\'})"><div class="deal-card-top"><div><div class="deal-title">'+escHtml(d.title)+'</div><div class="deal-parties">'+avatarHtml(other,'sm')+' '+escHtml(other?.name||'?')+' - '+(d.buyerId===me.id?'You are Buyer':'You are Seller')+'</div></div><div style="text-align:right"><div class="deal-amount">'+fmtMoney(d.priceCents/100,d.currency)+'</div>'+dealStatusBadge(d.status)+'</div></div><div class="deal-stages">'+STAGES.map((s,i)=>'<div class="deal-stage-dot '+(i<si?'done':i===si?'current':'')+'"></div>').join('')+'</div><div class="deal-card-footer"><span class="deal-due">'+icon('clock')+' '+(d.endDate||'TBD')+'</span><span class="flex items-center gap-2"><span class="t-micro c-text3">'+(d.messages?.length||0)+' messages</span>'+(isDone?'<button class="btn btn-ghost btn-xs delete-deal-btn" style="color:var(--red)" data-deal-id="'+d.id+'" data-deal-title="'+escHtml(d.title)+'" onclick="event.stopPropagation()">Delete</button>':'')+'</span></div></div>';
  }).join(''):'<div class="empty-state"><div class="empty-icon">&#x1F91D;</div><div class="empty-title">No deals yet</div><button class="btn btn-primary btn-sm" onclick="openModal(\'modal-create-deal\')">Create Deal</button></div>')+'</div>';
  $$('.deal-filter-btn',el).forEach(btn=>btn.addEventListener('click',()=>navigate('deals',{status:btn.dataset.status})));
  $$('.delete-deal-btn',el).forEach(btn=>btn.onclick=()=>deleteDealAction(btn.dataset.dealId, btn.dataset.dealTitle));
}

async function renderDealDetail(){
  let deal;
  try { deal=await store.getDeal(pageParams.dealId); } catch(e){ deal=null; }
  if(!deal){navigate('deals');return;}
  const me=store.getMe(),buyer=await store.getUser(deal.buyerId),seller=await store.getUser(deal.sellerId),isBuyer=deal.buyerId===me.id;
  const otherParty=isBuyer?seller:buyer;
  const isFinished=['completed','paid'].includes(deal.status);
  const withinReviewWindow=deal.completedAt && (Date.now()-new Date(deal.completedAt).getTime())<14*24*60*60*1000;
  let myReview=null;
  if(isFinished){
    try{ myReview=await store.getMyReviewForDeal(deal.id, me.id); }catch(e){ myReview=null; }
  }
  const canReview=isFinished && withinReviewWindow && !myReview;
  const STAGES=['proposed','negotiating','accepted','in_progress','completed','paid'],si=STAGES.indexOf(deal.status);
  const fairrissFee=10,fees=fairrissFee/100*deal.priceCents/100,sellerGets=deal.priceCents/100-fees;
  const actions={
    proposed:isBuyer?[]:[{label:'Accept Deal',fn:"updateDealStatus('"+deal.id+"','accepted')",cls:'btn-teal'},{label:'Counter',fn:"updateDealStatus('"+deal.id+"','negotiating')",cls:'btn-outline'}],
    negotiating:[{label:'Accept Terms',fn:"updateDealStatus('"+deal.id+"','accepted')",cls:'btn-teal'}],
    accepted:isBuyer?[{label:'Start Work',fn:"updateDealStatus('"+deal.id+"','in_progress')",cls:'btn-teal'}]:[],
    in_progress:!isBuyer?[{label:'Mark Complete',fn:"updateDealStatus('"+deal.id+"','completed')",cls:'btn-primary'}]:[{label:'Approve Payment',fn:"updateDealStatus('"+deal.id+"','paid')",cls:'btn-teal'},{label:'Raise Dispute',fn:"updateDealStatus('"+deal.id+"','disputed')",cls:'btn-danger'}],
    completed:isBuyer?[{label:'Pay Now - '+fmtMoney(deal.priceCents/100),fn:"openPaymentModal('"+deal.id+"')",cls:'btn-teal'},{label:'Raise Dispute',fn:"updateDealStatus('"+deal.id+"','disputed')",cls:'btn-danger'}]:[],
    paid:[],disputed:[]
  };
  const el=document.getElementById('page-deal-detail');
  el.innerHTML='<div class="mb-3"><button class="btn btn-ghost btn-sm" onclick="navigate(\'deals\')">Back to Deals</button></div>'+
  '<div class="deal-detail-header"><div class="flex justify-between items-start mb-3"><div><div class="deal-detail-title">'+escHtml(deal.title)+'</div><div class="deal-detail-meta">'+dealStatusBadge(deal.status)+'<span class="t-small c-text3">Created '+timeAgo(deal.createdAt)+'</span></div></div><div style="text-align:right"><div class="deal-detail-amount">'+fmtMoney(deal.priceCents/100,deal.currency)+'</div><div class="deal-detail-amount-label">'+(deal.paymentType==='lump_sum'?'Full Amount':deal.paymentType||'Full Amount')+'</div></div></div>'+
  '<div class="deal-stages mb-4">'+STAGES.map((s,i)=>'<div class="deal-stage-dot '+(i<si?'done':i===si?'current':'')+'" title="'+s+'"></div>').join('')+'</div>'+
  '<div class="two-col-equal"><div class="card card-sm" style="background:var(--surface)"><div class="t-label c-text4 mb-2">Buyer</div><div class="flex gap-2 items-center">'+avatarHtml(buyer,'md')+'<div class="t-h3">'+escHtml(buyer?.name||'?')+'</div></div></div><div class="card card-sm" style="background:var(--surface)"><div class="t-label c-text4 mb-2">Seller</div><div class="flex gap-2 items-center">'+avatarHtml(seller,'md')+'<div class="t-h3">'+escHtml(seller?.name||'?')+'</div></div></div></div>'+
  (actions[deal.status]?.length?'<div class="flex gap-2 mt-4">'+actions[deal.status].map(a=>'<button class="btn '+a.cls+'" onclick="'+a.fn+'">'+a.label+'</button>').join('')+'</div>':'')+(['paid','completed'].includes(deal.status)?'<div class="mt-3"><button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="deleteDealAction(\''+deal.id+'\',\''+escHtml(deal.title).replace(/'/g,"\\\\'")+'\')">Delete Deal</button></div>':'')+'</div>'+
  (canReview?'<div class="card mb-4"><h3 class="t-h2 mb-2">Leave a review for '+escHtml(otherParty?.name||'this user')+'</h3><p class="t-small c-text3 mb-3">You have 14 days after a deal completes to leave a review.</p><div id="deal-review-stars" style="display:flex;gap:4px;margin-bottom:.75rem" data-rating="0">'+[1,2,3,4,5].map(n=>'<button type="button" class="deal-review-star" data-n="'+n+'" style="background:none;border:none;cursor:pointer;padding:2px" onclick="setDealReviewStar('+n+')">'+starIcon(false).replace(/width="14" height="14"/,'width="24" height="24"')+'</button>').join('')+'</div><textarea class="form-control mb-2" id="deal-review-comment" rows="2" placeholder="Optional \u2014 what was it like working with them?"></textarea><button class="btn btn-teal btn-sm" onclick="submitDealReview(\''+deal.id+'\',\''+otherParty?.id+'\')">Submit Review</button></div>':'')+
  (myReview?'<div class="card mb-4"><h3 class="t-h2 mb-2">Your review</h3>'+starRow(myReview.rating,18)+(myReview.comment?'<p class="t-small mt-2" style="color:var(--text-2)">'+escHtml(myReview.comment)+'</p>':'')+'</div>':'')+
  '<div class="two-col"><div><div class="card mb-3"><h3 class="t-h2 mb-2">Scope</h3><p class="t-body" style="line-height:1.7;color:var(--text-2)">'+escHtml(deal.scope)+'</p></div>'+
  '<div class="card mb-3"><h3 class="t-h2 mb-3">Deliverables</h3>'+(deal.deliverables?.map(del=>'<div class="deliverable-item '+(del.done?'done':'')+'"><div class="deliverable-check '+(del.done?'checked':'')+'">'+( del.done?icon('check'):'')+'</div><div class="deliverable-title" style="'+(del.done?'text-decoration:line-through;opacity:.6':'')+'">'+escHtml(del.title)+'</div></div>').join('')||'<div class="t-body c-text3">No deliverables</div>')+'</div>'+
  '<div class="card card-sm" style="background:var(--surface)"><div class="t-label c-text4 mb-2">Fee Breakdown</div><div class="flex justify-between mb-1"><span class="t-small c-text3">Deal value</span><span class="t-small">'+fmtMoney(deal.priceCents/100)+'</span></div><div class="flex justify-between mb-2"><span class="t-small c-text3">Fairriss fee (10%)</span><span class="t-small c-red">-'+fmtMoney(fees)+'</span></div><div class="divider" style="margin:.5rem 0"></div><div class="flex justify-between"><span class="t-body" style="font-weight:700">Seller receives</span><span class="t-body c-green" style="font-weight:700">'+fmtMoney(sellerGets)+'</span></div></div></div>'+
  '<div><div class="card card-flush"><div class="notif-panel-head" style="padding:.875rem 1rem"><h3 class="t-h2">Messages</h3></div><div class="message-thread" id="deal-messages">'+
  (deal.messages?.map(msg=>{const isMe2=msg.senderId===me.id,sender=msg.senderId===buyer?.id?buyer:seller;return '<div class="message-item '+(isMe2?'mine':'')+'">'+(!isMe2?avatarHtml(sender,'sm'):'')+'<div><div class="message-bubble">'+escHtml(msg.body)+'</div><div class="message-time">'+timeAgo(msg.createdAt)+' &middot; '+fullDateTime(msg.createdAt)+'</div></div></div>';}).join('')||'<div class="empty-state" style="padding:1.5rem">No messages yet</div>')+
  '</div><div class="message-input-row" style="position:relative"><button type="button" class="btn btn-ghost btn-sm" style="padding:.5rem;font-size:1.125rem" onclick="toggleEmojiPicker(\'deal-msg-input\',this)">&#x1F642;</button><input class="message-input" id="deal-msg-input" placeholder="Write a message..."><button class="btn btn-teal btn-sm" id="deal-msg-send">'+icon('send')+'</button></div></div></div></div>';
  const sendMsg=()=>{const input=$('#deal-msg-input'),body=input.value.trim();if(!body)return;store.addDealMessage(deal.id,body);input.value='';renderDealDetail();const t=$('#deal-messages');if(t)t.scrollTop=t.scrollHeight;};
  $('#deal-msg-send').onclick=sendMsg;$('#deal-msg-input').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}};
  const t=$('#deal-messages');if(t)t.scrollTop=t.scrollHeight;
}
window.updateDealStatus=async(id,status)=>{
  const fields={status};
  if(status==='completed'||status==='paid'){
    let d=null;
    try{ d=await store.getDeal(id); }catch(e){}
    if(!d?.completedAt) fields.completedAt=new Date().toISOString();
  }
  await store.updateDeal(id,fields);
  toast('Deal moved to '+status.replace('_',' '),'success');
  updateShellDynamic(store.getMe());
  renderDealDetail();
};

// ── Profile ────────────────────────────────────────────────────────────────
function renderFeaturedPhotosCard(u, isMe){
  const pics = u.featuredPhotos || [];
  if(!isMe && !pics.filter(Boolean).length) return '';
  let h = '<div class="card mb-4"><h2 class="t-h2 mb-3">'+icon('camera')+' Featured</h2><div style="display:flex;gap:.75rem;flex-wrap:wrap">';
  for(let i=0;i<2;i++){
    const pic = pics[i];
    if(pic){
      h += '<div style="position:relative"><img src="'+pic+'" style="width:130px;height:130px;border-radius:var(--radius-sm);object-fit:cover;border:1px solid var(--border);cursor:pointer" onclick="openLightbox(\''+pic+'\')">'+(isMe?'<label style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);border-radius:var(--radius-sm);opacity:0;cursor:pointer" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0" onclick="event.stopPropagation()">'+icon('camera')+'<input type="file" accept="image/*" style="display:none" onchange="uploadFeaturedPhoto(event,'+i+')"></label>':'')+'</div>';
    } else if(isMe){
      h += '<label style="width:130px;height:130px;border-radius:var(--radius-sm);border:2px dashed var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:var(--text-4);font-size:.75rem;gap:.375rem">'+icon('camera')+'<span>Photo '+(i+1)+'</span><input type="file" accept="image/*" style="display:none" onchange="uploadFeaturedPhoto(event,'+i+')"></label>';
    }
  }
  h += '</div></div>';
  return h;
}

function renderVideosCard(u, isMe){
  // Fall back to the old single introVideo field for anyone who uploaded before this change
  const vids = (u.videos && u.videos.length) ? u.videos : (u.introVideo ? [u.introVideo] : []);
  if(!isMe && !vids.filter(Boolean).length) return '';
  let h = '<div class="card mb-4"><h2 class="t-h2 mb-3">'+icon('video')+' Video</h2>';
  for(let i=0;i<2;i++){
    const v = vids[i];
    if(v){
      h += '<video src="'+v+'" controls style="width:100%;border-radius:var(--radius-sm);background:#000;max-height:220px;margin-bottom:.75rem"></video>';
      if(isMe) h += '<label class="btn btn-ghost btn-xs" style="cursor:pointer;margin-bottom:.75rem;display:inline-block">Replace<input type="file" accept="video/*" style="display:none" onchange="uploadVideo(event,'+i+')"></label>';
    } else if(isMe){
      h += '<label class="btn btn-outline btn-sm" style="cursor:pointer;margin-bottom:.75rem;display:inline-block">'+icon('video')+' Upload Video '+(i+1)+'<input type="file" accept="video/*" style="display:none" onchange="uploadVideo(event,'+i+')"></label><br>';
    }
  }
  h += '</div>';
  return h;
}

function renderAboutCard(u,isMe){
  let h='<div class="card mb-4"><h2 class="t-h2 mb-3">About</h2>';
  if(isMe){
    const roleOptions=['','Founder','Freelancer','Owner','Investor','Advisor','Other'];
    const isCustomRole = u.userType && !roleOptions.includes(u.userType);
    const selectedValue = isCustomRole ? 'Other' : (u.userType||'');
    h+='<div class="form-group mb-2"><label class="form-label">Name</label><input class="form-control" id="profile-name" value="'+escHtml(u.name||'')+'" placeholder="Your name"></div>';
    h+='<div class="form-group mb-2"><label class="form-label">What best describes you? <span>(optional)</span></label><select class="form-control" id="profile-usertype" onchange="document.getElementById(\'profile-other-row\').style.display=(this.value===\'Other\')?\'block\':\'none\'">'+roleOptions.map(r=>'<option value="'+escHtml(r)+'"'+(selectedValue===r?' selected':'')+'>'+(r||'Not set')+'</option>').join('')+'</select></div>';
    h+='<div class="form-group mb-2" id="profile-other-row" style="display:'+(isCustomRole?'block':'none')+'"><label class="form-label">Tell us what you do</label><input class="form-control" id="profile-other-input" value="'+escHtml(isCustomRole?u.userType:'')+'" placeholder="e.g. Consultant, Student, Recruiter..."></div>';
    h+='<textarea class="form-control mb-2" id="profile-bio" rows="3">'+escHtml(u.bio||'')+'</textarea>';
    h+='<div class="form-row mb-2"><div class="form-group"><label class="form-label">Job Title</label><input class="form-control" id="profile-title" value="'+escHtml(u.jobTitle||'')+'" placeholder="CEO, Designer..."></div><div class="form-group"><label class="form-label">Company</label><input class="form-control" id="profile-company" value="'+escHtml(u.company||'')+'" placeholder="Acme Corp..."></div></div>';
    h+='<div class="form-group mb-2"><label class="form-label">Location <span>(city or country)</span></label><input class="form-control" id="profile-location" value="'+escHtml(u.location||'')+'" placeholder="Toronto, ON or Canada"></div>';
    h+='<div class="form-group mb-3"><label class="form-label">Website / Link</label><input class="form-control" id="profile-website" value="'+escHtml(u.website||'')+'" placeholder="yoursite.com or linkedin.com/in/you"></div>';
    h+='<div class="form-group mb-3"><label class="form-label">Additional Links <span>(portfolio, social, etc.)</span></label><div id="profile-links-list" style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:.625rem">';
    (u.links||[]).forEach((lnk,i)=>{h+='<div style="display:flex;gap:.5rem;align-items:center"><input class="form-control profile-link-input" value="'+escHtml(lnk)+'" placeholder="https://..." style="flex:1"><button class="btn btn-ghost btn-xs" onclick="removeLink('+i+')" style="color:var(--red)">Remove</button></div>';});
    h+='</div><button class="btn btn-outline btn-xs" onclick="addLinkField()">+ Add Link</button></div>';
    h+='<div class="form-group mb-3"><label class="form-label">Contact Email <span>(optional \u2014 shown to other members)</span></label><input class="form-control" id="profile-contact-email" type="email" value="'+escHtml(u.contactEmail||'')+'" placeholder="you@example.com"></div>';
    h+='<button class="btn btn-outline btn-sm" onclick="saveProfileInfo()">Save</button>';
  }else{
    h+='<p class="t-body mb-3" style="color:var(--text-2);line-height:1.7">'+escHtml(u.bio||'No bio yet.')+'</p>';
    const links=(u.links||[]).filter(Boolean);
    if(links.length){
      h+='<div style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:.5rem">';
      links.forEach(lnk=>{const href=lnk.startsWith('http')?lnk:'https://'+lnk;const label=lnk.replace(/^https?:\/\//,'').replace(/\/$/,'');h+='<a href="'+escHtml(href)+'" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:.5rem;color:var(--teal);font-size:.875rem;font-weight:500;text-decoration:none">'+icon('link')+escHtml(label)+'</a>';});
      h+='</div>';
    }
    if(u.contactEmail){
      h+='<a href="mailto:'+escHtml(u.contactEmail)+'" style="display:flex;align-items:center;gap:.5rem;color:var(--teal);font-size:.875rem;font-weight:500;text-decoration:none"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'+escHtml(u.contactEmail)+'</a>';
    }
  }
  h+='</div>';return h;
}

function renderReviewItem(r, viewerId){
  const reviewerUser = {id:r.reviewerId, name:r.reviewer?.name||'Fairriss user', profilePics:r.reviewer?.profilePics||[]};
  const withinReplyWindow = (Date.now()-new Date(r.createdAt).getTime()) < 28*24*60*60*1000;
  const canReply = viewerId===r.revieweeId && !r.reply && withinReplyWindow;
  const canReport = viewerId && viewerId!==r.reviewerId && !r.reported;
  return '<div style="padding:.875rem;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:.625rem">'+
    '<div class="flex justify-between items-start">'+
      '<div class="flex gap-2 items-center">'+avatarHtml(reviewerUser,'sm')+
        '<div><div class="t-small" style="font-weight:600">'+escHtml(reviewerUser.name)+'</div>'+starRow(r.rating,12)+'</div>'+
      '</div>'+
      '<span class="t-micro c-text4">'+timeAgo(r.createdAt)+'</span>'+
    '</div>'+
    (r.comment?'<p class="t-small mt-2" style="color:var(--text-2)">'+escHtml(r.comment)+'</p>':'')+
    (r.reply?'<div style="margin-top:.625rem;padding-left:.75rem;border-left:2px solid var(--border)"><div class="t-micro c-text3" style="font-weight:600;margin-bottom:.125rem">Reply</div><p class="t-small" style="color:var(--text-2)">'+escHtml(r.reply)+'</p></div>':'')+
    (canReply?'<div style="margin-top:.625rem"><textarea class="form-control review-reply-input" id="reply-input-'+r.id+'" rows="2" placeholder="Add context to this review (one-time, cannot be edited later)"></textarea><button class="btn btn-outline btn-xs mt-2" onclick="submitReviewReply(\''+r.id+'\')">Post Reply</button></div>':'')+
    (canReport?'<button class="btn btn-ghost btn-xs mt-2" style="color:var(--text-4)" onclick="reportReviewPrompt(\''+r.id+'\')">Report</button>':(r.reported?'<span class="t-micro c-text4 mt-2" style="display:block">Reported for review</span>':''))+
  '</div>';
}

async function renderProfile(){
  const userId=pageParams.userId||store.getMe()?.id;
  if(!userId){navigate('home');return;}
  let u, lookupError=null;
  try {
    u=await store.getUser(userId);
    // If not found in Supabase, try local store as fallback
    if(!u) u=store.data.users.find(x=>x.id===userId);
  } catch(e){
    lookupError=e;
    u=store.data.users.find(x=>x.id===userId)||null;
  }
  if(!u){
    toast('Could not load profile: '+(lookupError?.message||'user not found (id: '+userId+')'), 'error');
    navigate('home');return;
  }
  // Get current authenticated user ID directly from Supabase session
  let currentUserId = null;
  try {
    if(window._supabase){
      const { data: { user } } = await window._supabase.auth.getUser();
      currentUserId = user?.id;
    }
  } catch(e){}
  // Fallback to local store
  if(!currentUserId) currentUserId = store.data.currentUser;
  const me=store.getMe();
  const isMe = u.id === currentUserId;
  const myDeals=store.get('deals').filter(d=>d.sellerId===u.id||d.buyerId===u.id);
  const recentDealUsers = await usersByIdMap(myDeals.slice(0,3).map(d=>d.buyerId===u.id?d.sellerId:d.buyerId));
  const myServices = await (async()=>{
    const sb=getSb();
    if(!sb) return [];
    try {
      const { data } = await sb.from('services').select('*').eq('creator_id',u.id).eq('status','open').order('created_at',{ascending:false});
      return data||[];
    } catch(e){ return []; }
  })();
  let profileReviews = [];
  try { profileReviews = await store.getReviewsForUser(u.id); } catch(e){ profileReviews = []; }
  const el=document.getElementById('page-profile');
  if(!el) return;

  // Build photo slots
  let picSlots='<div style="display:flex;gap:.625rem;flex-wrap:wrap">';
  for(let i=1;i<=4;i++){
    const pic=(u.profilePics||[])[i];
    if(pic){picSlots+='<div style="position:relative"><img src="'+pic+'" style="width:90px;height:90px;border-radius:var(--radius-sm);object-fit:cover;border:2px solid rgba(255,255,255,.2);cursor:pointer" onclick="openLightbox(\''+pic+'\')">'+(isMe?'<label style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);border-radius:var(--radius-sm);opacity:0;cursor:pointer" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0" onclick="event.stopPropagation()">'+icon('camera')+'<input type="file" accept="image/*" style="display:none" onchange="uploadPic(event,'+i+')"></label>':'')+'</div>';}
    else if(isMe){picSlots+='<label style="width:90px;height:90px;border-radius:var(--radius-sm);border:2px dashed rgba(255,255,255,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,.5);font-size:.625rem;gap:.25rem">'+icon('camera')+'<span>Photo '+(i+1)+'</span><input type="file" accept="image/*" style="display:none" onchange="uploadPic(event,'+i+')"></label>';}
  }
  picSlots+='</div>';

  el.innerHTML='<div class="mb-3"><button class="btn btn-ghost btn-sm" onclick="navigate(\'members\')">Back</button></div>'+
  '<div class="profile-header" style="padding:1.75rem 2rem">'+
  '<div style="display:flex;align-items:center;gap:1.75rem;flex-wrap:wrap">'+
  '<div style="position:relative;flex-shrink:0">'+profilePhotoHtml(u)+(isMe?'<label style="position:absolute;bottom:4px;right:4px;width:32px;height:32px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--navy);box-shadow:0 2px 8px rgba(0,0,0,.4)">'+icon('camera')+'<input type="file" accept="image/*" style="display:none" onchange="uploadPic(event,0)"></label>':'')+'</div>'+
  '<div style="flex:1;min-width:180px">'+
  '<h1 class="profile-name" style="font-size:1.75rem;margin-bottom:.25rem;line-height:1.1">'+escHtml(u.name)+'</h1>'+
  (u.jobTitle?'<div style="color:rgba(255,255,255,.9);font-size:1rem;font-weight:600;margin-bottom:.2rem">'+escHtml(u.jobTitle)+(u.company?' at '+escHtml(u.company):'')+'</div>':'')+
  (u.userType?'<div style="color:rgba(255,255,255,.55);font-size:.8125rem;margin-bottom:.75rem">'+escHtml(u.userType)+'</div>':'')+
  '<div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">'+
  (u.location?'<span style="color:rgba(255,255,255,.6);font-size:.8125rem;display:flex;align-items:center;gap:.3rem">'+icon('map')+' '+escHtml(u.location)+'</span>':'')+
  '<span class="avail-badge '+(u.availability||'unavailable')+'" style="font-size:.75rem">'+(u.availability==='available'?'Available':u.availability==='limited'?'Limited':'Unavailable')+'</span>'+
  (u.website?'<a href="'+(u.website.startsWith('http')?u.website:'https://'+u.website)+'" target="_blank" rel="noopener" style="color:var(--teal);font-size:.8125rem;display:flex;align-items:center;gap:.3rem;text-decoration:none;font-weight:500">'+icon('link')+' '+escHtml(u.website.replace(/^https?:\/\//,'').replace(/\/$/,''))+'</a>':'')+
  '</div></div>'+
  '<div style="flex-shrink:0;text-align:right;margin-left:auto">'+(u.reviewCount?starRow(u.reviewAvg,16)+' <div style="margin-top:.25rem;font-weight:600">'+u.reviewAvg+' <span class="t-micro c-text3" style="font-weight:400">('+u.reviewCount+')</span></div>':'<div class="t-micro c-text4">No reviews yet</div>')+'</div>'+
  '</div>'+
  '<div style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,.1)"><div style="font-size:.6875rem;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:.07em;text-transform:uppercase;margin-bottom:.625rem">Photos</div>'+picSlots+'</div></div>'+
  (!isMe?'<div class="flex gap-2 mb-4"><button class="btn btn-primary" onclick="openModal(\'modal-create-deal\')">Create Deal</button><button class="btn btn-outline" onclick="openDM(\''+u.id+'\')">Message</button></div>':'<div class="flex gap-2 mb-4"><button class="btn btn-outline" onclick="shareMyProfile(\''+escHtml(u.username||'')+'\')">'+icon('link')+' Share Profile</button></div>')+
  '<div class="two-col"><div>'+renderAboutCard(u,isMe)+
  renderFeaturedPhotosCard(u,isMe)+
  renderVideosCard(u,isMe)+
  '<div class="card mb-4"><h2 class="t-h2 mb-3">'+icon('briefcase')+' Work History</h2>'+
  (u.workHistory||[]).map((j,i)=>'<div style="padding:.875rem;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:.625rem"><div class="flex justify-between items-start"><div><div class="t-h3">'+escHtml(j.title)+'</div><div class="t-small c-text3">'+escHtml(j.company)+(j.city?' &middot; '+escHtml(j.city):'')+' - '+escHtml(j.from)+' to '+escHtml(j.to)+'</div></div>'+(isMe?'<button class="btn btn-ghost btn-xs" onclick="removeJob('+i+')">Remove</button>':'')+'</div>'+(j.desc?'<p class="t-small c-text3 mt-1">'+escHtml(j.desc)+'</p>':'')+'</div>').join('')+
  (isMe?'<div style="border:1.5px dashed var(--border);border-radius:var(--radius-sm);padding:.875rem;margin-top:.5rem"><div class="form-row mb-2"><div class="form-group"><label class="form-label">Title</label><input class="form-control" id="job-title" placeholder="Product Manager"></div><div class="form-group"><label class="form-label">Company</label><input class="form-control" id="job-company" placeholder="Acme Corp"></div></div><div class="form-row mb-2"><div class="form-group"><label class="form-label">City</label><input class="form-control" id="job-city" placeholder="Toronto, ON"></div><div class="form-group"><label class="form-label">From</label><input class="form-control" id="job-from" placeholder="2022"></div></div><div class="form-group mb-2"><label class="form-label">To</label><input class="form-control" id="job-to" placeholder="Present"></div><div class="form-group mb-2"><label class="form-label">Description</label><input class="form-control" id="job-desc" placeholder="What did you do?"></div><button class="btn btn-outline btn-sm" onclick="addJob()">+ Add Position</button></div>':'')+
  '</div>'+
  '<div class="card mb-4"><h2 class="t-h2 mb-3">'+icon('briefcase')+' Education</h2>'+
  (u.education||[]).map((ed,i)=>'<div style="padding:.875rem;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:.625rem"><div class="flex justify-between items-start"><div><div class="t-h3">'+escHtml(ed.school)+'</div><div class="t-small c-text3">'+escHtml(ed.degree)+(ed.fieldOfStudy?', '+escHtml(ed.fieldOfStudy):'')+(ed.location?' &middot; '+escHtml(ed.location):'')+'</div><div class="t-small c-text3">'+escHtml(ed.from)+' - '+escHtml(ed.to)+'</div></div>'+(isMe?'<button class="btn btn-ghost btn-xs" onclick="removeEducation('+i+')">Remove</button>':'')+'</div></div>').join('')+
  (isMe?'<div style="border:1.5px dashed var(--border);border-radius:var(--radius-sm);padding:.875rem;margin-top:.5rem"><div class="form-row mb-2"><div class="form-group"><label class="form-label">School</label><input class="form-control" id="edu-school" placeholder="University of Toronto"></div><div class="form-group"><label class="form-label">Degree</label><input class="form-control" id="edu-degree" placeholder="Bachelor of Arts"></div></div><div class="form-row mb-2"><div class="form-group"><label class="form-label">Field of Study</label><input class="form-control" id="edu-field" placeholder="Economics"></div><div class="form-group"><label class="form-label">City/Country</label><input class="form-control" id="edu-location" placeholder="Toronto, Canada"></div></div><div class="form-row mb-2"><div class="form-group"><label class="form-label">From</label><input class="form-control" id="edu-from" placeholder="2019"></div><div class="form-group"><label class="form-label">To</label><input class="form-control" id="edu-to" placeholder="2023 or Present"></div></div><button class="btn btn-outline btn-sm" onclick="addEducation()">+ Add Education</button></div>':'')+
  '</div>'+
  (isMe||u.resume?'<div class="card mb-4"><h2 class="t-h2 mb-3">'+icon('file')+' Resume</h2>'+(u.resume?'<div class="flex gap-2 items-center"><span class="t-small c-green">Resume uploaded</span><a href="'+u.resume+'" target="_blank" class="btn btn-outline btn-sm">View</a>'+(isMe?'<label class="btn btn-ghost btn-sm" style="cursor:pointer">Replace<input type="file" accept=".pdf,.doc,.docx" style="display:none" onchange="uploadResume(event)"></label>':'')+'</div>':'<label class="btn btn-outline btn-sm" style="cursor:pointer">'+icon('file')+' Upload Resume<input type="file" accept=".pdf,.doc,.docx" style="display:none" onchange="uploadResume(event)"></label>')+'</div>':'')+
  (isMe?'<div class="card mb-4"><h2 class="t-h2 mb-3">Username</h2><div class="form-group mb-2"><input class="form-control" id="profile-username" data-original="'+escHtml(u.username||'')+'" value="'+escHtml(u.username||'')+'" placeholder="username"><div class="t-micro c-text3 mt-1">Used in your profile link (fairriss.com/?u=your-username). <strong style="color:var(--red)">Changing it breaks any link you\'ve already shared.</strong></div></div><button class="btn btn-outline btn-sm" onclick="saveUsername()">Save</button></div>':'')+
  '</div><div>'+
  '<div class="card mb-4"><h2 class="t-h2 mb-3">Reputation</h2><div class="reputation-grid"><div class="rep-item"><div class="rep-value">'+(u.deals||0)+'</div><div class="rep-label">Deals Done</div></div>'+(isMe?'<div class="rep-item"><div class="rep-value">'+fmtMoney(u.revenue||0)+'</div><div class="rep-label">Revenue</div></div>':'')+
  '<div class="rep-item"><div class="rep-value">'+(u.referralsSent||0)+'</div><div class="rep-label">Referrals</div></div><div class="rep-item"><div class="rep-value">'+(u.referralsConverted||0)+'</div><div class="rep-label">Converted</div></div><div class="rep-item"><div class="rep-value">'+(u.reviewCount?u.reviewAvg:'-')+'</div><div class="rep-label">Avg Review</div></div><div class="rep-item"><div class="rep-value">'+(u.reviewCount||0)+'</div><div class="rep-label">Reviews</div></div></div></div>'+
  '<div class="card mb-4"><h2 class="t-h2 mb-3">Reviews</h2>'+
  (profileReviews.length?profileReviews.map(r=>renderReviewItem(r,currentUserId)).join(''):'<p class="t-body c-text3">No reviews yet.</p>')+
  '</div>'+
  (isMe?'<div class="card mb-4"><h2 class="t-h2 mb-3">Payouts</h2>'+
  '<p class="t-small c-text3 mb-3">Connect your bank account to receive payments when deals are completed.</p>'+
  (me.stripeAccountId?
    '<div class="flex items-center gap-2 mb-3"><span style="color:var(--green);font-weight:600">&#x2705; Bank account connected</span></div>'+
    '<button class="btn btn-outline btn-sm" onclick="connectBankAccount()">Update Bank Account</button>':
    '<button class="btn btn-teal" onclick="connectBankAccount()">&#x1F3E6; Connect Bank Account</button>'+
    '<div class="t-micro c-text4 mt-2">Secured by Stripe. Takes 2 minutes.</div>'
  )+'</div>':'')+
'<div class="card mb-4"><h2 class="t-h2 mb-3">Skills</h2><div class="skill-tags">'+(u.skills||[]).map(s=>'<span class="skill-tag primary">'+escHtml(s)+'</span>').join('')+'</div>'+(isMe?'<input class="form-control mt-3" id="profile-skills" placeholder="Skills comma-separated" value="'+escHtml((u.skills||[]).join(', '))+'" style="margin-top:.75rem"><button class="btn btn-outline btn-sm mt-2" onclick="saveSkills()">Update Skills</button>':'')+'</div>'+
  (myServices.length || isMe ? '<div class="card mb-4"><div class="flex justify-between items-center mb-3"><h2 class="t-h2" style="margin:0">Services</h2>'+(isMe?'<button class="btn btn-outline btn-xs" onclick="openModal(\'modal-create-service\')">+ Add</button>':'')+'</div>'+(myServices.length?myServices.map(s=>'<div class="card card-sm mb-2" style="background:var(--surface)"><div class="flex justify-between items-start"><div class="flex-1"><div class="t-h3 mb-1">'+escHtml(s.title)+'</div><div class="t-small c-text3 mb-1">'+escHtml(s.description)+'</div><div class="skill-tags mt-1">'+(s.skills||[]).map(sk=>'<span class="skill-tag">'+escHtml(sk)+'</span>').join('')+'</div></div><div style="text-align:right;flex-shrink:0;margin-left:.75rem"><div style="font-weight:800;color:var(--navy)">'+(s.price_cents?fmtMoney(s.price_cents/100)+(s.price_type==='hourly'?'/hr':''):'Rate on request')+'</div>'+(isMe?'<button class="btn btn-ghost btn-xs mt-1" style="color:var(--red)" onclick="deleteServiceAction(\''+s.id+'\',\''+escHtml(s.title).replace(/'/g,"\\\\'")+'\')">Delete</button>':'<button class="btn btn-teal btn-xs mt-1" onclick="openDM(\''+s.creator_id+'\')">Message</button>')+'</div></div></div>').join(''):'<div class="t-body c-text3">No services listed yet</div>')+'</div>':'')+
  '<div class="card"><h2 class="t-h2 mb-3">Recent Deals</h2>'+(myDeals.slice(0,3).length?myDeals.slice(0,3).map(d=>{const other=recentDealUsers[d.buyerId===u.id?d.sellerId:d.buyerId];return '<div class="flex justify-between items-center mb-3">'+avatarHtml(other,'sm')+'<div class="flex-1" style="margin-left:.5rem"><div class="t-small" style="font-weight:600">'+escHtml(d.title)+'</div><div class="t-micro c-text4">'+timeAgo(d.createdAt)+'</div></div>'+dealStatusBadge(d.status)+'</div>';}).join(''):'<div class="t-body c-text3">No deals yet</div>')+
  '</div>'+
  (isMe?'<div class="card mt-4"><h2 class="t-h2 mb-3">Account</h2><div style="display:flex;flex-direction:column;gap:.5rem"><button class="btn btn-outline btn-sm" style="justify-content:flex-start" onclick="navigate(\'support\')"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Support</button><button class="btn btn-outline btn-sm" style="justify-content:flex-start;color:var(--red);border-color:var(--red)" onclick="handleLogout()"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Log Out</button></div></div>':'')+
  '</div></div>';
}

window.confirmDeleteAccount = async () => {
  const checkbox = $('#delete-account-confirm-checkbox');
  if(!checkbox || !checkbox.checked){
    toast('Please confirm the checkbox to continue', 'error');
    return;
  }
  const btn = $('#delete-account-submit-btn');
  btn.disabled = true; btn.textContent = 'Deleting...';
  const sb = getSb();
  try {
    if(!sb) throw new Error('Not connected. Please refresh and try again.');
    const { data: { session } } = await sb.auth.getSession();
    const res = await fetch('https://kpzrvpokasqwmfeuypxv.supabase.co/functions/v1/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session?.access_token,
      },
    });
    const data = await res.json();
    if(data.error) throw new Error(data.error);
    toast('Account deleted. Goodbye for now.', 'success');
    try { await sb.auth.signOut(); } catch(e){}
    store.data.currentUser = null;
    store._save();
    setTimeout(()=>{ window.location.href = window.location.pathname; }, 1200);
  } catch(e){
    toast('Failed to delete account: '+e.message, 'error');
    btn.disabled = false; btn.textContent = 'Permanently Delete Account';
  }
};

window.shareMyProfile = async (username) => {
  if(!username){ toast('Set a username in your profile first', 'error'); return; }
  const url = window.location.origin + window.location.pathname + '?u=' + encodeURIComponent(username);
  try {
    await navigator.clipboard.writeText(url);
    toast('Profile link copied!', 'success');
  } catch(e){
    prompt('Copy your profile link:', url);
  }
};

window.shareWheel = async (slug, name) => {
  if(!slug){ toast('This Wheel has no shareable link yet', 'error'); return; }
  const url = window.location.origin + window.location.pathname + '?wheel=' + encodeURIComponent(slug);
  try {
    await navigator.clipboard.writeText(url);
    toast((name||'Wheel')+' link copied!', 'success');
  } catch(e){
    prompt('Copy the Wheel link:', url);
  }
};

window.saveUsername=async()=>{
  const usernameInput=$('#profile-username');
  let username=usernameInput?.value.trim().toLowerCase()||'';
  const originalUsername=usernameInput?.dataset.original||'';
  if(!username){toast('Username cannot be empty','error');return;}
  if(!/^[a-z0-9_-]+$/.test(username)){toast('Username can only contain letters, numbers, hyphens and underscores','error');return;}
  if(username===originalUsername.toLowerCase()){toast('No change to save','success');return;}
  const ok=window.confirm('Change your username from "'+originalUsername+'" to "'+username+'"?\n\nYour profile link will change. Anyone who already has your old link (fairriss.com/?u='+originalUsername+') will get a broken link once you save.');
  if(!ok) return;
  const btn = event?.target;
  if(btn){ btn.disabled=true; btn.textContent='Saving...'; }
  try {
    await store.updateMe({username});
    toast('Username updated','success');
    renderProfile();
  } catch(e){
    const isDupe = /unique|duplicate/i.test(e.message||'');
    toast(isDupe?'That username is already taken \u2014 please choose another':'Failed to save: '+e.message, 'error');
    if(btn){ btn.disabled=false; btn.textContent='Save'; }
  }
};
window.saveProfileInfo=async()=>{
  const name=$('#profile-name')?.value.trim();
  if(!name){toast('Name cannot be empty','error');return;}
  const links=[...$$('.profile-link-input')].map(i=>i.value.trim()).filter(Boolean);
  let userType=$('#profile-usertype')?.value||'';
  if(userType==='Other'){
    const custom=$('#profile-other-input')?.value.trim();
    if(!custom){ toast('Please tell us what you do, or pick "Not set"', 'error'); return; }
    userType=custom;
  }
  const fields={name,bio:$('#profile-bio').value.trim(),jobTitle:$('#profile-title').value.trim(),company:$('#profile-company').value.trim(),website:$('#profile-website')?.value.trim()||'',userType,links,location:$('#profile-location')?.value.trim()||'',contactEmail:$('#profile-contact-email')?.value.trim()||''};
  const btn = event?.target;
  if(btn){ btn.disabled=true; btn.textContent='Saving...'; }
  try {
    await store.updateMe(fields);
    toast('Profile updated','success');
    const headerAvatar=document.getElementById('header-avatar');
    if(headerAvatar) headerAvatar.textContent=initials(name);
    const sidebarName=document.querySelector('.sidebar-user-name');
    if(sidebarName) sidebarName.textContent=name;
    renderProfile();
  } catch(e){
    const isDupe = /unique|duplicate/i.test(e.message||'');
    toast(isDupe?'That username is already taken \u2014 please choose another':'Failed to save: '+e.message, 'error');
    if(btn){ btn.disabled=false; btn.textContent='Save'; }
  }
};
window.saveSkills=async()=>{await store.updateMe({skills:$('#profile-skills').value.split(',').map(s=>s.trim()).filter(Boolean)});toast('Skills updated','success');renderProfile();};
window.addLinkField=()=>{const list=document.getElementById('profile-links-list');if(!list)return;const div=document.createElement('div');div.style.cssText='display:flex;gap:.5rem;align-items:center';div.innerHTML='<input class="form-control profile-link-input" placeholder="https://..." style="flex:1"><button class="btn btn-ghost btn-xs" onclick="this.parentElement.remove()" style="color:var(--red)">Remove</button>';list.appendChild(div);};
window.removeLink=async(i)=>{const me=store.getMe(),links=[...(me.links||[])];links.splice(i,1);try{await store.updateMe({links});toast('Link removed','success');renderProfile();}catch(e){toast('Failed to remove: '+e.message,'error');}};
window.addJob=async()=>{
  const title=$('#job-title').value.trim(),company=$('#job-company').value.trim();
  if(!title||!company){toast('Title and company required','error');return;}
  const me=store.getMe();
  const history=[...(me.workHistory||[]),{id:uid(),title,company,city:$('#job-city').value.trim()||'',from:$('#job-from').value.trim()||'',to:$('#job-to').value.trim()||'Present',desc:$('#job-desc').value.trim()}];
  const btn = event?.target;
  if(btn){ btn.disabled=true; btn.textContent='Adding...'; }
  try {
    await store.updateMe({workHistory:history});
    toast('Position added','success');
    renderProfile();
  } catch(e){
    toast('Failed to add: '+e.message, 'error');
    if(btn){ btn.disabled=false; btn.textContent='+ Add Position'; }
  }
};
window.removeJob=async(i)=>{const me=store.getMe(),history=[...(me.workHistory||[])];history.splice(i,1);try{await store.updateMe({workHistory:history});toast('Removed','success');renderProfile();}catch(e){toast('Failed to remove: '+e.message,'error');}};
window.addEducation=async()=>{
  const school=$('#edu-school').value.trim(),degree=$('#edu-degree').value.trim();
  if(!school||!degree){toast('School and degree required','error');return;}
  const me=store.getMe();
  const education=[...(me.education||[]),{id:uid(),school,degree,fieldOfStudy:$('#edu-field').value.trim()||'',location:$('#edu-location').value.trim()||'',from:$('#edu-from').value.trim()||'',to:$('#edu-to').value.trim()||'Present'}];
  const btn = event?.target;
  if(btn){ btn.disabled=true; btn.textContent='Adding...'; }
  try {
    await store.updateMe({education});
    toast('Education added','success');
    renderProfile();
  } catch(e){
    toast('Failed to add: '+e.message, 'error');
    if(btn){ btn.disabled=false; btn.textContent='+ Add Education'; }
  }
};
window.removeEducation=async(i)=>{const me=store.getMe(),education=[...(me.education||[])];education.splice(i,1);try{await store.updateMe({education});toast('Removed','success');renderProfile();}catch(e){toast('Failed to remove: '+e.message,'error');}};

window.submitReviewReply=async(reviewId)=>{
  const input=$('#reply-input-'+reviewId);
  const reply=input?.value.trim();
  if(!reply){toast('Write a reply first','error');return;}
  try{
    await store.submitReply(reviewId,reply);
    toast('Reply posted','success');
    renderProfile();
  }catch(e){
    toast('Could not post reply: '+e.message,'error');
  }
};

window.reportReviewPrompt=async(reviewId)=>{
  const reason=window.prompt('Tell us what\'s wrong with this review (abuse, harassment, or a false claim). This flags it for admin review only \u2014 it will not be removed automatically.');
  if(reason===null) return;
  try{
    await store.reportReview(reviewId,reason);
    toast('Reported. Our team will take a look.','success');
    renderProfile();
  }catch(e){
    toast('Could not report review: '+e.message,'error');
  }
};

window.setDealReviewStar=(n)=>{
  const wrap=$('#deal-review-stars');
  if(!wrap) return;
  wrap.dataset.rating=n;
  $$('.deal-review-star',wrap).forEach((btn,i)=>{
    btn.innerHTML=starIcon(i<n).replace(/width="14" height="14"/,'width="24" height="24"');
  });
};

window.submitDealReview=async(dealId,revieweeId)=>{
  const wrap=$('#deal-review-stars');
  const rating=parseInt(wrap?.dataset.rating||'0',10);
  if(!rating){toast('Pick a star rating first','error');return;}
  const comment=$('#deal-review-comment')?.value.trim()||'';
  try{
    await store.submitReview(dealId,revieweeId,rating,comment);
    toast('Review submitted','success');
    renderDealDetail();
  }catch(e){
    toast('Could not submit review: '+e.message,'error');
  }
};
// uploadPic / uploadVideo / uploadResume are defined in supabase_phase2.js
// (real Supabase Storage uploads with correct slot handling) — do not
// redefine them here, it silently overwrites the working versions.
window.previewPostPhoto=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>{const p=document.getElementById('cp-photo-preview');if(p)p.innerHTML='<img src="'+ev.target.result+'" style="max-width:100%;max-height:200px;border-radius:var(--radius-sm);object-fit:cover;display:block">';};r.readAsDataURL(file);};
window.previewEventPhoto=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>{const p=document.getElementById('ev-photo-preview');if(p)p.innerHTML='<img src="'+ev.target.result+'" style="max-width:100%;max-height:200px;border-radius:var(--radius-sm);object-fit:cover;display:block">';};r.readAsDataURL(file);};
window.previewPostVideo=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>{const p=document.getElementById('cp-video-preview');if(p)p.innerHTML='<video src="'+ev.target.result+'" controls style="max-width:100%;max-height:180px;border-radius:var(--radius-sm);display:block"></video>';};r.readAsDataURL(file);};

// ── Analytics ──────────────────────────────────────────────────────────────
async function renderAnalytics(){
  const myWheels=await store.getMyWheels()||[];
  const allDeals=store.get('deals').filter(d=>(myWheels||[]).some(w=>w.id===d.wheelId));
  const paid=allDeals.filter(d=>d.status==='paid'),gmv=paid.reduce((s,d)=>s+d.priceCents/100,0);
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul'],rev=[1200,2100,1800,3400,2800,4200,5100],maxRev=Math.max(...rev);
  let topMembers=[];
  try{
    const memberArrays=await Promise.all(myWheels.map(w=>store.getWheelMembers(w.id).catch(()=>[])));
    topMembers=memberArrays.flat().filter((u,i,a)=>u&&a.findIndex(x=>x.id===u.id)===i).sort((a,b)=>(b.reviewAvg||0)-(a.reviewAvg||0)).slice(0,5);
  }catch(e){ topMembers=[]; }
  document.getElementById('page-analytics').innerHTML=
  '<div class="page-head"><div class="page-head-left"><h1 class="page-title">Analytics</h1><p class="page-sub">Your network at a glance</p></div></div>'+
  '<div class="stats-grid"><div class="stat-card"><span class="stat-label">Total Members</span><span class="stat-value">'+fmt(myWheels.reduce((s,w)=>s+w.memberCount,0))+'</span></div><div class="stat-card"><span class="stat-label">GMV</span><span class="stat-value">'+fmtMoney(gmv)+'</span></div><div class="stat-card"><span class="stat-label">Completed Deals</span><span class="stat-value">'+paid.length+'</span></div><div class="stat-card"><span class="stat-label">Active Deals</span><span class="stat-value">'+allDeals.filter(d=>d.status==='in_progress').length+'</span></div></div>'+
  '<div class="two-col"><div><div class="analytics-chart"><h3 class="t-h2 mb-3">Revenue (Monthly)</h3><div class="chart-bars">'+months.map((m,i)=>'<div class="chart-bar-group"><div class="chart-bar-val">'+fmtMoney(rev[i])+'</div><div class="chart-bar" style="height:'+Math.round(rev[i]/maxRev*100)+'%;background:'+(i===months.length-1?'var(--teal)':'var(--navy)')+'"></div><div class="chart-bar-label">'+m+'</div></div>').join('')+'</div></div></div>'+
  '<div><div class="card"><h3 class="t-h2 mb-3">Top Members by Rating</h3>'+(topMembers.length?topMembers.map(u=>'<div class="flex gap-2 items-center mb-3">'+avatarHtml(u,'sm')+'<div class="flex-1"><div class="t-small" style="font-weight:600">'+escHtml(u.name)+'</div></div>'+reviewSummaryHtml(u.reviewAvg||0,u.reviewCount||0)+'</div>').join(''):'<p class="t-body c-text3">No members yet</p>')+'</div></div></div>';
}

// ── Direct Messages ──────────────────────────────────────────────────────
let _dmActiveUserId = null;

// Resolve the Supabase client from whichever global is actually set up.
function getSb(){
  return window._supabase || window.SupabaseStore?._supabase || window.supabaseClient || null;
}

// Real, persisted notification for another user — unlike store.addNotif,
// which only ever saved to the sender's own local browser storage and
// never actually reached the recipient.
async function notifyUser(userId, type, text){
  const sb = getSb();
  if(!sb || !userId) return;
  try {
    await sb.from('notifications').insert({ user_id: userId, type, text, read: false });
  } catch(e){ console.warn('Notify failed:', e.message); }
}

// ── Emoji picker ─────────────────────────────────────────────────────────
const EMOJI_SET = ['😀','😂','😍','😊','🙌','👍','👏','🎉','🔥','💯','🙏','😅','😎','🤔','😢','❤️','💰','🤝','✅','👀'];
window.openLightbox = (imgUrl) => {
  let box = document.getElementById('photo-lightbox');
  if(!box){
    box = document.createElement('div');
    box.id = 'photo-lightbox';
    box.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:10000;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:2rem';
    box.onclick = () => box.remove();
    document.body.appendChild(box);
  }
  box.innerHTML = '<img src="'+imgUrl+'" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.6)"><button onclick="event.stopPropagation();document.getElementById(\'photo-lightbox\').remove()" style="position:absolute;top:1.5rem;right:1.5rem;background:rgba(255,255,255,.15);border:none;color:#fff;width:40px;height:40px;border-radius:50%;font-size:1.5rem;cursor:pointer;display:flex;align-items:center;justify-content:center">&times;</button>';
};

window.toggleEmojiPicker = (inputId, btnEl) => {
  const existing = document.getElementById('emoji-popover');
  if(existing){ existing.remove(); if(existing.dataset.forInput===inputId) return; }
  const rect = btnEl.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.id = 'emoji-popover';
  pop.dataset.forInput = inputId;
  pop.style.cssText = 'position:fixed;left:'+rect.left+'px;bottom:'+(window.innerHeight-rect.top+6)+'px;background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-lg);padding:.5rem;display:grid;grid-template-columns:repeat(5,1fr);gap:.25rem;z-index:9999';
  pop.innerHTML = EMOJI_SET.map(e=>'<button type="button" style="font-size:1.25rem;background:none;border:none;cursor:pointer;padding:.25rem;border-radius:6px" onmouseover="this.style.background=\'var(--surface)\'" onmouseout="this.style.background=\'none\'" onclick="insertEmoji(\''+inputId+'\',\''+e+'\')">'+e+'</button>').join('');
  document.body.appendChild(pop);
  setTimeout(()=>{
    document.addEventListener('click', function closeOnce(ev){
      if(!pop.contains(ev.target) && ev.target!==btnEl){ pop.remove(); document.removeEventListener('click', closeOnce); }
    });
  }, 0);
};
window.insertEmoji = (inputId, emoji) => {
  const input = document.getElementById(inputId);
  if(!input) return;
  const pos = input.selectionStart ?? input.value.length;
  input.value = input.value.slice(0,pos) + emoji + input.value.slice(pos);
  input.focus();
  const newPos = pos + emoji.length;
  input.setSelectionRange(newPos, newPos);
  document.getElementById('emoji-popover')?.remove();
};

// Get a user's profile, falling back to a live Supabase fetch if not cached locally.
async function dmGetUser(id){
  let u = null;
  try { u = await store.getUser(id); } catch(e){ u = null; }
  if(u) return u;
  try {
    if(window.Users?.getById){
      const p = await window.Users.getById(id);
      if(p){ u = sbToLocal(p); store.data.users.push(u); return u; }
    }
    const sb = getSb();
    if(sb){
      const { data } = await sb.from('users').select('*').eq('id', id).single();
      if(data){ u = sbToLocal(data); store.data.users.push(u); return u; }
    }
  } catch(e){ console.warn('User lookup failed:', e.message); }
  return null;
}

async function dmFetchThread(otherUserId){
  const me = store.getMe();
  const sb = getSb();
  if(!sb || !me) return [];
  const { data, error } = await sb
    .from('direct_messages')
    .select('*')
    .or('and(sender_id.eq.'+me.id+',recipient_id.eq.'+otherUserId+'),and(sender_id.eq.'+otherUserId+',recipient_id.eq.'+me.id+')')
    .order('created_at', { ascending: true });
  if(error){ console.warn('DM fetch failed:', error.message); return []; }
  return data || [];
}

async function dmFetchConversations(){
  const me = store.getMe();
  const sb = getSb();
  if(!sb || !me) return [];
  const { data, error } = await sb
    .from('direct_messages')
    .select('*')
    .or('sender_id.eq.'+me.id+',recipient_id.eq.'+me.id)
    .order('created_at', { ascending: false });
  if(error){ console.warn('DM conversations failed:', error.message); return []; }
  let hiddenIds = [];
  try {
    const { data: hidden } = await sb.from('dm_hidden_conversations').select('other_user_id').eq('user_id', me.id);
    hiddenIds = (hidden||[]).map(h=>h.other_user_id);
  } catch(e){ /* table may not exist yet — treat as nothing hidden */ }
  const seen = new Map();
  (data||[]).forEach(m=>{
    const otherId = m.sender_id===me.id ? m.recipient_id : m.sender_id;
    if(!seen.has(otherId) && !hiddenIds.includes(otherId)) seen.set(otherId, m);
  });
  return [...seen.entries()];
}

window.hideConversation = async (otherUserId) => {
  const me = store.getMe();
  const sb = getSb();
  if(!sb || !me) return;
  try {
    const { error } = await sb.from('dm_hidden_conversations').upsert({ user_id: me.id, other_user_id: otherUserId });
    if(error) throw error;
    toast('Conversation removed from Inbox', 'success');
    navigate('messages');
  } catch(e){ toast('Failed to remove: '+e.message, 'error'); }
};

async function dmSend(otherUserId, body, attachment){
  const me = store.getMe();
  const sb = getSb();
  if(!sb){ toast('Messaging is not connected. Please refresh and try again.', 'error'); return false; }
  if(!me || (!body.trim() && !attachment)) return false;
  const row = { sender_id: me.id, recipient_id: otherUserId, body: body.trim(), read: false };
  if(attachment){ row.attachment_url = attachment.url; row.attachment_name = attachment.name; }
  const { error } = await sb.from('direct_messages').insert(row);
  if(error){ toast('Failed to send: '+error.message, 'error'); return false; }
  notifyUser(otherUserId, 'dm', '<strong>'+escHtml(me.name)+'</strong> sent you a message');
  // A new message un-hides the conversation for both people, so it doesn't
  // stay lost just because one side had previously removed it.
  try {
    await sb.from('dm_hidden_conversations').delete().eq('user_id', me.id).eq('other_user_id', otherUserId);
    await sb.from('dm_hidden_conversations').delete().eq('user_id', otherUserId).eq('other_user_id', me.id);
  } catch(e){ /* non-critical */ }
  return true;
}

async function dmUploadAttachment(file){
  const me = store.getMe();
  if(!me) return null;
  try {
    if(window.LiveStore?.uploadFile){
      const path = me.id + '/dm_' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
      const url = await window.LiveStore.uploadFile('post-media', path, file);
      return { url, name: file.name };
    }
    const sb = getSb();
    if(sb){
      const path = me.id + '/dm_' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
      const { data, error } = await sb.storage.from('post-media').upload(path, file, { upsert: true });
      if(error) throw error;
      const { data: pub } = sb.storage.from('post-media').getPublicUrl(data.path);
      return { url: pub.publicUrl, name: file.name };
    }
  } catch(e){ toast('Attachment upload failed: '+e.message, 'error'); }
  return null;
}

window.openDM = (userId) => { navigate('messages', { withUserId: userId }); };

async function renderMessages(){
  const me = store.getMe();
  const el = document.getElementById('page-messages');
  if(!el || !me) return;
  const withUserId = pageParams.withUserId || null;

  el.innerHTML = '<div class="page-head"><div class="page-head-left"><h1 class="page-title">Messages</h1><p class="page-sub">Direct conversations</p></div></div>'+
  '<div class="dm-container'+(withUserId?' dm-show-thread':'')+'" id="dm-container">'+
  '<div class="card card-flush" style="overflow-y:auto" id="dm-convo-list"><div style="padding:1.5rem;text-align:center;color:var(--text-3);font-size:.875rem">Loading...</div></div>'+
  '<div class="card card-flush dm-thread-panel" id="dm-thread-panel"><div class="empty-state" style="margin:auto"><div class="empty-icon">&#x1F4AC;</div><div class="empty-title">Select a conversation</div></div></div>'+
  '</div>';

  const convos = await dmFetchConversations();
  const listEl = document.getElementById('dm-convo-list');
  if(!listEl) return;
  if(!convos.length && !withUserId){
    listEl.innerHTML = '<div class="empty-state" style="padding:1.5rem"><div class="empty-icon">&#x1F4EC;</div><div class="empty-title">No messages yet</div><div class="empty-desc">Visit a profile and click Message</div></div>';
  } else {
    const otherIds = convos.map(([id])=>id);
    if(withUserId && !otherIds.includes(withUserId)) otherIds.unshift(withUserId);
    const users = await Promise.all(otherIds.map(id=>dmGetUser(id)));
    listEl.innerHTML = otherIds.map((id,i)=>{
      const u = users[i];
      const convo = convos.find(([cid])=>cid===id);
      const preview = convo ? convo[1].body : 'Say hello';
      return '<div class="dm-convo-item" data-user-id="'+id+'" style="padding:.875rem 1rem;border-bottom:1px solid var(--border);cursor:pointer;display:flex;gap:.625rem;align-items:center'+(withUserId===id?';background:var(--surface)':'')+'">'+avatarHtml(u,'sm')+'<div style="min-width:0;flex:1"><div style="font-size:.875rem;font-weight:600;color:var(--navy)">'+escHtml(u?.name||'Unknown')+'</div><div style="font-size:.75rem;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escHtml(preview)+'</div></div></div>';
    }).join('');
    $$('.dm-convo-item', listEl).forEach(item=>{
      item.onclick = () => navigate('messages', { withUserId: item.dataset.userId });
    });
  }

  if(withUserId){
    const other = await dmGetUser(withUserId);
    const panel = document.getElementById('dm-thread-panel');
    panel.innerHTML = '<div class="notif-panel-head" style="padding:.875rem 1rem;display:flex;align-items:center;gap:.625rem"><button class="dm-back-btn" onclick="navigate(\'messages\')" aria-label="Back to conversations"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>'+avatarHtml(other,'sm')+'<h3 class="t-h2" style="margin:0">'+escHtml(other?.name||'Unknown')+'</h3><button class="btn btn-ghost btn-xs" style="margin-left:auto;color:var(--red)" onclick="if(confirm(\'Remove this conversation from your Inbox? It will come back if either of you messages again.\'))hideConversation(\''+withUserId+'\')">Delete</button></div>'+
    '<div class="message-thread" id="dm-messages" style="flex:1;overflow-y:auto"></div>'+
    '<div id="dm-attach-preview" style="display:none;padding:.5rem 1rem 0;font-size:.8125rem;color:var(--text-3)"></div>'+
    '<div class="message-input-row" style="position:relative"><label class="btn btn-ghost btn-sm" style="cursor:pointer;padding:.5rem" title="Attach a file"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg><input type="file" id="dm-file" style="display:none"></label><button type="button" class="btn btn-ghost btn-sm" style="padding:.5rem;font-size:1.125rem" onclick="toggleEmojiPicker(\'dm-input\',this)">&#x1F642;</button><input class="message-input" id="dm-input" placeholder="Write a message..."><button class="btn btn-teal btn-sm" id="dm-send">'+icon('send')+'</button></div>';

    const thread = await dmFetchThread(withUserId);
    const msgsEl = document.getElementById('dm-messages');
    msgsEl.innerHTML = thread.length ? thread.map(m=>{
      const isMine = m.sender_id === me.id;
      const sender = isMine ? me : other;
      const isImage = m.attachment_url && /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(m.attachment_url);
      const attach = m.attachment_url
        ? (isImage
            ? '<a href="'+escHtml(m.attachment_url)+'" target="_blank" rel="noopener" style="display:block;margin-top:.375rem"><img src="'+escHtml(m.attachment_url)+'" style="max-width:220px;max-height:260px;border-radius:8px;display:block;object-fit:cover;cursor:pointer"></a>'
            : '<a href="'+escHtml(m.attachment_url)+'" target="_blank" rel="noopener" class="message-attachment">'+icon('file')+' '+escHtml(m.attachment_name||'Attachment')+'</a>')
        : '';
      const bodyHtml = m.body ? '<div class="message-bubble">'+escHtml(m.body)+attach+'</div>' : (attach?'<div class="message-bubble">'+attach+'</div>':'');
      return '<div class="message-item '+(isMine?'mine':'')+'">'+(!isMine?avatarHtml(sender,'sm'):'')+'<div>'+bodyHtml+'<div class="message-time">'+timeAgo(m.created_at)+' &middot; '+fullDateTime(m.created_at)+'</div></div></div>';
    }).join('') : '<div class="empty-state" style="padding:1.5rem">No messages yet. Say hello!</div>';
    msgsEl.scrollTop = msgsEl.scrollHeight;

    let pendingAttachment = null;
    const fileInput = document.getElementById('dm-file');
    const preview = document.getElementById('dm-attach-preview');
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if(!file) return;
      if(file.size > 10*1024*1024){ toast('File must be under 10MB', 'error'); fileInput.value=''; return; }
      preview.style.display='block'; preview.textContent='Uploading '+file.name+'...';
      const uploaded = await dmUploadAttachment(file);
      if(uploaded){ pendingAttachment = uploaded; preview.textContent='Ready to send: '+uploaded.name; }
      else { preview.style.display='none'; }
      fileInput.value='';
    };

    const send = async () => {
      const input = document.getElementById('dm-input');
      const body = input.value.trim();
      if(!body && !pendingAttachment) return;
      input.value=''; input.disabled=true;
      const ok = await dmSend(withUserId, body, pendingAttachment);
      pendingAttachment = null; preview.style.display='none';
      input.disabled=false;
      if(ok) renderMessages();
    };
    document.getElementById('dm-send').onclick = send;
    document.getElementById('dm-input').onkeydown = e => { if(e.key==='Enter') send(); };
  }
}

// ── Invite Modal ────────────────────────────────────────────────────────────
window.openInviteModal=async wheelId=>{
  openModal('modal-invite-wheel');
  const wheel=store.get('wheels').find(w=>w.id===wheelId);
  if(!wheel)return;
  let memberIds=[];
  try{ memberIds=(await store.getWheelMembers(wheelId)).map(u=>u.id); }catch(e){ memberIds=[]; }
  // Show ALL users on platform (except current user), mark existing members
  const allUsers=store.get('users').filter(u=>u.id!==store.getMe()?.id);

  function renderInviteList(filtered){
    const list=document.getElementById('invite-member-list');
    if(!list)return;
    if(!filtered.length){
      list.innerHTML='<div class="empty-state" style="padding:1.5rem"><div class="empty-icon">&#x1F50D;</div><div class="empty-title">No results</div><div class="empty-desc">Try a different name, country, or skill</div></div>';
      return;
    }
    list.innerHTML=filtered.map(u=>{
      const isMember=memberIds.includes(u.id);
      return '<label style="display:flex;align-items:center;gap:.75rem;padding:.875rem;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:.5rem;background:'+(isMember?'var(--surface)':'var(--white)')+';opacity:'+(isMember?'.7':'1')+';cursor:'+(isMember?'default':'pointer')+'">'+
      '<input type="checkbox" class="invite-checkbox" value="'+u.id+'" style="width:18px;height:18px;accent-color:var(--teal);flex-shrink:0" '+(isMember?'disabled':'')+'>'+
      avatarHtml(u,'md')+
      '<div style="flex:1;min-width:0">'+
      '<div style="font-size:.875rem;font-weight:600;color:var(--navy)">'+escHtml(u.name)+'</div>'+
      '<div style="font-size:.75rem;color:var(--text-3)">'+escHtml(u.jobTitle||u.userType||u.role)+(u.location?' &mdash; '+escHtml(u.location):'')+'</div>'+
      (u.skills&&u.skills.length?'<div style="display:flex;gap:.25rem;flex-wrap:wrap;margin-top:.25rem">'+u.skills.slice(0,3).map(s=>'<span style="font-size:.6875rem;background:var(--surface-2);border-radius:99px;padding:.1rem .4rem;color:var(--text-3)">'+escHtml(s)+'</span>').join('')+'</div>':'')+
      '</div>'+
      (isMember
        ? '<span style="font-size:.6875rem;font-weight:700;color:var(--green);background:var(--green-bg);padding:.2rem .625rem;border-radius:99px;flex-shrink:0">In Wheel</span>'
        : '<span class="avail-badge '+(u.availability||'unavailable')+'" style="font-size:.6875rem;flex-shrink:0">'+(u.availability==='available'?'Available':u.availability==='limited'?'Limited':'Busy')+'</span>'
      )+
      '</label>';
    }).join('');
  }

  // Initial render - show all users
  renderInviteList(allUsers);

  // Search
  const searchInput=document.getElementById('invite-search');
  if(searchInput){
    searchInput.value='';
    searchInput.oninput=e=>{
      const q=e.target.value.toLowerCase().trim();
      const filtered=q?allUsers.filter(u=>
        u.name.toLowerCase().includes(q)||
        (u.jobTitle||'').toLowerCase().includes(q)||
        (u.company||'').toLowerCase().includes(q)||
        (u.skills||[]).some(s=>s.toLowerCase().includes(q))||
        (u.location||'').toLowerCase().includes(q)||
        (u.userType||'').toLowerCase().includes(q)||
        (u.bio||'').toLowerCase().includes(q)
      ):allUsers;
      renderInviteList(filtered);
    };
  }

  // Send
  const sendBtn=document.getElementById('send-invites-btn');
  if(sendBtn)sendBtn.onclick=()=>{
    const selected=[...document.querySelectorAll('.invite-checkbox:checked')].map(i=>i.value);
    if(!selected.length){toast('Select at least one person to invite','error');return;}
    const me=store.getMe();
    selected.forEach(userId=>{
      notifyUser(userId,'wheel_invite',
        '<strong>'+escHtml(me.name)+'</strong> invited you to join <strong>'+escHtml(wheel.name)+'</strong> &mdash; <span class="notif-accept-btn" data-wid="'+wheelId+'" style="color:var(--teal);cursor:pointer;font-weight:600" onclick="acceptWheelInvite(this)">Accept</span>'
      );
    });
    updateShellDynamic(store.getMe());
    toast('Invite sent to '+selected.length+' member'+(selected.length>1?'s':'')+'!','success');
    closeAllModals();
  };
};

// ── @Mention ────────────────────────────────────────────────────────────────
async function initMentionAutocomplete(textareaId,wheelId){
  const ta=document.getElementById(textareaId);if(!ta)return;
  let dropdown=document.getElementById('mention-dropdown');
  if(!dropdown){dropdown=document.createElement('div');dropdown.id='mention-dropdown';dropdown.style.cssText='position:fixed;background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-lg);z-index:9999;min-width:220px;max-height:200px;overflow-y:auto;display:none';document.body.appendChild(dropdown);}
  let cachedMembers=[];
  try{ cachedMembers=wheelId?(await store.getWheelMembers(wheelId)):store.get('users'); }catch(e){ cachedMembers=[]; }
  ta.addEventListener('input',()=>{
    const val=ta.value,pos=ta.selectionStart,before=val.slice(0,pos),match=before.match(/@(\w*)$/);
    if(!match){dropdown.style.display='none';return;}
    const members=cachedMembers;
    const q=match[1].toLowerCase();
    const filtered=members.filter(u=>u.id!==store.getMe()?.id&&(u.name.toLowerCase().includes(q)||(u.username||'').toLowerCase().includes(q))).slice(0,6);
    if(!filtered.length){dropdown.style.display='none';return;}
    const rect=ta.getBoundingClientRect();dropdown.style.left=rect.left+'px';dropdown.style.top=(rect.top+rect.height+4)+'px';dropdown.style.display='block';
    dropdown.innerHTML=filtered.map(u=>'<div style="display:flex;align-items:center;gap:.625rem;padding:.625rem 1rem;cursor:pointer" onclick="insertMention(\''+textareaId+'\',\''+escHtml(u.name)+'\')">'+avatarHtml(u,'sm')+'<div><div style="font-size:.875rem;font-weight:600;color:var(--navy)">'+escHtml(u.name)+'</div><div style="font-size:.75rem;color:var(--text-3)">@'+(u.username||u.name.split(' ')[0].toLowerCase())+'</div></div></div>').join('');
  });
  ta.addEventListener('keydown',e=>{if(e.key==='Escape')dropdown.style.display='none';});
  document.addEventListener('click',e=>{if(!e.target.closest('#mention-dropdown')&&e.target!==ta)dropdown.style.display='none';},{capture:true});
}
window.insertMention=(textareaId,name)=>{
  const ta=document.getElementById(textareaId);if(!ta)return;
  const val=ta.value,pos=ta.selectionStart,before=val.slice(0,pos),after=val.slice(pos),atIdx=before.lastIndexOf('@');
  ta.value=before.slice(0,atIdx)+'@'+name+' '+after;ta.focus();const newPos=atIdx+name.length+2;ta.setSelectionRange(newPos,newPos);
  const dd=document.getElementById('mention-dropdown');if(dd)dd.style.display='none';
};

// ── Modals ──────────────────────────────────────────────────────────────────
function buildModals(){
  const templateGrid=SUGGESTED_WHEELS.map((w,i)=>'<div class="auth-role-card" onclick="applyWheelTemplate('+i+')" style="padding:.625rem;text-align:center"><div style="width:28px;height:28px;border-radius:50%;background:'+w.hex+';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:.75rem;margin:0 auto .375rem">'+w.emoji+'</div><div style="font-size:.6875rem;font-weight:600">'+w.name+'</div></div>').join('');
  return (
  '<div class="modal-overlay" id="modal-create-wheel"><div class="modal modal-lg"><div class="modal-header"><span class="modal-title">Create a Wheel</span><button class="modal-close">x</button></div><div class="modal-body"><p class="t-small c-text3 mb-3">All Wheels on Fairriss are open and free to join.</p><div class="form-group mb-3"><label class="form-label">Start from a template:</label><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-top:.5rem" id="wheel-templates">'+templateGrid+'</div></div><div class="divider"></div><div class="form-stack"><div class="form-group"><label class="form-label">Wheel Name *</label><input class="form-control" id="cw-name" placeholder="The Founders Circle"></div><div class="form-group"><label class="form-label">Description *</label><textarea class="form-control" id="cw-desc" rows="3" placeholder="What is this Wheel about?"></textarea></div><div class="form-row"><div class="form-group"><label class="form-label">Category</label><select class="form-control" id="cw-cat" onchange="document.getElementById(\'cw-other-row\').style.display=(this.value===\'Other\')?\'block\':\'none\'"><option>Startup</option><option>Design</option><option>Marketing</option><option>Technology</option><option>Finance</option><option>Business</option><option>Events</option><option>Community</option><option>Talent</option><option>Other</option></select></div><div class="form-group"><label class="form-label">Accent Color</label><input class="form-control" id="cw-color" type="color" value="#00C9A7" style="height:40px;cursor:pointer"></div></div><div class="form-group mb-3" id="cw-other-row" style="display:none"><label class="form-label">What kind of Wheel is this?</label><input class="form-control" id="cw-other-input" placeholder="e.g. Fashion, Wellness, Sports..."></div><div class="form-group"><label class="form-label">Location <span>(optional \u2014 city, town, or country)</span></label><input class="form-control" id="cw-location" placeholder="Toronto, ON or Remote"></div><label style="display:flex;align-items:center;gap:.625rem;cursor:pointer"><input type="checkbox" id="cw-is-event" style="width:18px;height:18px;accent-color:var(--teal)"><span class="t-body">This is an Event Wheel (enables ticket selling)</span></label></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="create-wheel-btn">Create Wheel</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-create-opp"><div class="modal modal-lg"><div class="modal-header"><span class="modal-title">Post an Opportunity</span><button class="modal-close">x</button></div><div class="modal-body"><div class="form-stack"><div class="form-group"><label class="form-label">Type *</label><select class="form-control" id="co-type" onchange="document.getElementById(\'co-resume-row\').style.display=this.value===\'job\'?\'flex\':\'none\'"><option value="job">Job</option><option value="collaboration">Collaboration</option><option value="investment">Investment</option><option value="service">Service Request</option></select></div><div class="form-group"><label class="form-label">Title *</label><input class="form-control" id="co-title" placeholder="Head of Product at Acme Corp"></div><div class="form-group"><label class="form-label">Description *</label><textarea class="form-control" id="co-desc" rows="4" placeholder="Tell members about this opportunity..."></textarea></div><div class="form-row"><div class="form-group"><label class="form-label">Location</label><input class="form-control" id="co-location" placeholder="Remote, New York..."></div><div class="form-group"><label class="form-label">Skills Required</label><input class="form-control" id="co-skills" placeholder="React, Design, Growth..."></div></div><div class="form-group"><label class="form-label">Compensation</label><input class="form-control" id="co-comp" placeholder="$120k - $150k or $500 bonus..."></div><label id="co-resume-row" style="display:flex;align-items:center;gap:.625rem;cursor:pointer;padding:.75rem;background:var(--surface);border-radius:8px"><input type="checkbox" id="co-require-resume" checked style="width:18px;height:18px;accent-color:var(--teal)"><span class="t-body">Require applicants to submit a resume</span></label></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="create-opp-btn">Post Opportunity</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-create-service"><div class="modal modal-lg"><div class="modal-header"><span class="modal-title">Post a Service</span><button class="modal-close">x</button></div><div class="modal-body"><div class="form-stack"><div class="form-group"><label class="form-label">Title *</label><input class="form-control" id="sv-title" placeholder="Brand identity design for startups"></div><div class="form-group"><label class="form-label">Description *</label><textarea class="form-control" id="sv-desc" rows="4" placeholder="What do you offer? What\'s included?"></textarea></div><div class="form-group"><label class="form-label">Skills</label><input class="form-control" id="sv-skills" placeholder="Branding, Figma, Illustration..."></div><div class="form-group"><label class="form-label">Location <span>(optional \u2014 city, town, or country)</span></label><input class="form-control" id="sv-location" placeholder="Toronto, ON or Remote"></div><div class="form-row"><div class="form-group"><label class="form-label">Pricing Type</label><select class="form-control" id="sv-price-type"><option value="fixed">Flat rate</option><option value="hourly">Hourly</option></select></div><div class="form-group"><label class="form-label">Price ($) <span>(optional)</span></label><input class="form-control" id="sv-price" type="number" min="0" placeholder="1500"></div></div><div class="form-group"><label class="form-label">Typical Delivery Time <span>(optional, in days)</span></label><input class="form-control" id="sv-delivery" type="number" min="1" placeholder="14"></div><div class="form-group"><label class="form-label">Portfolio Link <span>(optional)</span></label><input class="form-control" id="sv-portfolio" placeholder="https://..."></div></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="create-service-btn">Post Service</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-create-deal"><div class="modal modal-lg"><div class="modal-header"><span class="modal-title">Create a Deal</span><button class="modal-close">x</button></div><div class="modal-body"><div class="form-stack"><div class="form-group"><label class="form-label">Deal Title *</label><input class="form-control" id="cd-title" placeholder="Website Redesign Project"></div><div class="form-group"><label class="form-label">Counterparty (Seller) *</label><select class="form-control" id="cd-seller"><option value="">Select member...</option></select></div><div class="form-group"><label class="form-label">Scope *</label><textarea class="form-control" id="cd-scope" rows="3" placeholder="Describe what you are buying..."></textarea></div><div class="form-row"><div class="form-group"><label class="form-label">Price ($) *</label><input class="form-control" id="cd-price" type="number" min="1" placeholder="5000"></div><div class="form-group"><label class="form-label">Payment Type</label><select class="form-control" id="cd-payment-type"><option value="lump_sum">Full Amount</option><option value="milestones">Milestones</option></select></div></div><div class="form-row"><div class="form-group"><label class="form-label">Start Date</label><input class="form-control" id="cd-start" type="date"></div><div class="form-group"><label class="form-label">End Date</label><input class="form-control" id="cd-end" type="date"></div></div><div class="form-group"><label class="form-label">Deliverables <span>one per line</span></label><textarea class="form-control" id="cd-deliverables" rows="3" placeholder="Discovery and wireframes&#10;High-fidelity mockups&#10;Developer handoff"></textarea></div><div class="form-group"><label class="form-label">Wheel</label><select class="form-control" id="cd-wheel"><option value="">None (direct deal)</option></select></div></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="create-deal-btn">Propose Deal</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-create-post"><div class="modal"><div class="modal-header"><span class="modal-title">New Post</span><button class="modal-close">x</button></div><div class="modal-body"><div class="form-stack"><div class="form-group"><label class="form-label">Type</label><select class="form-control" id="cp-type"><option value="post">Post</option><option value="announcement">Announcement</option><option value="referral">Referral</option></select></div><div class="form-group"><label class="form-label">Message</label><textarea class="form-control" id="cp-body" rows="3" placeholder="Share something with your Wheel... Use @name to mention someone"></textarea></div><div class="form-group"><label class="form-label">Link <span>(optional)</span></label><input class="form-control" id="cp-link" placeholder="https://..."></div><div class="form-group"><label class="form-label">Photo <span>(optional)</span></label><input type="file" id="cp-photo" accept="image/*" class="form-control" style="padding:.375rem" onchange="previewPostPhoto(event)"><div id="cp-photo-preview" style="margin-top:.5rem"></div></div><div class="form-group"><label class="form-label">Video <span>(optional)</span></label><input type="file" id="cp-video" accept="video/*" class="form-control" style="padding:.375rem" onchange="previewPostVideo(event)"><div id="cp-video-preview" style="margin-top:.5rem"></div></div></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="create-post-btn">Publish</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-create-event"><div class="modal"><div class="modal-header"><span class="modal-title">Create Event</span><button class="modal-close">x</button></div><div class="modal-body"><div class="form-stack"><div class="form-group"><label class="form-label">Event Title *</label><input class="form-control" id="ev-title" placeholder="Founders Dinner - Toronto"></div><div class="form-group"><label class="form-label">Description *</label><textarea class="form-control" id="ev-desc" rows="3" placeholder="What is this event about?"></textarea></div><div class="form-row"><div class="form-group"><label class="form-label">Date *</label><input class="form-control" id="ev-date" type="date"></div><div class="form-group"><label class="form-label">Time</label><input class="form-control" id="ev-time" type="time"></div></div><div class="form-group"><label class="form-label">Location *</label><input class="form-control" id="ev-location" placeholder="Toronto, ON or Virtual"></div><div class="form-group"><label class="form-label">Capacity <span>(optional \u2014 defaults to 50 if left blank)</span></label><input class="form-control" id="ev-count" type="number" min="1" placeholder="50"></div><div class="form-group"><label class="form-label">Photo <span>(optional)</span></label><input type="file" id="ev-photo" accept="image/*" class="form-control" style="padding:.375rem" onchange="previewEventPhoto(event)"><div id="ev-photo-preview" style="margin-top:.5rem"></div></div><div class="form-group"><label class="form-label">Links <span>(optional, up to 3)</span></label><div style="display:flex;flex-direction:column;gap:.5rem"><input class="form-control" id="ev-link1" placeholder="https://..."><input class="form-control" id="ev-link2" placeholder="https://..."><input class="form-control" id="ev-link3" placeholder="https://..."></div></div></div></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="create-event-btn">Create Event</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-invite-wheel"><div class="modal"><div class="modal-header"><span class="modal-title">Invite to Wheel</span><button class="modal-close">x</button></div><div class="modal-body">'+
    '<div style="position:relative;margin-bottom:1rem">'+
    '<svg style="position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:var(--text-4);pointer-events:none" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'+
    '<input class="form-control" id="invite-search" placeholder="Search by name, country, city, job title, skill..." style="padding-left:2.25rem">'+
    '</div>'+
    '<p class="t-small c-text3 mb-2">Select people to invite. They will receive a notification.</p>'+
    '<div id="invite-member-list" style="max-height:360px;overflow-y:auto"></div>'+
    '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn btn-teal" id="send-invites-btn">Send Invites</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-payment"><div class="modal"><div class="modal-header"><span class="modal-title">Complete Payment</span><button class="modal-close">x</button></div><div class="modal-body" id="payment-modal-body"><div style="text-align:center;padding:2rem;color:var(--text-3)">Loading payment...</div></div></div></div>'+
  '<div class="modal-overlay" id="modal-opp-detail"><div class="modal modal-lg"><div class="modal-header"><span class="modal-title" id="modal-opp-title">Opportunity</span><button class="modal-close">x</button></div><div class="modal-body" id="modal-opp-body"></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Close</button><button class="btn btn-teal" onclick="applyToOpportunity(getActiveOppId(), this)">Apply Now</button></div></div></div>'+
  '<div class="modal-overlay" id="modal-event-attendees"><div class="modal"><div class="modal-header"><span class="modal-title">Attendees</span><button class="modal-close">x</button></div><div class="modal-body" id="event-attendees-body"></div></div></div>'+
  '<div class="modal-overlay" id="modal-post-likers"><div class="modal"><div class="modal-header"><span class="modal-title">Liked by</span><button class="modal-close">x</button></div><div class="modal-body" id="post-likers-body"></div></div></div>'+
  '<div class="modal-overlay" id="modal-delete-account"><div class="modal"><div class="modal-header"><span class="modal-title" style="color:var(--red)">Delete Your Account</span><button class="modal-close">x</button></div><div class="modal-body"><p class="t-body mb-3" style="color:var(--text-2)">This permanently deletes your Fairriss account, including your profile, messages, service listings, and deal history. <strong>This cannot be undone.</strong></p><label style="display:flex;align-items:flex-start;gap:.625rem;cursor:pointer;padding:.75rem;background:var(--surface);border-radius:8px"><input type="checkbox" id="delete-account-confirm-checkbox" style="width:18px;height:18px;accent-color:var(--red);margin-top:.125rem" onchange="document.getElementById(\'delete-account-submit-btn\').disabled=!this.checked"><span class="t-body">I understand this is permanent and cannot be undone.</span></label></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeAllModals()">Cancel</button><button class="btn" style="background:var(--red);color:#fff" id="delete-account-submit-btn" onclick="confirmDeleteAccount()" disabled>Permanently Delete Account</button></div></div></div>'
  );
}

window.applyWheelTemplate=i=>{
  const s=SUGGESTED_WHEELS[i];if(!s)return;
  $$('#wheel-templates .auth-role-card').forEach(c=>c.classList.remove('selected'));
  $$('#wheel-templates .auth-role-card')[i]?.classList.add('selected');
  const n=$('#cw-name'),d=$('#cw-desc'),c=$('#cw-color');
  if(n)n.value=s.name;if(d)d.value=s.desc;if(c)c.value=s.hex;
  const cat=$('#cw-cat');if(cat){for(let o of cat.options){if(o.value===s.category){o.selected=true;break;}}}
};

function bindModalForms(){
  $('#create-wheel-btn')?.addEventListener('click', async ()=>{
    const name=$('#cw-name').value.trim(),desc=$('#cw-desc').value.trim();
    if(!name){toast('Wheel name is required','error');return;}
    let category=$('#cw-cat').value;
    if(category==='Other'){
      const custom=$('#cw-other-input')?.value.trim();
      if(!custom){toast('Please tell us what kind of Wheel this is','error');return;}
      category=custom;
    }
    const color=$('#cw-color').value;
    const btn=$('#create-wheel-btn'); btn.disabled=true; btn.textContent='Creating...';
    try {
      const w = await store.createWheel({name,slug:name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''),description:desc,category,hexColor:color,coverGradient:'linear-gradient(135deg,'+color+'cc,'+color+')',isEventWheel:$('#cw-is-event').checked,location:$('#cw-location').value.trim()||null});
      toast('Wheel "'+name+'" created!','success');closeAllModals();updateShellDynamic(store.getMe());navigate('wheel-detail',{wheelId:w.id});
    } catch(e){
      toast('Failed to create Wheel: '+e.message,'error'); btn.disabled=false; btn.textContent='Create Wheel';
    }
  });
  $('#create-opp-btn')?.addEventListener('click', async ()=>{
    const title=$('#co-title').value.trim(),desc=$('#co-desc').value.trim();
    if(!title||!desc){toast('Title and description are required','error');return;}
    const btn=$('#create-opp-btn'); btn.disabled=true; btn.textContent='Posting...';
    try {
      const myWheels = await store.getMyWheels();
      await store.createOpportunity({type:$('#co-type').value,title,description:desc,skills:$('#co-skills').value.split(',').map(s=>s.trim()).filter(Boolean),location:$('#co-location').value.trim()||'Remote',remoteOk:true,wheelIds:(myWheels||[]).map(w=>w.id),metadata:{value:$('#co-comp').value.trim(),requireResume:$('#co-require-resume')?.checked!==false},expiresAt:null});
      toast('Opportunity posted!','success');closeAllModals();navigate('opportunities');
    } catch(e){
      toast('Failed to post: '+e.message,'error'); btn.disabled=false; btn.textContent='Post Opportunity';
    }
  });
  $('#create-service-btn')?.addEventListener('click', async ()=>{
    const title=$('#sv-title').value.trim(),desc=$('#sv-desc').value.trim();
    if(!title||!desc){toast('Title and description are required','error');return;}
    const me=store.getMe();
    const sb=getSb();
    if(!sb){toast('Not connected. Please refresh and try again.','error');return;}
    const btn=$('#create-service-btn'); btn.disabled=true; btn.textContent='Posting...';
    try {
      const priceVal=$('#sv-price').value.trim();
      const { error } = await sb.from('services').insert({
        creator_id: me.id, title, description: desc,
        skills: $('#sv-skills').value.split(',').map(s=>s.trim()).filter(Boolean),
        price_type: $('#sv-price-type').value,
        price_cents: priceVal ? parseInt(priceVal)*100 : null,
        delivery_days: $('#sv-delivery').value ? parseInt($('#sv-delivery').value) : null,
        portfolio_url: $('#sv-portfolio').value.trim() || null,
        location: $('#sv-location').value.trim() || null,
      });
      if(error) throw error;
      toast('Service posted!','success');closeAllModals();navigate('opportunities',{view:'services'});
    } catch(e){
      toast('Failed to post: '+e.message,'error'); btn.disabled=false; btn.textContent='Post Service';
    }
  });
  $('#create-deal-btn')?.addEventListener('click',()=>{
    const title=$('#cd-title').value.trim(),scope=$('#cd-scope').value.trim(),price=parseInt($('#cd-price').value)||0,sellerId=$('#cd-seller').value;
    if(!title||!scope||!price||!sellerId){toast('Please fill all required fields','error');return;}
    const deliverables=$('#cd-deliverables').value.trim().split('\n').filter(Boolean).map(l=>({id:uid(),title:l.trim(),done:false}));
    const d=store.createDeal({title,scope,sellerId,priceCents:price*100,currency:'USD',paymentType:$('#cd-payment-type').value,startDate:$('#cd-start').value,endDate:$('#cd-end').value,wheelId:$('#cd-wheel').value||null,deliverables});
    notifyUser(sellerId,'deal_message','<strong>'+store.getMe().name+'</strong> proposed a deal: '+escHtml(title));
    toast('Deal proposed!','success');closeAllModals();navigate('deal-detail',{dealId:d.id});
  });
  document.getElementById('modal-create-deal')?.addEventListener('click', async ()=>{
    const sel=$('#cd-seller'),wsel=$('#cd-wheel');
    if(!sel||sel.options.length>1)return;
    store.get('users').filter(u=>u.id!==store.getMe()?.id).forEach(u=>sel.options.add(new Option(u.name,u.id)));
    const myWheels = await store.getMyWheels();
    (myWheels||[]).forEach(w=>wsel.options.add(new Option(w.name,w.id)));
  });
  $('#create-post-btn')?.addEventListener('click', async ()=>{
    const body=$('#cp-body')?.value.trim()||'',link=$('#cp-link')?.value.trim()||'';
    const photoFile=document.getElementById('cp-photo')?.files[0],videoFile=document.getElementById('cp-video')?.files[0];
    if(!body&&!link&&!photoFile&&!videoFile){toast('Add a message, link, photo or video','error');return;}
    const myWheels = await store.getMyWheels();
    const wheelId=pageParams.wheelId||(myWheels||[])[0]?.id;
    if(!wheelId){toast('Join a Wheel first','error');return;}
    const doPost=async(photo,video)=>{
      store.createPost({wheelId,body,type:$('#cp-type').value,link:link||null,photo:photo||null,video:video||null});
      const mentions=[...body.matchAll(/@(\w+)/g)].map(m=>m[1].toLowerCase());
      if(mentions.length){
        try{
          const wheelMembers=await store.getWheelMembers(wheelId);
          (wheelMembers||[]).forEach(m=>{if(mentions.includes(m.username?.toLowerCase()||m.name.split(' ')[0].toLowerCase())&&m.id!==store.getMe().id)notifyUser(m.id,'mention','<strong>'+escHtml(store.getMe().name)+'</strong> mentioned you in a post');});
        }catch(e){}
      }
      toast('Post published!','success');closeAllModals();renderWheelDetail();
    };
    if(photoFile){const r=new FileReader();r.onload=ev=>{if(videoFile){const r2=new FileReader();r2.onload=ev2=>doPost(ev.target.result,ev2.target.result);r2.readAsDataURL(videoFile);}else doPost(ev.target.result,null);};r.readAsDataURL(photoFile);}
    else if(videoFile){const r=new FileReader();r.onload=ev=>doPost(null,ev.target.result);r.readAsDataURL(videoFile);}
    else doPost(null,null);
  });
  document.getElementById('modal-create-post')?.addEventListener('click',()=>{setTimeout(()=>initMentionAutocomplete('cp-body',pageParams.wheelId||null),50);});
  $('#create-event-btn')?.addEventListener('click', async ()=>{
    const title=$('#ev-title').value.trim(),desc=$('#ev-desc').value.trim(),date=$('#ev-date').value,location=$('#ev-location').value.trim();
    if(!title||!desc||!date||!location){toast('Please fill all required fields','error');return;}
    const myWheels = await store.getMyWheels();
    const wheelId=pageParams.wheelId||(myWheels||[])[0]?.id;if(!wheelId){toast('Open a Wheel first','error');return;}
    const links=[$('#ev-link1').value.trim(),$('#ev-link2').value.trim(),$('#ev-link3').value.trim()].filter(Boolean);
    const btn=$('#create-event-btn'); btn.disabled=true; btn.textContent='Creating...';
    let imageUrl=null;
    const photoFile=document.getElementById('ev-photo')?.files[0];
    if(photoFile){
      imageUrl = await dmUploadAttachment(photoFile).then(r=>r?.url||null);
    }
    try {
      await store.createEvent({wheelId,title,description:desc,date,time:$('#ev-time').value||'7:00 PM',location,ticketCount:parseInt($('#ev-count').value)||null,imageUrl,links});
      toast('Event created!','success');closeAllModals();renderWheelDetail();
    } catch(e){
      toast('Failed to create event: '+e.message,'error'); btn.disabled=false; btn.textContent='Create Event';
    }
  });
}

// ── Boot ────────────────────────────────────────────────────────────────────


window.handlePostClick = wheelId => {
  const me = store.getMe();
  if (!me) return;
  // Check if user is a member
  const isMember = store.isMember(wheelId);
  if (!isMember) {
    // Show join prompt instead of post modal
    const wheel = store.get('wheels').find(w => w.id === wheelId);
    if (confirm('You need to join "' + (wheel ? wheel.name : 'this Wheel') + '" before you can post. Join now?')) {
      store.joinWheel(wheelId);
      toast('Joined! You can now post in this Wheel.', 'success');
      updateShellDynamic(me);
      renderWheelDetail();
    }
    return;
  }
  openModal('modal-create-post');
};

window.acceptWheelInvite = el => {
  const wid = el.dataset.wid;
  if (!wid) return;
  store.joinWheel(wid);
  const w = store.get('wheels').find(x => x.id === wid);
  toast('Joined ' + (w ? w.name : 'Wheel') + '!', 'success');
  updateShellDynamic(store.getMe());
  el.textContent = 'Joined!';
  el.style.color = 'var(--green)';
  el.style.cursor = 'default';
  el.onclick = null;
};


window.handleLogout = async () => {
  try {
    if(window._supabase) await window._supabase.auth.signOut();
    if(window.Realtime) Realtime.unsubscribeAll();
  } catch(e){ console.warn('Signout error:', e); }
  // Clear LiveStore state
  if(window.LiveStore){ window.LiveStore._currentUserId=null; window.LiveStore._profile=null; window.LiveStore._loaded=false; }
  store.logout();
  renderPage();
};


// ================================================================
// STRIPE PAYMENTS
// ================================================================
const STRIPE_PK = 'pk_live_51TwRBCBcFQ7cg5YhIPO8bijPfb5xZY0VEdBKJMIA2soSGJV3HgC13DBmIxCKP3eXHOvPDLE6TwbZ93v4jsuAufNu00vZATZgQ8'; // Live key
let _stripe = null;

function getStripe(){
  if(!_stripe && window.Stripe) _stripe = window.Stripe(STRIPE_PK);
  return _stripe;
}

// Call Supabase Edge Function
async function callStripeFunction(action, params){
  const { data: { session } } = await window._supabase.auth.getSession();
  const res = await fetch('https://kpzrvpokasqwmfeuypxv.supabase.co/functions/v1/stripe-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + session?.access_token,
    },
    body: JSON.stringify({ action, ...params }),
  });
  const data = await res.json();
  if(data.error) throw new Error(data.error);
  return data;
}

// Open payment modal for a deal
window.openPaymentModal = async (dealId) => {
  const deal = await store.getDeal(dealId);
  if(!deal){ toast('Deal not found', 'error'); return; }

  const me = store.getMe();
  if(!me || me.id !== deal.buyerId){ toast('Only the buyer can make payment', 'error'); return; }

  // Show payment modal
  openModal('modal-payment');
  const body = document.getElementById('payment-modal-body');
  if(body) body.innerHTML = '<div style="text-align:center;padding:2rem"><div style="font-size:2rem;margin-bottom:1rem">&#x1F4B3;</div><div class="t-h3 mb-2">'+escHtml(deal.title)+'</div><div style="font-size:1.75rem;font-weight:900;color:var(--navy);margin-bottom:.5rem">'+fmtMoney(deal.priceCents/100)+'</div><div class="t-small c-text3 mb-4">Fairriss holds payment in escrow until you approve the work</div><div id="payment-element-container" style="margin-bottom:1rem"></div><div id="payment-error" style="color:var(--red);font-size:.875rem;margin-bottom:.75rem;display:none"></div><button class="btn btn-teal w-full" id="pay-now-btn" style="justify-content:center">Pay '+fmtMoney(deal.priceCents/100)+'</button><div style="display:flex;align-items:center;justify-content:center;gap:.5rem;margin-top:1rem;color:var(--text-4);font-size:.75rem"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Secured by Stripe</div></div>';

  try {
    const { clientSecret } = await callStripeFunction('create_payment_intent', {
      dealId,
      amount: deal.priceCents,
      currency: deal.currency?.toLowerCase() || 'usd',
      sellerId: deal.sellerId,
      buyerEmail: me.email,
    });

    const stripe = getStripe();
    if(!stripe){ toast('Stripe not loaded', 'error'); return; }

    const elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element-container');

    document.getElementById('pay-now-btn').onclick = async () => {
      const btn = document.getElementById('pay-now-btn');
      btn.textContent = 'Processing...'; btn.disabled = true;
      const errEl = document.getElementById('payment-error');

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: 'https://fairriss.com?payment=success&deal='+dealId },
        redirect: 'if_required',
      });

      if(error){
        errEl.textContent = error.message; errEl.style.display = 'block';
        btn.textContent = 'Pay '+fmtMoney(deal.priceCents/100); btn.disabled = false;
      } else {
        closeAllModals();
        toast('Payment successful! Funds held in escrow.', 'success');
        store.updateDeal(dealId, { status: 'in_progress', stripeStatus: 'succeeded' });
        navigate('deal-detail', { dealId });
      }
    };
  } catch(e){
    const body = document.getElementById('payment-modal-body');
    if(body) body.innerHTML = '<div class="empty-state" style="padding:2rem"><div class="empty-icon">&#x26A0;</div><div class="empty-title">'+escHtml(e.message)+'</div><div class="empty-desc">Make sure the seller has connected their bank account first.</div></div>';
  }
};

// Seller: connect bank account
window.connectBankAccount = async () => {
  const me = store.getMe();
  if(!me){ toast('Please sign in first', 'error'); return; }
  try {
    toast('Setting up your payout account...', 'default');
    const { url } = await callStripeFunction('create_connect_account', {
      userId: me.id,
      email: me.email,
      name: me.name,
    });
    if(!url) throw new Error('No onboarding URL returned');
    window.location.href = url;
  } catch(e){ toast(e.message || 'Failed to start bank connection', 'error'); }
};

// Check if payment success on page load
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  if(params.get('payment') === 'success'){
    const dealId = params.get('deal');
    toast('Payment successful! Funds held in escrow.', 'success');
    window.history.replaceState({}, '', window.location.pathname);
    if(dealId) navigate('deal-detail', { dealId });
  }
  if(params.get('stripe') === 'success'){
    toast('Bank account connected! You can now receive payments.', 'success');
    window.history.replaceState({}, '', window.location.pathname);
  }
});

window.renderTerms=renderTerms;window.renderPrivacy=renderPrivacy;
window.goProfile=()=>{const me=store.getMe();if(me)navigate('profile',{userId:me.id});};window.navigate=navigate;window.openModal=openModal;window.closeAllModals=closeAllModals;
window.store=store;window.toast=toast;window.renderHome=renderHome;window.renderMessages=renderMessages;
window.renderProfile=renderProfile;window.renderWheelDetail=renderWheelDetail;
window.renderDealDetail=renderDealDetail;window.renderOppDetail=renderOppDetail;
window.createFromTemplate=createFromTemplate;

document.addEventListener('DOMContentLoaded', async ()=>{
  // Public shareable profile link (?u=username) — works without logging in
  const publicUsername = new URLSearchParams(window.location.search).get('u');
  if(publicUsername){
    await renderPublicProfile(publicUsername);
    return;
  }

  // Public shareable wheel link (?wheel=slug) — works without logging in
  const publicWheelSlug = new URLSearchParams(window.location.search).get('wheel');
  if(publicWheelSlug){
    await renderPublicWheel(publicWheelSlug);
    return;
  }

  // Clear old cache versions
  ['fairriss_mvp_v1','fairriss_mvp_v2','fairriss_mvp_v3'].forEach(k=>localStorage.removeItem(k));

  // Check if user has an active Supabase session
  if(window.SupabaseStore){
    try {
      const profile = await window.SupabaseStore.init();
      if(profile){
        // User is logged in via Supabase - sync into local store
        store.data.currentUser = profile.id;
        const existing = store.data.users.find(u=>u.id===profile.id);
        if(!existing) store.data.users.push(sbToLocal(profile));
        else Object.assign(existing, sbToLocal(profile));
        store._save();

        // Start real-time notifications
        Realtime.subscribeToNotifications(profile.id, (notif)=>{
          // Add to local store and update bell
          if(!store.data.notifications) store.data.notifications=[];
          store.data.notifications.unshift({
            id: notif.id, userId: notif.user_id, type: notif.type,
            text: notif.text, read: false, createdAt: notif.created_at
          });
          store._save();
          updateShellDynamic(store.getMe());
        });
      }
    } catch(e){ console.warn('Supabase session check failed:', e.message); }
  }

  // Handle password reset redirect from email link
  const hashParams = new URLSearchParams(window.location.hash.replace('#',''));
  const queryParams = new URLSearchParams(window.location.search);
  const type = hashParams.get('type') || queryParams.get('type');
  const accessToken = hashParams.get('access_token');

  if(type === 'recovery' && accessToken){
    // User clicked password reset link in email
    renderResetPassword();
    return;
  }

  renderPage();
  if(store.getMe()) checkEventReminders();

  // Listen for auth state changes (e.g. after magic link click)
  if(window.Auth){
    Auth.onAuthChange(async (user)=>{
      if(user && !store.data.currentUser){
        try {
          const profile = await Users.getById(user.id);
          if(profile){
            store.data.currentUser = profile.id;
            const existing = store.data.users.find(u=>u.id===profile.id);
            if(!existing) store.data.users.push(sbToLocal(profile));
            else Object.assign(existing, sbToLocal(profile));
            store._save();
            renderPage();
          }
        } catch(e){ console.warn('Profile load failed:', e.message); }
      } else if(!user && store.data.currentUser){
        store.data.currentUser = null;
        store._save();
        renderPage();
      }
    });
  }
});

// ── Admin Dashboard ────────────────────────────────────────────────────────
async function renderAdmin(){
  const me = store.getMe();
  // Only allow admin role
  if(!me || me.role !== 'admin'){
    document.getElementById('page-admin').innerHTML = '<div class="empty-state"><div class="empty-icon">&#x1F6AB;</div><div class="empty-title">Access Denied</div><div class="empty-desc">You do not have admin permissions.</div></div>';
    return;
  }

  const el = document.getElementById('page-admin');
  el.innerHTML = '<div class="page-head"><div class="page-head-left"><h1 class="page-title">&#x1F6E1; Admin Dashboard</h1><p class="page-sub">Platform overview and management</p></div><div class="page-actions"><button class="btn btn-outline btn-sm" onclick="renderAdmin()">Refresh</button></div></div><div style="text-align:center;padding:3rem;color:var(--text-3)">Loading...</div>';

  // Load all data
  let allUsers = [], allWheels = [], allDeals = [], allOpps = [];
  try {
    if(window.LiveStore && window.LiveStore.isReady()){
      const [u, w, d, o] = await Promise.all([
        window._supabase.from('users').select('*').order('created_at', {ascending:false}),
        window._supabase.from('wheels').select('*').order('created_at', {ascending:false}),
        window._supabase.from('deals').select('*').order('created_at', {ascending:false}),
        window._supabase.from('opportunities').select('*').order('created_at', {ascending:false}),
      ]);
      allUsers = u.data || [];
      allWheels = w.data || [];
      allDeals = d.data || [];
      allOpps = o.data || [];
    } else {
      allUsers = store.get('users') || [];
      allWheels = store.get('wheels') || [];
      allDeals = store.get('deals') || [];
      allOpps = store.get('opportunities') || [];
    }
  } catch(e){ console.warn('Admin load error:', e); }

  const totalRevenue = allDeals.filter(d=>d.status==='paid').reduce((s,d)=>s+(d.price_cents||d.priceCents||0)/100,0);
  const fairrissFees = totalRevenue * 0.10;
  const activeDeals = allDeals.filter(d=>['proposed','negotiating','accepted','in_progress'].includes(d.status));

  const adminTab = window._adminTab || 'overview';

  el.innerHTML =
    '<div class="page-head"><div class="page-head-left"><h1 class="page-title">&#x1F6E1; Admin Dashboard</h1><p class="page-sub">Platform overview and management</p></div><div class="page-actions"><button class="btn btn-outline btn-sm" onclick="renderAdmin()">Refresh</button></div></div>'+

    // Stats
    '<div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:1.5rem">'+
    '<div class="stat-card"><span class="stat-label">Total Users</span><span class="stat-value">'+allUsers.length+'</span></div>'+
    '<div class="stat-card"><span class="stat-label">Total Wheels</span><span class="stat-value">'+allWheels.length+'</span></div>'+
    '<div class="stat-card"><span class="stat-label">Total Deals</span><span class="stat-value">'+allDeals.length+'</span><span class="stat-change">'+activeDeals.length+' active</span></div>'+
    '<div class="stat-card"><span class="stat-label">Fairriss Fees</span><span class="stat-value">'+fmtMoney(fairrissFees)+'</span><span class="stat-change">from '+fmtMoney(totalRevenue)+' GMV</span></div>'+
    '</div>'+

    // Tabs
    '<div class="tabs mb-4">'+
    '<div class="tab-item '+(adminTab==='overview'?'active':'')+'" onclick="setAdminTab(\'overview\')">Overview</div>'+
    '<div class="tab-item '+(adminTab==='users'?'active':'')+'" onclick="setAdminTab(\'users\')">Users ('+allUsers.length+')</div>'+
    '<div class="tab-item '+(adminTab==='wheels'?'active':'')+'" onclick="setAdminTab(\'wheels\')">Wheels ('+allWheels.length+')</div>'+
    '<div class="tab-item '+(adminTab==='deals'?'active':'')+'" onclick="setAdminTab(\'deals\')">Deals ('+allDeals.length+')</div>'+
    '<div class="tab-item '+(adminTab==='opps'?'active':'')+'" onclick="setAdminTab(\'opps\')">Opportunities ('+allOpps.length+')</div>'+
    '</div>'+

    // Tab content
    '<div id="admin-tab-content">'+renderAdminTab(adminTab, allUsers, allWheels, allDeals, allOpps)+'</div>';
}

function renderAdminTab(tab, users, wheels, deals, opps){
  if(tab === 'overview'){
    const recent = [...users].sort((a,b)=>new Date(b.created_at||b.joinedAt||0)-new Date(a.created_at||a.joinedAt||0)).slice(0,5);
    const recentDeals = [...deals].sort((a,b)=>new Date(b.created_at||b.createdAt||0)-new Date(a.created_at||a.createdAt||0)).slice(0,5);
    return '<div class="two-col">'+
      '<div><div class="card"><h3 class="t-h2 mb-3">Recent Sign Ups</h3>'+
      (recent.length ? recent.map(u=>'<div class="flex gap-3 items-center mb-3">'+avatarHtml({id:u.id,name:u.name,profilePics:u.profile_pics||u.profilePics||[]},'sm')+'<div class="flex-1"><div class="t-small" style="font-weight:600">'+escHtml(u.name)+'</div><div class="t-micro c-text4">'+escHtml(u.email||'')+'</div></div><div class="t-micro c-text4">'+timeAgo(u.created_at||u.joinedAt)+'</div></div>').join('') : '<div class="t-body c-text3">No users yet</div>')+
      '</div></div>'+
      '<div><div class="card"><h3 class="t-h2 mb-3">Recent Deals</h3>'+
      (recentDeals.length ? recentDeals.map(d=>'<div class="flex justify-between items-center mb-3"><div><div class="t-small" style="font-weight:600">'+escHtml(d.title)+'</div><div class="t-micro c-text4">'+timeAgo(d.created_at||d.createdAt)+'</div></div>'+dealStatusBadge(d.status)+'</div>').join('') : '<div class="t-body c-text3">No deals yet</div>')+
      '</div></div></div>';
  }

  if(tab === 'users'){
    return '<div class="card"><table style="width:100%;border-collapse:collapse">'+
      '<thead><tr style="border-bottom:2px solid var(--border)">'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">User</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Email</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Role</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Joined</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Actions</th>'+
      '</tr></thead><tbody>'+
      users.map(u=>'<tr style="border-bottom:1px solid var(--border)">'+
        '<td style="padding:.75rem"><div class="flex gap-2 items-center">'+avatarHtml({id:u.id,name:u.name,profilePics:u.profile_pics||[]},'sm')+'<div><div class="t-small" style="font-weight:600">'+escHtml(u.name)+'</div><div class="t-micro c-text4">@'+escHtml(u.username||'')+'</div></div></div></td>'+
        '<td style="padding:.75rem"><div class="t-small c-text3">'+escHtml(u.email||'')+'</div></td>'+
        '<td style="padding:.75rem"><span class="type-badge type-'+( u.role==='admin'?'job':'service')+'" style="font-size:.6875rem">'+escHtml(u.role||'member')+'</span></td>'+
        '<td style="padding:.75rem"><div class="t-micro c-text4">'+timeAgo(u.created_at||u.joinedAt)+'</div></td>'+
        '<td style="padding:.75rem"><div class="flex gap-1">'+
        '<button class="btn btn-ghost btn-xs" onclick="adminViewUser(\''+u.id+'\')">View</button>'+
        (u.role!=='admin'?'<button class="btn btn-ghost btn-xs" style="color:var(--red)" onclick="adminSuspendUser(\''+u.id+'\',\''+escHtml(u.name)+'\')">Suspend</button>':'')+'</div></td>'+
      '</tr>').join('')+
      '</tbody></table></div>';
  }

  if(tab === 'wheels'){
    return '<div class="card"><table style="width:100%;border-collapse:collapse">'+
      '<thead><tr style="border-bottom:2px solid var(--border)">'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Wheel</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Category</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Members</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Created</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Actions</th>'+
      '</tr></thead><tbody>'+
      wheels.map(w=>'<tr style="border-bottom:1px solid var(--border)">'+
        '<td style="padding:.75rem"><div class="flex gap-2 items-center">'+hexBadge({name:w.name,hexColor:w.hex_color||w.hexColor||'#0F1F3D'},28)+'<div class="t-small" style="font-weight:600">'+escHtml(w.name)+'</div></div></td>'+
        '<td style="padding:.75rem"><div class="t-small c-text3">'+escHtml(w.category||'')+'</div></td>'+
        '<td style="padding:.75rem"><div class="t-small">'+fmt(w.member_count||w.memberCount||0)+'</div></td>'+
        '<td style="padding:.75rem"><div class="t-micro c-text4">'+timeAgo(w.created_at||w.createdAt)+'</div></td>'+
        '<td style="padding:.75rem"><button class="btn btn-ghost btn-xs" style="color:var(--red)" onclick="adminDeleteWheel(\''+w.id+'\',\''+escHtml(w.name)+'\')">Delete</button></td>'+
      '</tr>').join('')+
      '</tbody></table></div>';
  }

  if(tab === 'deals'){
    return '<div class="card"><table style="width:100%;border-collapse:collapse">'+
      '<thead><tr style="border-bottom:2px solid var(--border)">'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Deal</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Amount</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Status</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Fairriss Fee</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Created</th>'+
      '</tr></thead><tbody>'+
      deals.map(d=>'<tr style="border-bottom:1px solid var(--border)">'+
        '<td style="padding:.75rem"><div class="t-small" style="font-weight:600">'+escHtml(d.title)+'</div></td>'+
        '<td style="padding:.75rem"><div class="t-small">'+fmtMoney((d.price_cents||d.priceCents||0)/100)+'</div></td>'+
        '<td style="padding:.75rem">'+dealStatusBadge(d.status)+'</td>'+
        '<td style="padding:.75rem"><div class="t-small '+(d.status==='paid'?'c-green':'c-text3')+'">'+fmtMoney((d.price_cents||d.priceCents||0)/100*0.10)+'</div></td>'+
        '<td style="padding:.75rem"><div class="t-micro c-text4">'+timeAgo(d.created_at||d.createdAt)+'</div></td>'+
      '</tr>').join('')+
      '</tbody></table></div>';
  }

  if(tab === 'opps'){
    return '<div class="card"><table style="width:100%;border-collapse:collapse">'+
      '<thead><tr style="border-bottom:2px solid var(--border)">'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Title</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Type</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Status</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Applications</th>'+
      '<th style="text-align:left;padding:.75rem;font-size:.8125rem;color:var(--text-3);font-weight:600">Actions</th>'+
      '</tr></thead><tbody>'+
      opps.map(o=>'<tr style="border-bottom:1px solid var(--border)">'+
        '<td style="padding:.75rem"><div class="t-small" style="font-weight:600">'+escHtml(o.title)+'</div></td>'+
        '<td style="padding:.75rem"><span class="type-badge type-'+o.type+'" style="font-size:.6875rem">'+o.type+'</span></td>'+
        '<td style="padding:.75rem"><span class="status-badge status-'+o.status+'"><span class="status-dot"></span>'+o.status+'</span></td>'+
        '<td style="padding:.75rem"><div class="t-small">'+fmt(o.application_count||o.applicationCount||0)+'</div></td>'+
        '<td style="padding:.75rem"><button class="btn btn-ghost btn-xs" style="color:var(--red)" onclick="adminRemoveOpp(\''+o.id+'\',\''+escHtml(o.title)+'\')">Remove</button></td>'+
      '</tr>').join('')+
      '</tbody></table></div>';
  }
  return '';
}

window.setAdminTab = (tab) => {
  window._adminTab = tab;
  renderAdmin();
};

window.adminViewUser = (userId) => {
  navigate('profile', {userId});
};

window.adminSuspendUser = async (userId, name) => {
  if(!confirm('Suspend ' + name + '? They will not be able to log in.')) return;
  try {
    await window._supabase.from('users').update({role:'suspended'}).eq('id', userId);
    toast(name + ' has been suspended.', 'success');
    renderAdmin();
  } catch(e){ toast('Error: ' + e.message, 'error'); }
};

window.adminDeleteWheel = async (wheelId, name) => {
  if(!confirm('Delete Wheel "' + name + '"? This cannot be undone.')) return;
  try {
    await window._supabase.from('wheels').delete().eq('id', wheelId);
    toast('Wheel deleted.', 'success');
    renderAdmin();
  } catch(e){ toast('Error: ' + e.message, 'error'); }
};

window.adminRemoveOpp = async (oppId, title) => {
  if(!confirm('Remove "' + title + '"?')) return;
  try {
    await window._supabase.from('opportunities').update({status:'closed'}).eq('id', oppId);
    toast('Opportunity removed.', 'success');
    renderAdmin();
  } catch(e){ toast('Error: ' + e.message, 'error'); }
};

// ── Support Page ───────────────────────────────────────────────────────────
function renderSupport(){
  const el = document.getElementById('page-support');
  el.innerHTML =
    '<div class="page-head"><div class="page-head-left"><h1 class="page-title">Support</h1><p class="page-sub">We are here to help. Get in touch with the Fairriss team.</p></div></div>'+

    '<div class="two-col"><div>'+

    // Contact form
    '<div class="card mb-4">'+
    '<h2 class="t-h2 mb-1">Send us a message</h2>'+
    '<p class="t-small c-text3 mb-4">We typically respond within 24 hours.</p>'+
    '<div class="form-stack">'+
    '<div class="form-group"><label class="form-label">Name *</label><input class="form-control" id="support-name" placeholder="Your name" value="'+escHtml(store.getMe()?.name||'')+'"></div>'+
    '<div class="form-group"><label class="form-label">Email *</label><input class="form-control" id="support-email" type="email" placeholder="your@email.com" value="'+escHtml(store.getMe()?.email||'')+'"></div>'+
    '<div class="form-group"><label class="form-label">Subject *</label><select class="form-control" id="support-subject">'+
    '<option value="">Select a topic...</option>'+
    '<option>Account & Login</option>'+
    '<option>Payments & Deals</option>'+
    '<option>Wheels & Communities</option>'+
    '<option>Profile & Settings</option>'+
    '<option>Technical Issue</option>'+
    '<option>Report a User</option>'+
    '<option>Other</option>'+
    '</select></div>'+
    '<div class="form-group"><label class="form-label">Message *</label><textarea class="form-control" id="support-message" rows="5" placeholder="Describe your issue in detail..."></textarea></div>'+
    '<div id="support-status" style="display:none;padding:.75rem;border-radius:var(--radius-sm);margin-bottom:.5rem"></div>'+
    '<button class="btn btn-teal" id="support-submit">Send Message</button>'+
    '</div></div>'+

    // Direct email
    '<div class="card" style="background:var(--surface)">'+
    '<h3 class="t-h2 mb-2">Prefer email?</h3>'+
    '<p class="t-body c-text3 mb-3">Send us a message directly and we will get back to you within 24 hours.</p>'+
    '<a href="mailto:hello@fairriss.com" class="btn btn-outline" style="display:inline-flex;align-items:center;gap:.5rem">'+
    '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>'+
    'hello@fairriss.com</a>'+
    '</div>'+

    // Delete account (only shown to logged-in users)
    (store.getMe()?'<div class="card mt-4" style="border-color:var(--red)"><h3 class="t-h2 mb-2" style="color:var(--red)">Delete Account</h3><p class="t-small c-text3 mb-3">Permanently delete your Fairriss account, including your profile, messages, service listings, and deal history. This cannot be undone.</p><button class="btn btn-outline btn-sm" style="color:var(--red);border-color:var(--red)" onclick="openModal(\'modal-delete-account\')">Delete My Account</button></div>':'')+
    '</div>'+

    // FAQ
    '<div><div class="card"><h2 class="t-h2 mb-4">Frequently Asked Questions</h2>'+
    [
      {q:'How do I create a Wheel?', a:'Go to My Wheels in the navigation and click Create Wheel. Give it a name, description, and category. You can invite members after creating it.'},
      {q:'How do payments work?', a:'When a deal is accepted, the buyer pays through Stripe. Funds are held in escrow until the buyer approves the completed work. Fairriss takes a 10% fee and the seller receives the rest.'},
      {q:'How do I get paid as a seller?', a:'Go to your Profile and click Connect Bank Account. This links your bank via Stripe so you can receive payouts when deals are completed.'},
      {q:'Can I cancel a deal?', a:'Deals can be cancelled before payment is made. Once payment is in escrow, both parties need to agree or raise a dispute for resolution.'},
      {q:'How do I reset my password?', a:'On the sign in screen click Forgot password? and enter your email. You will receive a password reset link within a few minutes.'},
      {q:'How do I report a user?', a:'Use the Support form on this page and select Report a User. Provide as much detail as possible and our team will review within 24 hours.'},
      {q:'What is a Trust Score?', a:'Your Trust Score reflects your reputation on Fairriss. It increases as you complete deals, receive positive reviews, and engage positively with the community.'},
    ].map(f=>'<div style="border-bottom:1px solid var(--border);padding:1rem 0"><div style="font-weight:700;color:var(--navy);margin-bottom:.5rem">'+escHtml(f.q)+'</div><div style="color:var(--text-2);font-size:.9375rem;line-height:1.6">'+escHtml(f.a)+'</div></div>').join('')+
    '</div></div></div>';

  // Submit handler
  document.getElementById('support-submit').onclick = async () => {
    const name = document.getElementById('support-name').value.trim();
    const email = document.getElementById('support-email').value.trim();
    const subject = document.getElementById('support-subject').value;
    const message = document.getElementById('support-message').value.trim();
    const status = document.getElementById('support-status');

    if(!name||!email||!subject||!message){
      status.style.display='block';
      status.style.background='rgba(239,68,68,.1)';
      status.style.color='var(--red)';
      status.textContent='Please fill in all fields.';
      return;
    }

    const btn = document.getElementById('support-submit');
    btn.textContent='Sending...';btn.disabled=true;

    // Send email via mailto as fallback (Supabase email in production)
    try {
      if(window._supabase){
        await window._supabase.from('notifications').insert({
          user_id: store.getMe()?.id,
          type: 'support',
          text: 'Support request submitted: ' + subject
        });
      }
      status.style.display='block';
      status.style.background='rgba(0,201,167,.1)';
      status.style.color='var(--teal)';
      status.textContent='Message sent! We will get back to you within 24 hours.';
      document.getElementById('support-message').value='';
      document.getElementById('support-subject').value='';
      btn.textContent='Send Message';btn.disabled=false;
    } catch(e){
      status.style.display='block';
      status.style.background='rgba(239,68,68,.1)';
      status.style.color='var(--red)';
      status.textContent='Something went wrong. Please email hello@fairriss.com directly.';
      btn.textContent='Send Message';btn.disabled=false;
    }
  };
}
