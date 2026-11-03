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

// Cross-platform app download area
const platform=isiOS?'ios':isAndroid?'android':isWindows?'windows':isMac?'mac':'other';
const installText={
en:{nav:'Download app',eyebrow:'Works across devices',title:'Install Color & Learn',summary:'We detect your operating system and show the appropriate installation option.',detected:'Detected device',desc:'Use the install button or follow instructions for your browser.',action:'Install app',ios:'In Safari, tap Share → Add to Home Screen. A signed iOS IPA is not available yet.',android:'Open in Chrome, tap ⋮ → Install app or Add to Home screen. The GitHub APK is a test build, not an official release.',windows:'Use Edge/Chrome menu → Apps → Install this site as an app. No separate EXE is provided.',mac:'Use Safari File → Add to Dock, or Chrome menu → Install page as app.',other:'Use a supported browser to install the app.',helpAndroid:'Install the website using Chrome. A test APK build may be available on GitHub.',helpIos:'Safari: Share → Add to Home Screen. Signed IPA is not yet available.',helpWindows:'Install the website as an app from Edge or Chrome. No separate EXE required.',helpMac:'Safari: Add to Dock, or install through Chrome.',btnAndroid:'Install on Android',btnIos:'Install on Apple',btnWindows:'Install on Windows',btnMac:'Install on Mac',apk:'Get test APK from GitHub (sign-in required)',installed:'Already installed on this device.'},
ar:{nav:'تحميل التطبيق',eyebrow:'متاح على أجهزتك',title:'حمّل تطبيق لون وتعلّم',summary:'نكتشف نظام تشغيل جهازك ونعرض طريقة التثبيت المناسبة.',detected:'الجهاز المكتشف',desc:'اضغط تثبيت أو اتبع الخطوات في المتصفح.',action:'تثبيت التطبيق',ios:'في Safari اضغط مشاركة ثم إضافة إلى الشاشة الرئيسية. ملف IPA موقّع غير متاح حتى الآن.',android:'افتح الموقع في Chrome واضغط ⋮ ثم تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية. APK من GitHub إصدار تجريبي فقط.',windows:'من Edge أو Chrome اختر التطبيقات ثم تثبيت الموقع كتطبيق، دون الحاجة إلى ملف EXE.',mac:'في Safari اختر File ثم Add to Dock، أو ثبّت من Chrome.',other:'استخدم متصفحاً متوافقاً لتثبيت التطبيق.',helpAndroid:'ثبّت الموقع عبر Chrome. قد تتوفر نسخة APK تجريبية عبر GitHub.',helpIos:'من Safari: مشاركة ثم إضافة إلى الشاشة الرئيسية. لا توجد نسخة IPA موقّعة بعد.',helpWindows:'ثبّت الموقع كتطبيق عبر Edge أو Chrome، دون ملف EXE.',helpMac:'من Safari اختر إضافة إلى Dock، أو استخدم Chrome.',btnAndroid:'تثبيت على Android',btnIos:'تثبيت على Apple',btnWindows:'تثبيت على Windows',btnMac:'تثبيت على Mac',apk:'الحصول على APK تجريبي من GitHub (يتطلب الدخول)',installed:'التطبيق مثبت بالفعل على هذا الجهاز.'}};
function refreshDownload(){const c=installText[loc()];const ids={headerDownloadText:c.nav,navDownload:c.nav,downloadEyebrow:c.eyebrow,downloadTitle:c.title,downloadSummary:c.summary,detectedTitle:c.detected,detectedDesc:os+' — '+c.desc,detectedAction:installed()?c.installed:c.action,androidHelp:c.helpAndroid,iosHelp:c.helpIos,windowsHelp:c.helpWindows,macHelp:c.helpMac,apkBuildLink:c.apk};
for(const [id,value] of Object.entries(ids)){const elem=document.getElementById(id);if(elem)elem.textContent=value}
document.querySelectorAll('[data-platform-install]').forEach(button=>{button.textContent=c['btn'+button.dataset.platformInstall[0].toUpperCase()+button.dataset.platformInstall.slice(1)]||c.action});
document.querySelectorAll('.downloadTile').forEach(card=>card.classList.toggle('detected',card.dataset.device===platform));
document.getElementById('detectedAction').disabled=installed();
}
async function installFor(target){const c=installText[loc()],notice=document.getElementById('downloadNotice');
if(pending&&(target===platform||target==='other')){const p=pending;pending=null;try{await p.prompt();await p.userChoice}catch{}refresh();refreshDownload();return}
notice.textContent=c[target]||c.other;notice.scrollIntoView({behavior:'smooth',block:'nearest'});
}
document.getElementById('detectedAction').addEventListener('click',()=>installFor(platform));
document.querySelectorAll('[data-platform-install]').forEach(button=>button.addEventListener('click',()=>installFor(button.dataset.platformInstall)));
window.addEventListener('beforeinstallprompt',refreshDownload);
window.addEventListener('appinstalled',refreshDownload);
new MutationObserver(refreshDownload).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
refreshDownload();

if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{}));
})();