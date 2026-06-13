/* ════════════════════════════════════════════════════════════
   Aspire ERP — common.js
   Shared across all pages: helpers, validation, autocomplete,
   OTP utilities, toast/modal, cross-page navigation, role rules.
════════════════════════════════════════════════════════════ */

/* ── Cross-page navigation ──
   The original single-page app used goTo('login') etc. We keep the
   same call sites but route them to real files. */
var PAGES = { register:'register.html', login:'login.html', forgot:'forgot-password.html', dash:'dashboard.html' };
function goTo(id){ if(PAGES[id]) window.location.href = PAGES[id]; }
function getParam(name){
  var m = new RegExp('[?&]'+name+'=([^&]*)').exec(window.location.search);
  return m ? decodeURIComponent(m[1].replace(/\+/g,' ')) : '';
}

/* ── Demo "directory": role is identified automatically from the
   account. In production this lookup happens server-side. ── */
var otpConfigured = { Trustee:true, Admin:true, Principal:true, HOD:false }; // HOD intentionally not configured (demo)
function resolveRole(identifier){
  var s = (identifier||'').toLowerCase();
  if(s.indexOf('trustee')   > -1) return 'Trustee';
  if(s.indexOf('principal') > -1) return 'Principal';
  if(s.indexOf('hod')       > -1) return 'HOD';
  if(s.indexOf('admin')     > -1) return 'Admin';
  return 'Admin'; // sensible default for the demo
}

/* ── Companies (shared so dashboard + switcher can read them) ── */
var COMPANIES = [
  {code:'HIA', name:"Horizon Int'l Academy", full:'Horizon International Academy', color:'#0F4C75', meta:'4 branches · K-12'},
  {code:'BVS', name:'Brightvale School',     full:'Brightvale Senior School',     color:'#0EA571', meta:'2 branches · K-12'},
  {code:'SRC', name:'Sterling College',      full:'Sterling Degree College',      color:'#7C3AED', meta:'3 branches · Degree'},
  {code:'NXE', name:'Nexus Ed-Tech',         full:'Nexus Ed-Tech Institute',      color:'#F59E0B', meta:'1 campus · Coaching'}
];

/* ════════════════════════════════════════════════════════════
   GENERIC FORM HELPERS / VALIDATION
════════════════════════════════════════════════════════════ */
function V(id){ var el=document.getElementById(id); return el ? el.value.trim() : ''; }
function setStatus(inp,state){
  if(!inp) return;
  inp.classList.remove('valid','error');
  var okEl=document.getElementById(inp.id+'-ok');
  if(state==='ok'){ inp.classList.add('valid'); if(okEl){okEl.classList.add('show','ok');okEl.classList.remove('err');} }
  else if(state==='err'){ inp.classList.add('error'); if(okEl){okEl.classList.add('show','err');okEl.classList.remove('ok');} }
  else { if(okEl) okEl.classList.remove('show'); }
}
function setError(inputId,errId,msg){
  var inp=document.getElementById(inputId), err=document.getElementById(errId);
  if(inp) setStatus(inp,'err');
  if(err){ err.querySelector('span').textContent=msg; err.classList.add('show'); }
}
function clearError(inputId,errId){
  var inp=document.getElementById(inputId), err=document.getElementById(errId);
  if(inp){ inp.classList.remove('error'); if(!inp.classList.contains('valid')) setStatus(inp,''); }
  if(err) err.classList.remove('show');
}
function live(inp,errId,validator){
  var v=inp.value.trim();
  if(!v){ clearError(inp.id,errId); setStatus(inp,''); return; }
  var res=validator(v);
  if(res===true){ clearError(inp.id,errId); setStatus(inp,'ok'); }
  else setError(inp.id,errId,res);
}
function liveSelect(sel,errId){
  if(sel.value){ clearError(sel.id,errId); sel.classList.remove('error'); sel.classList.add('valid'); }
  else sel.classList.remove('valid');
}
function validateAndShow(id,errId,validator){
  var val=V(id);
  if(!val){ setError(id,errId,'This field is required.'); return false; }
  var r=validator(val);
  if(r===true){ clearError(id,errId); setStatus(document.getElementById(id),'ok'); return true; }
  setError(id,errId,r); return false;
}

