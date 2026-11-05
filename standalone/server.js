'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),PORT=Number(process.env.PORT||10000),MAX=18*1024*1024;
const SECRET=process.env.DOWNLOAD_SIGNING_SECRET||'',ADMIN=process.env.ADMIN_UPLOAD_KEY||'',TEST=process.env.TEST_ACCESS_CODE||'';
const DATA=process.env.DATA_DIR||'/tmp/color-learn-data';
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'};
fs.mkdirSync(DATA,{recursive:true});
const filesDir=path.join(DATA,'protected'),ordersDir=path.join(DATA,'orders');
fs.mkdirSync(filesDir,{recursive:true});fs.mkdirSync(ordersDir,{recursive:true});
const timingEq=(a,b)=>{a=Buffer.from(String(a||''));b=Buffer.from(String(b||''));return a.length===b.length&&crypto.timingSafeEqual(a,b)};
const json=(res,status,data)=>{const body=JSON.stringify(data);res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'"});res.end(body)};
const readBody=req=>new Promise((resolve,reject)=>{const pieces=[];let count=0;req.on('data',c=>{count+=c.length;if(count>MAX){reject(new Error('Request too large'));req.destroy();return}pieces.push(c)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(pieces).toString('utf8')))}catch(e){reject(new Error('Invalid JSON'))}});req.on('error',reject)});
const validProduct=id=>/^(ar|en)-[0-9]+-(3-5|5-8)$/.test(id)||/^bundle-[0-9]+-(3-5|5-8)$/.test(id);
const filePath=id=>path.join(filesDir,id+'.pdf');
const sign=(order,id,email,exp)=>crypto.createHmac('sha256',SECRET).update([order,id,email,exp].join('|')).digest('hex');
const baseUrl=req=>(process.env.PUBLIC_BASE_URL||('https://'+req.headers.host)).replace(/\/$/,'');
// Stateless HMAC links survive loss of ephemeral order JSON records.
const signLink=(order,id,exp)=>crypto.createHmac('sha256',SECRET).update(['v2',order,id,exp].join('|')).digest('hex');
const lookup=(order,id,exp,sig,version)=>{
 if(!SECRET||!/^[-\w]{10,80}$/.test(order)||!validProduct(id)||!/^\d{10,14}$/.test(exp))return {error:'invalid'};
 if(Number(exp)<Math.floor(Date.now()/1000))return {error:'expired'};
 if(version==='2')return timingEq(sig,signLink(order,id,exp))?{valid:true}:{error:'invalid'};
 const fname=path.join(ordersDir,order+'.json');
 if(!fs.existsSync(fname))return {error:'order_missing'};
 const record=JSON.parse(fs.readFileSync(fname));
 return record.products.includes(id)&&timingEq(sig,sign(order,id,record.email,exp))?{valid:true}:{error:'invalid'};
};
const limiter=new Map();function limit(req){const ip=(req.socket.remoteAddress||'local');const now=Date.now();const old=limiter.get(ip)||[];const latest=old.filter(t=>now-t<60000);if(latest.length>15)return false;latest.push(now);limiter.set(ip,latest);return true}
const sendEmail=async(to,order,links)=>{const key=process.env.RESEND_API_KEY,from=process.env.EMAIL_FROM;if(!key||!from)return {sent:false,reason:'Email provider is not configured (RESEND_API_KEY and EMAIL_FROM are required).'};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const list=links.map(x=>'<li><a href="'+esc(x.url)+'">'+esc(x.name)+'</a></li>').join('');
 const html='<h2>Color & Learn — TEST delivery only</h2><p>This is a simulated test order. No money has been charged. Download links are valid for 24 hours while protected files are hosted. For small purchases, the PDFs are also attached to this email, because free Render may erase uploads on restart:</p><ul>'+list+'</ul><p>هذه رسالة اختبار، ولم يتم تحصيل أي مبلغ.</p><p>Order: '+esc(order)+'</p>';
 const payload={from,to:[to],subject:'[TEST — NO CHARGE] Color & Learn PDF download — '+order,html};
// Email a small PDF attachment as fallback if free Render loses uploaded files.
let attachmentBytes=0;const attachments=[];
for(const link of links){const fp=filePath(link.id);if(!fs.existsSync(fp))continue;const size=fs.statSync(fp).size;
if(attachmentBytes+size>8*1024*1024)break;attachmentBytes+=size;
attachments.push({filename:link.id+'.pdf',content:fs.readFileSync(fp).toString('base64')});}
if(attachments.length)payload.attachments=attachments;
 const merchant='ananader2026@hotmail.com';
 if(process.env.COPY_MERCHANT_EMAIL==='true'&&to.toLowerCase()!==merchant)payload.bcc=[merchant];
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+key},body:JSON.stringify(payload),signal:AbortSignal.timeout(14000)});
 const body=await response.json().catch(()=>({}));
 if(!response.ok)return {sent:false,reason:'Email provider rejected the message',providerStatus:response.status};
 return {sent:true,messageId:body.id||null};
};
const sendFile=(res,filepath,name,type)=>{const stat=fs.statSync(filepath);res.writeHead(200,{'content-type':type,'content-length':stat.size,'content-disposition':'attachment; filename="'+name.replace(/[^a-zA-Z0-9._-]/g,'_')+'"','cache-control':'private, no-store','x-content-type-options':'nosniff'});fs.createReadStream(filepath).pipe(res)};
const serveStatic=(req,res,url)=>{let requested=decodeURIComponent(url.pathname);if(requested==='/')requested='/index.html';const absolute=path.resolve(ROOT,'.'+requested);if(!absolute.startsWith(ROOT+path.sep)||absolute.includes(path.sep+'standalone'+path.sep)&&!absolute.endsWith('checkout.html')||path.basename(absolute).startsWith('.'))return json(res,404,{error:'Not found'});const ext=path.extname(absolute).toLowerCase();if(!MIME[ext]||!fs.existsSync(absolute)||!fs.statSync(absolute).isFile())return json(res,404,{error:'Not found'});const stat=fs.statSync(absolute);res.writeHead(200,{'content-type':MIME[ext],'content-length':stat.size,'cache-control':'public, max-age=90','x-content-type-options':'nosniff'});fs.createReadStream(absolute).pipe(res)};
const handler=async(req,res)=>{const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/health')return json(res,200,{ok:true,mode:'TEST_ONLY',livePayments:false,emailConfigured:!!(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM),storage:'ephemeral unless persistent DATA_DIR disk configured',protectedBooks:fs.readdirSync(filesDir).filter(f=>f.endsWith('.pdf')).length});
 if(url.pathname==='/api/admin/upload'&&req.method==='POST'){
   if(!ADMIN||!timingEq(req.headers.authorization, 'Bearer '+ADMIN))return json(res,403,{error:'Admin authorization required'});
   const body=await readBody(req);const id=body.productId;
   if(!validProduct(id)||typeof body.base64!=='string'||body.base64.length>MAX*1.4)return json(res,400,{error:'Invalid product or upload'});
   const bytes=Buffer.from(body.base64,'base64');if(bytes.length<20||bytes.length>MAX||bytes.toString('latin1',0,5)!=='%PDF-')return json(res,400,{error:'Only PDF files up to 18 MB'});
   const target=filePath(id);fs.writeFileSync(target,bytes,{mode:0o600});return json(res,200,{ok:true,productId:id,bytes:bytes.length,persisted:!!process.env.PERSISTENT_STORAGE});
 }
 if(url.pathname==='/api/admin/status'&&req.method==='GET'){
  if(!ADMIN||!timingEq(req.headers.authorization,'Bearer '+ADMIN))return json(res,403,{error:'Admin authorization required'});
  return json(res,200,{files:fs.readdirSync(filesDir).filter(f=>f.endsWith('.pdf')).map(x=>x.slice(0,-4)),emailConfigured:!!(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM),persistent:!!process.env.PERSISTENT_STORAGE});
 }
 if(url.pathname==='/api/test/checkout'&&req.method==='POST'){
   if(!limit(req))return json(res,429,{error:'Too many attempts'});
   if(!SECRET||!TEST)return json(res,503,{error:'Test checkout is not configured'});
   const body=await readBody(req);
   if(!timingEq(body.testCode,TEST))return json(res,403,{error:'Incorrect test access code'});
   const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return json(res,400,{error:'Valid email is required'});
   const items=Array.isArray(body.items)?body.items:[];
   if(!items.length||items.length>20||items.some(x=>!validProduct(x.id)||!Number.isInteger(x.qty)||x.qty<1||x.qty>20))return json(res,400,{error:'Invalid cart'});
   const ids=[...new Set(items.map(x=>x.id))];
   const missing=ids.filter(id=>!fs.existsSync(filePath(id)));
   if(missing.length)return json(res,409,{error:'Private PDFs not yet uploaded for these products.',missing});
   const order=crypto.randomBytes(14).toString('hex'),exp=Math.floor(Date.now()/1000)+24*3600;
   const record={order,email,products:ids,createdAt:new Date().toISOString(),status:'SIMULATED_TEST_ONLY'};
   fs.writeFileSync(path.join(ordersDir,order+'.json'),JSON.stringify(record),{mode:0o600});
   const links=ids.map(id=>({id,name:id+'.pdf',url:baseUrl(req)+'/api/download?order='+order+'&product='+id+'&exp='+exp+'&v=2&sig='+signLink(order,id,exp)}));
   let delivery;try{delivery=await sendEmail(email,order,links)}catch(e){delivery={sent:false,reason:'Email sending failed; check service logs and credentials.'}};
   return json(res,200,{ok:true,order,payment:'SIMULATED_TEST_ONLY',charged:false,expiresInMinutes:1440,links,email:delivery});
 }
 if(url.pathname==='/api/download'&&req.method==='GET'){
   const order=url.searchParams.get('order')||'',id=url.searchParams.get('product')||'',exp=url.searchParams.get('exp')||'',sig=url.searchParams.get('sig')||'';
   const access=lookup(order,id,exp,sig,url.searchParams.get('v')||'');if(!access.valid)return json(res,403,{error:access.error==='expired'?'Download link expired after 24 hours':access.error==='order_missing'?'Previous test order vanished in free Render storage; create a new test order.':'Invalid download link',reason:access.error});
   const fp=filePath(id);if(!fs.existsSync(fp))return json(res,410,{error:'PDF file vanished after a free Render restart or redeploy; reupload the PDF and create a new test order'});
   return sendFile(res,fp,id+'.pdf','application/pdf');
 }
 if(req.method==='GET'||req.method==='HEAD')return serveStatic(req,res,url);
 return json(res,405,{error:'Method not allowed'});
};
http.createServer((req,res)=>Promise.resolve(handler(req,res)).catch(err=>{console.error('request error',err.message);if(!res.headersSent)json(res,500,{error:'Internal error'})})).listen(PORT,'0.0.0.0',()=>console.log('Color & Learn TEST ONLY on '+PORT));