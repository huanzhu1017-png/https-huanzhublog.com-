// Shared sample contract data for the non-comp budget demo and the contract review page.
// Generic vendors and made-up figures. Edits are saved only in the visitor's browser.
(function(){
  let seed=31337;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const rnd=(a,b)=>a+R()*(b-a);
  const LOB=['East','West','Central','South','International'];
  const CN='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(x=>'Vendor '+x);
  const GL=['Software','Data','Subscriptions','Marketing','Hiring'];
  const TODAY=new Date('2026-11-13');
  let amt=5200;
  const CONS=CN.map((n,i)=>{const ttm=Math.round(amt);amt*=rnd(.76,.93);
    const r=R(),exp=r<.15?null:new Date(2025,8+Math.floor(R()*40),1+Math.floor(R()*27));
    const k=1+Math.floor(R()*4),paid=[LOB[0]].concat(LOB.slice(1).sort(()=>R()-.5).slice(0,k-1));
    const gl=[GL[i%3]].concat(R()<.4?[GL[(i+1)%3]]:[]).concat(i===9?[GL[3]]:i===12?[GL[4]]:[]);
    return{i,n,ttm:Math.max(40,ttm),exp,paid:[...new Set(paid)],gl:[...new Set(gl)],v27:null,dec:'',note:''}});
  CONS.forEach(c=>{const d=c.exp?(c.exp-TODAY)/864e5/30.4:null;c.st=d==null?'none':d<0?'exp':d<=6?'r6':d<=12?'r12':'act'});
  // a few decisions already made, so the demo has something to show
  const pre={1:[null,'Renew',''],2:[0.9,'Renegotiate','Asked for 10% off at renewal'],5:[0,'Cancel','Overlaps with another tool'],7:[0.85,'Renegotiate','Two contracts merged into one'],13:[0,'Cancel','Expired; nobody using it']};
  Object.entries(pre).forEach(([i,[f,d,n]])=>{const c=CONS[+i];if(f!=null)c.v27=Math.round(c.ttm*f);c.dec=d;c.note=n});
  const KEY='hz-demo-contracts';
  try{const sv=JSON.parse(localStorage.getItem(KEY)||'null');if(sv)sv.forEach((x,i)=>{if(CONS[i]&&x)Object.assign(CONS[i],x)})}catch(e){}
  window.HZ_CONTRACTS={
    list:CONS,
    ttm:()=>CONS.reduce((a,c)=>a+c.ttm,0),
    next:()=>CONS.reduce((a,c)=>a+(c.v27==null?c.ttm:c.v27),0),
    save:()=>{try{localStorage.setItem(KEY,JSON.stringify(CONS.map(c=>({v27:c.v27,dec:c.dec,note:c.note}))));return true}catch(e){return false}},
    STL:{none:['No end date','mut'],exp:['Expired','bad'],r6:['Renews soon','warn'],r12:['Renews this year','warn'],act:['Active','ok']}
  };
})();
