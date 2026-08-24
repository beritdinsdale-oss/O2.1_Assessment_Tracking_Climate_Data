"use strict";
const data=window.CORVALLIS_CLIMATE_DATA||[];
const screens=[...document.querySelectorAll(".screen")],steps=[...document.querySelectorAll(".steps li")];
const prev=document.querySelector("#previous"),next=document.querySelector("#next"),label=document.querySelector("#step-label");
let current=0; const answered={q1:false,q2:false,q3:false,q4:false};
const labels=["Start here","2024 weather","Long-term record","Variability","Put it together","Takeaway"];

function show(i){
 current=Math.max(0,Math.min(i,screens.length-1));
 screens.forEach((s,n)=>s.classList.toggle("active",n===current));
 steps.forEach((s,n)=>s.classList.toggle("active",n===current));
 label.textContent=labels[current]; prev.disabled=current===0; updateNext();
 window.scrollTo({top:0,behavior:"smooth"}); if(current===2)setTimeout(drawChart,30);
}
function updateNext(){
 if(current===0){next.disabled=false}
 else if(current===1)next.disabled=!answered.q1;
 else if(current===2)next.disabled=!answered.q2;
 else if(current===3)next.disabled=!answered.q3;
 else if(current===4)next.disabled=!answered.q4;
 else next.disabled=true;
 next.textContent=current===4?"Finish →":"Next →";
}
document.querySelector(".begin").addEventListener("click",()=>show(1));
prev.addEventListener("click",()=>show(current-1));next.addEventListener("click",()=>{if(!next.disabled)show(current+1)});
document.querySelector(".restart").addEventListener("click",()=>{Object.keys(answered).forEach(k=>answered[k]=false);document.querySelectorAll(".answer").forEach(b=>b.classList.remove("selected","correct","incorrect"));document.querySelectorAll(".feedback").forEach(f=>{f.textContent="";f.className="feedback"});show(0)});

document.querySelectorAll(".answer-stack").forEach(group=>group.querySelectorAll(".answer").forEach(btn=>btn.addEventListener("click",()=>{
 const q=group.dataset.question,fb=document.querySelector(`#${q}-feedback`);
 group.querySelectorAll(".answer").forEach(b=>b.classList.remove("selected","correct","incorrect"));btn.classList.add("selected");
 const ok=btn.dataset.correct==="true";btn.classList.add(ok?"correct":"incorrect");
 if(ok){answered[q]=true;fb.className="feedback good";
   const txt={q1:"Exactly. A single warmer-than-normal growing season is weather evidence. Climate change requires a pattern across many years.",
   q2:"Yes. The individual years preserve the ups and downs that a trend line intentionally smooths over.",
   q3:"Right. Climate trends do not require every year to be warmer than the year before it.",
   q4:"Exactly. One year is part of the record; the long record tells us whether a broader pattern is present."};fb.innerHTML="<strong>Yes.</strong> "+txt[q];
 } else {fb.className="feedback try";fb.textContent="Not quite. Focus on the difference between an individual year and the pattern across many years."}
 updateNext();
})));

function svgEl(name,attrs={},text=""){const e=document.createElementNS("http://www.w3.org/2000/svg",name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;return e}
function trend(){
 const n=data.length,s=data.reduce((a,d)=>{a.x+=d.year;a.y+=d.temperature;a.xy+=d.year*d.temperature;a.xx+=d.year*d.year;return a},{x:0,y:0,xy:0,xx:0});
 const m=(n*s.xy-s.x*s.y)/(n*s.xx-s.x*s.x),b=(s.y-m*s.x)/n;return {m,b};
}
function drawChart(){
 const c=document.querySelector("#climate-chart"); if(!c||!data.length)return;
 const years=document.querySelector("#show-years").checked,tr=document.querySelector("#show-trend").checked;
 const w=Math.max(690,c.clientWidth||900),h=400,m={top:22,right:25,bottom:48,left:58},pw=w-m.left-m.right,ph=h-m.top-m.bottom;
 const minY=48,maxY=56,minX=1950,maxX=2024,x=v=>m.left+(v-minX)/(maxX-minX)*pw,y=v=>m.top+ph-(v-minY)/(maxY-minY)*ph;
 const svg=svgEl("svg",{viewBox:`0 0 ${w} ${h}`,width:"100%",height:"100%","aria-hidden":"true"});
 [48,50,52,54,56].forEach(v=>{svg.append(svgEl("line",{x1:m.left,x2:w-m.right,y1:y(v),y2:y(v),stroke:"#ddd8cd"}));svg.append(svgEl("text",{x:m.left-9,y:y(v)+4,"text-anchor":"end",fill:"#5d675f","font-size":"12"},`${v}°`))});
 [1950,1960,1970,1980,1990,2000,2010,2020].forEach(v=>svg.append(svgEl("text",{x:x(v),y:h-17,"text-anchor":"middle",fill:"#5d675f","font-size":"12"},String(v))));
 svg.append(svgEl("text",{x:17,y:h/2,transform:`rotate(-90 17 ${h/2})`,"text-anchor":"middle",fill:"#5d675f","font-size":"12","font-weight":"700"},"Annual mean temperature (°F)"));
 if(years){data.forEach(d=>{svg.append(svgEl("circle",{cx:x(d.year),cy:y(d.temperature),r:d.year===2024?5:3.2,fill:d.year===2024?"#b84c24":"#39768c",opacity:".88"}))})}
 if(tr){const t=trend(),v1=t.m*minX+t.b,v2=t.m*maxX+t.b;svg.append(svgEl("line",{x1:x(minX),y1:y(v1),x2:x(maxX),y2:y(v2),stroke:"#286044","stroke-width":"4","stroke-dasharray":"10 6","stroke-linecap":"round"}));}
 c.replaceChildren(svg);
 const note=document.querySelector("#chart-note");
 note.textContent=tr?"The trend line summarizes the broader direction; the dots show that individual years still vary around it.":"Start with the individual years. Notice how much they move up and down.";
}
document.querySelectorAll("#show-years,#show-trend").forEach(e=>e.addEventListener("change",drawChart));
window.addEventListener("resize",()=>{if(current===2){clearTimeout(window._r);window._r=setTimeout(drawChart,100)}});

const tbody=document.querySelector("#climate-table-body");
data.forEach(d=>{const tr=document.createElement("tr");tr.innerHTML=`<th scope="row">${d.year}</th><td>${d.temperature.toFixed(1)}</td>`;tbody.appendChild(tr)});
document.querySelector("#toggle-table").addEventListener("click",e=>{const w=document.querySelector("#table-wrap"),open=w.hidden;w.hidden=!open;e.currentTarget.setAttribute("aria-expanded",String(open));e.currentTarget.textContent=open?"Hide accessible annual data table":"View accessible annual data table"});

show(0);drawChart();
