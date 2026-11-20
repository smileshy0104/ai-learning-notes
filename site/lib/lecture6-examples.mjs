// Synthetic finite teaching examples; no real tools, accounts or devices are used.
export function retrievalMetrics(labels,totalRelevant,k) {
 if(!Number.isInteger(k)||k<1||k>labels.length||!Number.isInteger(totalRelevant)||totalRelevant<0||labels.some(x=>x!==0&&x!==1)||labels.reduce((a,b)=>a+b,0)>totalRelevant)throw new Error('Invalid binary relevance setup');
 const top=labels.slice(0,k),hits=top.reduce((a,b)=>a+b,0),first=top.indexOf(1);
 const dcg=top.reduce((sum,v,i)=>sum+v/Math.log2(i+2),0);
 const ideal=Array.from({length:Math.min(totalRelevant,k)},(_,i)=>1/Math.log2(i+2)).reduce((a,b)=>a+b,0);
 return {precision:hits/k,recall:totalRelevant?hits/totalRelevant:0,rr:first<0?0:1/(first+1),dcg,ideal,ndcg:ideal?dcg/ideal:0};
}
export function chunkRanges(length,size,overlap) {
 if(![length,size,overlap].every(Number.isInteger)||length<0||size<1||overlap<0||overlap>=size)throw new Error('Invalid chunk setup');
 const ranges=[];
 for(let start=0;start<length;start+=size-overlap){const end=Math.min(length,start+size);ranges.push([start,end]);if(end===length)break;}
 return ranges;
}
export function cosine(a,b) {
 if(!a.length||a.length!==b.length)throw new Error('Vector dimensions must match');
 const norm=v=>Math.sqrt(v.reduce((s,x)=>s+x*x,0));const denom=norm(a)*norm(b);
 if(!denom)throw new Error('Cosine of zero vector is undefined');
 return a.reduce((s,v,i)=>s+v*b[i],0)/denom;
}
export function sharedPrefixLength(a,b) {
 let i=0;while(i<Math.min(a.length,b.length)&&a[i]===b[i])i++;return i;
}
export function cachedInputCost(requests,fixed,dynamic,normalPrice,cachedPrice) {
 return {uncached:requests*(fixed+dynamic)*normalPrice/1e6,cached:(fixed*normalPrice+(requests-1)*fixed*cachedPrice+requests*dynamic*normalPrice)/1e6};
}
export function toolDecision({tool,authorized,confirmed,targetF}) {
 if(!authorized)return 'deny';
 if(tool==='read_temperature')return 'execute';
 if(tool!=='set_temperature')return 'deny';
 if(!Number.isFinite(targetF)||targetF<60||targetF>80)return 'invalid';
 return confirmed?'execute':'confirm';
}
export const fahrenheitToCelsius=f=>(f-32)*5/9;
const f=n=>n.toFixed(5);
function lab(name,title,choices,panels) {
 return `<div class="l6-lab"><p class="l6-title">${title}</p>${choices.map((_,i)=>`<input class="l6-radio" type="radio" name="${name}" id="${name}-${i}"${i===0?' checked':''}>`).join('')}<div class="l6-choices">${choices.map((label,i)=>`<label for="${name}-${i}">${label}</label>`).join('')}</div>${panels.map((html,i)=>`<div class="l6-panel ${name}-panel-${i}">${html}</div>`).join('')}</div>`;
}
export function renderLecture6Lab(name) {
 if(name==='metrics')return lab('retrieval-metrics','实验：同样找到两条，谁排在前面？',['先无关后相关','相关项前移','全命中'],[[0,1,1,1],[1,1,0,1],[1,1,1,0]].map(labels=>{
  const r=retrievalMetrics(labels,3,3);
  return `<p>总相关数3，k=3，前3相关性 <strong>[${labels.slice(0,3).join(', ')}]</strong>。</p><table><thead><tr><th>指标</th><th>数值</th></tr></thead><tbody>${[['Precision',r.precision],['Recall',r.recall],['RR',r.rr],['DCG',r.dcg],['NDCG',r.ndcg]].map(([label,v])=>`<tr><th>${label}</th><td>${f(v)}</td></tr>`).join('')}</tbody></table><p>IDCG=${f(r.ideal)}，依据全库真值，不只对已命中的条目排序。P/R看数量，RR与NDCG也看位置。</p>`;
 }));
 if(name==='tool-gate') {
  const cases=[{tool:'read_temperature',authorized:true},{tool:'set_temperature',authorized:true,targetF:70},{tool:'set_temperature',authorized:true,confirmed:true,targetF:70},{tool:'set_temperature',authorized:true,confirmed:true},{tool:'set_temperature',authorized:false,confirmed:true,targetF:70}];
  const text={execute:'允许进入执行；之后仍须核验工具结果。',confirm:'暂停等待确认，不能先写入再询问。',invalid:'参数缺失或越界，拒绝执行并澄清。',deny:'权限不允许，不能由模型或工具文本自行放行。'};
  return lab('tool-gate','实验：调用格式正确，也未必能执行',['只读已授权','写入待确认','写入已确认','缺少目标值','没有权限'],cases.map(c=>`<p>提议工具：<code>${c.tool}</code>；目标：${c.targetF??'未提供'}；授权：${c.authorized?'有':'无'}；确认：${c.confirmed?'有':'无'}。</p><p><strong>${text[toolDecision(c)]}</strong></p><p>此处60–80°F是合成实验的规则范围，不是现实设备安全标准；没有连接设备。</p>`));
 }
 if(name==='prefix') {
  const configs=[['U','T','C'],['T','C','U'],['C','T','U']];
  return lab('prefix','实验：固定工具T，动态时间C与问题U',['问题放前','工具放前','时间放前'],configs.map(order=>{
   const a=order.map(k=>({T:'T_fixed',C:'C_time1',U:'U_query1'})[k]),b=order.map(k=>({T:'T_fixed',C:'C_time2',U:'U_query2'})[k]),n=sharedPrefixLength(a,b);
   return `<p>请求1：<code>${a.join(' → ')}</code></p><p>请求2：<code>${b.join(' → ')}</code></p><p>共同前缀：<strong>${n}个块</strong>。${n?'固定工具可复用，动态部分仍需处理。':'首块已变化，后面的相同T不是共同前缀。'}</p><p>块只是教学符号，实际按token和后端规则计算；保持消息角色与权限边界不变。</p>`;
  }));
 }
 if(name==='react')return lab('agent-loop','实验：设定值改变，不等于房间瞬间升温',['读到65°F','提议70°F','设定已核验'],[
  '<p>观察：传感器读到65°F；当前尚未执行写入。下一步可在授权范围内提议目标并确认。</p>',
  '<p>计划：将设定值改为70°F。只有计划，没有成功执行证据；权限或确认不满足时停止等待。</p>',
  '<p>工具报告并读回：设定值70°F。可以确认设定已改变，不能说实际室温已经70°F；如需实测，应稍后读取传感器。</p>'
 ]);
 if(name==='compaction')return lab('compaction','实验：早期限制能否在压缩后保留？',['仅留最近结果','结构化摘要'],[
  '<p>保留：候选A、B、C与价格。<strong>遗漏：用户要求“不要购买，只比较”。</strong></p><p>短不等于好。摘要遗漏不表示限制已撤回，不得因此执行购买。</p>',
  '<p><strong>目标：</strong>比较三个候选。<strong>约束：</strong>不要购买。<strong>进度：</strong>已检索价格，未发生交易。<strong>待办：</strong>核对来源并比较。<strong>引用：</strong>候选ID与原记录。</p><p>保留关键事实与边界；摘要仍非无损，重要信息应能回查。</p>'
 ]);
 throw new Error(`Unknown lecture 6 lab: ${name}`);
}
