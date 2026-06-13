/* ════════════════════════════════════════════════════════════
   Aspire ERP — forgot.js  (forgot-password page)
════════════════════════════════════════════════════════════ */
function submitForgot(){
  if(!validateAndShow('fp-email','fp-email-err',validateFpEmail)) return;
  var btn=document.getElementById('fp-btn'); btn.classList.add('btn-loading');
  setTimeout(function(){
    btn.classList.remove('btn-loading');
    document.getElementById('fp-sent-email').textContent=V('fp-email');
    document.getElementById('fp-card-main').style.display='none';
    document.getElementById('fp-card-success').style.display='block';
    toast('Reset link sent! Check your inbox.','ok');
  },1200);
}
function resetFpForm(){
  document.getElementById('fp-card-main').style.display='block';
  document.getElementById('fp-card-success').style.display='none';
  var fp=document.getElementById('fp-email'); if(fp){ fp.value=''; fp.className='finput'; }
  clearError('fp-email','fp-email-err');
}
document.addEventListener('DOMContentLoaded',resetFpForm);
