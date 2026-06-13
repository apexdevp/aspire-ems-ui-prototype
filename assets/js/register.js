/* ════════════════════════════════════════════════════════════
   Aspire ERP — register.js  (registration page)
════════════════════════════════════════════════════════════ */
var regData = {};
var emailVerified = false, sentRegCode = null;

/* ── Stepper ── */
function setStep(n){
  var icons={1:'<i class="ti ti-building" style="font-size:14px"></i>',2:'<i class="ti ti-user" style="font-size:14px"></i>',3:'<i class="ti ti-clipboard-check" style="font-size:14px"></i>'};
  for(var i=1;i<=3;i++){
    var node=document.getElementById('sn-'+i), item=document.getElementById('si-'+i);
    node.className='step-node'; item.className='step-item';
    if(i<n){ node.classList.add('done'); item.classList.add('done'); node.innerHTML='<i class="ti ti-check" style="font-size:14px"></i>'; }
    else if(i===n){ node.classList.add('active'); item.classList.add('active'); node.innerHTML=icons[i]; }
    else node.innerHTML=i;
  }
  ['reg-s1','reg-s2','reg-s3','reg-s4'].forEach(function(s,idx){ document.getElementById(s).style.display=(idx===n-1)?'block':'none'; });
}
function step1Next(){
  if(!validateAll1()) return;
  regData.company=V('r-company'); regData.type=V('r-type'); regData.branches=V('r-branches');
  regData.city=V('r-city'); regData.state=V('r-state');
  setStep(2); window.scrollTo({top:0,behavior:'smooth'});
}
function s2Back(){ setStep(1); }
function s3Back(){ setStep(2); }
function step2Next(){
  if(!emailVerified){ toast('Please verify your email first.','err'); return; }
  if(!validateAll2()) return;
  regData.fname=V('r-fname'); regData.lname=V('r-lname'); regData.email=V('r-email');
  var init=(regData.company||'').split(' ').slice(0,3).map(function(w){return w[0]||'';}).join('').toUpperCase().slice(0,3);
  document.getElementById('cf-initials').textContent=init||'CO';
  document.getElementById('cf-company').textContent=regData.company;
  document.getElementById('cf-type-city').textContent=regData.type+' \u00B7 '+regData.city+', '+regData.state;
  document.getElementById('cf-admin').textContent=regData.fname+' '+regData.lname;
  document.getElementById('cf-email').textContent=regData.email;
  document.getElementById('cf-branches').textContent=regData.branches;
  setStep(3); window.scrollTo({top:0,behavior:'smooth'});
}
function submitRegister(){
  var btn=document.getElementById('reg-submit-btn'); btn.classList.add('btn-loading');
  setTimeout(function(){
    btn.classList.remove('btn-loading');
    document.getElementById('reg-s3').style.display='none';
    document.getElementById('reg-s4').style.display='block';
    toast('Company registered successfully!','ok');
  },1500);
}

/* ── Form reset: never retain stale values ── */
function resetRegister(){
  setStep(1);
  ['r-company','r-city','r-fname','r-lname','r-email','r-pw','r-cpw','r-branches','r-state'].forEach(function(id){
    var el=document.getElementById(id);
    if(el){ el.value=''; el.className='finput'; var ok=document.getElementById(id+'-ok'); if(ok) ok.classList.remove('show','ok','err'); }
  });
  var type=document.getElementById('r-type'); if(type){ type.value=''; type.className='finput'; }
  var terms=document.getElementById('r-terms'); if(terms) terms.checked=false;
  ['r-company-err','r-type-err','r-branches-err','r-city-err','r-state-err','r-fname-err','r-lname-err','r-email-err','r-pw-err','r-cpw-err','r-terms-err','reg-otp-err'].forEach(function(id){ var e=document.getElementById(id); if(e) e.classList.remove('show'); });
  resetPwStrength(); resetEmailVerify();
  var sl=document.getElementById('state-list'); if(sl) sl.classList.remove('show');
}

