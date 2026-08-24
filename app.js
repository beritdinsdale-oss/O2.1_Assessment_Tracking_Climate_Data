"use strict";
const pages=[...document.querySelectorAll(".page")],dots=[...document.querySelectorAll(".nav li")],back=document.querySelector("#back"),next=document.querySelector("#next"),step=document.querySelector("#stepName");
const names=["Start here","Weather stations","Learn xmACIS","Corvallis research","Your climate snapshot","Finish"];
let current=0; const q1={done:false};
function show(n){current=Math.max(0,Math.min(n,pages.length-1));pages.forEach((p,i)=>p.classList.toggle("active",i===current));dots.forEach((d,i)=>d.classList.toggle("on",i===current));step.textContent=names[current];back.disabled=current===0;next.disabled=current===5;next.textContent=current===4?"Finish →":"Next →";window.scrollTo({top:0,behavior:"smooth"})}
document.querySelector(".start").onclick=()=>show(1);back.onclick=()=>show(current-1);next.onclick=()=>show(current+1);document.querySelector(".restart").onclick=()=>show(0);

document.querySelectorAll(".answers").forEach(g=>g.querySelectorAll("button").forEach(b=>b.onclick=()=>{
 g.querySelectorAll("button").forEach(x=>x.classList.remove("correct","wrong"));const ok=b.dataset.ok==="true";b.classList.add(ok?"correct":"wrong");
 document.querySelector("#q1-feedback").innerHTML=ok?"<strong>Exactly.</strong> Climate questions become possible because the same kinds of observations are collected repeatedly across a long record.":"Try again. The key is not just what a station measures, but how long and consistently observations are collected.";
}));

const val=name=>document.querySelector(`input[name="${name}"]:checked`)?.value||"";
document.querySelector("#checkCorvallis").onclick=()=>{
 const t=val("c_temp"),p=val("c_precip"),f=val("c_frost"),box=document.querySelector("#corvallisFeedback");
 if(!t||!p||!f){box.textContent="Answer all three Corvallis questions first.";return}
 let msg=[];
 if(t==="warming") msg.push("Your temperature interpretation matches the long-term Corvallis pattern.");
 else msg.push("Take another look at the temperature trend across the full record rather than a few individual years.");
 if(p==="variable") msg.push("For precipitation, noticing strong year-to-year variability and a less obvious long-term direction is a reasonable reading of the record.");
 else msg.push("For precipitation, look again at the full record and compare the size of the year-to-year swings with the overall trend.");
 msg.push("For last spring freeze, focus on the trend across the dates rather than expecting every year to move in the same direction. The point of this practice is learning how to read the evidence, not guessing from one or two years.");
 box.innerHTML=msg.map(x=>`<p>${x}</p>`).join("");
};

document.querySelector("#saveJournal").onclick=()=>{
 const entry={
  activity:"Tracking Climate Data",
  saved:new Date().toISOString(),
  station:document.querySelector("#station").value.trim(),
  temperatureTrend:val("l_temp"),
  precipitationTrend:val("l_precip"),
  lastSpringFreezeTrend:val("l_frost"),
  standout:document.querySelector("#standout").value.trim(),
  gardenQuestion:document.querySelector("#gardenQuestion").value.trim()
 };
 if(!entry.station){document.querySelector("#saveStatus").textContent="Add your station or location before saving.";return}
 localStorage.setItem("fieldNotebook.climateSnapshot",JSON.stringify(entry));
 document.querySelector("#saveStatus").textContent="Saved in this browser. This entry is ready for the Field Notebook to retrieve.";
};
show(0);