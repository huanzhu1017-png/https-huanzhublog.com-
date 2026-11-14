// Detail budgets behind each non-comp cost type (offices, travel and staff, fees, fixed costs, shared services).
// Made-up data. Each page builds its own 2027 number; the non-comp budget reads the result.
// Edits are saved only in the visitor's browser.
(function(){
const KEY='hz-demo-cost-';
const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(KEY+k)||'null');return v?Object.assign(d,v):d}catch(e){return d}};
const store=(k,v)=>{try{localStorage.setItem(KEY+k,JSON.stringify(v));return true}catch(e){return false}};
const sum=a=>a.reduce((x,y)=>x+y,0);
const fit=(rows,f,total)=>{const t=sum(rows.map(r=>r[f]));rows.forEach(r=>r[f]=Math.round(r[f]*total/t))};
const fK=v=>{const r=Math.round(v);return r<0?'('+Math.abs(r).toLocaleString('en-US')+')':r.toLocaleString('en-US')};
const sK=v=>{const r=Math.round(v);return(r>0?'+':r<0?'−':'')+Math.abs(r).toLocaleString('en-US')};
const pc=v=>(v>0?'+':v<0?'−':'')+Math.abs(v*100).toFixed(1)+'%';
const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=(attr,v,lab,w,step)=>`<input class="num" type="number" step="${step||1}" ${attr} value="${v}" aria-label="${esc(lab)}" style="width:${w||80}px">`;
const sel=(attr,v,opts,lab)=>`<select class="st" ${attr} aria-label="${esc(lab)}">${opts.map(o=>`<option${o===v?' selected':''}>${o}</option>`).join('')}</select>`;

/* ---------------- OFFICES: lease schedule ---------------- */
const OFF=[['New York','East',120,'2031-04',14000],['Boston','East',35,'2027-06',3600],['Philadelphia','East',22,'2027-03',1900],
 ['Chicago','Central',60,'2029-09',5200],['Minneapolis','Central',14,'2028-06',1100],['Dallas','South',48,'2028-01',3800],['Houston','South',30,'2027-01',2300],
 ['Atlanta','South',28,'2030-05',2100],['Denver','West',20,'2027-08',1500],['Los Angeles','West',55,'2032-02',5600],['San Francisco','West',40,'2026-12',4500],
 ['Seattle','West',18,'2028-11',1600],['London','International',45,'2030-01',6100],['Toronto','International',16,'2027-05',1300]]
 .map(([n,r,sf,end,c],i)=>({i,n,r,sf,end,c}));
fit(OFF,'c',52800);
const ESC=[3,3,3,3,2.5,3,3,3,3,3.5,3,3,2,2]; // default rent increase % per office
const offS=load('occ2',{e:{},r:{},dec:{10:'Exit',13:'Exit',2:'Downsize'}});
const oE=o=>offS.e[o.i]??ESC[o.i];
function offRow(o,S){const d=S.dec[o.i]||(o.end.startsWith('2027')?'Renew':'Keep'),y=+o.end.slice(0,4),m=+o.end.slice(5,7),e=1+oE(o)/100;
  // leases ending after 2027: exit or downsize from July, with a sublease covering part of the rent
  let v;if(d==='Exit')v=y<2027?0:y===2027?o.c*e*(m-1)/12:o.c*e*(.5+.5*.4);
  else if(d==='Downsize'){const f=y<2027?0:y===2027?(m-1)/12:.5;v=o.c*e*(f+(1-f)*.65)}
  else v=o.c*e;
  return{d,v}}

/* ---------------- TRAVEL AND STAFF: cost per head x headcount ---------------- */
const REG=['East','West','Central','South','International'],HC=[420,380,260,300,190],MULT=[1.1,1.05,.9,.95,1];
const TCAT=[['Travel',7.6],['Phones',2.8],['Training',2.1],['Hiring',1.6]];
const RATE=REG.map((_,r)=>TCAT.map(([,v])=>v*MULT[r]));
{const t=sum(REG.map((_,r)=>HC[r]*sum(RATE[r])));RATE.forEach(a=>a.forEach((v,j)=>a[j]=v*21900/t))}
const tsS=load('ppl',{hc:[430,385,255,310,195],chg:[0,-5,0,-20]});

