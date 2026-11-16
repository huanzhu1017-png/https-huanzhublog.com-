// Shared sample brokers for the revenue budget and the broker contract demo.
// 500 made-up brokers; 2026 production adds up to 95% of the demo's 2026 full-year revenue.
(function(){
  const FY=[251813235.37133282,168448814.26736265,58693946.98512871];
  const MK=[['New York','East',3.0],['Boston','East',1.0],['DC','East',.9],['Atlanta','East',.8],['Miami','East',.7],
   ['Chicago','West',1.1],['Dallas','West',1.0],['Houston','West',.8],['Denver','West',.6],['LA','West',1.3],['San Francisco','West',1.1],['Seattle','West',.6],
   ['London','International',.8],['Toronto','International',.4]];
  let bs=20270101;const r2=()=>{bs=(bs*16807)%2147483647;return bs/2147483647};
  const wt=MK.reduce((a,m)=>a+m[2],0);let alloc=MK.map(m=>Math.round(500*m[2]/wt));alloc[0]+=500-alloc.reduce((a,b)=>a+b,0);
  const BK=[];let id=1;const mean=[2.6e6,.9e6,.32e6];
  MK.forEach(([mk,rg],j)=>{for(let k=0;k<alloc[j];k++){
    const u=r2(),ln=rg==='International'?(u<.82?0:1):(u<.66?0:u<.88?1:2),v=r2(),lv=v<.1?0:v<.68?1:2;
    const p=Math.exp(Math.log(mean[lv])+.45*Math.sqrt(-2*Math.log(r2()||1e-9))*Math.cos(2*Math.PI*r2()));
    const leave=r2()<.045?1+Math.floor(r2()*11):0;
    BK.push({id:'B'+String(id++).padStart(3,'0'),mk,rg,ln,lv,p26:p,leave})}});
  [0,1,2].forEach(i=>{const t=BK.filter(b=>b.ln===i).reduce((a,b)=>a+b.p26,0);BK.forEach(b=>{if(b.ln===i)b.p26=b.p26*FY[i]*.95/t})});
  // revenue budget assumptions: defaults, plus whatever the visitor changed on the revenue budget tab
  const D={g:[4,8,10],lv:[3,6,25],nh:{},nhp:250,nbg:3,ov:{}};MK.forEach(m=>D.nh[m[0]]=Math.max(0,Math.round(m[2]*2.2)));
  function settings(){try{return Object.assign(JSON.parse(JSON.stringify(D)),JSON.parse(localStorage.getItem('hz-demo-revbud2')||'{}'))}catch(e){return JSON.parse(JSON.stringify(D))}}
  function p27(b,S){const m=b.p26*S.g[b.ln]/100,l=(b.p26+m)*S.lv[b.lv]/100,full=b.p26+m+l,f=b.leave?full*(b.leave-1)/12:full;const o=S.ov[b.id];return o!=null?o*1e3:f}
  const FYT=FY[0]+FY[1]+FY[2],NB=FYT*.05;
  function total27(S){return BK.reduce((a,b)=>a+p27(b,S),0)+MK.reduce((a,m)=>a+(S.nh[m[0]]||0)*S.nhp*1e3*.5,0)+NB*(1+S.nbg/100)}
  window.HZ_BROKERS={list:BK,FY,MK,defaults:D,settings,p27,total27,FYT,NB};
})();
