/* ================================================================
   FAIRRISS — supabase_phase2.js
   Connects Wheels, Posts, Members, Deals, Opportunities to Supabase.
   Add to index.html AFTER supabase.js and BEFORE script.js:
   <script src="supabase_phase2.js"></script>
   ================================================================ */

/* ── Helper: convert Supabase row to local camelCase format ─── */
function dbWheel(w) {
  return {
    id: w.id,
    name: w.name,
    slug: w.slug,
    creatorId: w.creator_id,
    description: w.description || '',
    category: w.category || 'Other',
    coverGradient: w.cover_gradient || 'linear-gradient(135deg,#0F1F3D,#243B6B)',
    hexColor: w.hex_color || '#0F1F3D',
    memberCount: w.member_count || 1,
    status: w.status || 'active',
    membershipMode: w.membership_mode || 'open',
    monthlyPrice: w.monthly_price || 0,
    dealCommission: w.deal_commission || 2.5,
    isEventWheel: w.is_event_wheel || false,
    createdAt: w.created_at,
  };
}

function dbUser(u) {
  return {
    id: u.id,
    name: u.name || '',
    username: u.username || '',
    email: u.email || '',
    bio: u.bio || '',
    jobTitle: u.job_title || '',
    company: u.company || '',
    location: u.location || '',
    website: u.website || '',
    userType: u.user_type || 'member',
    role: u.role || 'member',
    availability: u.availability || 'available',
    skills: u.skills || [],
    links: u.links || [],
    wantTo: u.want_to || [],
    profilePics: u.profile_pics || [],
    introVideo: u.intro_video || '',
    resume: u.resume || '',
    trustScore: u.trust_score || 0,
    deals: u.deals_count || 0,
    revenue: u.revenue || 0,
    referralsSent: u.referrals_sent || 0,
    referralsConverted: u.referrals_converted || 0,
    reviewAvg: u.review_avg || 0,
    workHistory: u.work_history || [],
    joinedAt: u.created_at,
  };
}

function dbPost(p) {
  return {
    id: p.id,
    wheelId: p.wheel_id,
    authorId: p.author_id,
    type: p.type || 'post',
    body: p.body || '',
    photo: p.photo || '',
    video: p.video || '',
    link: p.link || '',
    likes: p.likes || 0,
    createdAt: p.created_at,
    // joined user data
    author: p.users ? dbUser(p.users) : null,
  };
}

function dbDeal(d) {
  return {
    id: d.id,
    wheelId: d.wheel_id,
    buyerId: d.buyer_id,
    sellerId: d.seller_id,
    title: d.title,
    scope: d.scope || '',
    status: d.status || 'proposed',
    priceCents: d.price_cents,
    currency: d.currency || 'USD',
    paymentType: d.payment_type || 'lump_sum',
    deliverables: d.deliverables || [],
    startDate: d.start_date || '',
    endDate: d.end_date || '',
    platformFeePct: d.platform_fee_pct || 3,
    creatorCommissionPct: d.creator_commission_pct || 2.5,
    createdAt: d.created_at,
    messages: (d.deal_messages || []).map(m => ({
      id: m.id,
      senderId: m.sender_id,
      body: m.body,
      createdAt: m.created_at,
    })),
    buyer: d.buyer ? dbUser(d.buyer) : null,
    seller: d.seller ? dbUser(d.seller) : null,
  };
}

function dbOpp(o) {
  return {
    id: o.id,
    creatorId: o.creator_id,
    wheelIds: o.wheel_ids || [],
    type: o.type,
    title: o.title,
    description: o.description || '',
    skills: o.skills || [],
    location: o.location || 'Remote',
    remoteOk: o.remote_ok,
    status: o.status || 'open',
    metadata: o.metadata || {},
    viewCount: o.view_count || 0,
    applicationCount: o.application_count || 0,
    expiresAt: o.expires_at,
    createdAt: o.created_at,
  };
}

function dbEvent(e) {
  return {
    id: e.id,
    wheelId: e.wheel_id,
    creatorId: e.creator_id,
    title: e.title,
    description: e.description || '',
    date: e.event_date,
    time: e.event_time || '7:00 PM',
    location: e.location || '',
    ticketPrice: e.ticket_price || 0,
    ticketCount: e.ticket_count || 50,
    ticketsSold: e.tickets_sold || 0,
    createdAt: e.created_at,
  };
}

/* ================================================================
   LIVE STORE — replaces localStorage with Supabase calls
   Falls back to localStorage if Supabase is unavailable
   ================================================================ */
