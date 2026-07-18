/* ================================================================
   FAIRRISS — supabase.js
   Drop this file in the same folder as index.html, style.css, script.js
   Then add this to index.html BEFORE script.js:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="supabase.js"></script>
   ================================================================ */

// ── 1. CONFIG — replace with your project values ───────────────
const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';

// Both values are in: Supabase Dashboard → Project Settings → API
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ================================================================
// 2. AUTH
// ================================================================
const Auth = {

  // Sign up with email + password
  // Pass name and username in options.data
  async signUp(email, password, name, username) {
    const { data, error } = await _supabase.auth.signUp({
      email,
      password,
      options: { data: { name, username } }
    });
    if (error) throw error;
    return data.user;
  },

  // Sign in with email + password
  async signIn(email, password) {
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  // Magic link (passwordless)
  async sendMagicLink(email) {
    const { error } = await _supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  },

  // Sign out
  async signOut() {
    const { error } = await _supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session user
  async getUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    return user;
  },

  // Listen for auth state changes
  onAuthChange(callback) {
    return _supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
};

// ================================================================
// 3. DATABASE HELPERS
// ================================================================

// ── Users ─────────────────────────────────────────────────────
const Users = {

  async getById(id) {
    const { data, error } = await _supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await _supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Search users by name, job title, skills, location
  async search(query, location = '') {
    let q = _supabase.from('users').select('*');
    if (query) {
      q = q.or(
        `name.ilike.%${query}%,` +
        `job_title.ilike.%${query}%,` +
        `bio.ilike.%${query}%,` +
        `company.ilike.%${query}%`
      );
    }
    if (location) {
      q = q.ilike('location', `%${location}%`);
    }
    const { data, error } = await q.order('trust_score', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateProfile(userId, fields) {
    // Map camelCase fields to snake_case DB columns
    const mapped = {
      name:          fields.name,
      bio:           fields.bio,
      job_title:     fields.jobTitle,
      company:       fields.company,
      location:      fields.location,
      website:       fields.website,
      user_type:     fields.userType,
      availability:  fields.availability,
      skills:        fields.skills,
      links:         fields.links,
      want_to:       fields.wantTo,
      profile_pics:  fields.profilePics,
      intro_video:   fields.introVideo,
      resume:        fields.resume,
      work_history:  fields.workHistory,
    };
    // Remove undefined keys
    Object.keys(mapped).forEach(k => mapped[k] === undefined && delete mapped[k]);
    const { data, error } = await _supabase
      .from('users')
      .update(mapped)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ── Wheels ────────────────────────────────────────────────────
const Wheels = {

  async getAll() {
    const { data, error } = await _supabase
      .from('wheels')
      .select('*, users(name, profile_pics)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getMyWheels(userId) {
    const { data, error } = await _supabase
      .from('wheel_members')
      .select('wheel_id, wheels(*)')
      .eq('user_id', userId)
      .eq('status', 'active');
    if (error) throw error;
    return data.map(row => row.wheels);
  },

  async getMembers(wheelId) {
    const { data, error } = await _supabase
      .from('wheel_members')
      .select('*, users(*)')
      .eq('wheel_id', wheelId)
      .eq('status', 'active');
    if (error) throw error;
    return data.map(row => row.users);
  },

  async create(creatorId, fields) {
    const { data, error } = await _supabase
      .from('wheels')
      .insert({
        creator_id:      creatorId,
        name:            fields.name,
        slug:            fields.slug,
        description:     fields.description,
        category:        fields.category,
        cover_gradient:  fields.coverGradient,
        hex_color:       fields.hexColor,
        deal_commission: fields.dealCommission,
        is_event_wheel:  fields.isEventWheel,
      })
      .select()
      .single();
    if (error) throw error;
    // Auto-join creator
    await _supabase.from('wheel_members').insert({ wheel_id: data.id, user_id: creatorId });
    return data;
  },

  async join(wheelId, userId) {
    const { error } = await _supabase
      .from('wheel_members')
      .upsert({ wheel_id: wheelId, user_id: userId, status: 'active' });
    if (error) throw error;
    // Increment member count
    await _supabase.rpc('increment_member_count', { wheel_id_param: wheelId });
  },

  async isMember(wheelId, userId) {
    const { data } = await _supabase
      .from('wheel_members')
      .select('id')
      .eq('wheel_id', wheelId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    return !!data;
  }
};

// ── Posts ─────────────────────────────────────────────────────
const Posts = {

  async getByWheel(wheelId) {
    const { data, error } = await _supabase
      .from('posts')
      .select('*, users(id, name, profile_pics, job_title)')
      .eq('wheel_id', wheelId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(authorId, fields) {
    const { data, error } = await _supabase
      .from('posts')
      .insert({
        wheel_id:  fields.wheelId,
        author_id: authorId,
        type:      fields.type,
        body:      fields.body,
        photo:     fields.photo || '',
        video:     fields.video || '',
        link:      fields.link  || '',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async like(postId, userId) {
    // Upsert like
    await _supabase.from('post_likes').upsert({ post_id: postId, user_id: userId });
    // Increment like count
    await _supabase.rpc('increment_post_likes', { post_id_param: postId });
  },

  async unlike(postId, userId) {
    await _supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    await _supabase.rpc('decrement_post_likes', { post_id_param: postId });
  }
};

// ── Opportunities ─────────────────────────────────────────────
const Opportunities = {

  async getAll(filters = {}) {
    let q = _supabase
      .from('opportunities')
      .select('*, users(id, name, profile_pics, job_title)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    if (filters.type && filters.type !== 'all') q = q.eq('type', filters.type);
    if (filters.q) q = q.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  async create(creatorId, fields) {
    const { data, error } = await _supabase
      .from('opportunities')
      .insert({
        creator_id:  creatorId,
        wheel_ids:   fields.wheelIds,
        type:        fields.type,
        title:       fields.title,
        description: fields.description,
        skills:      fields.skills,
        location:    fields.location,
        remote_ok:   fields.remoteOk,
        metadata:    fields.metadata,
        expires_at:  fields.expiresAt,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ── Deals ─────────────────────────────────────────────────────
const Deals = {

  async getMyDeals(userId) {
    const { data, error } = await _supabase
      .from('deals')
      .select('*, buyer:users!buyer_id(id,name,profile_pics), seller:users!seller_id(id,name,profile_pics)')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(dealId) {
    const { data, error } = await _supabase
      .from('deals')
      .select('*, buyer:users!buyer_id(*), seller:users!seller_id(*), deal_messages(*, users(id,name,profile_pics))')
      .eq('id', dealId)
      .single();
    if (error) throw error;
    return data;
  },

  async create(buyerId, fields) {
    const { data, error } = await _supabase
      .from('deals')
      .insert({
        buyer_id:     buyerId,
        seller_id:    fields.sellerId,
        wheel_id:     fields.wheelId || null,
        title:        fields.title,
        scope:        fields.scope,
        price_cents:  fields.priceCents,
        currency:     fields.currency || 'USD',
        payment_type: fields.paymentType,
        deliverables: fields.deliverables,
        start_date:   fields.startDate || null,
        end_date:     fields.endDate || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(dealId, status) {
    const { data, error } = await _supabase
      .from('deals')
      .update({ status })
      .eq('id', dealId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateDeliverables(dealId, deliverables) {
    const { data, error } = await _supabase
      .from('deals')
      .update({ deliverables })
      .eq('id', dealId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async sendMessage(dealId, senderId, body) {
    const { data, error } = await _supabase
      .from('deal_messages')
      .insert({ deal_id: dealId, sender_id: senderId, body })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Subscribe to real-time deal messages
  subscribeToMessages(dealId, callback) {
    return _supabase
      .channel(`deal-messages-${dealId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'deal_messages',
        filter: `deal_id=eq.${dealId}`
      }, payload => callback(payload.new))
      .subscribe();
  }
};

// ── Events ────────────────────────────────────────────────────
const Events = {

  async getByWheel(wheelId) {
    const { data, error } = await _supabase
      .from('events')
      .select('*')
      .eq('wheel_id', wheelId)
      .order('event_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(creatorId, fields) {
    const { data, error } = await _supabase
      .from('events')
      .insert({
        wheel_id:     fields.wheelId,
        creator_id:   creatorId,
        title:        fields.title,
        description:  fields.description,
        event_date:   fields.date,
        event_time:   fields.time,
        location:     fields.location,
        ticket_price: fields.ticketPrice,
        ticket_count: fields.ticketCount,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async buyTicket(eventId) {
    const { data, error } = await _supabase.rpc('buy_event_ticket', { event_id_param: eventId });
    if (error) throw error;
    return data;
  }
};

// ── Notifications ─────────────────────────────────────────────
const Notifications = {

  async getMyNotifs(userId) {
    const { data, error } = await _supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  async send(userId, type, text, extraData = {}) {
    const { error } = await _supabase
      .from('notifications')
      .insert({ user_id: userId, type, text, data: extraData });
    if (error) throw error;
  },

  async markAllRead(userId) {
    const { error } = await _supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;
  },

  // Real-time: listen for new notifications
  subscribe(userId, callback) {
    return _supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, payload => callback(payload.new))
      .subscribe();
  }
};

// ── Storage ───────────────────────────────────────────────────
const Storage = {

  async uploadFile(bucket, path, file) {
    const { data, error } = await _supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    if (error) throw error;
    // Return public URL
    const { data: { publicUrl } } = _supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  },

  // Upload profile picture — returns public URL
  async uploadAvatar(userId, file) {
    const ext  = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    return this.uploadFile('avatars', path, file);
  },

  // Upload one of the 5 profile photos
  async uploadProfilePhoto(userId, slotIndex, file) {
    const ext  = file.name.split('.').pop();
    const path = `${userId}/photo_${slotIndex}.${ext}`;
    return this.uploadFile('avatars', path, file);
  },

  // Upload intro video
  async uploadIntroVideo(userId, file) {
    const ext  = file.name.split('.').pop();
    const path = `${userId}/intro.${ext}`;
    return this.uploadFile('avatars', path, file);
  },

  // Upload resume
  async uploadResume(userId, file) {
    const ext  = file.name.split('.').pop();
    const path = `${userId}/resume.${ext}`;
    return this.uploadFile('resumes', path, file);
  },

  // Upload post photo
  async uploadPostPhoto(postId, file) {
    const ext  = file.name.split('.').pop();
    const path = `${postId}/photo.${ext}`;
    return this.uploadFile('post-media', path, file);
  },

  // Upload post video
  async uploadPostVideo(postId, file) {
    const ext  = file.name.split('.').pop();
    const path = `${postId}/video.${ext}`;
    return this.uploadFile('post-media', path, file);
  }
};

// ================================================================
// 4. SUPABASE STORE — drop-in replacement for localStorage Store
//    This wraps the API calls with the same interface your
//    existing script.js uses, so you can swap gradually.
// ================================================================
const SupabaseStore = {

  _currentUser: null,
  _profile:     null,

  // Call once on page load
  async init() {
    const user = await Auth.getUser();
    if (user) {
      this._currentUser = user;
      this._profile = await Users.getById(user.id);
    }
    // Listen for auth changes
    Auth.onAuthChange(async (user) => {
      this._currentUser = user;
      this._profile = user ? await Users.getById(user.id) : null;
    });
    return this._profile;
  },

  getMe() { return this._profile; },
  isLoggedIn() { return !!this._currentUser; },

  async login(email, password) {
    const user = await Auth.signIn(email, password);
    this._currentUser = user;
    this._profile = await Users.getById(user.id);
    return this._profile;
  },

  async logout() {
    await Auth.signOut();
    this._currentUser = null;
    this._profile = null;
  },

  async updateMe(fields) {
    if (!this._currentUser) return;
    this._profile = await Users.updateProfile(this._currentUser.id, fields);
    return this._profile;
  },

  async getMyWheels() {
    if (!this._currentUser) return [];
    return Wheels.getMyWheels(this._currentUser.id);
  },

  async joinWheel(wheelId) {
    if (!this._currentUser) return;
    await Wheels.join(wheelId, this._currentUser.id);
  },

  async isMember(wheelId) {
    if (!this._currentUser) return false;
    return Wheels.isMember(wheelId, this._currentUser.id);
  },

  async createWheel(fields) {
    if (!this._currentUser) return;
    return Wheels.create(this._currentUser.id, fields);
  },

  async getOpportunities(filters = {}) {
    return Opportunities.getAll(filters);
  },

  async createOpportunity(fields) {
    if (!this._currentUser) return;
    return Opportunities.create(this._currentUser.id, fields);
  },

  async getMyDeals() {
    if (!this._currentUser) return [];
    return Deals.getMyDeals(this._currentUser.id);
  },

  async createDeal(fields) {
    if (!this._currentUser) return;
    return Deals.create(this._currentUser.id, fields);
  },

  async updateDeal(dealId, fields) {
    if (fields.status) return Deals.updateStatus(dealId, fields.status);
    if (fields.deliverables) return Deals.updateDeliverables(dealId, fields.deliverables);
  },

  async addDealMessage(dealId, body) {
    if (!this._currentUser) return;
    return Deals.sendMessage(dealId, this._currentUser.id, body);
  },

  async getPosts(wheelId) {
    return Posts.getByWheel(wheelId);
  },

  async createPost(fields) {
    if (!this._currentUser) return;
    return Posts.create(this._currentUser.id, fields);
  },

  async likePost(postId) {
    if (!this._currentUser) return;
    return Posts.like(postId, this._currentUser.id);
  },

  async getMyNotifs() {
    if (!this._currentUser) return [];
    return Notifications.getMyNotifs(this._currentUser.id);
  },

  async addNotif(userId, type, text) {
    return Notifications.send(userId, type, text);
  },

  async markNotifsRead() {
    if (!this._currentUser) return;
    return Notifications.markAllRead(this._currentUser.id);
  },

  async uploadProfilePhoto(slotIndex, file) {
    if (!this._currentUser) return '';
    const url = await Storage.uploadProfilePhoto(this._currentUser.id, slotIndex, file);
    const pics = [...(this._profile?.profile_pics || [])];
    pics[slotIndex] = url;
    await this.updateMe({ profilePics: pics });
    return url;
  },

  async uploadIntroVideo(file) {
    if (!this._currentUser) return '';
    const url = await Storage.uploadIntroVideo(this._currentUser.id, file);
    await this.updateMe({ introVideo: url });
    return url;
  },

  async uploadResume(file) {
    if (!this._currentUser) return '';
    const url = await Storage.uploadResume(this._currentUser.id, file);
    await this.updateMe({ resume: url });
    return url;
  }
};

// ================================================================
// 5. REAL-TIME SUBSCRIPTIONS
// ================================================================
const Realtime = {
  _channels: [],

  // Subscribe to new notifications for current user
  subscribeToNotifications(userId, onNew) {
    const ch = Notifications.subscribe(userId, onNew);
    this._channels.push(ch);
    return ch;
  },

  // Subscribe to deal messages
  subscribeToDealMessages(dealId, onNew) {
    const ch = Deals.subscribeToMessages(dealId, onNew);
    this._channels.push(ch);
    return ch;
  },

  // Unsubscribe all
  unsubscribeAll() {
    this._channels.forEach(ch => _supabase.removeChannel(ch));
    this._channels = [];
  }
};

// ================================================================
// 6. SQL FUNCTIONS TO ADD IN SUPABASE SQL EDITOR
//    (These support the RPC calls above)
// ================================================================
/*
-- Run these in Supabase SQL Editor:

create or replace function increment_member_count(wheel_id_param uuid)
returns void as $$
  update public.wheels set member_count = member_count + 1 where id = wheel_id_param;
$$ language sql security definer;

create or replace function increment_post_likes(post_id_param uuid)
returns void as $$
  update public.posts set likes = likes + 1 where id = post_id_param;
$$ language sql security definer;

create or replace function decrement_post_likes(post_id_param uuid)
returns void as $$
  update public.posts set likes = greatest(likes - 1, 0) where id = post_id_param;
$$ language sql security definer;

create or replace function buy_event_ticket(event_id_param uuid)
returns boolean as $$
declare
  remaining int;
begin
  select ticket_count - tickets_sold into remaining
  from public.events where id = event_id_param;
  if remaining > 0 then
    update public.events set tickets_sold = tickets_sold + 1 where id = event_id_param;
    return true;
  end if;
  return false;
end;
$$ language plpgsql security definer;
*/

// Expose everything globally
window.SupabaseStore = SupabaseStore;
window.Auth          = Auth;
window.Users         = Users;
window.Wheels        = Wheels;
window.Posts         = Posts;
window.Opportunities = Opportunities;
window.Deals         = Deals;
window.Events        = Events;
window.Notifications = Notifications;
window.Storage       = Storage;
window.Realtime      = Realtime;

console.log('Fairriss Supabase layer loaded.');