/* ---------------- FEES: zero-based by engagement ---------------- */
const FEE=[['Outside counsel, contracts','Legal','General counsel',6200,6000,'Keep','Rate card agreed'],['Outside counsel, disputes','Legal','General counsel',5100,4600,'Reduce','Two matters close in Q1'],
 ['Employment law advice','Legal','HR lead',1900,1900,'Keep',''],['Annual audit','Audit and tax','Controller',5400,5600,'Keep','Fee letter +4%'],['Tax advisory','Audit and tax','Tax lead',3500,3500,'Keep',''],
 ['Systems upgrade consultants','Consulting','IT lead',4800,3600,'Reduce','Phase 2 done in-house'],['Pricing study','Consulting','Business heads',2600,1300,'Reduce','Smaller scope'],
 ['Process review','Consulting','COO office',1700,1700,'Keep',''],['Market research','Other advisory','Business heads',2100,2100,'Keep',''],['Valuation opinions','Other advisory','Finance',1600,1600,'Keep',''],
 ['Search firm fees','Consulting','HR lead',1300,1300,'Keep',''],['Data strategy review','Consulting','IT lead',0,800,'New','New for 2027']]
 .map(([n,t,o,a,b,d,note],i)=>({i,n,t,o,a,b,d,note}));
{const t=sum(FEE.map(f=>f.a)),k=37600/t;FEE.forEach(f=>{f.a=Math.round(f.a*k);f.b=Math.round(f.b*k)})}
const feeS=load('dis',{v:{},d:{},n:{}});

/* ---------------- FIXED COSTS: from Accounting ---------------- */
const FIX=[['Property insurance','Insurance',3100,6,'Renewal quote'],['Professional liability insurance','Insurance',1900,4,'Broker estimate'],['Payroll and local taxes','Taxes',2600,3,'Follows headcount plan'],
 ['Equipment taxes','Taxes',1100,0,'Flat'],['Bank fees','Bank fees',1800,-5,'New bank pricing'],['FX gains/losses','FX',1900,0,'Held at 2026']].map(([n,t,a,g,b],i)=>({i,n,t,a,g,b}));
const fixS=load('nco',{g:{}});

/* ---------------- SHARED SERVICES: our share of central pools ---------------- */
const SH=[['IT','Headcount share',61000,38,4,37],['Head office','Revenue share',40000,36,0,36],['Legal','Revenue share',30000,40,2,40],['Accounting','Transaction volume',22000,39,-3,39]]
 .map(([n,drv,pool,sh,g,sh27],i)=>({i,n,drv,pool,sh,g,sh27}));
{const t=sum(SH.map(s=>s.pool*s.sh/100)),k=58300/t;SH.forEach(s=>s.pool=Math.round(s.pool*k))}
const shS=load('all',{g:{},s:{}});

/* ---------------- totals for the non-comp budget ---------------- */
const T={
 occ:{base:52800,next:()=>sum(OFF.map(o=>offRow(o,offS).v)),page:'../offices/index.html',src:'office budget'},
 ppl:{base:21900,next:()=>sum(REG.map((_,r)=>tsS.hc[r]*sum(RATE[r].map((v,j)=>v*(1+tsS.chg[j]/100))))),page:'../travel-staff/index.html',src:'travel and staff budget'},
 dis:{base:37600,next:()=>sum(FEE.map(f=>feeV(f))),page:'../fees/index.html',src:'fees budget'},
 nco:{base:12400,next:()=>sum(FIX.map(x=>x.a*(1+(fixS.g[x.i]??x.g)/100))),page:'../fixed-costs/index.html',src:'fixed costs'},
 all:{base:58300,next:()=>sum(SH.map(x=>x.pool*(1+(shS.g[x.i]??x.g)/100)*(shS.s[x.i]??x.sh27)/100)),page:'../shared-services/index.html',src:'shared services'}};
function feeV(f){const d=feeS.d[f.i]??f.d;return d==='Stop'?0:(feeS.v[f.i]??f.b)}
window.HZ_COST=T;

