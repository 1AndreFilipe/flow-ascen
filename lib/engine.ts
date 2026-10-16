import type { Node, Edge, Connection } from '@xyflow/react';
export type Kind = 'trigger' | 'action' | 'condition' | 'delay' | 'notification';
export type Data = { label:string; kind:Kind; detail:string; field:string; operator:'gte'|'eq'; value:string; delay:number; fail:boolean; status?:'done'|'current'|'error'|'skipped' };
export type FlowNode = Node<Data>;
export type Workflow = {id:string; name:string; description:string; category:string; state:'Pronto'|'Rascunho'; nodes:FlowNode[]; edges:Edge[]; updated:string};
export type Log = {nodeId:string; label:string; kind:Kind; message:string; status:'success'|'error'; elapsed:number};
export type Execution = {id:string; workflowId:string; name:string; date:string; status:'success'|'error'; logs:Log[]; duration:number};
export const labels:Record<Kind,string> = {trigger:'Gatilho',action:'Ação',condition:'Condição',delay:'Espera',notification:'Notificação'};
export function makeNode(kind:Kind,x=100,y=120):FlowNode {return {id:crypto.randomUUID(),type:'flow',position:{x,y},data:{kind,label:labels[kind],detail:kind==='trigger'?'Entrada manual de dados':'Configurar etapa',field:'pontuacao',operator:'gte',value:'70',delay:30,fail:false}};}
export function connectionError(c:Connection|Edge,nodes:FlowNode[],edges:Edge[]):string {
 const from=nodes.find(n=>n.id===c.source),to=nodes.find(n=>n.id===c.target);
 if(!from||!to)return 'A ligação aponta para uma etapa inexistente.';
 if(from.id===to.id)return 'Uma etapa não se pode ligar a si própria.';
 if(to.data.kind==='trigger')return 'O gatilho é sempre o início do workflow.';
 if(edges.some(e=>e.source===c.source&&e.target===c.target))return 'Esta ligação já existe.';
 if(edges.some(e=>e.source===c.source&&e.sourceHandle===c.sourceHandle))return 'Cada saída aceita apenas uma ligação.';
 if(from.data.kind!=='condition'&&edges.some(e=>e.source===c.source))return 'Esta etapa só pode ter uma saída.';
 if(from.data.kind==='condition'&&!['yes','no'].includes(c.sourceHandle||''))return 'Escolha a saída Sim ou Não.';
 if(edges.some(e=>e.target===c.target))return 'Cada etapa aceita uma entrada. Crie etapas separadas para cada ramo.';
 const seen=new Set<string>(); const visit=(id:string):boolean=>{if(id===from.id)return true;if(seen.has(id))return false;seen.add(id);return edges.filter(e=>e.source===id).some(e=>visit(e.target));};
 if(visit(to.id))return 'Esta ligação criaria um ciclo.';
 return '';
}
export function validate(w:Workflow):string[]{
 const errors:string[]=[];const triggers=w.nodes.filter(n=>n.data.kind==='trigger');
 if(triggers.length!==1)errors.push('O workflow precisa de exatamente um gatilho.');
 if(!w.name.trim())errors.push('Dê um nome ao workflow.');
 const valid:Edge[]=[];for(const edge of w.edges){const error=connectionError(edge,w.nodes,valid);if(error)errors.push(error);valid.push(edge);}
 if(new Set(w.nodes.map(n=>n.id)).size!==w.nodes.length)errors.push('Existem identificadores de etapas repetidos.');
 const visited=new Set<string>();const walk=(id:string)=>{if(visited.has(id))return;visited.add(id);w.edges.filter(e=>e.source===id).forEach(e=>walk(e.target));};if(triggers[0])walk(triggers[0].id);
 for(const n of w.nodes){if(!visited.has(n.id))errors.push(`«${n.data.label}» não está ligada ao gatilho.`);if(!n.data.label.trim())errors.push('Todas as etapas precisam de um nome.');if(n.data.kind==='condition'){if(!n.data.field.trim())errors.push('Defina o campo da condição.');if(n.data.operator==='gte'&&!Number.isFinite(Number(n.data.value)))errors.push('A condição numérica precisa de um valor válido.');for(const handle of ['yes','no'])if(!w.edges.some(e=>e.source===n.id&&e.sourceHandle===handle))errors.push(`Ligue a saída ${handle==='yes'?'Sim':'Não'} de «${n.data.label}».`);}if(n.data.kind==='delay'&&(!Number.isFinite(n.data.delay)||n.data.delay<0))errors.push('O tempo de espera deve ser positivo.');}
 return [...new Set(errors)];
}
export function simulate(w:Workflow,input:Record<string,unknown>):{logs:Log[];status:'success'|'error';duration:number}{
 const errors=validate(w);if(errors.length)throw new Error(errors.join('\n'));
 const logs:Log[]=[];let id:string|undefined=w.nodes.find(n=>n.data.kind==='trigger')!.id;let duration=0;const visited=new Set<string>();
 while(id){if(visited.has(id))throw new Error('Ciclo detetado.');visited.add(id);const n=w.nodes.find(n=>n.id===id)!;const d=n.data;let branch:string|undefined;let message='Ação simulada com sucesso. Nenhum serviço externo foi contactado.';let status:'success'|'error'='success';let elapsed=120;
 if(d.kind==='trigger')message='Dados de teste recebidos. Simulação iniciada.';
 if(d.kind==='condition'){if(!Object.prototype.hasOwnProperty.call(input,d.field)){status='error';message=`Campo «${d.field}» ausente nos dados de teste.`;}else if(d.operator==='gte'&&(input[d.field]===null||String(input[d.field]).trim()===''||!Number.isFinite(Number(input[d.field])))){status='error';message=`O campo «${d.field}» deve ser numérico.`;}else{branch=(d.operator==='gte'?Number(input[d.field])>=Number(d.value):String(input[d.field])===d.value)?'yes':'no';message=`${d.field} ${d.operator==='gte'?'≥':'='} ${d.value} → ${branch==='yes'?'Sim':'Não'}`;}}
 if(d.kind==='delay'){elapsed=d.delay*1000;message=`Espera virtual de ${d.delay} s. O tempo é acelerado na demonstração.`;}
 if(d.kind==='notification')message='Notificação simulada. Não foi enviada qualquer mensagem.';
 if(d.fail){status='error';message='Falha de teste configurada nesta etapa. Execução interrompida.';}
 duration+=elapsed;logs.push({nodeId:n.id,label:d.label,kind:d.kind,message,status,elapsed});if(status==='error')return {logs,status:'error',duration};
 id=w.edges.find(e=>e.source===n.id&&(d.kind!=='condition'||e.sourceHandle===branch))?.target;
 }return {logs,status:'success',duration};
}
export function template(index:number):Workflow {
 const names=['Qualificação de leads','Triagem de suporte','Aprovação de pedidos','Follow-up de clientes'];
 const titles=[['Novo lead recebido','Qualificar lead','Pontuação ≥ 70','Notificar equipa comercial','Adicionar à nutrição'],['Pedido recebido','Classificar pedido','Prioridade elevada?','Notificar especialista','Preparar resposta'],['Pedido de aprovação','Registar pedido','Valor ≥ 500','Notificar responsável','Aprovar automaticamente'],['Novo contacto','Preparar follow-up','Interesse confirmado?','Enviar lembrete','Aguardar novo contacto']];
 const t=titles[index];const nodes:FlowNode[]=[makeNode('trigger',80,180),makeNode(index===3?'delay':'action',370,180),makeNode('condition',660,180),makeNode('notification',960,65),makeNode('action',960,310)];nodes.forEach((n,i)=>{n.data.label=t[i];n.data.detail=['Início do workflow','Preparação dos dados','Decisão com dados de teste','Ramo Sim · simulado','Ramo Não · simulado'][i];});nodes[2].data.field=index===1?'prioridade':index===2?'valor':index===3?'interesse':'pontuacao';nodes[2].data.value=index===1?'alta':index===2?'500':index===3?'sim':'70';nodes[2].data.operator=index===1||index===3?'eq':'gte';
 const edges:Edge[]=[{id:crypto.randomUUID(),source:nodes[0].id,target:nodes[1].id},{id:crypto.randomUUID(),source:nodes[1].id,target:nodes[2].id},{id:crypto.randomUUID(),source:nodes[2].id,target:nodes[3].id,sourceHandle:'yes',label:'Sim'},{id:crypto.randomUUID(),source:nodes[2].id,target:nodes[4].id,sourceHandle:'no',label:'Não'}];return {id:crypto.randomUUID(),name:names[index],description:['Transforme novos contactos em oportunidades.','Dê a cada pedido o acompanhamento certo.','Simplifique decisões e mantenha tudo em movimento.','Mantenha a conversa no momento certo.'][index],category:['Vendas','Suporte','Operações','Marketing'][index],state:'Pronto',nodes,edges,updated:new Date().toISOString()};
}
