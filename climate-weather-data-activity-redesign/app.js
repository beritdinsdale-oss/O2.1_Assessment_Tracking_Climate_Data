'use strict';

const ACIS_URL = 'https://data.rcc-acis.org/StnData';
const requestParameters = {
  sid: '351862', sdate: '1893', edate: String(new Date().getFullYear() - 1),
  meta: ['name','state','sids'], elems: [{ name:'avgt', interval:'yly', duration:'yly', reduce:'mean', maxmissing:15, prec:1 }]
};

let currentPage = 0;
let climateChart;
const pages = [...document.querySelectorAll('.page')];
const roadmapButtons = [...document.querySelectorAll('.roadmap-step')];
const pageCount = document.getElementById('page-count');

function stopVideo() {
  const iframe = document.getElementById('kaltura_player');
  if (!iframe || !iframe.src) return;
  // Reloading the player stops playback when the learner leaves the video page.
  iframe.src = iframe.src;
}

function showPage(index, moveFocus=true) {
  if (index < 0 || index >= pages.length) return;
  if (currentPage === 1 && index !== 1) stopVideo();
  pages.forEach((page,i) => { page.hidden = i !== index; page.classList.toggle('is-active', i === index); });
  roadmapButtons.forEach((btn,i) => {
    btn.classList.toggle('is-current', i === index);
    btn.classList.toggle('is-complete', i < index);
    if (i === index) btn.setAttribute('aria-current','step'); else btn.removeAttribute('aria-current');
  });
  currentPage = index;
  pageCount.textContent = `Stop ${index + 1} of ${pages.length}`;
  if (moveFocus) {
    const heading = pages[index].querySelector('h1,h2');
    if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
    window.scrollTo({top:0,behavior:'smooth'});
  }
}

document.querySelectorAll('.next-page').forEach(btn => btn.addEventListener('click', () => showPage(currentPage+1)));
document.querySelectorAll('.prev-page').forEach(btn => btn.addEventListener('click', () => showPage(currentPage-1)));
roadmapButtons.forEach(btn => btn.addEventListener('click', () => showPage(Number(btn.dataset.page))));
document.getElementById('restart').addEventListener('click', () => { resetQuestions(); showPage(0); });

function calculateTrend(data) {
  const n=data.length; const totals=data.reduce((s,d)=>({x:s.x+d.year,y:s.y+d.temperature,xy:s.xy+d.year*d.temperature,xx:s.xx+d.year*d.year}),{x:0,y:0,xy:0,xx:0});
  const denominator=n*totals.xx-totals.x*totals.x;
  if(!denominator) return data.map(d=>({x:d.year,y:d.temperature}));
  const slope=(n*totals.xy-totals.x*totals.y)/denominator; const intercept=(totals.y-slope*totals.x)/n;
  return data.map(d=>({x:d.year,y:slope*d.year+intercept}));
}

async function loadAcisData() {
  const body=new URLSearchParams({params:JSON.stringify(requestParameters)});
  const response=await fetch(ACIS_URL,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body});
  if(!response.ok) throw new Error(`Data service returned ${response.status}.`);
  const result=await response.json(); if(result.error) throw new Error(result.error);
  return result.data.map(([year,value])=>({year:Number(year),temperature:Number(value)})).filter(d=>Number.isFinite(d.year)&&Number.isFinite(d.temperature));
}

function fillTable(data){
  const body=document.getElementById('data-table-body'); const fragment=document.createDocumentFragment();
  data.forEach(d=>{const row=document.createElement('tr');const year=document.createElement('th');const value=document.createElement('td');year.scope='row';year.textContent=d.year;value.textContent=`${d.temperature.toFixed(1)} °F`;row.append(year,value);fragment.appendChild(row);});
  body.replaceChildren(fragment);
}

