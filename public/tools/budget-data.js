// One source for the budgets behind the non-comp budget and the P&L: events, corporate headcount,
// and the roll-up of every cost type. Needs contracts-data.js and cost-data.js first.
// Made-up data. Edits are saved only in the visitor's browser.
(function(){
const sum=a=>a.reduce((x,y)=>x+y,0);

/* ======================= EVENTS ======================= */
const OWN={ev:'Company events',cm:'West team',df:'South team',ls:'East team',in:'International team'};
const E=[
 {n:'Company summit',g:'ev',ie:'Internal',reg:'US',ind:'Office',who:'East lead',b26:464,f25:440,f26:483,adj:9,why:'add',act:0,ok:1,note:'Held flat at the 2026 level.',m:[9],d:'Sep 14–16',c:'Chicago, IL',own:1},
 {n:'Industry forum',g:'ev',ie:'Both',reg:'US',ind:'Industrial',who:'West lead',b26:289,f25:260,f26:297,adj:-8,why:'scope',act:253,ok:1,note:'Venue booked; sponsor credits cover part.',m:[2],d:'Feb 9–11',c:'Denver, CO',own:1},
 {n:'Client summit',g:'ev',ie:'Internal',reg:'US',ind:'Office',who:'Central lead',b26:278,f25:195,f26:0,adj:239,why:'add',act:0,ok:1,note:'Returns in 2027 after a year off.',m:[4],d:'Apr 12–14',c:'Atlanta, GA',own:1},
 {n:'Leadership offsite',g:'ev',ie:'Internal',reg:'US',ind:'Internal',who:'COO office',b26:0,f25:0,f26:193,adj:-193,why:'oneoff',act:0,ok:1,note:'One-off in 2026.',m:null,own:1},
 {n:'Client dinner',g:'ev',ie:'External',reg:'US',ind:'Office',who:'East lead',b26:175,f25:170,f26:153,adj:-153,why:'elim',act:0,ok:1,note:'Dropped for 2027.',m:[12],d:'Date TBD',ph:1,c:'Boston, MA',own:1},
 {n:'Training program',g:'ev',ie:'Internal',reg:'US',ind:'Internal',who:'HR lead',b26:179,f25:169,f26:157,adj:-157,why:'defer',act:0,ok:1,note:'Skipped in 2027, back in 2028.',m:null,own:1},
 {n:'Trade group A',g:'ls',ie:'External',reg:'US',ind:'Office',who:'Central lead',b26:132,f25:127,f26:138,adj:-112,why:'scope',act:0,ok:1,note:'Smaller host package instead of a full sponsorship.',m:[11],d:'Nov 8–10',c:'Nashville, TN'},
 {n:'Holiday party',g:'ev',ie:'Internal',reg:'US',ind:'Internal',who:'COO office',b26:130,f25:127,f26:130,adj:0,why:'add',act:0,ok:1,note:'Held at the 2026 level.',m:[12],d:'Dec 9',c:'New York, NY',own:1},
 {n:'Industry gala',g:'ls',ie:'External',reg:'US',ind:'Office',who:'East lead',b26:55,f25:52,f26:104,adj:-104,why:'elim',act:0,ok:1,note:'Dropped; teams can buy tables from their own budget.',m:[1],d:'Jan 14',c:'Philadelphia, PA'},
 {n:'Roundtable',g:'ls',ie:'Internal',reg:'US',ind:'Tech',who:'Central lead',b26:48,f25:38,f26:46,adj:0,why:'add',act:0,ok:1,note:'Held at the 2026 level.',m:[6],d:'Jun 2–4',c:'Austin, TX',own:1},
 {n:'Awards dinner',g:'ls',ie:'External',reg:'US',ind:'Office',who:'Marketing lead',b26:37,f25:33,f26:43,adj:-10,why:'scope',act:0,ok:0,flag:'Checking actuals',note:'Fewer tables.',m:[7],d:'July',ph:1,c:'Charlotte, NC'},
 {n:'Trade show A',g:'ls',ie:'External',reg:'US',ind:'General',who:'South lead',b26:14,f25:14,f26:14,adj:0,why:'add',act:0,ok:1,note:'Flat to 2026.',m:[5],d:'May 2–5',c:'Baltimore, MD'},
 {n:'Trade show B',g:'ls',ie:'External',reg:'US',ind:'General',who:'South lead',b26:8,f25:8,f26:8,adj:0,why:'add',act:0,ok:1,note:'Flat to 2026.',m:[10],d:'Oct 13–15',c:'St. Louis, MO'},
 {n:'Spring convention',g:'cm',ie:'External',reg:'US',ind:'Retail',who:'West lead',b26:687,f25:667,f26:687,adj:10,why:'add',act:136,ok:1,note:'2026 plus inflation; deposit paid.',m:[5],d:'May 24–26',c:'Orlando, FL',fund:[.96,.03,.01]},
 {n:'Fall convention',g:'cm',ie:'External',reg:'US',ind:'Retail',who:'West lead',b26:290,f25:315,f26:379,adj:-135,why:'scope',act:0,ok:1,note:'Smaller booth proposal.',m:[12],d:'Dec 8–9',c:'Boston, MA'},
 {n:'Industry meetings',g:'cm',ie:'External',reg:'US',ind:'Finance',who:'Central lead',b26:88,f25:81,f26:90,adj:0,why:'add',act:1,ok:1,note:'Held flat; spring and fall.',m:[5,10],d:['May 11–13','Oct 18–20'],c:['Portland, OR','Pittsburgh, PA']},
 {n:'Trade group B',g:'cm',ie:'External',reg:'US',ind:'Industrial',who:'West lead',b26:26,f25:25,f26:32,adj:-1,why:'scope',act:0,ok:1,note:'Spring and fall chapters.',m:[3,10],d:['Mar 9–10','Oct 20–21'],c:['San Antonio, TX','Columbus, OH']},
 {n:'Finance conference',g:'cm',ie:'External',reg:'US',ind:'Finance',who:'South lead',b26:41,f25:35,f26:30,adj:0,why:'add',act:0,ok:1,note:'Held at 2026.',m:[2],d:'Feb 7–10',c:'San Jose, CA'},
 {n:'Trade group C',g:'cm',ie:'External',reg:'US',ind:'Industrial',who:'West lead',b26:8,f25:0,f26:0,adj:7,why:'add',act:0,ok:0,flag:'New proposal',note:'New request from the team.',m:[5,11],d:['May 5–8','Nov 3–6'],c:['Tampa, FL','Minneapolis, MN']},
 {n:'Investor forum',g:'df',ie:'Both',reg:'US',ind:'Housing',who:'South lead',b26:563,f25:529,f26:722,adj:-288,why:'scope',act:259,ok:1,note:'Smaller venue, one night fewer.',m:[5],d:'May 10–12',c:'Location TBD',own:1,fund:[.98,.02,0]},
 {n:'Industry conference',g:'df',ie:'External',reg:'US',ind:'Housing',who:'South lead',b26:239,f25:220,f26:215,adj:74,why:'add',act:289,ok:1,note:'Contracts signed.',m:[1],d:'Jan 26–28',c:'Las Vegas, NV'},
 {n:'Team meeting',g:'df',ie:'Internal',reg:'US',ind:'Housing',who:'South lead',b26:126,f25:121,f26:12,adj:106,why:'add',act:0,ok:1,note:'Back in person; 2026 was held virtually.',m:[11],d:'November',ph:1,c:'To confirm',own:1},
 {n:'Regional client event',g:'df',ie:'External',reg:'US',ind:'Housing',who:'South lead',b26:13,f25:0,f26:0,adj:21,why:'add',act:0,ok:1,note:'New for 2027.',m:[9],d:'Date TBD',ph:1,c:'Houston, TX',own:1},
 {n:'Client reception',g:'df',ie:'External',reg:'US',ind:'Housing',who:'West lead',b26:3,f25:5,f26:13,adj:-6,why:'scope',act:0,ok:1,note:'Halved from 2026.',m:[6],d:'Jun 6–8',c:'San Diego, CA',own:1},
 {n:'Policy summit',g:'df',ie:'External',reg:'US',ind:'Housing',who:'South lead',b26:16,f25:0,f26:0,adj:18,why:'add',act:0,ok:1,note:'Confirmed by the team.',m:[11],d:'Date TBD',ph:1,c:'Washington, DC'},
 {n:'Sports hospitality',g:'df',ie:'External',reg:'US',ind:'Finance',who:'West lead',b26:62,f25:65,f26:103,adj:-103,why:'elim',act:0,ok:1,note:'Dropped; teams can pay from their own budget.',m:[2],d:'Feb 8–14',c:'Phoenix, AZ',fund:[.9,.1,0]},
 {n:'International fair A',g:'in',ie:'External',reg:'International',ind:'Global',who:'International lead',b26:228,f25:219,f26:299,adj:0,why:'add',act:0,ok:1,note:'Held at 2026 full year.',m:[3],d:'Mar 16–19',c:'Amsterdam, Netherlands'},
 {n:'International fair B',g:'in',ie:'External',reg:'International',ind:'Global',who:'International lead',b26:265,f25:275,f26:319,adj:0,why:'add',act:0,ok:1,note:'Held flat.',m:[10],d:'Oct 4–6',c:'Paris, France'},
 {n:'International forum',g:'in',ie:'External',reg:'International',ind:'Global',who:'International lead',b26:50,f25:46,f26:113,adj:0,why:'add',act:0,ok:0,flag:'Team to confirm',note:'Held flat; team to confirm.',m:[5],d:'May 18–20',c:'Dublin, Ireland'},
 {n:'Asia summit',g:'in',ie:'External',reg:'International',ind:'Office',who:'International lead',b26:34,f25:31,f26:27,adj:0,why:'add',act:0,ok:1,note:'Flat to 2026.',m:[3],d:'Mar 2–4',c:'Singapore'}
];
const XTRA=[ // industry events on the calendar with no budget
 [1,'Jan 12–14','Industry outlook day','Miami, FL'],[2,'Feb 17–19','Tech expo','Las Vegas, NV'],[3,'Mar 23–25','Spring trade show','Dallas, TX'],
 [4,'Apr 20–22','Workplace forum','Denver, CO'],[5,'May 17–19','Investment forum','Berlin, Germany'],[6,'Jun 14–16','Summer conference','New York, NY'],
 [8,'Aug 24–26','Tech summit','Austin, TX'],[9,'Sep 21–23','Workplace forum, Europe','London, UK'],[10,'Oct 26–27','Tech week','New York, NY'],[11,'Nov 16–17','Fall trade show','Atlanta, GA']];
const VTYPE=['Venue and catering','Booth build and freight','Sponsorship and registration','Hotel block','AV and production','Travel agency','Gifts and printing'];
let seed=4401;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
E.forEach((e,i)=>{e.i=i+1;e.fund=e.fund||[1,0,0];e.adj0=e.adj;
  const k=2+Math.floor(R()*3),w=Array.from({length:k},()=>.4+R()),t=sum(w),ty=VTYPE.slice().sort(()=>R()-.5).slice(0,k);
  e.vend=ty.map((v,j)=>({v,a:w[j]/t}));});

/* other spend booked as event costs, not tied to an event */
const OTH=[
 {n:'Expense reports',a:269,s:0,o:'Team leads',nx:'Saving opportunity: team leads to move what they can to team budgets',opp:1},
 {n:'To investigate',a:160,s:-57,o:'Accounting team',nx:'One-off removed from 2027; the rest to move to the right event.'},
 {n:'International',a:124,s:0,o:'To be assigned',nx:'Not yet reviewed'},
 {n:'Head office',a:93,s:0,o:'To be assigned',nx:'Not yet reviewed'},
 {n:'Other teams',a:77,s:0,o:'To be assigned',nx:'Not yet reviewed'},
 {n:'Small items',a:49,s:0,o:'To be assigned',nx:'Not yet reviewed'},
 {n:'Events team',a:44,s:0,o:'Events lead',nx:'Tag to events'},
 {n:'Branch offices',a:21,s:0,o:'To be assigned',nx:'Not yet reviewed'}];
const OTHT=sum(OTH.map(o=>o.a)), OTH27=sum(OTH.map(o=>o.a+o.s));

const EKEY='hz-demo-events';
try{const sv=JSON.parse(localStorage.getItem(EKEY)||'{}');E.forEach(e=>{if(sv[e.i]!=null)e.adj=+sv[e.i]})}catch(x){}
function esave(){try{const o={};E.forEach(e=>{if(e.adj!==e.adj0)o[e.i]=e.adj});localStorage.setItem(EKEY,JSON.stringify(o));return true}catch(x){return false}}
const evFY26=()=>sum(E.map(e=>e.f26));
const ev27=()=>sum(E.map(e=>Math.max(0,e.f26+e.adj)));   // corporate-funded, at the page's default settings
window.HZ_EVENTS={OWN,E,XTRA,OTH,OTHT,OTH27,save:esave,fy26:evFY26,next27:ev27};

/* ======================= CORPORATE HEADCOUNT ======================= */
const T=[['Finance',33,2,195,1],['HR',15,1,150,1],['Technology',44,4,210,3],['Marketing',21,1,140,1],['Research',12,1,165,1],['Operations',38,3,120,1],['Legal and compliance',10,0,240,0],['Executive office',6,0,480,0]]
 .map(([n,hc,open,sal,hires],i)=>({i,n,hc,open,sal,hires,start:i%2?4:3}));
const S={merit:3.5,bonus:15,match:6,trend:7};   // the four drivers the page can change

// 2026 US employer rates and caps, in dollars. The page lists the sources.
const RT={ss:6.2,ssBase:184500,mc:1.45,futa:.6,futaBase:7000,suta:2.8,sutaBase:12000,wc:.35,pfl:.3,pflBase:95000,
  matchCap:360000,med:[9500,17400,23200],dv:[640,1160,1720],life:340,dis:560,hsa:[500,750,1000],oth:1600};

// every employer cost component for a full-time US employee, in the order the roster shows them
const CMP=[['base','Base salary','cash','Base'],['bonus','Bonus at target','cash','Bonus'],
 ['ss','Social Security (OASDI), 6.2% to the wage base','tax','Soc Sec'],['mc','Medicare, 1.45%, no cap','tax','Medicare'],
 ['futa','Federal unemployment (FUTA)','tax','FUTA'],['suta','State unemployment (SUTA)','tax','SUTA'],
 ['wc','Workers compensation','tax','Work comp'],['pfl','State paid family leave and disability','tax','PFL/SDI'],
 ['ret','401(k) employer match','ben','401(k)'],['med','Medical and prescription','ben','Medical'],
 ['dv','Dental and vision','ben','Dental/vis'],['life','Life and AD&D','ben','Life'],
 ['dis','Short and long-term disability','ben','Disability'],['hsa','HSA employer contribution','ben','HSA'],
 ['oth','Other benefits: wellness, tuition, commuter, phone, training','ben','Other']];

/* ---- the roster: one line per person, built so each team foots to its own average salary ---- */
const ROLE={'Finance':'Analyst','HR':'Partner','Technology':'Engineer','Marketing':'Specialist','Research':'Analyst','Operations':'Specialist','Legal and compliance':'Counsel'};
const BANDS=[[0,'Head of #T',2.60],[.12,'#T Director',1.95],[.18,'#T Manager',1.40],[.26,'Senior #R',1.05],[.26,'#R',.78],[0,'Associate',.60]];
const EXEC=[['Chief executive',2.10],['Chief financial officer',1.55],['Chief operating officer',1.45],['General counsel',1.25],['Chief people officer',1.05],['Chief of staff',.60]];
// corporate teams sit in the US offices, so one US employer cost stack covers the whole roster
const LOC=[['New York',.31],['Chicago',.13],['Dallas',.10],['LA',.09],['Atlanta',.07],['Boston',.06],['DC',.06],['Houston',.05],['Miami',.04],['San Francisco',.04],['Denver',.03],['Seattle',.02]];
const PRE=['FIN','HRS','TEC','MKT','RES','OPS','LEG','EXE'];
let hs=90210;const RH=()=>{hs=(hs*16807)%2147483647;return hs/2147483647};
const pick=W=>{const r=RH();let a=0;for(const[n,w]of W){a+=w;if(r<=a)return n}return W[W.length-1][0]};
const ROSTER=[];
T.forEach(t=>{
  const list=[];
  if(t.n==='Executive office')EXEC.forEach(([ti,w])=>list.push({ti,w}));
  else{const R=ROLE[t.n];let left=t.hc;
    BANDS.forEach(([sh,ti,w],bi)=>{
      let n=bi===0?1:bi===BANDS.length-1?left:Math.max(1,Math.round(t.hc*sh));
      n=Math.max(0,Math.min(n,left));left-=n;
      for(let k=0;k<n;k++)list.push({ti:ti.replace('#T',t.n).replace('#R',R),w})});
    for(let k=0;k<left;k++)list.push({ti:'Associate',w:.60})}
  // spread the team's salary pool over the ladder, then put the rounding difference on the top job
  const tgt=t.hc*t.sal*1000;
  list.forEach(p=>p.raw=p.w*(.97+RH()*.06));
  const sw=sum(list.map(p=>p.raw));
  list.forEach(p=>p.base=Math.round(p.raw/sw*tgt/500)*500);
  let mx=0;list.forEach((p,j)=>{if(p.base>list[mx].base)mx=j});
  list[mx].base+=tgt-sum(list.map(p=>p.base));
  list.forEach((p,j)=>{delete p.raw;p.t=t.i;p.team=t.n;p.id=PRE[t.i]+'-'+String(j+1).padStart(3,'0');
    p.loc=pick(LOC);p.tier=pick([[0,.38],[1,.24],[2,.38]]);p.yrs=1+Math.floor(RH()*14);ROSTER.push(p)})});

/* ---- one person's full employer cost, $ ---- */
function comp(p,yr){
  const mer=yr===2027?1+S.merit/100:1, tr=yr===2027?1+S.trend/100:1, pr=p.pr==null?1:p.pr, o={};
  const base=p.base*mer*pr, bonus=base*S.bonus/100, pay=base+bonus;
  o.base=base;o.bonus=bonus;
  o.ss=Math.min(pay,RT.ssBase*pr)*RT.ss/100;
  o.mc=pay*RT.mc/100;
  o.futa=RT.futaBase*RT.futa/100;              // a mid-year hire still clears the full wage base
  o.suta=RT.sutaBase*RT.suta/100;
  o.wc=pay*RT.wc/100;
  o.pfl=Math.min(pay,RT.pflBase*pr)*RT.pfl/100;
  o.ret=Math.min(pay,RT.matchCap*pr)*S.match/100;
  o.med=RT.med[p.tier]*tr*pr;o.dv=RT.dv[p.tier]*tr*pr;o.life=RT.life*tr*pr;
  o.dis=RT.dis*tr*pr;o.hsa=RT.hsa[p.tier]*tr*pr;o.oth=RT.oth*tr*pr;
  o.cash=o.base+o.bonus;
  o.tax=o.ss+o.mc+o.futa+o.suta+o.wc+o.pfl;
  o.ben=o.ret+o.med+o.dv+o.life+o.dis+o.hsa+o.oth;
  o.tot=o.cash+o.tax+o.ben;o.load=o.cash?(o.tax+o.ben)/o.cash*100:0;
  return o}
const people=t=>ROSTER.filter(p=>p.t===t.i);
// the new hires a team adds in 2027: priced at the team's average salary, from their start month
const hire=t=>({base:t.sal*1000,tier:1,pr:(12-t.start+1)/12,ti:'Open role',id:PRE[t.i]+'-new',loc:'To be set',yrs:0,team:t.n});
function row(t){const P=people(t),newHC=t.open+t.hires;
  const c26=sum(P.map(p=>comp(p,2026).tot))/1000;
  let c27=sum(P.map(p=>comp(p,2027).tot))/1000;
  if(newHC>0)c27+=newHC*comp(hire(t),2027).tot/1000;
  return{c26,c27,end:t.hc+newHC,n:P.length}}
const HKEY='hz-demo-head';
try{const sv=JSON.parse(localStorage.getItem(HKEY)||'null');if(sv){['merit','bonus','match','trend'].forEach(k=>{if(sv.S&&sv.S[k]!=null)S[k]=sv.S[k]});(sv.T||[]).forEach((x,i)=>{if(T[i]){T[i].hires=x.hires;T[i].start=x.start}})}}catch(e){}
function hsave(){try{localStorage.setItem(HKEY,JSON.stringify({S,T:T.map(t=>({hires:t.hires,start:t.start}))}));return true}catch(e){return false}}
const heads26=()=>sum(T.map(t=>t.hc)), heads27=()=>sum(T.map(t=>row(t).end));
const comp26=()=>sum(T.map(t=>row(t).c26)), comp27=()=>sum(T.map(t=>row(t).c27));
// the stack added up across everyone, $K: what the component table and the implied load read
function stack(yr){const o={};CMP.forEach(([k])=>o[k]=0);let cash=0,tax=0,ben=0,tot=0;
  const add=(p,w)=>{const c=comp(p,yr);CMP.forEach(([k])=>o[k]+=c[k]*w);cash+=c.cash*w;tax+=c.tax*w;ben+=c.ben*w;tot+=c.tot*w};
  ROSTER.forEach(p=>add(p,1));
  if(yr===2027)T.forEach(t=>{const n=t.open+t.hires;if(n>0)add(hire(t),n)});
  CMP.forEach(([k])=>o[k]/=1000);
  return{c:o,cash:cash/1e3,tax:tax/1e3,ben:ben/1e3,tot:tot/1e3,load:(tax+ben)/cash*100}}
window.HZ_HEAD={T,S,RT,CMP,ROSTER,comp,people,hire,row,stack,save:hsave,heads26,heads27,comp26,comp27,openRoles:()=>sum(T.map(t=>t.open))};

/* ======================= ROLL-UP ======================= */
// $K. Everything the non-comp budget, the market P&L and the reports read.
const C=window.HZ_CONTRACTS,K=window.HZ_COST;
function noncomp(yr){const n=yr===2027?1:0;return{
  'Contracts':n?C.next():C.ttm(),
  'Offices':n?K.occ.next():K.occ.base,
  'Travel and entertainment':n?K.ppl.next():K.ppl.base,
  'Professional and consulting fees':n?K.dis.next():K.dis.base,
  'Events':n?ev27():evFY26()}}
function alloc(yr){const n=yr===2027?1:0;return{
  'Corporate comp':n?comp27():comp26(),
  'Shared services':n?K.all.next():K.all.base,
  'Fixed costs':n?K.nco.next():K.nco.base}}
// where each cost type stands with its owner. The non-comp budget page edits this; every other page reads it.
window.HZ_STATUS={key:'hz-demo-noncomp3',
  def:{con:'In review',occ:'In review',ppl:'In review',evt:'Agreed',dis:'Not started',nco:'Not started',all:'Not started',comp:'Agreed'},
  get(){const o=Object.assign({},this.def);try{const sv=JSON.parse(localStorage.getItem(this.key)||'null');if(sv&&sv.st)Object.assign(o,sv.st)}catch(e){}return o},
  chip:{'Agreed':'ok','In review':'warn','Not started':'bad'}};
window.HZ_BUDGET={noncomp,alloc,
  noncompTotal:yr=>sum(Object.values(noncomp(yr))),
  allocTotal:yr=>sum(Object.values(alloc(yr))),
  // every cost type in one list, for the non-comp budget table
  types:yr=>Object.assign(noncomp(yr),alloc(yr))};
})();
