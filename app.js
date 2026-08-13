const pages=[...document.querySelectorAll(".page")];
const steps=[...document.querySelectorAll(".road-step")];
let current=0;
let chart;
let questionCharts=[];

function stopVideo(){
  const frame=document.querySelector("#kalturaFrame");
  if(!frame) return;
  const src=frame.src;
  frame.src="";
  frame.src=src;
}

function showPage(index){
  const old=current;
  current=Math.max(0,Math.min(pages.length-1,index));
  pages.forEach((p,i)=>p.classList.toggle("active",i===current));
  steps.forEach((s,i)=>s.classList.toggle("active",i===current));
  if(old===1 && current!==1) stopVideo();
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll(".next").forEach(btn=>btn.addEventListener("click",()=>showPage(current+1)));
document.querySelectorAll(".back").forEach(btn=>btn.addEventListener("click",()=>showPage(current-1)));
steps.forEach((btn,i)=>btn.addEventListener("click",()=>showPage(i)));

const questionCards=[...document.querySelectorAll(".question-card")];
questionCards.forEach((card,index)=>{
  const answers=[...card.querySelectorAll(".answer")];
  const feedback=card.querySelector(".feedback");
  const next=card.querySelector(".question-next");

  answers.forEach(answer=>{
    answer.addEventListener("click",()=>{
      answers.forEach(a=>a.classList.remove("selected","correct","incorrect"));
      answer.classList.add("selected");
      const correct=answer.dataset.correct==="true";
      answer.classList.add(correct?"correct":"incorrect");
      feedback.classList.remove("hidden");
      feedback.textContent=correct
        ? "Yes. Climate is a long-term pattern, so individual years can still bounce above or below that pattern."
        : "Not quite. Climate trends do not mean every year changes in the same direction. Year-to-year variability still occurs.";
      next.classList.remove("hidden");
    });
  });

  next.addEventListener("click",()=>{
    if(index<questionCards.length-1){
      card.classList.remove("active");
      questionCards[index+1].classList.add("active");
      questionCards[index+1].scrollIntoView({behavior:"smooth",block:"start"});
    }else{
      showPage(4);
    }
  });
});

document.querySelector("#restart").addEventListener("click",()=>{
  questionCards.forEach((card,i)=>{
    card.classList.toggle("active",i===0);
    card.querySelectorAll(".answer").forEach(a=>a.classList.remove("selected","correct","incorrect"));
    card.querySelector(".feedback").classList.add("hidden");
    card.querySelector(".question-next").classList.add("hidden");
  });
  showPage(0);
});

async function loadClimateData(){
  const status=document.querySelector("#chartStatus");
  const tbody=document.querySelector("#dataTable tbody");

  try{
    const payload={
      sid:"351862",
      sdate:"1950-01-01",
      edate:"por",
      elems:[{
        name:"avgt",
        interval:"yly",
        duration:1,
        reduce:"mean",
        units:"degreeF"
      }]
    };

    const url="https://data.rcc-acis.org/StnData?params="+encodeURIComponent(JSON.stringify(payload));
    const response=await fetch(url);
    if(!response.ok) throw new Error("Data request failed");
    const json=await response.json();

    const rows=(json.data||[])
      .map(r=>({year:String(r[0]).slice(0,4),value:Number(r[1])}))
      .filter(r=>Number.isFinite(r.value));

    if(rows.length<2) throw new Error("Not enough data");

    tbody.innerHTML=rows.map(r=>`<tr><td>${r.year}</td><td>${r.value.toFixed(1)}</td></tr>`).join("");

    const x=rows.map((_,i)=>i);
    const y=rows.map(r=>r.value);
    const n=x.length;
    const sx=x.reduce((a,b)=>a+b,0), sy=y.reduce((a,b)=>a+b,0);
    const sxy=x.reduce((sum,xi,i)=>sum+xi*y[i],0);
    const sx2=x.reduce((sum,xi)=>sum+xi*xi,0);
    const slope=(n*sxy-sx*sy)/(n*sx2-sx*sx);
    const intercept=(sy-slope*sx)/n;
    const trend=x.map(i=>intercept+slope*i);

    const labels=rows.map(r=>r.year);

    function makeChartConfig(compact=false){
      return {
        type:"line",
        data:{
          labels,
          datasets:[
            {
              label:"Annual average temperature",
              data:y,
              borderWidth:2,
              pointRadius:compact?1.5:2,
              pointHoverRadius:5,
              tension:.08
            },
            {
              label:"Long-term trend",
              data:trend,
              borderWidth:compact?3:4,
              pointRadius:0,
              tension:0
            }
          ]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          interaction:{mode:"nearest",intersect:false},
          plugins:{
            legend:{position:"bottom",labels:{boxWidth:compact?16:22}},
            tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${Number(c.raw).toFixed(1)} °F`}}
          },
          scales:{
            x:{title:{display:true,text:"Year"},ticks:{maxTicksLimit:compact?8:10}},
            y:{title:{display:true,text:"Annual average temperature (°F)"}}
          }
        }
      };
    }

    chart=new Chart(document.querySelector("#climateChart"),makeChartConfig(false));

    questionCharts.forEach(c=>c.destroy());
    questionCharts=["questionChart0","questionChart1","questionChart2"]
      .map(id=>{
        const el=document.getElementById(id);
        return el ? new Chart(el,makeChartConfig(true)) : null;
      })
      .filter(Boolean);

    status.textContent=`Loaded ${rows.length} years of annual average temperature data from the Corvallis station.`;
  }catch(error){
    status.textContent="The live station data could not be loaded. Try refreshing the page or use the xmACIS link on the final screen.";
    console.error(error);
  }
}

loadClimateData();
showPage(0);