function drawChart(data){
  const ctx=document.getElementById('temperature-chart');
  const annual=data.map(d=>({x:d.year,y:d.temperature})); const trend=calculateTrend(data);
  climateChart=new Chart(ctx,{type:'line',data:{datasets:[
    {label:'Annual average temperature',data:annual,borderColor:'#176b8f',backgroundColor:'#176b8f',borderWidth:2,pointRadius:2.5,pointHoverRadius:7,tension:.08},
    {label:'Long-term trend',data:trend,borderColor:'#e96f51',backgroundColor:'#e96f51',borderWidth:4,borderDash:[10,7],pointRadius:0,tension:0}
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'nearest',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{title(items){return items.length?`Year: ${Math.round(items[0].parsed.x)}`:''},label(c){return `${c.dataset.label}: ${c.parsed.y.toFixed(1)} °F`;}}}},scales:{x:{type:'linear',title:{display:true,text:'Year',font:{weight:'bold'}},ticks:{callback:v=>String(Math.round(v))},grid:{color:'#eef2f4'}},y:{title:{display:true,text:'Annual average temperature (°F)',font:{weight:'bold'}},grid:{color:'#eef2f4'}}}}});
}

function setupTable(){
  const button=document.getElementById('toggle-table'), wrapper=document.getElementById('data-table-wrapper');
  button.addEventListener('click',()=>{const show=wrapper.hidden;wrapper.hidden=!show;button.setAttribute('aria-expanded',String(show));button.textContent=show?'Hide data table':'View data as a table';});
}

const feedback={
  q1:{correct:'Exactly. Individual years naturally vary. A cooler year can happen even while the longer-term pattern is warming.',incorrect:'Not quite. One cooler year is short-term variability. Climate trends are identified across many years.'},
  q2:{correct:'Yes. The trend line helps us see the overall direction while still keeping the year-to-year variability visible.',incorrect:'Try again. A trend line summarizes the overall direction across the record; it does not predict exact future years or remove unusual ones.'},
  q3:{correct:'Right. Long-term warming can influence the conditions gardeners experience, including heat, seasonal timing, and water demand.',incorrect:'Not quite. Climate data do not provide an exact weather forecast or eliminate frost risk. Think about how changing average conditions can shape garden conditions over time.'}
};

function showQuestion(index){
  const cards=[...document.querySelectorAll('.question-card')]; cards.forEach((c,i)=>{c.hidden=i!==index;c.classList.toggle('is-active',i===index)});
  const h=cards[index].querySelector('h3'); h.tabIndex=-1; h.focus();
}

document.querySelectorAll('.check-answer').forEach(btn=>btn.addEventListener('click',()=>{
  const card=btn.closest('.question-card'), id=card.dataset.question, selected=card.querySelector(`input[name="${id}"]:checked`), out=card.querySelector('.feedback');
  out.className='feedback';
  if(!selected){out.textContent='Choose an answer first.';out.classList.add('incorrect');return;}
  const correct=selected.value===card.dataset.correct; out.textContent=correct?feedback[id].correct:feedback[id].incorrect; out.classList.add(correct?'correct':'incorrect');
  const next=card.querySelector('.question-next, .finish-questions'); if(correct) next.hidden=false;
}));
document.querySelectorAll('.question-next').forEach((btn,i)=>btn.addEventListener('click',()=>showQuestion(i+1)));
document.querySelector('.finish-questions').addEventListener('click',()=>showPage(4));

function resetQuestions(){
  document.querySelectorAll('.question-card').forEach((card,i)=>{card.hidden=i!==0;card.querySelectorAll('input').forEach(input=>input.checked=false);const out=card.querySelector('.feedback');out.textContent='';out.className='feedback';card.querySelectorAll('.question-next,.finish-questions').forEach(b=>b.hidden=true);});
}

async function initialize(){
  setupTable(); showPage(0,false);
  const status=document.getElementById('data-status'), area=document.getElementById('chart-area');
  try{const data=await loadAcisData(); if(data.length<2) throw new Error('Not enough observations returned.'); fillTable(data); drawChart(data); area.hidden=false; status.textContent=`Loaded ${data.length} annual observations from ${data[0].year} through ${data[data.length-1].year}.`; status.classList.add('success');}
  catch(error){console.error(error);status.textContent='The Corvallis data could not be loaded. Refresh the page and check that the site has internet access.';status.classList.add('error');}
}

document.addEventListener('DOMContentLoaded',initialize);
