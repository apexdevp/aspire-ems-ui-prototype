/* ════════════════════════════════════════════════════════════
   Aspire ERP — login.js  (login page)
   Role is detected automatically from the account — no manual
   role picker. OTP is enforced per the resolved role.
════════════════════════════════════════════════════════════ */
var resolvedRole = null;     // set after credentials are checked
var sentLoginCode = null;

function resetLoginScreen(){
  document.getElementById('login-form').style.display='block';
  document.getElementById('login-otp-step').style.display='none';
  document.getElementById('login-extras').style.display='block';
  var u=document.getElementById('l-user'), p=document.getElementById('l-pw');
  if(u){u.value='';u.className='finput';} if(p){p.value='';p.className='finput';}
  clearError('l-user','l-user-err'); clearError('l-pw','l-pw-err');
}

function submitLogin(){
  var ok=true;
  if(!validateAndShow('l-user','l-user-err',validateLoginUser)) ok=false;
  if(!validateAndShow('l-pw','l-pw-err',validateLoginPw)) ok=false;
  if(!ok) return;

  var btn=document.getElementById('login-btn'); btn.classList.add('btn-loading');
  setTimeout(function(){
    btn.classList.remove('btn-loading');
    // 1) Identify the role automatically from the account.
    resolvedRole = resolveRole(V('l-user'));
    // 2) Apply OTP rules for that role.
    if(resolvedRole==='Principal' || resolvedRole==='HOD'){
      if(!otpConfigured[resolvedRole]){
        toast(resolvedRole+' has no OTP configured. Redirecting to OTP setup…','err');
        setTimeout(openOtpSetup,800);     // restrict access until OTP is configured
        return;
      }
      beginLoginOtp();
      return;
    }
    enterDashboard();
  },1000);
}

function beginLoginOtp(){
  sentLoginCode=genOtp();
  document.getElementById('login-form').style.display='none';
  document.getElementById('login-extras').style.display='none';
  document.getElementById('login-otp-step').style.display='block';
  document.getElementById('otp-step-role-text').textContent=resolvedRole+' accounts require OTP verification';
  var user=V('l-user');
  document.getElementById('login-otp-target').textContent=user.indexOf('@')>-1?user:'your registered email';
  clearOtpBoxes('login-otp-row'); clearErr2('login-otp-err');
  setTimeout(function(){ var f=document.querySelector('#login-otp-row .otp-box'); if(f) f.focus(); },50);
  toast('OTP sent for '+resolvedRole+' verification (demo code: '+sentLoginCode+')','info');
}
function verifyLoginOtp(){
  var entered=readOtp('login-otp-row');
  if(entered.length<6){ setError2('login-otp-err','Enter all 6 digits.'); return; }
  if(entered!==sentLoginCode){ setError2('login-otp-err','Incorrect code. Please try again.'); clearOtpBoxes('login-otp-row'); return; }
  clearErr2('login-otp-err');
  var btn=document.getElementById('login-otp-btn'); btn.classList.add('btn-loading');
  setTimeout(function(){ btn.classList.remove('btn-loading'); enterDashboard(); },700);
}
function resendLoginOtp(e){ if(e) e.preventDefault(); sentLoginCode=genOtp(); clearOtpBoxes('login-otp-row'); toast('New code sent (demo: '+sentLoginCode+')','info'); }
function cancelLoginOtp(){ resetLoginScreen(); }

function openOtpSetup(){ window.location.href='register.html?otpsetup=1'; }

/* Hand off to the dashboard with the detected role. */
function enterDashboard(){
  var user=V('l-user');
  toast('Welcome back! Signed in as '+resolvedRole+'.','ok');
  setTimeout(function(){
    window.location.href='dashboard.html?role='+encodeURIComponent(resolvedRole)+'&u='+encodeURIComponent(user);
  },450);
}

function socialLogin(p){
  toast(p+' SSO initiated…','info');
  setTimeout(function(){
    toast(p+' authentication successful.','ok');
    resolvedRole = resolveRole(V('l-user')) || 'Admin';   // provider returns identity → role resolved server-side
    enterDashboard();
  },1100);
}

function openForgot(e){ if(e) e.preventDefault(); goTo('forgot'); }

document.addEventListener('DOMContentLoaded',function(){
  wireOtpRow('login-otp-row');
  resetLoginScreen();
});
