/* ════════════════════════════════════════════════════════════
   Aspire ERP — dashboard.js  (dashboard page)
   The role arrives in the URL (?role=…) after the login page has
   identified it automatically from the account.
════════════════════════════════════════════════════════════ */
var activeCompany = 0;
var SESSION = { role:'Admin', user:'', fname:'Admin', lname:'' };

/* ── Role application ── */
function applyRole(role){
  document.body.classList.remove('role-trustee','role-admin','role-principal','role-hod');
  var pill=document.getElementById('dash-role-pill');
  var isTrustee=(role==='Trustee');
  document.getElementById('view-trustee').style.display=isTrustee?'block':'none';
  document.getElementById('view-admin').style.display=isTrustee?'none':'block';
  if(isTrustee){
    document.body.classList.add('role-trustee');
    pill.innerHTML='<i class="ti ti-crown" style="font-size:12px"></i> Trustee';
    document.getElementById('dash-sub-line').innerHTML='Consolidated view across all <b>'+COMPANIES.length+' companies</b>. Switch companies from the top bar.';
    document.getElementById('dash-primary-action').innerHTML='<i class="ti ti-building-plus"></i>Create Company';
    renderTrustee();
  }else{
    document.body.classList.add('role-'+role.toLowerCase());
    var icon=role==='Admin'?'ti-building-skyscraper':role==='Principal'?'ti-school':'ti-users-group';
    pill.innerHTML='<i class="ti '+icon+'" style="font-size:12px"></i> '+role;
    document.getElementById('dash-sub-line').innerHTML='Company workspace for <b id="dash-company-name">'+COMPANIES[activeCompany].full+'</b>. Here\u2019s your overview.';
    document.getElementById('dash-primary-action').innerHTML='<i class="ti ti-plus"></i>Quick Add';
    renderAdmin();
  }
}
function primaryAction(){
  if(document.body.classList.contains('role-trustee')){ toggleGroup('g-comgmt',true); navJump('Create Company'); }
  else showModal('quick-add');
}

/* ════════════════════════════════════════════════════════════
   TRUSTEE WIDGETS
════════════════════════════════════════════════════════════ */
var INSTITUTES={
  admissions:[['Horizon Int\u2019l Academy','HIA',612,'admissions'],['Sterling College','SRC',548,'admissions'],['Brightvale School','BVS',431,'admissions'],['Nexus Ed-Tech','NXE',355,'admissions'],['Aspire Junior','AJC',289,'admissions']],
  revenue:[['Sterling College','SRC','₹6.2Cr'],['Horizon Int\u2019l Academy','HIA','₹5.1Cr'],['Brightvale School','BVS','₹3.8Cr'],['Nexus Ed-Tech','NXE','₹2.4Cr'],['Aspire Junior','AJC','₹0.9Cr']],
  performance:[['Brightvale School','BVS','A','grade'],['Horizon Int\u2019l Academy','HIA','A-','grade'],['Sterling College','SRC','B+','grade'],['Aspire Junior','AJC','B+','grade'],['Nexus Ed-Tech','NXE','B','grade']],
  strength:[['Horizon Int\u2019l Academy','HIA',4120,'students'],['Sterling College','SRC',3680,'students'],['Brightvale School','BVS',2840,'students'],['Nexus Ed-Tech','NXE',1320,'students'],['Aspire Junior','AJC',880,'students']]
};
var FACULTY={
  attendance:[['Dr. Anjali Rao','HIA','99.2%'],['Prof. Vikram Shah','SRC','98.7%'],['Meera Iyer','BVS','98.1%'],['Rohan Gupta','NXE','97.6%'],['Sana Khan','HIA','97.2%']],
  feedback:[['Meera Iyer','BVS','4.9/5'],['Dr. Anjali Rao','HIA','4.8/5'],['Karthik Nair','SRC','4.8/5'],['Sana Khan','HIA','4.7/5'],['Prof. Vikram Shah','SRC','4.6/5']],
  performance:[['Prof. Vikram Shah','SRC','94%'],['Dr. Anjali Rao','HIA','92%'],['Karthik Nair','SRC','90%'],['Meera Iyer','BVS','89%'],['Rohan Gupta','NXE','87%']],
  effectiveness:[['Dr. Anjali Rao','HIA','96'],['Meera Iyer','BVS','94'],['Karthik Nair','SRC','92'],['Prof. Vikram Shah','SRC','91'],['Sana Khan','HIA','88']]
};
var COLORS=['#0F4C75','#0EA571','#7C3AED','#F59E0B','#3B82F6'];