const LiveStore = {

  // ── State ────────────────────────────────────────────────────
  _currentUserId: null,
  _profile: null,
  _wheels: [],
  _users: [],
  _loaded: false,

  // ── Init ─────────────────────────────────────────────────────
  async boot() {
    if (!window._supabase) return false;
    try {
      const { data: { user } } = await window._supabase.auth.getUser();
      if (!user) return false;
      this._currentUserId = user.id;
      // Load profile
      const { data: profile } = await window._supabase
        .from('users').select('*').eq('id', user.id).single();
      if (profile) this._profile = dbUser(profile);
      this._loaded = true;
      return true;
    } catch(e) {
      console.warn('LiveStore boot failed:', e.message);
      return false;
    }
  },

  getMe() { return this._profile; },
  isReady() { return this._loaded && !!this._currentUserId; },

  // ── Users ────────────────────────────────────────────────────
  async getAllUsers() {
    const { data, error } = await window._supabase.from('users').select('*').order('trust_score', { ascending: false });
    if (error) throw error;
    return data.map(dbUser);
  },

  async getUser(id) {
    const { data, error } = await window._supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return dbUser(data);
  },

  async updateMe(fields) {
    const mapped = {};
    if (fields.bio !== undefined)        mapped.bio = fields.bio;
    if (fields.jobTitle !== undefined)   mapped.job_title = fields.jobTitle;
    if (fields.company !== undefined)    mapped.company = fields.company;
    if (fields.location !== undefined)   mapped.location = fields.location;
    if (fields.website !== undefined)    mapped.website = fields.website;
    if (fields.userType !== undefined)   mapped.user_type = fields.userType;
    if (fields.availability !== undefined) mapped.availability = fields.availability;
    if (fields.skills !== undefined)     mapped.skills = fields.skills;
    if (fields.links !== undefined)      mapped.links = fields.links;
    if (fields.wantTo !== undefined)     mapped.want_to = fields.wantTo;
    if (fields.profilePics !== undefined) mapped.profile_pics = fields.profilePics;
    if (fields.introVideo !== undefined) mapped.intro_video = fields.introVideo;
    if (fields.resume !== undefined)     mapped.resume = fields.resume;
    if (fields.workHistory !== undefined) mapped.work_history = fields.workHistory;
    const { data, error } = await window._supabase
      .from('users').update(mapped).eq('id', this._currentUserId).select().single();
    if (error) throw error;
    this._profile = dbUser(data);
    return this._profile;
  },

  // ── Wheels ───────────────────────────────────────────────────
  async getMyWheels() {
    const { data, error } = await window._supabase
      .from('wheel_members')
      .select('wheel_id, wheels(*)')
      .eq('user_id', this._currentUserId)
      .eq('status', 'active');
    if (error) throw error;
    return data.map(r => dbWheel(r.wheels)).filter(Boolean);
  },

  async getAllWheels() {
    const { data, error } = await window._supabase
      .from('wheels').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(dbWheel);
  },

  async getWheelMembers(wheelId) {
    const { data, error } = await window._supabase
      .from('wheel_members')
      .select('user_id, users(*)')
      .eq('wheel_id', wheelId)
      .eq('status', 'active');
    if (error) throw error;
    return data.map(r => dbUser(r.users)).filter(Boolean);
  },

  async createWheel(fields) {
    const color = fields.hexColor || '#0F1F3D';
    const { data, error } = await window._supabase
      .from('wheels')
      .insert({
        creator_id: this._currentUserId,
        name: fields.name,
        slug: fields.slug || fields.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''),
        description: fields.description || '',
        category: fields.category || 'Other',
        cover_gradient: fields.coverGradient || `linear-gradient(135deg,${color}cc,${color})`,
        hex_color: color,
        deal_commission: fields.dealCommission || 2.5,
        is_event_wheel: fields.isEventWheel || false,
      })
      .select().single();
    if (error) throw error;
    // Auto-join creator
    await window._supabase.from('wheel_members')
      .insert({ wheel_id: data.id, user_id: this._currentUserId, status: 'active' });
    return dbWheel(data);
  },

  async joinWheel(wheelId) {
    const { error } = await window._supabase
      .from('wheel_members')
      .upsert({ wheel_id: wheelId, user_id: this._currentUserId, status: 'active' });
    if (error) throw error;
    await window._supabase.rpc('increment_member_count', { wheel_id_param: wheelId });
  },

  async isMember(wheelId) {
    const { data } = await window._supabase
      .from('wheel_members')
      .select('id')
      .eq('wheel_id', wheelId)
      .eq('user_id', this._currentUserId)
      .eq('status', 'active')
      .maybeSingle();
    return !!data;
  },

  // ── Posts ────────────────────────────────────────────────────
  async getPosts(wheelId) {
    const { data, error } = await window._supabase
      .from('posts')
      .select('*, users(id, name, profile_pics, job_title, user_type, role)')
      .eq('wheel_id', wheelId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(dbPost);
  },

  async createPost(fields) {
    const { data, error } = await window._supabase
      .from('posts')
      .insert({
        wheel_id: fields.wheelId,
        author_id: this._currentUserId,
        type: fields.type || 'post',
        body: fields.body || '',
        photo: fields.photo || '',
        video: fields.video || '',
        link: fields.link || '',
      })
      .select().single();
    if (error) throw error;
    return dbPost(data);
  },

  async likePost(postId) {
    await window._supabase.from('post_likes')
      .upsert({ post_id: postId, user_id: this._currentUserId });
    await window._supabase.rpc('increment_post_likes', { post_id_param: postId });
  },

  // ── Opportunities ────────────────────────────────────────────
  async getOpportunities(filters = {}) {
    let q = window._supabase
      .from('opportunities')
      .select('*, users(id, name, profile_pics, job_title)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    if (filters.type && filters.type !== 'all') q = q.eq('type', filters.type);
    if (filters.q) q = q.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
    const { data, error } = await q;
    if (error) throw error;
    return data.map(dbOpp);
  },

  async createOpportunity(fields) {
    const { data, error } = await window._supabase
      .from('opportunities')
      .insert({
        creator_id: this._currentUserId,
        wheel_ids: fields.wheelIds || [],
        type: fields.type,
        title: fields.title,
        description: fields.description || '',
        skills: fields.skills || [],
        location: fields.location || 'Remote',
        remote_ok: fields.remoteOk !== false,
        metadata: fields.metadata || {},
        expires_at: fields.expiresAt || null,
      })
      .select().single();
    if (error) throw error;
    return dbOpp(data);
  },

  // ── Deals ────────────────────────────────────────────────────
  async getMyDeals() {
    const { data, error } = await window._supabase
      .from('deals')
      .select('*, buyer:users!buyer_id(*), seller:users!seller_id(*), deal_messages(*)')
      .or(`buyer_id.eq.${this._currentUserId},seller_id.eq.${this._currentUserId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(dbDeal);
  },

  async getDeal(id) {
    const { data, error } = await window._supabase
      .from('deals')
      .select('*, buyer:users!buyer_id(*), seller:users!seller_id(*), deal_messages(*, users(id,name,profile_pics))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return dbDeal(data);
  },

  async createDeal(fields) {
    const { data, error } = await window._supabase
      .from('deals')
      .insert({
        buyer_id: this._currentUserId,
        seller_id: fields.sellerId,
        wheel_id: fields.wheelId || null,
        title: fields.title,
        scope: fields.scope || '',
        price_cents: fields.priceCents,
        currency: fields.currency || 'USD',
        payment_type: fields.paymentType || 'lump_sum',
        deliverables: fields.deliverables || [],
        start_date: fields.startDate || null,
        end_date: fields.endDate || null,
      })
      .select().single();
    if (error) throw error;
    return dbDeal(data);
  },

  async updateDeal(id, fields) {
    const mapped = {};
    if (fields.status) mapped.status = fields.status;
    if (fields.deliverables) mapped.deliverables = fields.deliverables;
    const { data, error } = await window._supabase
      .from('deals').update(mapped).eq('id', id).select().single();
    if (error) throw error;
    return dbDeal(data);
  },

  async addDealMessage(dealId, body) {
    const { data, error } = await window._supabase
      .from('deal_messages')
      .insert({ deal_id: dealId, sender_id: this._currentUserId, body })
      .select().single();
    if (error) throw error;
    return { id: data.id, senderId: data.sender_id, body: data.body, createdAt: data.created_at };
  },

  // ── Events ───────────────────────────────────────────────────
  async getEvents(wheelId) {
    const { data, error } = await window._supabase
      .from('events').select('*').eq('wheel_id', wheelId).order('event_date', { ascending: true });
    if (error) throw error;
    return data.map(dbEvent);
  },

  async createEvent(fields) {
    const { data, error } = await window._supabase
      .from('events')
      .insert({
        wheel_id: fields.wheelId,
        creator_id: this._currentUserId,
        title: fields.title,
        description: fields.description || '',
        event_date: fields.date,
        event_time: fields.time || '7:00 PM',
        location: fields.location || '',
        ticket_price: fields.ticketPrice || 0,
        ticket_count: fields.ticketCount || 50,
      })
      .select().single();
    if (error) throw error;
    return dbEvent(data);
  },

  async buyTicket(eventId) {
    const { data, error } = await window._supabase.rpc('buy_event_ticket', { event_id_param: eventId });
    if (error) throw error;
    return data;
  },

  // ── Notifications ────────────────────────────────────────────
  async getMyNotifs() {
    const { data, error } = await window._supabase
      .from('notifications')
      .select('*')
      .eq('user_id', this._currentUserId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data.map(n => ({
      id: n.id, userId: n.user_id, type: n.type,
      text: n.text, read: n.read, createdAt: n.created_at,
    }));
  },

  async addNotif(userId, type, text) {
    const { error } = await window._supabase
      .from('notifications')
      .insert({ user_id: userId, type, text });
    if (error) console.warn('Notif error:', error.message);
  },

  async markNotifsRead() {
    await window._supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', this._currentUserId)
      .eq('read', false);
  },

  // ── Storage uploads ──────────────────────────────────────────
  async uploadFile(bucket, path, file) {
    const { data, error } = await window._supabase.storage
      .from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = window._supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  },

  async uploadProfilePic(slotIndex, file) {
    const ext = file.name.split('.').pop();
    const url = await this.uploadFile('avatars', `${this._currentUserId}/photo_${slotIndex}.${ext}`, file);
    const pics = [...(this._profile?.profilePics || [])];
    pics[slotIndex] = url;
    await this.updateMe({ profilePics: pics });
    return url;
  },

  async uploadVideo(file) {
    const ext = file.name.split('.').pop();
    const url = await this.uploadFile('avatars', `${this._currentUserId}/intro.${ext}`, file);
    await this.updateMe({ introVideo: url });
    return url;
  },

  async uploadResume(file) {
    const ext = file.name.split('.').pop();
    const url = await this.uploadFile('resumes', `${this._currentUserId}/resume.${ext}`, file);
    await this.updateMe({ resume: url });
    return url;
  },

  async uploadPostMedia(file, type) {
    const ext = file.name.split('.').pop();
    const path = `posts/${Date.now()}_${type}.${ext}`;
    return this.uploadFile('post-media', path, file);
  },

  // ── Search users ─────────────────────────────────────────────
  async searchUsers(q, location) {
    let query = window._supabase.from('users').select('*');
    if (q) {
      query = query.or(
        `name.ilike.%${q}%,job_title.ilike.%${q}%,bio.ilike.%${q}%,company.ilike.%${q}%`
      );
    }
    if (location) query = query.ilike('location', `%${location}%`);
    const { data, error } = await query.order('trust_score', { ascending: false });
    if (error) throw error;
    return data.map(dbUser);
  },
};

// ── Boot: override script.js store methods with live versions ──
window.LiveStore = LiveStore;

// Patch the existing store methods to use LiveStore when available
async function patchStoreWithLive() {
  const booted = await LiveStore.boot();
  if (!booted) {
    console.log('Fairriss: Using localStorage (no Supabase session)');
    return;
  }
  console.log('Fairriss: Connected to Supabase database');

  // Sync current user into localStorage store so UI works
  const me = LiveStore.getMe();
  if (me) {
    const existing = store.data.users.find(u => u.id === me.id);
    if (!existing) store.data.users.push(me);
    else Object.assign(existing, me);
    store.data.currentUser = me.id;
    store._save();
  }

  // Override store methods with live versions
  store.getMe = () => LiveStore.getMe();

  store.getMyWheels = async () => {
    try { return await LiveStore.getMyWheels(); }
    catch(e) { console.warn(e); return []; }
  };

  store.getAllWheels = async () => {
    try { return await LiveStore.getAllWheels(); }
    catch(e) { return store.data.wheels || []; }
  };

  store.getWheelMembers = async (wid) => {
    try { return await LiveStore.getWheelMembers(wid); }
    catch(e) { return []; }
  };

  store.createWheel = async (fields) => {
    const w = await LiveStore.createWheel(fields);
    return w;
  };

  store.joinWheel = async (wid) => {
    await LiveStore.joinWheel(wid);
  };

  store.isMember = async (wid) => {
    try { return await LiveStore.isMember(wid); }
    catch(e) { return false; }
  };

  store.getPosts = async (wid) => {
    try { return await LiveStore.getPosts(wid); }
    catch(e) { return []; }
  };

  store.createPost = async (fields) => {
    return await LiveStore.createPost(fields);
  };

  store.likePost = async (postId) => {
    await LiveStore.likePost(postId);
  };

  store.getOpportunities = async (filters) => {
    try { return await LiveStore.getOpportunities(filters); }
    catch(e) { return []; }
  };

  store.createOpportunity = async (fields) => {
    return await LiveStore.createOpportunity(fields);
  };

  store.getMyDeals = async () => {
    try { return await LiveStore.getMyDeals(); }
    catch(e) { return []; }
  };

  store.getDeal = async (id) => {
    try { return await LiveStore.getDeal(id); }
    catch(e) { return null; }
  };

  store.createDeal = async (fields) => {
    return await LiveStore.createDeal(fields);
  };

  store.updateDeal = async (id, fields) => {
    return await LiveStore.updateDeal(id, fields);
  };

  store.addDealMessage = async (dealId, body) => {
    return await LiveStore.addDealMessage(dealId, body);
  };

  store.getEvents = async (wid) => {
    try { return await LiveStore.getEvents(wid); }
    catch(e) { return []; }
  };

  store.createEvent = async (fields) => {
    return await LiveStore.createEvent(fields);
  };

  store.buyTicket = async (eid) => {
    try { return await LiveStore.buyTicket(eid); }
    catch(e) { return false; }
  };

  store.getMyNotifs = async () => {
    try { return await LiveStore.getMyNotifs(); }
    catch(e) { return []; }
  };

  store.addNotif = async (uid, type, text) => {
    await LiveStore.addNotif(uid, type, text);
  };

  store.markNotifsRead = async () => {
    await LiveStore.markNotifsRead();
  };

  store.updateMe = async (fields) => {
    try {
      const updated = await LiveStore.updateMe(fields);
      // Also update local cache
      const idx = store.data.users.findIndex(u => u.id === LiveStore._currentUserId);
      if (idx !== -1) Object.assign(store.data.users[idx], updated);
      store._save();
      return updated;
    } catch(e) {
      console.warn('updateMe failed:', e.message);
    }
  };

  store.get = (key) => {
    // Keep local fallback for non-async reads
    return store.data[key];
  };

  store.getUser = async (id) => {
    try { return await LiveStore.getUser(id); }
    catch(e) {
      return store.data.users.find(u => u.id === id) || null;
    }
  };

  // Override upload functions
  window.uploadPic = async (e, slot) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      toast('Uploading photo...', 'default');
      await LiveStore.uploadProfilePic(slot, file);
      toast('Photo uploaded!', 'success');
      renderProfile();
    } catch(err) {
      // Fallback to base64 for local preview
      const r = new FileReader();
      r.onload = ev => {
        const me = LiveStore.getMe() || store.getMe();
        const pics = [...(me?.profilePics || [])];
        pics[slot] = ev.target.result;
        store.updateMe({ profilePics: pics });
        toast('Photo saved', 'success');
        renderProfile();
      };
      r.readAsDataURL(file);
    }
  };

  window.uploadVideo = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast('Video must be under 50MB', 'error'); return; }
    try {
      toast('Uploading video...', 'default');
      await LiveStore.uploadVideo(file);
      toast('Video uploaded!', 'success');
      renderProfile();
    } catch(err) {
      const r = new FileReader();
      r.onload = ev => { store.updateMe({ introVideo: ev.target.result }); renderProfile(); };
      r.readAsDataURL(file);
    }
  };

  window.uploadResume = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      toast('Uploading resume...', 'default');
      await LiveStore.uploadResume(file);
      toast('Resume uploaded!', 'success');
      renderProfile();
    } catch(err) {
      const r = new FileReader();
      r.onload = ev => { store.updateMe({ resume: ev.target.result }); renderProfile(); };
      r.readAsDataURL(file);
    }
  };

  // Subscribe to real-time notifications
  window._supabase
    .channel('notifs-' + LiveStore._currentUserId)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'notifications',
      filter: `user_id=eq.${LiveStore._currentUserId}`
    }, payload => {
      if (!store.data.notifications) store.data.notifications = [];
      store.data.notifications.unshift({
        id: payload.new.id, userId: payload.new.user_id,
        type: payload.new.type, text: payload.new.text,
        read: false, createdAt: payload.new.created_at,
      });
      store._save();
      // Update bell without full re-render
      const dot = document.getElementById('notif-dot');
      if (dot) dot.style.display = 'block';
    })
    .subscribe();

  console.log('Fairriss LiveStore: all methods patched to Supabase');
}

// Run after DOM and script.js are ready
window.addEventListener('load', () => {
  if (window.store && window._supabase) {
    patchStoreWithLive().then(() => {
      // Re-render to show live data
      if (typeof renderPage === 'function') renderPage();
    });
  }
});
