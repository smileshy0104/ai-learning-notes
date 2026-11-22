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
// 五个实验的面板文案；中文保持既有输出，英文为对应翻译。
const labStrings = {
  zh: {
    metricsTitle: '实验：同样找到两条，谁排在前面？',
    metricsChoices: ['先无关后相关', '相关项前移', '全命中'],
    metricsIntro: labels => `总相关数3，k=3，前3相关性 <strong>[${labels.slice(0,3).join(', ')}]</strong>。`,
    metricsHead: ['指标', '数值'],
    metricsNote: idcg => `IDCG=${idcg}，依据全库真值，不只对已命中的条目排序。P/R看数量，RR与NDCG也看位置。`,
    gateTitle: '实验：调用格式正确，也未必能执行',
    gateChoices: ['只读已授权', '写入待确认', '写入已确认', '缺少目标值', '没有权限'],
    gateCase: (tool, target, authorized, confirmed) => `提议工具：<code>${tool}</code>；目标：${target}；授权：${authorized}；确认：${confirmed}。`,
    gateMissing: '未提供', gateYes: '有', gateNo: '无',
    gateDecisions: { execute: '允许进入执行；之后仍须核验工具结果。', confirm: '暂停等待确认，不能先写入再询问。', invalid: '参数缺失或越界，拒绝执行并澄清。', deny: '权限不允许，不能由模型或工具文本自行放行。' },
    gateNote: '此处60–80°F是合成实验的规则范围，不是现实设备安全标准；没有连接设备。',
    prefixTitle: '实验：固定工具T，动态时间C与问题U',
    prefixChoices: ['问题放前', '工具放前', '时间放前'],
    prefixReq: (n, seq) => `请求${n}：<code>${seq}</code>`,
    prefixShared: n => `共同前缀：<strong>${n}个块</strong>。`,
    prefixReuse: '固定工具可复用，动态部分仍需处理。',
    prefixBroken: '首块已变化，后面的相同T不是共同前缀。',
    prefixNote: '块只是教学符号，实际按token和后端规则计算；保持消息角色与权限边界不变。',
    reactTitle: '实验：设定值改变，不等于房间瞬间升温',
    reactChoices: ['读到65°F', '提议70°F', '设定已核验'],
    reactPanels: [
      '<p>观察：传感器读到65°F；当前尚未执行写入。下一步可在授权范围内提议目标并确认。</p>',
      '<p>计划：将设定值改为70°F。只有计划，没有成功执行证据；权限或确认不满足时停止等待。</p>',
      '<p>工具报告并读回：设定值70°F。可以确认设定已改变，不能说实际室温已经70°F；如需实测，应稍后读取传感器。</p>',
    ],
    compactionTitle: '实验：早期限制能否在压缩后保留？',
    compactionChoices: ['仅留最近结果', '结构化摘要'],
    compactionPanels: [
      '<p>保留：候选A、B、C与价格。<strong>遗漏：用户要求“不要购买，只比较”。</strong></p><p>短不等于好。摘要遗漏不表示限制已撤回，不得因此执行购买。</p>',
      '<p><strong>目标：</strong>比较三个候选。<strong>约束：</strong>不要购买。<strong>进度：</strong>已检索价格，未发生交易。<strong>待办：</strong>核对来源并比较。<strong>引用：</strong>候选ID与原记录。</p><p>保留关键事实与边界；摘要仍非无损，重要信息应能回查。</p>',
    ],
  },
  en: {
    metricsTitle: 'Lab: the same two hits — which one ranks first?',
    metricsChoices: ['irrelevant first', 'relevant moved up', 'all hits'],
    metricsIntro: labels => `3 relevant documents, k=3, top-3 relevance <strong>[${labels.slice(0,3).join(', ')}]</strong>.`,
    metricsHead: ['metric', 'value'],
    metricsNote: idcg => `IDCG=${idcg}, computed from the full ground truth, not by re-sorting only the hits found. P/R count documents; RR and NDCG also look at position.`,
    gateTitle: 'Lab: a well-formed call is still not permission to execute',
    gateChoices: ['authorised read', 'write awaiting confirmation', 'write confirmed', 'missing target value', 'no permission'],
    gateCase: (tool, target, authorized, confirmed) => `proposed tool: <code>${tool}</code>; target: ${target}; authorised: ${authorized}; confirmed: ${confirmed}.`,
    gateMissing: 'not given', gateYes: 'yes', gateNo: 'no',
    gateDecisions: { execute: 'Allowed to proceed; the tool result still has to be verified.', confirm: 'Pause and wait for confirmation; never write first and ask afterwards.', invalid: 'A parameter is missing or out of range; refuse and clarify.', deny: 'Permission is absent; neither the model nor tool text can grant it.' },
    gateNote: 'The 60–80°F range here is a rule of this synthetic experiment, not a real device safety standard; no device is connected.',
    prefixTitle: 'Lab: fixed tool T, dynamic time C and question U',
    prefixChoices: ['question first', 'tool first', 'time first'],
    prefixReq: (n, seq) => `request ${n}: <code>${seq}</code>`,
    prefixShared: n => `shared prefix: <strong>${n} block(s)</strong>. `,
    prefixReuse: 'The fixed tool can be reused; the dynamic part still has to be processed.',
    prefixBroken: 'The first block already changed, so the later identical T is not part of a shared prefix.',
    prefixNote: 'Blocks are only teaching symbols; real computation uses tokens and backend rules. Message roles and permission boundaries stay unchanged.',
    reactTitle: 'Lab: changing the setpoint does not instantly heat the room',
    reactChoices: ['reads 65°F', 'proposes 70°F', 'setpoint verified'],
    reactPanels: [
      '<p>Observation: the sensor reads 65°F; no write has been executed yet. The next step may propose a target and ask for confirmation within the authorised scope.</p>',
      '<p>Plan: change the setpoint to 70°F. This is only a plan with no evidence of execution; if permission or confirmation is missing, stop and wait.</p>',
      '<p>The tool reports and reads back: setpoint 70°F. That confirms the setpoint changed, not that the room is now 70°F; read the sensor later if you need a measurement.</p>',
    ],
    compactionTitle: 'Lab: do early constraints survive compaction?',
    compactionChoices: ['recent results only', 'structured summary'],
    compactionPanels: [
      '<p>Kept: candidates A, B, C and prices. <strong>Lost: the user asked to “compare only, do not buy”.</strong></p><p>Short is not the same as good. A summary omission does not revoke the constraint, so no purchase may be executed on that basis.</p>',
      '<p><strong>Goal:</strong> compare three candidates. <strong>Constraint:</strong> do not buy. <strong>Progress:</strong> prices retrieved, no transaction. <strong>Next:</strong> verify sources and compare. <strong>References:</strong> candidate IDs and original records.</p><p>Keep the key facts and boundaries; a summary is still lossy, so important details must remain retrievable.</p>',
    ],
  },
};