/* ── Email verification flow ── */
function onEmailInput(){
  live(document.getElementById('r-email'),'r-email-err',validateEmail);
  if(emailVerified) resetEmailVerify();           // editing a verified email re-locks the form
  var ok=validateEmail(V('r-email'))===true;
  document.getElementById('verify-email-btn').style.display = ok ? 'flex' : 'none';
}
function sendEmailOtp(){
  if(validateEmail(V('r-email'))!==true){ setError('r-email','r-email-err','Enter a valid email address.'); return; }
  sentRegCode=genOtp();
  document.getElementById('otp-target-email').textContent=V('r-email');
  document.getElementById('verify-email-btn').style.display='none';
  document.getElementById('reg-otp-panel').style.display='block';
  clearOtpBoxes('reg-otp-row'); startOtpCountdown('otp-hint');
  setTimeout(function(){ var f=document.querySelector('#reg-otp-row .otp-box'); if(f) f.focus(); },50);
  toast('OTP sent to '+V('r-email')+' (demo code: '+sentRegCode+')','info');
}
function resendEmailOtp(e){ if(e) e.preventDefault(); sendEmailOtp(); }
function confirmEmailOtp(){
  var entered=readOtp('reg-otp-row');
  if(entered.length<6){ setError2('reg-otp-err','Enter all 6 digits.'); return; }
  if(entered!==sentRegCode){ setError2('reg-otp-err','Incorrect code. Please try again.'); clearOtpBoxes('reg-otp-row'); return; }
  clearErr2('reg-otp-err'); emailVerified=true;
  if(otpTimer) clearInterval(otpTimer);
  document.getElementById('reg-otp-panel').style.display='none';
  document.getElementById('email-verified-badge').style.display='flex';
  document.getElementById('reg-secure-fields').style.display='block';
  document.getElementById('reg-locked-note').style.display='none';
  document.getElementById('step2-next-btn').disabled=false;
  toast('Email verified successfully!','ok');
}
function resetEmailVerify(){
  emailVerified=false; sentRegCode=null;
  if(otpTimer) clearInterval(otpTimer);
  var ids={'verify-email-btn':'none','reg-otp-panel':'none','email-verified-badge':'none','reg-secure-fields':'none'};
  Object.keys(ids).forEach(function(k){ var el=document.getElementById(k); if(el) el.style.display=ids[k]; });
  var ln=document.getElementById('reg-locked-note'); if(ln) ln.style.display='flex';
  var nb=document.getElementById('step2-next-btn'); if(nb) nb.disabled=true;
  ['r-pw','r-cpw'].forEach(function(id){ var el=document.getElementById(id); if(el){ el.value=''; el.className='finput'; } });
  var terms=document.getElementById('r-terms'); if(terms) terms.checked=false;
  resetPwStrength();
}

/* ── Step validators ── */
function validateAll1(){
  var ok=true;
  if(!validateAndShow('r-company','r-company-err',validateCompany)) ok=false;
  if(!V('r-type')){ setError('r-type','r-type-err','Please select organisation type.'); document.getElementById('r-type').classList.add('error'); ok=false; }
  if(!validateAndShow('r-branches','r-branches-err',validateBranches)) ok=false;
  if(!validateAndShow('r-city','r-city-err',validateCity)) ok=false;
  if(!validateAndShow('r-state','r-state-err',validateState)) ok=false;
  return ok;
}
function validateAll2(){
  var ok=true;
  if(!validateAndShow('r-fname','r-fname-err',validateName)) ok=false;
  if(!validateAndShow('r-lname','r-lname-err',validateName)) ok=false;
  if(!validateAndShow('r-email','r-email-err',validateEmail)) ok=false;
  if(!validateAndShow('r-pw','r-pw-err',validatePw)) ok=false;
  if(!V('r-cpw')){ setError('r-cpw','r-cpw-err','Please confirm your password.'); ok=false; }
  else if(!validateAndShow('r-cpw','r-cpw-err',validateCpw)) ok=false;
  if(!document.getElementById('r-terms').checked){ setError('r-terms','r-terms-err','You must agree to the terms to continue.'); ok=false; }
  else clearError('r-terms','r-terms-err');
  return ok;
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded',function(){
  wireOtpRow('reg-otp-row');
  resetRegister();
  // Arriving here from a Principal/HOD login that has no OTP configured:
  if(getParam('otpsetup')){
    setStep(2);
    var ln=document.getElementById('reg-locked-note');
    if(ln) ln.querySelector('span').textContent='OTP is mandatory for your role. Verify your email to configure OTP and unlock access.';
    toast('Complete email + OTP setup to enable system access.','info');
  }
});