function rankList(rows,metricLabel){
  return rows.map(function(r,i){
    var name=r[0],code=r[1],val=r[2],lbl=r[3]||metricLabel,color=COLORS[i%COLORS.length];
    return '<div class="rank-row"><div class="rank-num">'+(i+1)+'</div>'+
      '<div class="rank-av" style="background:'+color+'">'+code.slice(0,3)+'</div>'+
      '<div class="rank-info"><div class="rank-name">'+name+'</div><div class="rank-meta">'+code+'</div></div>'+
      '<div class="rank-metric"><div class="rank-metric-val">'+val+'</div><div class="rank-metric-lbl">'+lbl+'</div></div></div>';
  }).join('');
}
function renderTrustee(){
  rankBy('inst',null,'admissions');
  rankBy('fac',null,'attendance');
  renderRevCompare(); renderTrend('trend-spark',true); renderDonut('out-donut'); renderGrowthBars();
}
function rankBy(which,chip,metric){
  if(chip){ var row=chip.parentElement; row.querySelectorAll('.chip').forEach(function(c){c.classList.remove('active');}); chip.classList.add('active'); }
  if(which==='inst') document.getElementById('rank-inst').innerHTML=rankList(INSTITUTES[metric],metric);
  else document.getElementById('rank-fac').innerHTML=rankList(FACULTY[metric],metric);
}
function renderRevCompare(){
  var data=[['Sterling College',6.2],['Horizon Int\u2019l Academy',5.1],['Brightvale School',3.8],['Nexus Ed-Tech',2.4],['Aspire Junior',0.9]], max=6.2;
  document.getElementById('rev-compare').innerHTML=data.map(function(d){
    var pct=(d[1]/max*100).toFixed(0);
    return '<div class="hbar-row"><div class="hbar-top"><span class="hbar-name">'+d[0]+'</span><span class="hbar-val">₹'+d[1]+'Cr</span></div><div class="hbar-track"><div class="hbar-fill" style="width:0%" data-w="'+pct+'"></div></div></div>';
  }).join('');
  animateBars('rev-compare');
}
function renderGrowthBars(){
  var data=[['Student Growth (YoY)',14,'var(--jade)'],['New Faculty Hired',38,'var(--p)'],['Faculty Retention',92,'var(--p3)'],['Avg. Faculty Rating',88,'var(--sun)']];
  document.getElementById('growth-bars').innerHTML=data.map(function(d){
    var suffix=d[0].indexOf('Hired')>-1?'':'%';
    return '<div class="hbar-row"><div class="hbar-top"><span class="hbar-name">'+d[0]+'</span><span class="hbar-val">'+d[1]+suffix+'</span></div><div class="hbar-track"><div class="hbar-fill" style="width:0%;background:'+d[2]+'" data-w="'+Math.min(d[1],100)+'"></div></div></div>';
  }).join('');
  animateBars('growth-bars');
}
function animateBars(id){
  setTimeout(function(){ document.querySelectorAll('#'+id+' .hbar-fill').forEach(function(b){ b.style.width=b.getAttribute('data-w')+'%'; }); },80);
}
function renderTrend(id,dual){
  var adm=[210,260,240,320,300,412], fee=[180,200,230,260,250,310], w=460,h=130,pad=8,max=420;
  function path(arr){ var step=(w-pad*2)/(arr.length-1); return arr.map(function(v,i){return (i===0?'M':'L')+(pad+i*step).toFixed(1)+','+(h-pad-(v/max)*(h-pad*2)).toFixed(1);}).join(' '); }
  var svg='<svg viewBox="0 0 '+w+' '+h+'" width="100%" height="'+h+'" preserveAspectRatio="none">';
  for(var g=1;g<4;g++){ var y=(h/4)*g; svg+='<line x1="0" y1="'+y+'" x2="'+w+'" y2="'+y+'" stroke="#E4E8F0" stroke-width="1"/>'; }
  svg+='<path d="'+path(adm)+'" fill="none" stroke="#0F4C75" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
  if(dual) svg+='<path d="'+path(fee)+'" fill="none" stroke="#0EA571" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
  var step=(w-pad*2)/(adm.length-1);
  adm.forEach(function(v,i){ svg+='<circle cx="'+(pad+i*step).toFixed(1)+'" cy="'+(h-pad-(v/max)*(h-pad*2)).toFixed(1)+'" r="3" fill="#0F4C75"/>'; });
  svg+='</svg>';
  document.getElementById(id).innerHTML=svg;
}
function renderDonut(id){
  var segs=[[88.6,'#0EA571'],[7.2,'#F59E0B'],[4.2,'#EF4444']], r=46, c=2*Math.PI*r, off=0;
  var svg='<svg width="118" height="118" viewBox="0 0 118 118"><g transform="translate(59,59) rotate(-90)">';
  segs.forEach(function(s){ var len=c*s[0]/100; svg+='<circle r="'+r+'" fill="none" stroke="'+s[1]+'" stroke-width="16" stroke-dasharray="'+len+' '+(c-len)+'" stroke-dashoffset="'+(-off)+'"/>'; off+=len; });
  svg+='</g><text x="59" y="55" text-anchor="middle" font-family="Fira Code" font-size="17" font-weight="600" fill="#0A0E1A">88.6%</text><text x="59" y="72" text-anchor="middle" font-family="Plus Jakarta Sans" font-size="9" fill="#94A3B8">collected</text></svg>';
  document.getElementById(id).innerHTML=svg;
}