function validateCompany(v){ if(v.length<3) return 'Must be at least 3 characters.'; return true; }
function validateCity(v){ if(v.length<2) return 'Enter a valid city name.'; if(!/^[a-zA-Z\s\-]+$/.test(v)) return 'Only letters allowed.'; return true; }
function validateBranches(v){ if(!/^[0-9]+$/.test(v)) return 'Numbers only.'; if(parseInt(v,10)<1) return 'Enter at least 1.'; return true; }
function validateState(v){ return STATES.some(function(s){return s.toLowerCase()===v.toLowerCase();}) ? true : 'Select a state from the list.'; }
function validateName(v){ if(v.length<2) return 'Must be at least 2 characters.'; if(!/^[a-zA-Z\s\-']+$/.test(v)) return 'Only letters allowed.'; return true; }
function validateEmail(v){ if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.'; return true; }
function validatePw(v){ if(v.length<8) return 'At least 8 characters required.'; if(!/[A-Z]/.test(v)) return 'Must include at least one uppercase letter.'; if(!/[0-9]/.test(v)) return 'Must include at least one number.'; return true; }
function validateCpw(v){ if(v!==V('r-pw')) return 'Passwords do not match.'; return true; }
function validateLoginUser(v){ if(v.length<3) return 'Enter a valid email or username.'; return true; }
function validateLoginPw(v){ if(!v) return 'Password is required.'; return true; }
function validateFpEmail(v){ if(v.length<3) return 'Enter your email or username.'; return true; }

function updatePwStrength(v){
  var s=0; if(v.length>=8)s++; if(/[A-Z]/.test(v))s++; if(/[0-9]/.test(v))s++; if(/[^A-Za-z0-9]/.test(v))s++;
  var cols=['#EF4444','#F59E0B','#3B82F6','#0EA571'], labs=['Weak','Fair','Good','Strong'];
  for(var i=0;i<4;i++){ var bar=document.getElementById('pb'+i); if(bar) bar.style.background = i<s ? cols[Math.min(s,4)-1] : '#E4E8F0'; }
  var lbl=document.getElementById('pw-str-lbl');
  if(lbl){ if(!v.length){ lbl.textContent='Enter a password'; lbl.style.color='var(--ink4)'; }
           else { lbl.textContent=labs[Math.min(s,4)-1]||'Very weak'; lbl.style.color=cols[Math.min(s,4)-1]||'#EF4444'; } }
}
function resetPwStrength(){
  for(var i=0;i<4;i++){ var b=document.getElementById('pb'+i); if(b) b.style.background='#E4E8F0'; }
  var l=document.getElementById('pw-str-lbl'); if(l){ l.textContent='Enter a password'; l.style.color='var(--ink4)'; }
}
function toggleEye(id,btn){
  var el=document.getElementById(id), hide=el.type==='password';
  el.type=hide?'text':'password';
  btn.innerHTML='<i class="ti '+(hide?'ti-eye':'ti-eye-off')+'"></i>';
}

/* ════════════════════════════════════════════════════════════
   STATE AUTOCOMPLETE  (used on the registration page)
════════════════════════════════════════════════════════════ */
var STATES=['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];
var stateActiveIdx=-1;
function filterStates(q){
  var list=document.getElementById('state-list'); if(!list) return;
  var inp=document.getElementById('r-state');
  q=(q||'').trim();
  var matches=STATES.filter(function(s){return s.toLowerCase().indexOf(q.toLowerCase())===0;});
  if(matches.length===0 && q) matches=STATES.filter(function(s){return s.toLowerCase().indexOf(q.toLowerCase())>-1;});
  if(!q) matches=STATES;
  stateActiveIdx=-1;
  if(matches.length===0){ list.innerHTML='<div class="combo-empty">No matching state</div>'; list.classList.add('show'); return; }
  list.innerHTML=matches.map(function(s){
    var hl=s;
    if(q){ var i=s.toLowerCase().indexOf(q.toLowerCase()); if(i>-1) hl=s.slice(0,i)+'<span class="match">'+s.slice(i,i+q.length)+'</span>'+s.slice(i+q.length); }
    return '<div class="combo-item" onmousedown="pickState(event,\''+s.replace(/'/g,"\\'")+'\')"><i class="ti ti-map-pin"></i>'+hl+'</div>';
  }).join('');
  list.classList.add('show');
  if(STATES.some(function(s){return s.toLowerCase()===q.toLowerCase();})){ setStatus(inp,'ok'); clearError('r-state','r-state-err'); }
  else setStatus(inp,'');
}
function pickState(e,s){
  if(e) e.preventDefault();
  var inp=document.getElementById('r-state');
  inp.value=s; setStatus(inp,'ok'); clearError('r-state','r-state-err');
  document.getElementById('state-list').classList.remove('show');
}
function stateKeyNav(e){
  var list=document.getElementById('state-list'); if(!list||!list.classList.contains('show')) return;
  var items=list.querySelectorAll('.combo-item');
  if(e.key==='ArrowDown'){ e.preventDefault(); stateActiveIdx=Math.min(stateActiveIdx+1,items.length-1); }
  else if(e.key==='ArrowUp'){ e.preventDefault(); stateActiveIdx=Math.max(stateActiveIdx-1,0); }
  else if(e.key==='Enter'){ if(stateActiveIdx>-1&&items[stateActiveIdx]){ e.preventDefault(); pickState(null,items[stateActiveIdx].textContent); } return; }
  else if(e.key==='Escape'){ list.classList.remove('show'); return; }
  else return;
  items.forEach(function(it,i){ it.classList.toggle('active',i===stateActiveIdx); });
  if(items[stateActiveIdx]) items[stateActiveIdx].scrollIntoView({block:'nearest'});
}

/* ════════════════════════════════════════════════════════════
   OTP UTILITIES (shared by email verification + step-up login)
════════════════════════════════════════════════════════════ */
var otpTimer=null;
function genOtp(){ return String(Math.floor(100000+Math.random()*900000)); }
function readOtp(rowId){ return Array.prototype.map.call(document.querySelectorAll('#'+rowId+' .otp-box'),function(b){return b.value;}).join(''); }
function clearOtpBoxes(rowId){ document.querySelectorAll('#'+rowId+' .otp-box').forEach(function(b){ b.value=''; b.classList.remove('filled'); }); }
function wireOtpRow(rowId){
  var boxes=document.querySelectorAll('#'+rowId+' .otp-box');
  boxes.forEach(function(box,idx){
    box.addEventListener('input',function(){
      this.value=this.value.replace(/[^0-9]/g,'');
      this.classList.toggle('filled',!!this.value);
      if(this.value && idx<boxes.length-1) boxes[idx+1].focus();
    });
    box.addEventListener('keydown',function(e){ if(e.key==='Backspace' && !this.value && idx>0) boxes[idx-1].focus(); });
    box.addEventListener('paste',function(e){
      e.preventDefault();
      var d=(e.clipboardData||window.clipboardData).getData('text').replace(/[^0-9]/g,'').slice(0,6);
      for(var i=0;i<d.length && i<boxes.length;i++){ boxes[i].value=d[i]; boxes[i].classList.add('filled'); }
      var n=Math.min(d.length,boxes.length-1); if(boxes[n]) boxes[n].focus();
    });
  });
}
function startOtpCountdown(elId){
  var el=document.getElementById(elId); if(!el) return;
  var t=60; el.textContent='expires in '+t+'s';
  if(otpTimer) clearInterval(otpTimer);
  otpTimer=setInterval(function(){ t--; if(t<=0){ clearInterval(otpTimer); el.textContent='code expired'; } else el.textContent='expires in '+t+'s'; },1000);
}
function setError2(errId,msg){ var e=document.getElementById(errId); if(e){ e.querySelector('span').textContent=msg; e.classList.add('show'); } }
function clearErr2(errId){ var e=document.getElementById(errId); if(e) e.classList.remove('show'); }

/* ════════════════════════════════════════════════════════════
   MODALS + TOAST
════════════════════════════════════════════════════════════ */
function showModal(id){ var m=document.getElementById(id); if(m) m.classList.add('open'); }
function closeModal(id){ var m=document.getElementById(id); if(m) m.classList.remove('open'); }
function toast(msg,type){
  type=type||'info';
  var icons={ok:'ti-circle-check',err:'ti-alert-circle',info:'ti-info-circle'};
  var wrap=document.getElementById('toast-wrap'); if(!wrap) return;
  var el=document.createElement('div');
  el.className='toast '+type;
  el.innerHTML='<i class="ti '+(icons[type]||icons.info)+'"></i><span>'+msg+'</span>';
  wrap.appendChild(el);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('in'); }); });
  setTimeout(function(){ el.classList.remove('in'); setTimeout(function(){ el.remove(); },400); },3400);
}

/* ── Global dismissers (autocomplete list + company menu) ── */
document.addEventListener('click',function(e){
  var w=document.getElementById('state-list');
  if(w && !e.target.closest('.combo-wrap')) w.classList.remove('show');
  var cm=document.getElementById('co-menu');
  if(cm && cm.classList.contains('open') && !e.target.closest('.co-switch')) cm.classList.remove('open');
});
document.addEventListener('click',function(e){
  var o=e.target.closest('.overlay');
  if(o && e.target===o) o.classList.remove('open');
});
