#!/bin/bash
set -e
APP="/home/ec2-user/apkaai"
TOKEN="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"

echo "=== Pull latest ==="
cd "$APP"
git remote set-url origin "https://${TOKEN}@github.com/apkaai/apkaai.git"
git fetch origin && git reset --hard origin/main
echo "  $(git log --oneline -1)"

echo ""
echo "=== Fix payment.js ==="
node --check "$APP/backend/src/routes/payment.js" 2>/dev/null || {
cat > "$APP/backend/src/routes/payment.js" << 'EOF'
const express=require('express'),router=express.Router(),crypto=require('crypto'),Razorpay=require('razorpay'),{query}=require('../lib/db'),{sendEmail}=require('../services/emailService')
function getRazorpay(){const k=process.env.RAZORPAY_KEY_ID,s=process.env.RAZORPAY_KEY_SECRET;if(!k||!s)throw new Error('Razorpay keys not configured');return new Razorpay({key_id:k,key_secret:s})}
function verifyToken(t){try{const[p,s]=t.split('.');const e=process.env.JWT_SECRET||'apkaai-jwt-secret-2026';const x=crypto.createHmac('sha256',e).update(p).digest('hex').slice(0,32);if(s!==x)return null;return JSON.parse(Buffer.from(p,'base64url').toString())}catch{return null}}
function requireAuth(req,res,next){const a=req.headers.authorization;if(!a?.startsWith('Bearer '))return res.status(401).json({error:'Not authenticated'});const d=verifyToken(a.split(' ')[1]);if(!d)return res.status(401).json({error:'Invalid token'});req.user=d;next()}
router.post('/create-order',requireAuth,async(req,res,next)=>{try{const{orderId}=req.body;if(!orderId)return res.status(400).json({error:'orderId required'});const r=await query('SELECT * FROM orders WHERE order_id=$1 AND user_id=$2',[orderId,req.user.userId]);if(!r.rowCount)return res.status(404).json({error:'Not found'});const o=r.rows[0];if(o.status==='completed')return res.status(400).json({error:'Already paid'});const p=Math.round(Number(o.total)*100);if(p<100)return res.status(400).json({error:'Too low'});const rzp=getRazorpay();const ro=await rzp.orders.create({amount:p,currency:'INR',receipt:`apkaai_${o.order_id.slice(0,16)}`});await query('UPDATE orders SET payment_id=$1,updated_at=NOW() WHERE order_id=$2',[ro.id,o.order_id]);res.json({success:true,razorpayOrderId:ro.id,amount:ro.amount,currency:'INR',keyId:process.env.RAZORPAY_KEY_ID,prefill:{name:req.user.name||'',email:req.user.email||''}})}catch(err){if(err.message?.includes('Razorpay keys not configured'))return res.status(503).json({error:err.message});next(err)}})
router.post('/verify',requireAuth,async(req,res,next)=>{try{const{razorpayOrderId,razorpayPaymentId,razorpaySignature,orderId}=req.body;if(!razorpayOrderId||!razorpayPaymentId||!razorpaySignature||!orderId)return res.status(400).json({error:'All fields required'});const exp=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET||'').update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');if(exp!==razorpaySignature)return res.status(400).json({error:'Mismatch'});const u=await query("UPDATE orders SET status='completed',payment_id=$1,updated_at=NOW() WHERE order_id=$2 AND user_id=$3 RETURNING *",[razorpayPaymentId,orderId,req.user.userId]);if(!u.rowCount)return res.status(404).json({error:'Not found'});res.json({success:true,orderId,paymentId:razorpayPaymentId,status:'completed'})}catch(err){next(err)}})
router.post('/webhook',express.raw({type:'application/json'}),async(req,res)=>{res.json({received:true})})
router.get('/config',(req,res)=>{const k=process.env.RAZORPAY_KEY_ID;if(!k)return res.status(503).json({error:'Not configured'});res.json({keyId:k,currency:'INR'})})
router.get('/plans',(req,res)=>{res.json({plans:[]})})
module.exports=router
EOF
}

echo ""
echo "=== Apply calendarService hotpatch ==="
cat > "$APP/backend/src/services/calendarService.js" << 'EOF'
const { DateTime } = require('luxon')
function buildDateTimeRange(slotDate, slotTime, timezone, durationMinutes) {
  const tz=timezone||'Asia/Kolkata', mins=durationMinutes||30
  const timeStr=(slotTime||'10:00:00').replace(/^(\d{2}:\d{2})$/,'$1:00')
  let s=DateTime.fromISO(`${slotDate}T${timeStr}`,{zone:tz})
  if(!s.isValid)s=DateTime.fromISO(`${slotDate}T${timeStr}`,{zone:'UTC'})
  if(!s.isValid)s=DateTime.now().setZone(tz)
  const e=s.plus({minutes:mins})
  const iso=d=>d&&d.isValid?(d.toISO()||new Date().toISOString()):new Date().toISOString()
  return{startIso:iso(s),endIso:iso(e),startUtc:iso(s.toUTC()),endUtc:iso(e.toUTC()),displayTime:s.isValid?s.toFormat('cccc, LLLL d yyyy, h:mm a ZZZZ'):`${slotDate} at ${timeStr}`}
}
async function createGoogleCalendarEvent(booking){
  if(!process.env.GOOGLE_SERVICE_ACCOUNT_JSON){console.warn('[Calendar] No Google SA key');return null}
  try{
    const{google}=require('googleapis')
    const auth=new google.auth.GoogleAuth({credentials:JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),scopes:['https://www.googleapis.com/auth/calendar']})
    const cal=google.calendar({version:'v3',auth})
    const{startIso,endIso}=buildDateTimeRange(booking.slot_date,booking.slot_time,booking.slot_timezone,booking.duration_minutes)
    const ev={summary:`ApkaAI Demo — ${booking.name}`,start:{dateTime:startIso,timeZone:booking.slot_timezone||'Asia/Kolkata'},end:{dateTime:endIso,timeZone:booking.slot_timezone||'Asia/Kolkata'},attendees:[{email:booking.email},{email:process.env.DEMO_HOST_EMAIL||'ashutoshkumarpandey@apkaai.com',organizer:true}],conferenceData:{createRequest:{requestId:`apkaai-${booking.id}`,conferenceSolutionKey:{type:'hangoutsMeet'}}}}
    const r=await cal.events.insert({calendarId:process.env.GOOGLE_CALENDAR_ID||'primary',resource:ev,conferenceDataVersion:1,sendUpdates:'all'})
    const link=r.data.conferenceData?.entryPoints?.find(e=>e.entryPointType==='video')?.uri
    return{eventId:r.data.id,meetingLink:link||r.data.hangoutLink||null}
  }catch(e){console.error('[Calendar] Google error:',e.message);return null}
}
async function createCalendarEvent(booking,calendarType){
  if(calendarType==='google'){const r=await createGoogleCalendarEvent(booking);if(r)return{provider:'google',meetingLink:r.meetingLink,eventId:r.eventId}}
  const f=(process.env.FRONTEND_URL||'https://apkaai.com').replace(/\/$/,'')
  return{provider:'none',meetingLink:`${f}/demo/join/${booking.id}`,eventId:null}
}
function buildCalendarLinks(booking){
  if(!booking||!booking.slot_date||!booking.slot_time)return{googleUrl:'https://calendar.google.com',outlookUrl:'https://outlook.live.com/calendar',office365Url:'https://outlook.office.com/calendar',icsUrl:'',displayTime:'Time to be confirmed'}
  const{startIso,endIso,displayTime}=buildDateTimeRange(booking.slot_date,booking.slot_time,booking.slot_timezone,booking.duration_minutes)
  const l=booking.meeting_link||''
  const t=encodeURIComponent(`ApkaAI Demo — ${booking.name||'Guest'}`)
  const d=encodeURIComponent(`ApkaAI demo\nMeeting: ${l||'(coming)'}`)
  const lo=encodeURIComponent(l||'Online')
  const gs=startIso.replace(/[-:]/g,'').replace('.000','')
  const ge=endIso.replace(/[-:]/g,'').replace('.000','')
  return{googleUrl:`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${t}&dates=${gs}/${ge}&details=${d}&location=${lo}`,outlookUrl:`https://outlook.live.com/calendar/0/deeplink/compose?subject=${t}&startdt=${startIso}&enddt=${endIso}&body=${d}&location=${lo}`,office365Url:`https://outlook.office.com/calendar/0/deeplink/compose?subject=${t}&startdt=${startIso}&enddt=${endIso}&body=${d}&location=${lo}`,icsUrl:'',displayTime}
}
module.exports={createCalendarEvent,buildCalendarLinks,buildDateTimeRange}
EOF

echo ""
echo "=== Restart API ==="
pm2 restart apkaai-api --update-env
sleep 4
curl -sf http://localhost:4000/health && echo "  API: OK" || echo "  API: FAILED"

echo ""
echo "=== Build frontend ==="
cd "$APP/frontend"
npm install --prefer-offline 2>&1 | tail -2
npm run build 2>&1 | tail -8

pm2 restart apkaai-frontend --update-env
sleep 3
curl -sf http://localhost:3000 > /dev/null && echo "  Frontend: UP" || echo "  Frontend: DOWN"
echo "DONE — https://apkaai.com/demo"