function lab(name,title,choices,panels) {
 return `<div class="l6-lab"><p class="l6-title">${title}</p>${choices.map((_,i)=>`<input class="l6-radio" type="radio" name="${name}" id="${name}-${i}"${i===0?' checked':''}>`).join('')}<div class="l6-choices">${choices.map((label,i)=>`<label for="${name}-${i}">${label}</label>`).join('')}</div>${panels.map((html,i)=>`<div class="l6-panel ${name}-panel-${i}">${html}</div>`).join('')}</div>`;
}
export function renderLecture6Lab(name, lang = 'zh') {
 const S = labStrings[lang] ?? labStrings.zh;
 if(name==='metrics')return lab('retrieval-metrics',S.metricsTitle,S.metricsChoices,[[0,1,1,1],[1,1,0,1],[1,1,1,0]].map(labels=>{
  const r=retrievalMetrics(labels,3,3);
  return `<p>${S.metricsIntro(labels)}</p><table><thead><tr><th>${S.metricsHead[0]}</th><th>${S.metricsHead[1]}</th></tr></thead><tbody>${[['Precision',r.precision],['Recall',r.recall],['RR',r.rr],['DCG',r.dcg],['NDCG',r.ndcg]].map(([label,v])=>`<tr><th>${label}</th><td>${f(v)}</td></tr>`).join('')}</tbody></table><p>${S.metricsNote(f(r.ideal))}</p>`;
 }));
 if(name==='tool-gate') {
  const cases=[{tool:'read_temperature',authorized:true},{tool:'set_temperature',authorized:true,targetF:70},{tool:'set_temperature',authorized:true,confirmed:true,targetF:70},{tool:'set_temperature',authorized:true,confirmed:true},{tool:'set_temperature',authorized:false,confirmed:true,targetF:70}];
  const text=S.gateDecisions;
  return lab('tool-gate',S.gateTitle,S.gateChoices,cases.map(c=>`<p>${S.gateCase(c.tool, c.targetF??S.gateMissing, c.authorized?S.gateYes:S.gateNo, c.confirmed?S.gateYes:S.gateNo)}</p><p><strong>${text[toolDecision(c)]}</strong></p><p>${S.gateNote}</p>`));
 }
 if(name==='prefix') {
  const configs=[['U','T','C'],['T','C','U'],['C','T','U']];
  return lab('prefix',S.prefixTitle,S.prefixChoices,configs.map(order=>{
   const a=order.map(k=>({T:'T_fixed',C:'C_time1',U:'U_query1'})[k]),b=order.map(k=>({T:'T_fixed',C:'C_time2',U:'U_query2'})[k]),n=sharedPrefixLength(a,b);
   return `<p>${S.prefixReq(1, a.join(' → '))}</p><p>${S.prefixReq(2, b.join(' → '))}</p><p>${S.prefixShared(n)}${n?S.prefixReuse:S.prefixBroken}</p><p>${S.prefixNote}</p>`;
  }));
 }
 if(name==='react')return lab('agent-loop',S.reactTitle,S.reactChoices,S.reactPanels);
 if(name==='compaction')return lab('compaction',S.compactionTitle,S.compactionChoices,S.compactionPanels);
 throw new Error(`Unknown lecture 6 lab: ${name}`);
}
