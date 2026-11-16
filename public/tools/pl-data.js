// Shared market P&L for the Controller and the Reporting demos (needs brokers-data.js first).
// Revenue and commission come broker by broker; costs are spread to markets by broker count or revenue share.
(function(){
  const H=window.HZ_BROKERS,BK=H.list;
  // quarterly revenue by line (Lease, Sales, Debt), from the revenue forecast demo
  const Q={2025:[[50053510,30588256,12049919],[54106433,33065042,13025623],[58129698,35523704,13994187],[71109184,51722835,13308805]],
           2026:[[54841403,35181277,13451665],[58325634,37416445,14306288],[63076553,40464204,15471607],[75569644,55386888,15464387]]};
  const FYL=y=>[0,1,2].map(i=>Q[y].reduce((a,q)=>a+q[i],0)),YTDL=y=>[0,1,2].map(i=>Q[y].slice(0,3).reduce((a,q)=>a+q[i],0));
  const SH={2025:YTDL(2025).map((v,i)=>v/FYL(2025)[i]),2026:YTDL(2026).map((v,i)=>v/FYL(2026)[i])};
  // each broker's 2025 production: brokers hired in 2026 had none; the rest scaled to 95% of 2025 revenue by line
  let s=4242;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};
  BK.forEach(b=>{b.isNew=b.lv===2&&R()<.45;const g=-.35+R()*.95;b.p25=b.isNew?0:b.p26/(1+g)});
  const F25=FYL(2025);[0,1,2].forEach(i=>{const t=BK.filter(b=>b.ln===i).reduce((a,b)=>a+b.p25,0);BK.forEach(b=>{if(b.ln===i)b.p25=b.p25*F25[i]*.95/t})});
  // costs, $K
  const NC={2026:{'Contracts':23790,'Offices':36500,'Travel and entertainment':15200,'Professional and consulting fees':26000,'Events':5699},
            2027:{'Contracts':21250,'Offices':33491,'Travel and entertainment':15103,'Professional and consulting fees':24421,'Events':4913}};
  const AL={2026:{'Corporate comp':48112,'Shared services':40300,'Fixed costs':8600},2027:{'Corporate comp':54035,'Shared services':40491,'Fixed costs':8773}};
  const k25=.925;NC[2025]={};AL[2025]={};Object.entries(NC[2026]).forEach(([k,v])=>NC[2025][k]=Math.round(v*k25));Object.entries(AL[2026]).forEach(([k,v])=>AL[2025][k]=Math.round(v*k25));
  const NB={2025:(F25[0]+F25[1]+F25[2])*.05};
  function pnl(yr){
    const RS=H.settings(),KS=H.kSettings();NB[2026]=H.NB;NB[2027]=H.NB*(1+RS.nbg/100);
    const rows={};H.MK.forEach(([m,rg])=>rows[m]={m,rg,rev:[0,0,0],nh:0,other:0,com:0,loan:0,n:0});
    H.terms.forEach(c=>{const b=c.b,r=rows[b.mk],p=yr===2027?H.p27(b,RS):yr===2026?b.p26:b.p25;if(!p&&yr===2025)return;r.rev[b.ln]+=p;r.com+=H.commission(c,p,KS,yr);r.loan+=c.loan;r.n++});
    if(yr===2027)H.MK.forEach(([m])=>{const n=RS.nh[m]||0,p=RS.nhp*1e3*.5;rows[m].nh=n*p;rows[m].com+=n*H.gridC(p,KS.grid,0);rows[m].n+=n});
    const corp={m:'Corporate (fees, finance topside)',rg:'Corporate',rev:[0,0,0],nh:0,other:NB[yr],com:0,loan:0,n:0};
    const L=Object.values(rows).concat([corp]);L.forEach(r=>r.revT=r.rev[0]+r.rev[1]+r.rev[2]+r.nh+r.other);
    const totRev=L.reduce((a,r)=>a+r.revT,0),totN=L.reduce((a,r)=>a+r.n,0);
    L.forEach(r=>{r.direct={};Object.entries(NC[yr]).forEach(([k,v])=>r.direct[k]=v*1e3*(.5*r.n/totN+.5*r.revT/totRev));r.alloc={};Object.entries(AL[yr]).forEach(([k,v])=>r.alloc[k]=v*1e3*r.revT/totRev);
      r.dT=Object.values(r.direct).reduce((a,b)=>a+b,0);r.aT=Object.values(r.alloc).reduce((a,b)=>a+b,0);r.contrib=r.revT-r.com-r.loan;r.op=r.contrib-r.dT-r.aT});
    return L}
  // Jan–Sep view of a year: revenue by each line's Jan–Sep share, commission with it, costs at 9/12
  function ytd(yr){const L=pnl(yr),sh=SH[yr];return L.map(r=>{const rev=r.rev.map((v,i)=>v*sh[i]),o=r.other*.7,revT=rev[0]+rev[1]+rev[2]+o,f=r.revT?revT/r.revT:0;
    const x={m:r.m,rg:r.rg,rev,other:o,nh:0,revT,com:r.com*f,loan:r.loan*.75,n:r.n,dT:r.dT*.75,aT:r.aT*.75};x.contrib=x.revT-x.com-x.loan;x.op=x.contrib-x.dT-x.aT;return x})}
  function sum(L){const o={revT:0,com:0,loan:0,contrib:0,dT:0,aT:0,op:0,rev:[0,0,0]};L.forEach(r=>{['revT','com','loan','contrib','dT','aT','op'].forEach(k=>o[k]+=r[k]);r.rev.forEach((v,i)=>o.rev[i]+=v)});return o}
  window.HZ_PL={pnl,ytd,sum,Q,FYL,YTDL,SH,NC,AL};
})();