/* ════════════════════════════════════════════════════════════
   ADMIN WIDGETS
════════════════════════════════════════════════════════════ */
function renderAdmin(){ renderAdminTrend(); renderAdminAttBars(); }
function renderAdminTrend(){
  var fee=[34,38,41,37,44,46], w=460,h=130,pad=8,max=50, step=(w-pad*2)/(fee.length-1);
  var d=fee.map(function(v,i){return (i===0?'M':'L')+(pad+i*step).toFixed(1)+','+(h-pad-(v/max)*(h-pad*2)).toFixed(1);}).join(' ');
  var area=d+' L'+(w-pad)+','+(h-pad)+' L'+pad+','+(h-pad)+' Z';
  var svg='<svg viewBox="0 0 '+w+' '+h+'" width="100%" height="'+h+'" preserveAspectRatio="none">';
  for(var g=1;g<4;g++){ var y=(h/4)*g; svg+='<line x1="0" y1="'+y+'" x2="'+w+'" y2="'+y+'" stroke="#E4E8F0" stroke-width="1"/>'; }
  svg+='<path d="'+area+'" fill="rgba(14,165,113,0.10)"/><path d="'+d+'" fill="none" stroke="#0EA571" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
  fee.forEach(function(v,i){ svg+='<circle cx="'+(pad+i*step).toFixed(1)+'" cy="'+(h-pad-(v/max)*(h-pad*2)).toFixed(1)+'" r="3" fill="#0EA571"/>'; });
  svg+='</svg>';
  document.getElementById('admin-trend-spark').innerHTML=svg;
}
function renderAdminAttBars(){
  var data=[['Science',96],['Commerce',93],['Arts',91],['Computer Sci.',95],['Management',89]];
  document.getElementById('admin-att-bars').innerHTML=data.map(function(d){
    return '<div class="hbar-row"><div class="hbar-top"><span class="hbar-name">'+d[0]+'</span><span class="hbar-val">'+d[1]+'%</span></div><div class="hbar-track"><div class="hbar-fill" style="width:0%" data-w="'+d[1]+'"></div></div></div>';
  }).join('');
  animateBars('admin-att-bars');
}

/* ════════════════════════════════════════════════════════════
   NAV DRAWER
════════════════════════════════════════════════════════════ */
function toggleDrawer(){ document.getElementById('sidebar').classList.toggle('collapsed'); }
function toggleGroup(id,forceOpen){
  var g=document.getElementById(id);
  if(!g.classList.contains('open')) document.querySelectorAll('.nav-group.open').forEach(function(o){ if(o!==g) o.classList.remove('open'); });
  if(forceOpen) g.classList.add('open'); else g.classList.toggle('open');
}
function navSelect(el,name){
  document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
  document.querySelectorAll('.nav-subitem').forEach(function(n){n.classList.remove('active');});
  el.classList.add('active');
  document.getElementById('dash-crumb').textContent=name;
}
function navSub(el,name){
  document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
  document.querySelectorAll('.nav-subitem').forEach(function(n){n.classList.remove('active');});
  el.classList.add('active');
  var clean=name.replace(/ R$/,'');
  document.getElementById('dash-crumb').textContent=clean;
  toast(clean+' — module opening soon.','info');
}
function navJump(name){ toast(name+' — module opening soon.','info'); }