/* ---------------- page renderer ---------------- */
window.HZ_PAGE=function(k){
  const $=q=>document.querySelector(q),saved=()=>{$('#savedmsg').textContent='Saved in this browser.'};
  const kpi=(items)=>$('#kpi').innerHTML=items.map(([l,n,s])=>`<div class="kpi"><div class="l">${l}</div><div class="n">${n}</div><div class="s">${s}</div></div>`).join('');
  const head=(base,next,extra)=>kpi([['2026 base',fK(base),'$K'],['2027 budget',fK(next),'$K'],['Change',sK(next-base),pc(next/base-1)+' vs 2026'],extra]);
  const bars=(G)=>{const mx=Math.max(1,...G.flatMap(g=>[g.a,g.b])),W=600,rh=40;
    $('#chart').setAttribute('viewBox',`0 0 ${W} ${G.length*rh+10}`);
    $('#chart').innerHTML=G.map((g,i)=>`<text x="150" y="${i*rh+17}" text-anchor="end" style="font-size:12px;fill:var(--ink)">${esc(g.n)}</text>
      <rect x="160" y="${i*rh+6}" width="${g.a/mx*290}" height="12" fill="#A9A190"/><rect x="160" y="${i*rh+20}" width="${g.b/mx*290}" height="12" fill="#1A1A1A"/>
      <text x="${166+Math.max(g.a,g.b)/mx*290}" y="${i*rh+24}" style="font-size:11px;fill:var(--ink)">${fK(g.a)} → ${fK(g.b)}</text>`).join('')};
  const tb=$('#tbl'),ctl=$('#ctl');
  let draw;
  if(k==='occ'){
    ctl.innerHTML=`<span class="note" style="margin:0">Each office has its own rent increase. Renew and Keep both carry the rent increase; Downsize and Exit save from the month the lease ends.</span>`;
    draw=()=>{const R=OFF.map(o=>({o,...offRow(o,offS)}));head(52800,sum(R.map(r=>r.v)),['Offices',OFF.length,`${R.filter(r=>r.d==='Exit').length} exits planned`]);
      tb.innerHTML=`<tr><th class="t">Office</th><th class="t">Region</th><th>Sq ft (K)</th><th class="t">Lease ends</th><th>2026</th><th>Rent increase %</th><th class="t">Decision</th><th>2027</th><th>Change</th></tr>`+
        R.map(({o,d,v})=>`<tr><td class="t"><b>${o.n}</b></td><td class="t">${o.r}</td><td>${o.sf}</td><td class="t">${o.end}${o.end<'2028'?' <span class="chip warn">ends soon</span>':''}</td><td>${fK(o.c)}</td><td>${num(`data-e="${o.i}"`,oE(o),'Rent increase % for '+o.n,64,.5)}</td>
        <td class="t">${sel(`data-o="${o.i}"`,d,['Keep','Renew','Downsize','Exit'],'Decision for '+o.n)}</td><td><b>${fK(v)}</b></td><td class="${v<o.c?'pos':v>o.c?'neg':''}">${sK(v-o.c)}</td></tr>`).join('')+
        `<tr class="total"><td class="t" colspan="4">Total</td><td>${fK(52800)}</td><td></td><td></td><td>${fK(sum(R.map(r=>r.v)))}</td><td>${sK(sum(R.map(r=>r.v))-52800)}</td></tr>`;
      bars(REG.map(g=>({n:g,a:sum(R.filter(r=>r.o.r===g).map(r=>r.o.c)),b:sum(R.filter(r=>r.o.r===g).map(r=>r.v))})))};
        tb.addEventListener('change',e=>{const d=e.target.dataset;let f;if(d.o!=null){offS.dec[d.o]=e.target.value;f=`[data-o="${d.o}"]`}else if(d.e!=null){offS.e[d.e]=+e.target.value||0;f=`[data-e="${d.e}"]`}else return;store('occ2',offS)&&saved();draw();tb.querySelector(f).focus()});
  }
  if(k==='ppl'){
    ctl.innerHTML=TCAT.map(([n],j)=>`<label>${n} per head, change %${num(`data-c="${j}"`,tsS.chg[j],n+' change %',70)}</label>`).join('');
    draw=()=>{const per=r=>RATE[r].map((v,j)=>v*(1+tsS.chg[j]/100)),nx=T.ppl.next();
      head(21900,nx,['Headcount',sum(tsS.hc).toLocaleString('en-US'),`${sK(sum(tsS.hc)-sum(HC))} vs 2026`]);
      tb.innerHTML=`<tr><th class="t">Region</th><th>2026 heads</th><th>2026 per head</th><th>2026</th><th>2027 heads</th><th>2027 per head</th><th>2027</th><th>Change</th></tr>`+
        REG.map((g,r)=>{const a=HC[r]*sum(RATE[r]),b=tsS.hc[r]*sum(per(r));return`<tr><td class="t"><b>${g}</b></td><td>${HC[r]}</td><td>${sum(RATE[r]).toFixed(1)}</td><td>${fK(a)}</td>
          <td>${num(`data-h="${r}"`,tsS.hc[r],'2027 headcount '+g,70)}</td><td>${sum(per(r)).toFixed(1)}</td><td><b>${fK(b)}</b></td><td class="${b<a?'pos':b>a?'neg':''}">${sK(b-a)}</td></tr>`}).join('')+
        `<tr class="total"><td class="t">Total</td><td>${sum(HC)}</td><td></td><td>${fK(21900)}</td><td>${sum(tsS.hc)}</td><td></td><td>${fK(nx)}</td><td>${sK(nx-21900)}</td></tr>`;
      bars(TCAT.map(([n],j)=>({n,a:sum(REG.map((_,r)=>HC[r]*RATE[r][j])),b:sum(REG.map((_,r)=>tsS.hc[r]*RATE[r][j]*(1+tsS.chg[j]/100)))})))};
    ctl.addEventListener('change',e=>{const j=e.target.dataset.c;if(j==null)return;tsS.chg[j]=+e.target.value||0;store('ppl',tsS)&&saved();draw()});
    tb.addEventListener('change',e=>{const r=e.target.dataset.h;if(r==null)return;tsS.hc[r]=Math.max(0,+e.target.value||0);store('ppl',tsS)&&saved();draw();tb.querySelector(`[data-h="${r}"]`).focus()});
  }
  if(k==='dis'){
    ctl.innerHTML=`<span class="note" style="margin:0">Each owner lists the outside help they need next year. Stop sets the line to zero.</span>`;
    draw=()=>{const nx=T.dis.next();head(37600,nx,['Engagements',FEE.length,`${FEE.filter(f=>(feeS.d[f.i]??f.d)==='Stop').length} stopped`]);
      tb.innerHTML=`<tr><th class="t">Engagement</th><th class="t">Type</th><th class="t">Owner</th><th>2026</th><th>2027</th><th class="t">Decision</th><th>Change</th><th class="t">Notes</th></tr>`+
        FEE.map(f=>{const d=feeS.d[f.i]??f.d,v=feeV(f);return`<tr><td class="t"><b>${esc(f.n)}</b></td><td class="t">${f.t}</td><td class="t">${f.o}</td><td>${fK(f.a)}</td>
          <td>${num(`data-v="${f.i}"`,v,'2027 for '+f.n,80,10)}</td><td class="t">${sel(`data-d="${f.i}"`,d,['Keep','Reduce','Stop','New'],'Decision for '+f.n)}</td>
          <td class="${v<f.a?'pos':v>f.a?'neg':''}">${sK(v-f.a)}</td><td class="t"><input class="txt" data-n="${f.i}" value="${esc(feeS.n[f.i]??f.note)}" aria-label="Notes for ${esc(f.n)}"></td></tr>`}).join('')+
        `<tr class="total"><td class="t" colspan="3">Total</td><td>${fK(37600)}</td><td>${fK(nx)}</td><td></td><td>${sK(nx-37600)}</td><td></td></tr>`;
      bars(['Legal','Audit and tax','Consulting','Other advisory'].map(t=>({n:t,a:sum(FEE.filter(f=>f.t===t).map(f=>f.a)),b:sum(FEE.filter(f=>f.t===t).map(f=>feeV(f)))})))};
    tb.addEventListener('change',e=>{const d=e.target.dataset;let f=null;
      if(d.v!=null){feeS.v[d.v]=Math.max(0,+e.target.value||0);f=`[data-v="${d.v}"]`}else if(d.d!=null){feeS.d[d.d]=e.target.value;if(e.target.value==='Stop')feeS.v[d.d]=0;f=`[data-d="${d.d}"]`}else if(d.n!=null){feeS.n[d.n]=e.target.value;store('dis',feeS)&&saved();return}else return;
      store('dis',feeS)&&saved();draw();tb.querySelector(f).focus()});
  }
  if(k==='nco'){
    ctl.innerHTML=`<span class="note" style="margin:0">Accounting sends these numbers. They are outside the savings target; FP&amp;A checks the basis.</span>`;
    draw=()=>{const nx=T.nco.next();head(12400,nx,['Lines',FIX.length,'from Accounting']);
      tb.innerHTML=`<tr><th class="t">Item</th><th class="t">Type</th><th>2026</th><th>Change %</th><th>2027</th><th>Change</th><th class="t">Basis</th></tr>`+
        FIX.map(x=>{const g=fixS.g[x.i]??x.g,v=x.a*(1+g/100);return`<tr><td class="t"><b>${x.n}</b></td><td class="t">${x.t}</td><td>${fK(x.a)}</td><td>${num(`data-g="${x.i}"`,g,'Change % for '+x.n,70,.5)}</td><td><b>${fK(v)}</b></td><td class="${v<x.a?'pos':v>x.a?'neg':''}">${sK(v-x.a)}</td><td class="t">${x.b}</td></tr>`}).join('')+
        `<tr class="total"><td class="t" colspan="2">Total</td><td>${fK(12400)}</td><td></td><td>${fK(nx)}</td><td>${sK(nx-12400)}</td><td></td></tr>`;
      bars(['Insurance','Taxes','Bank fees','FX'].map(t=>({n:t,a:sum(FIX.filter(x=>x.t===t).map(x=>x.a)),b:sum(FIX.filter(x=>x.t===t).map(x=>x.a*(1+(fixS.g[x.i]??x.g)/100)))})))};
    tb.addEventListener('change',e=>{const i=e.target.dataset.g;if(i==null)return;fixS.g[i]=+e.target.value||0;store('nco',fixS)&&saved();draw();tb.querySelector(`[data-g="${i}"]`).focus()});
  }
  if(k==='all'){
    ctl.innerHTML=`<span class="note" style="margin:0">2027 = the central team's cost pool × our share. Corporate FP&amp;A sets the pools; the share follows each driver.</span>`;
    draw=()=>{const nx=T.all.next();head(58300,nx,['Services',SH.length,'charged from head office']);
      tb.innerHTML=`<tr><th class="t">Service</th><th class="t">Driver</th><th>2026 pool</th><th>2026 share</th><th>2026</th><th>Pool change %</th><th>2027 share %</th><th>2027</th><th>Change</th></tr>`+
        SH.map(x=>{const g=shS.g[x.i]??x.g,s2=shS.s[x.i]??x.sh27,a=x.pool*x.sh/100,v=x.pool*(1+g/100)*s2/100;return`<tr><td class="t"><b>${x.n}</b></td><td class="t">${x.drv}</td><td>${fK(x.pool)}</td><td>${x.sh}%</td><td>${fK(a)}</td>
          <td>${num(`data-g="${x.i}"`,g,'Pool change % for '+x.n,70,.5)}</td><td>${num(`data-s="${x.i}"`,s2,'2027 share % for '+x.n,70,.5)}</td><td><b>${fK(v)}</b></td><td class="${v<a?'pos':v>a?'neg':''}">${sK(v-a)}</td></tr>`}).join('')+
        `<tr class="total"><td class="t" colspan="4">Total</td><td>${fK(58300)}</td><td></td><td></td><td>${fK(nx)}</td><td>${sK(nx-58300)}</td></tr>`;
      bars(SH.map(x=>({n:x.n,a:x.pool*x.sh/100,b:x.pool*(1+(shS.g[x.i]??x.g)/100)*(shS.s[x.i]??x.sh27)/100})))};
    tb.addEventListener('change',e=>{const d=e.target.dataset;let f=null;if(d.g!=null){shS.g[d.g]=+e.target.value||0;f=`[data-g="${d.g}"]`}else if(d.s!=null){shS.s[d.s]=Math.max(0,+e.target.value||0);f=`[data-s="${d.s}"]`}else return;store('all',shS)&&saved();draw();tb.querySelector(f).focus()});
  }
  draw();
};
})();
