(() => {
'use strict';
const $ = s => document.querySelector(s), page = document.body.dataset.page;
const random = () => { const bytes = new Uint32Array(2); if (window.crypto?.getRandomValues) crypto.getRandomValues(bytes); else { bytes[0] = Math.random()*2**32; bytes[1] = Math.random()*2**32; } return Array.from(bytes, n => n.toString(36)).join('').toUpperCase(); };
const params = new URLSearchParams(location.search);
const run = params.get('run')?.slice(0,160) || 'run-' + random();
params.set('run',run); history.replaceState(null,'',location.pathname+'?'+params);
$('#run-label').textContent = 'Session: '+run;
const key = 'northstar-v1:'+run;
const fresh = () => ({version:1,events:[],tests:{},workflow:{details:[]}});
function fieldsForStorage(d){return ['firstName','lastName','email','purpose','notes'].some(f=>typeof d[f]!=='string') || typeof d.guidelines!=='boolean';}
let state = fresh();
const warning = message => { $('#storage-warning').textContent = message; };
try { const raw = localStorage.getItem(key); if(raw) { const s=JSON.parse(raw); if(s.version!==1 || !Array.isArray(s.events) || !s.tests || !s.workflow || !Array.isArray(s.workflow.details)) throw Error(); if (typeof s.tests !== 'object' || Array.isArray(s.tests) || typeof s.workflow !== 'object' || s.workflow.details.some(x=>typeof x!=='string') || s.events.some(e=>!e || typeof e.timestamp!=='string' || typeof e.type!=='string') || (s.jsCode && typeof s.jsCode!=='string') || (s.workflow.draft && (typeof s.workflow.draft!=='object' || fieldsForStorage(s.workflow.draft)))) throw Error(); state=s; } } catch { warning('Saved run data could not be read. A fresh in-memory run is active. Export diagnostics before leaving if storage is unavailable.'); }
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{warning('Browser storage is unavailable or full. Changes may be lost when navigating or refreshing. Export diagnostics to retain this page’s events.');}}
function log(type,details={}) {state.events.push({timestamp:new Date().toISOString(),run,page,type,details});save();}
const esc = x => String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = (file,extra={}) => file+'?'+new URLSearchParams({run,...extra});
const go = (file,extra) => {location.href=url(file,extra);};
function links(){document.querySelectorAll('a[href]').forEach(a=>{const u=new URL(a.getAttribute('href'),location.href);if(u.origin===location.origin && u.pathname.endsWith('.html')){u.searchParams.set('run',run);a.href=u.href;}});}
document.addEventListener('click',e=>{const el=e.target.closest('a,button');if(el)log('click',{control:el.id || el.textContent.trim().slice(0,90),destination:el.tagName==='A'?el.getAttribute('href'):undefined});});
log('page_load');
if(['html-test','navigation-destination','guidelines'].includes(page)){state.tests[page]='visited';log('test_completion',{test:page,signal:'page loaded; reading is not verified'});}
const appointments=PORTAL_CONFIG.appointments;
const qualifies = a => a.available && a.location==='Chicago' && a.format==='In person' && a.duration===30;
const correct = [...appointments].filter(qualifies).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];
const selected = () => appointments.find(a=>a.id===state.workflow.selected);
const summary = a => `<dl><dt>Appointment</dt><dd>${esc(a.id)}</dd><dt>Date</dt><dd>${esc(a.date)}</dd><dt>Time</dt><dd>${esc(a.time)} — America/Chicago</dd><dt>Location</dt><dd>${esc(a.location)}</dd><dt>Format</dt><dd>${esc(a.format)}</dd><dt>Duration</dt><dd>${a.duration} minutes</dd><dt>Availability</dt><dd>${a.available?'Available':'Fully booked'}</dd></dl>`;
const fields = ['firstName','lastName','email','purpose','notes'];
function errors(d){const result={};for(const f of fields)if(!String(d[f]||'').trim())result[f]='Please complete this field.';if(d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))result.email='Enter a valid email address.';if(d.purpose!=='Research visit')result.purpose='Select Research visit to arrange a research appointment.';if(d.notes?.trim()!=='Research demo')result.notes='Enter the required note exactly: Research demo';if(!d.guidelines)result.guidelines='Confirm that you have read the visit guidelines.';return result;}
const ready = () => {const w=state.workflow;return selected()?.id===correct?.id && w.details.includes(w.selected) && state.tests.guidelines && w.draft && !Object.keys(errors(w.draft)).length && w.reviewed;};
const incomplete = target => `<div class="panel"><h2>Booking incomplete</h2><p>Complete the visit guidelines, appointment details, visitor form, and review before confirmation. Choose the earliest available 30-minute in-person appointment in Chicago.</p><a class="button" href="${url(target||'guidelines.html')}">Resume booking</a></div>`;
if(page==='javascript-test'){
 if(!state.jsCode){state.jsCode='NS-JS-'+random();save();}
 if(state.tests.javascript)$('#js-code').textContent=state.jsCode;
 $('#reveal').onclick=()=>{$('#js-code').textContent=state.jsCode;state.tests.javascript='revealed';log('code_reveal');log('test_completion',{test:'javascript',signal:'reveal handler executed'});};
}
if(page==='appointments'){
 function render(){const list=appointments.filter(a=>(!$('#location').value||a.location===$('#location').value)&&(!$('#format').value||a.format===$('#format').value)&&(!$('#availability').value|| (a.available?'Available':'Fully booked')===$('#availability').value));$('#appointments').innerHTML=`<p>${list.length} appointments</p><div class="table-wrap"><table><thead><tr><th>Date / time</th><th>Location</th><th>Format / duration</th><th>Availability</th><th>Details</th></tr></thead><tbody>${list.map(a=>`<tr><td>${a.date}<br>${a.time} America/Chicago</td><td>${a.location}</td><td>${a.format}<br>${a.duration} minutes</td><td>${a.available?'Available':'Fully booked'}</td><td><a href="${url('details.html',{id:a.id})}" aria-label="View details for ${a.id}">${a.id} →</a></td></tr>`).join('')}</tbody></table></div>`;links();}
 ['location','format','availability'].forEach(id=>{$('#'+id).onchange=()=>{log('filter_change',{filter:id,value:$('#'+id).value});render();};});render();
}
if(page==='details'){
 const a=appointments.find(a=>a.id===params.get('id'));
 if(!a)$('#details').innerHTML='<p>Appointment not found.</p><a href="appointments.html">Browse appointments</a>';
 else {if(!state.workflow.details.includes(a.id))state.workflow.details.push(a.id);log('appointment_details_viewed',{appointment:a.id});$('#details').innerHTML=`<div class="panel">${summary(a)}</div><button id="book" ${!a.available?'disabled':''}>Book this appointment</button>${!a.available?'<p>This appointment is fully booked. Choose another appointment.</p>':''}`;$('#book').onclick=()=>{if(!a.available)return;if(state.workflow.selected!==a.id){state.workflow.draft=null;state.workflow.reviewed=false;state.workflow.confirmation=null;}state.workflow.selected=a.id;log('appointment_selection',{appointment:a.id});go('booking.html');};}
}
if(page==='booking'){
 const a=selected();
 if(!a || !state.workflow.details.includes(a.id))$('#booking').innerHTML=incomplete();
 else {const d=state.workflow.draft||{};$('#booking').innerHTML=`<div class="panel">${summary(a)}</div><p>Read the <a href="guidelines.html">visit guidelines</a> before submitting.</p><form novalidate><div id="errors" role="alert" tabindex="-1"></div>${[['firstName','First name'],['lastName','Last name'],['email','Email']].map(([id,label])=>`<label for="${id}">${label} (required)</label><input id="${id}" name="${id}" type="${id==='email'?'email':'text'}" required maxlength="150" value="${esc(d[id]||'')}" aria-describedby="${id}-error"><span class="error" id="${id}-error"></span>`).join('')}<label for="purpose">Visit purpose (required)</label><select id="purpose" required aria-describedby="purpose-error"><option value="">Select a purpose</option>${['Research visit','General inquiry','Campus tour'].map(v=>`<option ${d.purpose===v?'selected':''}>${v}</option>`).join('')}</select><span class="error" id="purpose-error"></span><label for="notes">Notes (required)</label><textarea id="notes" required maxlength="1000" aria-describedby="notes-error">${esc(d.notes||'')}</textarea><span class="error" id="notes-error"></span><label><input id="guidelines" type="checkbox" ${d.guidelines?'checked':''} aria-describedby="guidelines-error">I have read the visit guidelines (required)</label><span class="error" id="guidelines-error"></span><div class="actions"><button>Review booking</button></div></form>`;
 function collect(){return Object.fromEntries([...fields.map(f=>[f,$('#'+f).value]),['guidelines',$('#guidelines').checked]]);}
 $('form').onchange=e=>{state.workflow.draft=collect();state.workflow.reviewed=false;state.workflow.confirmation=null;log('field_change',{field:e.target.id,filled:e.target.type==='checkbox'?e.target.checked:!!e.target.value.trim()});};
 $('form').onsubmit=e=>{e.preventDefault();const draft=collect(),err=errors(draft);state.workflow.draft=draft;state.workflow.reviewed=false;for(const f of [...fields,'guidelines']){$('#'+f+'-error').textContent=err[f]||'';$('#'+f).setAttribute('aria-invalid',String(!!err[f]));}if(Object.keys(err).length){$('#errors').textContent='Please correct the highlighted fields.';$('#errors').focus();log('validation_error',{fields:Object.keys(err)});return;}log('form_submission',{fields:fields.map(field=>({field,filled:!!draft[field].trim()})),guidelines:true});go('review.html');};}
}
if(page==='review'){
 const a=selected(),d=state.workflow.draft;
 if(!a||!d||Object.keys(errors(d)).length)$('#review').innerHTML=incomplete('booking.html');
 else {state.workflow.reviewed=true;log('booking_review');$('#review').innerHTML=`<div class="panel">${summary(a)}<h2>Visitor information</h2><dl>${[...fields,'guidelines'].map(f=>`<dt>${({firstName:'First name',lastName:'Last name',email:'Email',purpose:'Visit purpose',notes:'Notes',guidelines:'Guidelines read'})[f]}</dt><dd>${esc(d[f]===true?'Yes':d[f])}</dd>`).join('')}</dl></div><div id="result" role="alert"></div><div class="actions"><a class="button secondary" href="booking.html">Return and edit booking</a><button id="confirm">Confirm booking</button></div>`;$('#confirm').onclick=()=>{if(!ready()){$('#result').innerHTML=incomplete();log('validation_error',{reason:'Appointment or workflow does not satisfy all requirements'});return;}if(!state.workflow.confirmation){state.workflow.confirmation={reference:'NS-'+random(),code:'DONE-'+random(),appointment:a.id};log('booking_confirmation',{appointment:a.id,reference:state.workflow.confirmation.reference});log('test_completion',{test:'booking'});}go('confirmation.html');};}
}
if(page==='confirmation'){
 const c=state.workflow.confirmation;
 $('#confirmation').innerHTML=c&&ready()&&c.appointment===selected()?.id?`<div class="panel"><span class="badge">Booking confirmed</span><h2>Research visit confirmed</h2><p>Your booking details and reference are shown below.</p><dl><dt>Booking reference</dt><dd>${esc(c.reference)}</dd><dt>Completion code</dt><dd>${esc(c.code)}</dd></dl>${summary(selected())}<h2>Visitor</h2><dl>${fields.map(f=>`<dt>${esc(f)}</dt><dd>${esc(state.workflow.draft[f])}</dd>`).join('')}</dl></div>`:incomplete();
}
if(page==='diagnostics'){
 $('#status').innerHTML=`<h2>Current session: ${esc(run)}</h2><p>Visitor reference: ${state.tests['html-test']?'page visited':'not observed'}<br>Arrival reference: ${state.tests['navigation-destination']?'destination visited':'not observed'}<br>Access code: ${state.tests.javascript?'code revealed':'not observed'}<br>Booking: ${state.workflow.confirmation&&ready()?'complete':'incomplete'}</p><p>Session activity is stored on your device. Export a copy before clearing browser data.</p>`;
 $('#timeline').innerHTML=state.events.map(e=>`<div class="event"><small>${esc(e.timestamp)} · ${esc(e.page)}</small><strong>${esc(e.type)}</strong><div>${esc(JSON.stringify(e.details))}</div></div>`).join('');
 $('#export').onclick=()=>{log('json_export');const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),run,...state},null,2)],{type:'application/json'});const href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download='northstar-run.json';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);};
 $('#reset').onclick=()=>{if(confirm('Reset all saved activity, codes, and booking information for this session?')){state=fresh();save();go('diagnostics.html');}};
}
links();save();
})();
