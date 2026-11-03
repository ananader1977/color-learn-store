(function(){'use strict';
const el=document.getElementById('installCard'),button=document.getElementById('installAction'),heading=document.getElementById('installTitle'),desc=document.getElementById('installDesc'),osLabel=document.getElementById('installOS');
if(!el||!button)return;
let pending=null;
const isiOS=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),isMac=/Macintosh|Mac OS X/i.test(navigator.userAgent)&&!isiOS,isAndroid=/Android/i.test(navigator.userAgent),isWindows=/Windows/i.test(navigator.userAgent);
const os=isiOS?'iOS / iPadOS':isAndroid?'Android':isWindows?'Windows':isMac?'macOS':'Desktop';
const installed=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const loc=()=>document.documentElement.lang==='en'?'en':'ar';
const copy={en:{title:'Install Color & Learn',description:'Use the bookstore like an app on your device.',install:'Install app',steps:'How to install',installed:'App already installed',ios:'Open this page in Safari, tap Share, then Add to Home Screen.',mac:'Open this page in Safari: File → Add to Dock. Or use Chrome menu → Cast, save, and share → Install page as app.',android:'In Chrome, tap ⋮ and choose Install app or Add to Home screen.',windows:'In Edge or Chrome, open the menu and choose Apps → Install this site as an app (or Install Color & Learn).',other:'Open this site in a supported browser and use its Install app option.',dismiss:'Dismiss'},ar:{title:'ثبّت تطبيق لون وتعلّم',description:'استخدم متجر الكتب كتطبيق على جهازك.',install:'تثبيت التطبيق',steps:'طريقة التثبيت',installed:'التطبيق مثبت بالفعل',ios:'افتح الصفحة باستخدام Safari واضغط مشاركة ثم إضافة إلى الشاشة الرئيسية.',mac:'في Safari اختر File ثم Add to Dock، أو من قائمة Chrome اختر تثبيت الصفحة كتطبيق.',android:'في Chrome اضغط ⋮ ثم تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية.',windows:'في Edge أو Chrome افتح القائمة ثم Apps ثم Install this site as an app.',other:'افتح هذا الموقع في متصفح متوافق واختر تثبيت التطبيق.',dismiss:'إغلاق'}};
function refresh(){const c=copy[loc()];osLabel.textContent=os;heading.textContent=installed()?c.installed:c.title;desc.textContent=c.description;button.textContent=pending?c.install:c.steps;button.disabled=installed();el.hidden=installed()||sessionStorage.getItem('cl-install-dismissed')==='1'}
button.addEventListener('click',async()=>{if(pending){const prompt=pending;pending=null;prompt.prompt();try{await prompt.userChoice}catch{}refresh();return}const c=copy[loc()];desc.textContent=isiOS?c.ios:isMac?c.mac:isAndroid?c.android:isWindows?c.windows:c.other});
document.getElementById('installDismiss').onclick=()=>{sessionStorage.setItem('cl-install-dismissed','1');el.hidden=true};
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();pending=event;refresh()});
window.addEventListener('appinstalled',()=>{pending=null;refresh()});
new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
refresh();
if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{}));
})();