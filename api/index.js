const { createClient } = require('@supabase/supabase-js')
const { put, del } = require('@vercel/blob')

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function client(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  return createClient(supabaseUrl, supabaseKey, { global: { headers: token ? { Authorization: `Bearer ${token}` } : {} } })
}
async function userFor(req) {
  const { data, error } = await client(req).auth.getUser()
  if (error || !data.user) throw new Error('UNAUTHORIZED')
  return data.user
}
function json(res, status, body) { res.status(status).json({ status_code: status, ...body }) }
function body(req) { return new Promise((resolve, reject) => { let raw=''; req.on('data', c => raw += c); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}) } catch { reject(new Error('INVALID_JSON')) } }) }) }
function path(req) { return new URL(req.url, `https://${req.headers.host || 'localhost'}`).pathname.replace(/^\/api\/?/, '') }
function profileShape(row) { return { ...row, profile_picture: row.profile_picture || null } }

async function register(req, res) {
  const input = await body(req)
  const email = String(input.email || '').trim().toLowerCase(); const password = String(input.password || '')
  if (!email || password.length < 6) return json(res, 400, { message: 'Email and password are required.' })
  const { data, error } = await client(req).auth.signUp({ email, password, options: { data: { first_name: input.first_name || null, last_name: input.last_name || null } } })
  if (error) return json(res, 400, { message: error.message })
  return json(res, 201, { token: { access_token: data.session?.access_token || '' }, user: data.user })
}
async function login(req, res) {
  const input = await body(req); const { data, error } = await client(req).auth.signInWithPassword({ email: input.username || input.email, password: input.password })
  if (error || !data.session) return json(res, 401, { message: 'Invalid email or password.' })
  json(res, 200, { access_token: data.session.access_token, refresh_token: data.session.refresh_token, token_type: 'bearer' })
}
async function profile(req, res) {
  const user = await userFor(req); const supabase = client(req)
  if (req.method === 'GET') { const { data, error } = await supabase.from('liebena_profiles').select('*').eq('id', user.id).single(); if (error) return json(res, 404, { message: 'Profile not found.' }); return json(res, 200, { user: profileShape(data) }) }
  const input = await body(req); const { data, error } = await supabase.from('liebena_profiles').upsert({ id: user.id, email: user.email, first_name: input.first_name, last_name: input.last_name, passion: input.passion, phone_number: input.phone_number, birth_date: input.birth_date, gender: input.gender, bio: input.bio, updated_at: new Date().toISOString() }).select().single(); if (error) return json(res, 400, { message: error.message }); return json(res, 200, { user: profileShape(data), message: 'Profile updated.' })
}
async function users(req, res) { const user = await userFor(req); const { data, error } = await client(req).from('liebena_profiles').select('*').neq('id', user.id).order('created_at', { ascending: false }); if (error) return json(res, 400, { message: error.message }); json(res, 200, { result: data.map(profileShape) }) }
async function matches(req, res) { const user = await userFor(req); const supabase = client(req); if (req.method === 'POST') { const input = await body(req); const { data: target } = await supabase.from('liebena_profiles').select('id').eq('email', input.match).single(); if (!target) return json(res, 404, { message: 'User not found.' }); const { error } = await supabase.from('liebena_matches').upsert([{ user_id: user.id, matched_user_id: target.id }, { user_id: target.id, matched_user_id: user.id }], { onConflict: 'user_id,matched_user_id' }); if (error) return json(res, 400, { message: error.message }); return json(res, 201, { message: 'Match created.' }) } const { data, error } = await supabase.from('liebena_matches').select('matched_user_id, liebena_profiles:matched_user_id(*)').eq('user_id', user.id); if (error) return json(res, 400, { message: error.message }); json(res, 200, { result: (data || []).map(x => profileShape(x.liebena_profiles)) }) }
async function messages(req, res) { const user = await userFor(req); const supabase = client(req); if (req.method === 'POST') { const input = await body(req); const receiverId = String(input.receiver_id || '');
    const { data: receiver } = await supabase.from('liebena_profiles').select('id').or(`id.eq.${receiverId},email.eq.${receiverId}`).maybeSingle();
    if (!receiver || receiver.id === user.id) return json(res, 400, { message: 'A valid conversation recipient is required.' });
    const messageType = input.type === 'media' ? 'image' : (input.type || 'text');
    const { data, error } = await supabase.from('liebena_messages').insert({ sender_id: user.id, receiver_id: receiver.id, content: input.content || null, message_type: messageType, media_pathname: input.media_pathname || null }).select().single(); if (error) return json(res, 400, { message: error.message }); return json(res, 201, { result: data }) } const receiverKey = new URL(req.url, 'https://localhost').searchParams.get('receiver_id') || new URL(req.url, 'https://localhost').searchParams.get('receiver'); let query = supabase.from('liebena_messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at'); if (receiverKey) { const { data: receiver } = await supabase.from('liebena_profiles').select('id').or(`id.eq.${receiverKey},email.eq.${receiverKey}`).maybeSingle(); if (!receiver) return json(res, 200, { result: [] }); query = supabase.from('liebena_messages').select('*').or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiver.id}),and(sender_id.eq.${receiver.id},receiver_id.eq.${user.id})`).order('created_at'); } const { data, error } = await query; if (error) return json(res, 400, { message: error.message }); json(res, 200, { result: data || [] }) }
async function upload(req, res) { const user = await userFor(req); if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed.' }); const input = await body(req); const contentType = String(input.content_type || ''); const size = Number(input.size_bytes || 0); if (!/^image\/(jpeg|png|webp|gif)$/.test(contentType) || size <= 0 || size > 8 * 1024 * 1024) return json(res, 400, { message: 'Invalid image.' }); const pathname = `liebena/${user.id}/${crypto.randomUUID()}`; const blob = await put(pathname, Buffer.from(input.base64, 'base64'), { access: 'public', contentType }); const { error } = await client(req).from('liebena_profile_photos').insert({ user_id: user.id, pathname: blob.pathname, url: blob.url, content_type: contentType, size_bytes: size }); if (error) { await del(blob.url); return json(res, 400, { message: error.message }) } await client(req).from('liebena_profiles').update({ profile_picture: blob.url }).eq('id', user.id); json(res, 200, { url: blob.url, pathname: blob.pathname, message: 'Profile image updated.' }) }

module.exports = async function handler(req, res) { try { const p = path(req); if (p === 'auth/register') return register(req,res); if (p === 'auth/login') return login(req,res); if (p === 'auth/logout') return json(res,200,{message:'Logged out.'}); if (p === 'user/profile') return profile(req,res); if (p === 'user/all') return users(req,res); if (p === 'matches') return matches(req,res); if (p === 'messages' || p === 'message' || p === 'message/users') return messages(req,res); if (p === 'user/profile-image') return upload(req,res); return json(res,404,{message:'API route not found.'}) } catch (error) { if (error.message === 'UNAUTHORIZED') return json(res,401,{message:'Authentication required.'}); if (error.message === 'INVALID_JSON') return json(res,400,{message:'Invalid request.'}); console.error('[v0] API error', error); return json(res,500,{message:'Unexpected server error.'}) } }