/* ════════════════════════════════════════════════════════════
   COMPANY SWITCHER (Trustee)
════════════════════════════════════════════════════════════ */
function buildCoMenu(){
  var list=document.getElementById('co-menu-list'); if(!list) return;
  list.innerHTML=COMPANIES.map(function(c,i){
    return '<div class="co-menu-item'+(i===activeCompany?' active':'')+'" onclick="switchCompany('+i+')">'+
      '<div class="co-menu-logo" style="background:'+c.color+'">'+c.code+'</div>'+
      '<div><div class="co-menu-name">'+c.name+'</div><div class="co-menu-meta">'+c.meta+'</div></div>'+
      (i===activeCompany?'<i class="ti ti-check"></i>':'')+'</div>';
  }).join('');
}
function toggleCoMenu(e){ e.stopPropagation(); buildCoMenu(); document.getElementById('co-menu').classList.toggle('open'); }
function switchCompany(i){
  activeCompany=i; var c=COMPANIES[i];
  document.getElementById('cosw-logo').textContent=c.code;
  document.getElementById('cosw-logo').style.background=c.color;
  document.getElementById('cosw-name').textContent=c.name;
  document.getElementById('cosw-sub').textContent='Active company';
  document.getElementById('sb-logo').textContent=c.code;
  document.getElementById('sb-company-name').textContent=c.name;
  document.getElementById('co-menu').classList.remove('open');
  toast('Switched to '+c.full,'ok');
}
function viewAllCompanies(){
  document.getElementById('cosw-name').textContent='All Companies';
  document.getElementById('cosw-sub').textContent='Consolidated view';
  document.getElementById('cosw-logo').textContent='ALL';
  document.getElementById('cosw-logo').style.background='var(--p)';
  document.getElementById('co-menu').classList.remove('open');
  toast('Showing consolidated data across all companies.','info');
}

/* ════════════════════════════════════════════════════════════
   USER / PROFILE SYNC
════════════════════════════════════════════════════════════ */
function updateDashUser(){
  var fn=SESSION.fname||'Admin', ln=SESSION.lname||'', role=SESSION.role||'Admin';
  var co=(role==='Trustee')?'All Companies':COMPANIES[activeCompany].full;
  var av=(fn[0]||'A').toUpperCase()+((ln[0]||'').toUpperCase()||'U');
  var h=new Date().getHours(), greet=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  function sT(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; }
  sT('dash-greeting',greet+', '+fn+' \ud83d\udc4b');
  sT('tb-uname',fn+(ln?' '+ln:''));
  sT('tb-avatar',av);
  sT('tb-tenant-code','v3.0 \u00B7 '+(role==='Trustee'?'Trustee Console':'Company Workspace'));
  sT('tb-urole',role);
  sT('modal-uname',fn+(ln?' '+ln:''));
  sT('modal-email',SESSION.user||(fn.toLowerCase()+'@aspire.erp'));
  sT('modal-company',co);
  sT('modal-role-badge',role.toUpperCase());
  sT('modal-scope',role==='Trustee'?'All companies':role==='Admin'?'Company-level':role==='Principal'?'Institute-level':'Department-level');
  if(role!=='Trustee'){ var dn=document.getElementById('dash-company-name'); if(dn) dn.textContent=COMPANIES[activeCompany].full; }
  buildCoMenu();
}

/* ════════════════════════════════════════════════════════════
   INIT — read the auto-detected role from the URL
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',function(){
  var role=getParam('role')||'Admin';
  var user=getParam('u')||'';
  var base=(user.split('@')[0].split('.')[0])||role;
  SESSION={ role:role, user:user, fname:base.charAt(0).toUpperCase()+base.slice(1), lname:'' };
  applyRole(role);
  updateDashUser();
});
