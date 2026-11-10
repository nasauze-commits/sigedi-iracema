'use strict';
const KEY='sigedi-iracema-v1';let state={people:[],records:[],holidays:[]},editing=null;
const $=id=>document.getElementById(id),$$=s=>[...document.querySelectorAll(s)];
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),fmt=s=>s?`${s.slice(8,10)}/${s.slice(5,7)}/${s.slice(0,4)}`:'—',digits=s=>String(s||'').replace(/\D/g,''),norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(),safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(s){let e=$('toast');e.textContent=s;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),4300)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){toast('Espaço insuficiente: exporte um backup.') }}
function load(){try{let v=JSON.parse(localStorage.getItem(KEY)||'{}');state={people:Array.isArray(v.people)?v.people:[],records:Array.isArray(v.records)?v.records:[],holidays:Array.isArray(v.holidays)?v.holidays:[]}}catch(e){toast('Erro ao carregar dados locais.')}}
function navigate(p){$$('.page').forEach(x=>x.classList.toggle('active',x.id==='page-'+p));$$('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.page===p));$('sectionName').textContent=({painel:'Painel geral',novo:'Nova diária',processos:'Processos',servidores:'Beneficiários',relatorios:'Relatórios',config:'Configurações'})[p];render();window.scrollTo(0,0)}
function validCPF(s){let x=digits(s);if(x.length!==11||/^(\d)\1+$/.test(x))return false;for(let t=9;t<11;t++){let z=0;for(let i=0;i<t;i++)z+=Number(x[i])*(t+1-i);let v=(z*10)%11;if(v===10)v=0;if(v!==Number(x[t]))return false}return true}
function cpfFmt(s){let x=digits(s);return x.length===11?`${x.slice(0,3)}.${x.slice(3,6)}.${x.slice(6,9)}-${x.slice(9)}`:s}
function reportCPF(r){if(digits(r.cpf).length===11)return cpfFmt(r.cpf);let found=state.people.filter(p=>p.matricula===r.matricula&&norm(p.nome)===norm(r.nome)&&digits(p.cpf).length===11);return found.length===1?cpfFmt(found[0].cpf):'—'}
function tableLine(r){return `<tr><td><strong>${safe(r.nome)}</strong></td><td>${safe(r.memo)}</td><td>${safe(r.destino)}</td><td>${fmt(r.pagamento)}</td><td>${safe(r.quantidade)}</td><td><strong>${money(r.total)}</strong></td><td><button class="action" data-edit="${safe(r.id)}">Editar</button><button class="action" data-word="${safe(r.id)}">Word ↓</button><button class="action" data-delete="${safe(r.id)}" style="color:#a32222;margin-left:6px">Excluir</button></td></tr>`}
function filteredRecords(){let a=$('fStart').value,b=$('fEnd').value,p=norm($('fPerson').value),d=norm($('fDest').value),min=$('fMin').value,max=$('fMax').value,field=$('fDateType').value;return state.records.filter(r=>(!a||r[field]>=a)&&(!b||r[field]<=b)&&(norm(r.nome+' '+r.matricula).includes(p)||digits(reportCPF(r)).includes(digits(p))&&digits(p).length>0)&&norm(r.destino).includes(d)&&(!min||r.total>=+min)&&(!max||r.total<=+max))}
function render(){const pq=norm($('personSearch').value),rq=norm($('processSearch').value);let people=state.people.filter(p=>norm(p.nome+' '+p.matricula+' '+p.cargo).includes(pq));$('peopleRows').innerHTML=people.length?people.map(p=>`<tr><td><strong>${safe(p.nome)}</strong></td><td>${safe(p.matricula)}</td><td>${safe(p.cargo)}</td><td>${safe(p.situacao||'Não informada')}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">Nenhum beneficiário localizado.</td></tr>';['dlNomes','dlMatriculas','dlCargos'].forEach((id,i)=>$(id).innerHTML=[...new Set(state.people.map(p=>[p.nome,p.matricula,p.cargo][i]))].map(v=>`<option value="${safe(v)}"></option>`).join(''));let rec=[...state.records].reverse();$('processRows').innerHTML=rec.filter(r=>norm(r.nome+' '+r.memo+' '+r.destino).includes(rq)).map(tableLine).join('')||'<tr><td colspan="7" class="empty">Nenhum processo localizado.</td></tr>';$('recent').innerHTML=rec.length?`<div class="table-wrap"><table><thead><tr><th>Beneficiário</th><th>Memo</th><th>Destino</th><th>Pagamento</th><th>Diárias</th><th>Valor</th><th>Ações</th></tr></thead><tbody>${rec.slice(0,5).map(tableLine).join('')}</tbody></table></div>`:'<div class="empty"><strong>Nenhum processo cadastrado</strong>Comece uma nova diária para visualizar os processos.</div>';$('mCount').textContent=state.records.length;$('mPeople').textContent=state.people.length;$('mQty').textContent=state.records.reduce((s,r)=>s+Number(r.quantidade),0);$('mTotal').textContent=money(state.records.reduce((s,r)=>s+Number(r.total),0));let rr=filteredRecords();$('rCount').textContent=rr.length;$('rQty').textContent=rr.reduce((s,r)=>s+Number(r.quantidade),0);$('rTotal').textContent=money(rr.reduce((s,r)=>s+Number(r.total),0));$('reportRows').innerHTML=rr.map(r=>`<tr><td>${safe(r.nome)}</td><td>${safe(reportCPF(r))}</td><td>${safe(r.memo)}</td><td>${safe(r.destino)}</td><td>${fmt(r.saida)}</td><td>${fmt(r.pagamento)}</td><td>${r.quantidade}</td><td>${money(r.total)}</td></tr>`).join('')||'<tr><td colspan="8" class="empty">Nenhum registro para os filtros selecionados.</td></tr>'}
function matchPerson(field){let hits=state.people.filter(p=>norm(p[field])===norm($(field).value));if(hits.length===1)['nome','matricula','cargo','cpf'].forEach(k=>$(k).value=hits[0][k]||'');else if(hits.length>1)toast('Mais de um beneficiário com este cargo. Selecione pelo nome ou matrícula.')}
function dialog(open){if(open){$('personForm').reset();$('newPersonError').hidden=true;$('personDialog').showModal()}else $('personDialog').close()}
function addPerson(e){e.preventDefault();let p={id:crypto.randomUUID(),nome:$('newNome').value.trim().toUpperCase(),matricula:$('newMatricula').value.trim(),cargo:$('newCargo').value.trim().toUpperCase(),cpf:cpfFmt($('newCpf').value),situacao:'Cadastro manual'},err=[];if(!p.nome||!p.matricula||!p.cargo||!p.cpf)err.push('Preencha todos os campos.');if(!validCPF(p.cpf))err.push('CPF inválido.');if(state.people.some(x=>x.matricula===p.matricula&&digits(x.cpf)===digits(p.cpf)))err.push('Cadastro duplicado.');if(state.people.some(x=>x.matricula===p.matricula&&digits(x.cpf)!==digits(p.cpf)))err.push('Matrícula já cadastrada para outro CPF.');if(err.length){$('newPersonError').hidden=false;$('newPersonError').textContent=err.join(' ');return}state.people.push(p);save();['nome','matricula','cargo','cpf'].forEach(k=>$(k).value=p[k]);dialog(false);render();toast('Beneficiário cadastrado.')}
const date=s=>new Date(s+'T12:00:00'),iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function addDay(s,n){let d=date(s);d.setDate(d.getDate()+n);return iso(d)}
function easter(y){let a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k+7)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;return iso(new Date(y,mo-1,da,12))}
function holidays(y){let fixed=['01-01','04-21','05-01','09-07','10-05','10-12','11-02','11-04','11-15','11-20','12-25'].map(s=>y+'-'+s),e=easter(y);return new Set([...fixed,addDay(e,-48),addDay(e,-47),addDay(e,-2),addDay(e,60),...state.holidays])}
function business(s){if(!s||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;let dow=date(s).getDay();return dow!==0&&dow!==6&&!holidays(+s.slice(0,4)).has(s)}
function shift(s,n){let dir=n>0?1:-1;for(let i=0;i<Math.abs(n);){s=addDay(s,dir);if(business(s))i++}return s}
function datesFor(r){let d4=shift(r.pagamento,-1),d2=shift(d4,-1),d1=shift(d2,-1),d6=shift(r.retorno,1);return {1:d1,2:d2,3:d4,4:d4,5:r.pagamento,6:d6,7:d6,8:d6}}
const fields=['nome','matricula','cargo','cpf','memo','processo','portaria','origem','destino','saida','retorno','transporte','pagamento','objetivo','justificativa','quantidade','unitario','norma','atividades','manifestacao'];
function readForm(){let r={};fields.forEach(id=>r[id]=$(id).value.trim());r.quantidade=Number(r.quantidade);r.unitario=Number(r.unitario);r.total=Math.round(r.quantidade*r.unitario*100)/100;r.cpf=cpfFmt(r.cpf);return r}
function validate(r,id){let er=[];for(let key of ['nome','matricula','cargo','cpf','memo','processo','portaria','origem','destino','saida','retorno','pagamento','objetivo','justificativa'])if(!r[key])er.push('Campo obrigatório: '+key+'.');if(!validCPF(r.cpf))er.push('CPF inválido.');if(!Number.isInteger(r.quantidade)||r.quantidade<1)er.push('Quantidade deve ser inteira e positiva.');if(!(r.unitario>0))er.push('Valor unitário deve ser positivo.');if(r.saida&&r.retorno&&r.retorno<r.saida)er.push('Retorno anterior à saída.');if(r.pagamento&&!business(r.pagamento))er.push('Pagamento ('+fmt(r.pagamento)+') não é dia útil.');if(r.pagamento&&business(r.pagamento)&&r.retorno)for(let [i,d] of Object.entries(datesFor(r)))if(!business(d))er.push('Data do documento '+i+' não é dia útil: '+fmt(d));if(state.records.some(x=>x.id!==id&&x.memo===r.memo))er.push('Número do memorando já cadastrado.');return er}
function errorBox(errors){$('formErrors').hidden=!errors.length;$('formErrors').innerHTML=errors.map(e=>'• '+safe(e)).join('<br>');if(errors.length){$('formErrors').scrollIntoView({block:'center'});toast('Revise os campos indicados.')}}
function persist(){let r=readForm(),er=validate(r,editing);errorBox(er);if(er.length)return null;let old=state.records.find(x=>x.id===editing);r.id=editing||crypto.randomUUID();r.createdAt=old?.createdAt||new Date().toISOString();r.updatedAt=new Date().toISOString();if(old)state.records[state.records.indexOf(old)]=r;else state.records.push(r);editing=r.id;save();render();toast('Registro salvo neste navegador.');return r}
function reset(){editing=null;$('diariaForm').reset();$('origem').value='Iracema/RR';$('formErrors').hidden=true;$('formTitle').textContent='Nova concessão de diária';calc()}
function edit(id){let r=state.records.find(x=>x.id===id);if(!r)return;reset();editing=id;fields.forEach(k=>$(k).value=r[k]??'');$('formTitle').textContent='Editar processo — '+r.memo;calc();navigate('novo')}
function deleteRecord(id){
 const record=state.records.find(r=>r.id===id);
 if(!record)return;
 const msg=`Excluir definitivamente o processo ${record.processo||record.memo} de ${record.nome}?\n\nEsta ação também retirará o processo dos relatórios e totais. Recomenda-se exportar um backup antes.`;
 if(!confirm(msg))return;
 state.records=state.records.filter(r=>r.id!==id);
 if(editing===id)reset();
 save();render();toast('Processo excluído deste navegador.');
}
function calc(){$('totalPreview').textContent=money(+$('quantidade').value*+$('unitario').value)}
function dl(name,blob){let u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),4000)}
function backup(){dl('SIGEDI-backup-'+iso(new Date())+'.json',new Blob([JSON.stringify({format:'SIGEDI-1',...state},null,2)],{type:'application/json'}));toast('Backup exportado. Guarde em local seguro.')}
function jsonFile(file,cb){if(!file)return;file.text().then(t=>cb(JSON.parse(t))).catch(e=>toast('Erro na importação: '+e.message))}
function importPeople(data){let a=Array.isArray(data)?data:data.people;if(!Array.isArray(a))throw Error('Formato inválido');let n=0;for(let r of a){if(!r.nome||!r.matricula||!r.cargo||!r.cpf)continue;if(!state.people.some(p=>p.matricula==r.matricula&&digits(p.cpf)===digits(r.cpf))){state.people.push({id:String(r.id||crypto.randomUUID()),nome:String(r.nome),matricula:String(r.matricula),cargo:String(r.cargo),cpf:String(r.cpf),situacao:String(r.situacao||'Importado')});n++}}save();render();toast(n+' cadastro(s) importado(s).')}
const csvCell=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
function csvReport(){let cols=['Beneficiário','CPF','Matrícula','Memo','Processo','Portaria','Destino','Saída','Retorno','Pagamento','Quantidade','Valor unitário','Valor total'],rows=filteredRecords().map(r=>[r.nome,reportCPF(r),r.matricula,r.memo,r.processo,r.portaria,r.destino,fmt(r.saida),fmt(r.retorno),fmt(r.pagamento),r.quantidade,r.unitario.toFixed(2).replace('.',','),r.total.toFixed(2).replace('.',',')]);dl('SIGEDI-relatorio-'+iso(new Date())+'.csv',new Blob(['\uFEFF'+[cols,...rows].map(x=>x.map(csvCell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}))}
/* output utilities */
function intWords(n){
 const units=['','um','dois','três','quatro','cinco','seis','sete','oito','nove'];
 const teens=['dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
 const tens=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
 const hundreds=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
 function sub(x){if(x===0)return '';if(x===100)return 'cem';let parts=[];if(x>=100){parts.push(hundreds[Math.floor(x/100)]);x%=100}if(x>=20){parts.push(tens[Math.floor(x/10)]);x%=10;if(x)parts.push(units[x])}else if(x>=10){parts.push(teens[x-10])}else if(x){parts.push(units[x])}return parts.join(' e ')}
 if(n===0)return 'zero';let parts=[];if(n>=1000000){let m=Math.floor(n/1000000);parts.push(sub(m)+(m===1?' milhão':' milhões'));n%=1000000}if(n>=1000){let m=Math.floor(n/1000);parts.push((m===1?'mil':sub(m)+' mil'));n%=1000}if(n)parts.push(sub(n));return parts.join(' e ')
}
function extenso(v){let cents=Math.round(Number(v)*100),reais=Math.floor(cents/100),centavos=cents%100;return intWords(reais)+' '+(reais===1?'real':'reais')+(centavos?' e '+intWords(centavos)+' '+(centavos===1?'centavo':'centavos'):'')}
function replacement(token,section,full,r){
 let t=token.slice(1,-1).trim().toLowerCase(),q=r.quantidade,tot=r.total,unit=r.unitario,period=fmt(r.saida)+' a '+fmt(r.retorno);
 if(t==='data')return fmt(datesFor(r)[section]);
 if(t==='memo'||t==='000/2026')return section===4?r.portaria:section===8?r.processo:r.memo;
 if(t==='nome'||t==='nome completo'||t==='beneficiário'||t==='nome do beneficiário'||t==='nome do solicitante')return r.nome;
 if(t==='cpf – uso interno')return r.cpf;
 if(t==='cargo'||t==='cargo / função'||t==='cargo/função')return r.cargo;
 if(t==='matrícula')return r.matricula;
 if(t==='município/uf'||t==='município / uf'||t==='destino')return r.destino;
 if(t==='dd/mm/aaaa'||t==='datas')return period;
 if(t==='data inicial')return fmt(r.saida);
 if(t==='data final')return fmt(r.retorno);
 if(t==='terrestre / aéreo / outro')return r.transporte;
 if(t==='quantidade de diárias'||t==='quantidade'||t==='0')return String(q);
 if(t==='valor total por extenso'||t==='extenso')return extenso(tot);
 if(t==='valor total')return tot.toFixed(2).replace('.',',');
 if(t==='valor')return section===4&&full.includes('valor unitário')?unit.toFixed(2).replace('.',','):tot.toFixed(2).replace('.',',');
 if(t==='0,00')return section===2&&/valor unitário/i.test(full)?unit.toFixed(2).replace('.',','):tot.toFixed(2).replace('.',',');
 if(t==='descrever objetivamente a missão institucional'||t==='finalidade institucional'||t==='missão institucional')return r.objetivo;
 if(t==='detalhar a relação com as atribuições e os resultados esperados')return r.justificativa;
 if(t==='indicar norma aplicável')return r.norma||'norma aplicável à concessão de diárias';
 if(t.startsWith('descreva (ou crie)'))return r.atividades||'O deslocamento foi realizado para realização de atividades relativas às necessidades da Casa Legislativa.';
 if(t.startsWith('declare, com base no objetivo'))return r.manifestacao||`Conforme as informações registradas, a missão institucional teve como objetivo ${r.objetivo.charAt(0).toLowerCase()+r.objetivo.slice(1)}. O deslocamento foi analisado à luz da justificativa apresentada: ${r.justificativa}`;
 if(t.startsWith('a regularidade da documentação'))return 'a regularidade da documentação e a inexistência de pendências';
 if(t==='autoridade competente')return 'NILSON VIEIRA DA SILVA';
 return null;
}
function changeParagraph(p,section,r,xml){
 const ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
 let nodes=[...p.getElementsByTagNameNS(ns,'t')];if(!nodes.length)return;
 let texts=nodes.map(n=>n.textContent),full=texts.join('');
 let matches=[...full.matchAll(section===1?/\[[^\]]+\]|Iracema\/RR →/g:/\[[^\]]+\]/g)];
 for(let k=matches.length-1;k>=0;k--){let match=matches[k],repl=match[0]==='Iracema/RR →'?r.origem+' →':replacement(match[0],section,full,r);if(repl===null)continue;
 let start=match.index,end=start+match[0].length,positions=[],offset=0;
 for(let i=0;i<texts.length;i++){positions.push([offset,offset+texts[i].length]);offset+=texts[i].length}
 let first=positions.findIndex(([a,b])=>start<b),last=positions.findIndex(([a,b])=>end<=b);
 if(first<0||last<0)continue;
 if(first===last){let local=start-positions[first][0],endLocal=end-positions[first][0];texts[first]=texts[first].slice(0,local)+repl+texts[first].slice(endLocal)}
 else{let a=start-positions[first][0],b=end-positions[last][0];texts[first]=texts[first].slice(0,a)+repl;for(let i=first+1;i<last;i++)texts[i]='';texts[last]=texts[last].slice(b)}
 }
 nodes.forEach((n,i)=>{n.textContent=texts[i];n.setAttribute('xml:space','preserve')});
}
async function generateWord(r){
 if(!window.JSZip){toast('Biblioteca Word indisponível. Conecte-se à internet e tente novamente.');return}
 const err=validate(r,r.id);if(err.length){toast('Não é possível gerar Word: '+err[0]);return}
 try{let res=await fetch('./modelo-processo.docx');if(!res.ok)throw Error('Modelo Word não encontrado');let zip=await JSZip.loadAsync(await res.arrayBuffer());let xml=await zip.file('word/document.xml').async('string');let dom=new DOMParser().parseFromString(xml,'application/xml');if(dom.querySelector('parsererror'))throw Error('Erro ao ler o modelo Word');const ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main';let body=dom.getElementsByTagNameNS(ns,'body')[0],section=0;
 for(let child of body.children){if(child.localName==='p'){const tx=[...child.getElementsByTagNameNS(ns,'t')].map(n=>n.textContent).join('');let m=tx.match(/^DOCUMENTO\s+0([1-8])/);if(m)section=Number(m[1]);changeParagraph(child,section,r,dom)}else if(child.localName==='tbl'){for(let row of child.getElementsByTagNameNS(ns,'tr'))for(let p of row.getElementsByTagNameNS(ns,'p'))changeParagraph(p,section,r,dom)}}
 zip.file('word/document.xml',new XMLSerializer().serializeToString(dom));let blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});dl(`SIGEDI_${r.memo.replace(/[^a-z0-9-]/gi,'_')}_${r.nome.replace(/\s+/g,'_')}.docx`,blob);toast('Processo Word gerado com as oito peças.');
 }catch(err){console.error(err);toast('Erro na geração Word: '+err.message)}
}
function bind(){
 $$('[data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
 $$('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
 ['nome','matricula','cargo'].forEach(id=>$(id).addEventListener('change',()=>matchPerson(id)));
 ['quantidade','unitario'].forEach(id=>$(id).addEventListener('input',calc));
 ['addPerson','addPersonTop'].forEach(id=>$(id).addEventListener('click',()=>dialog(true)));
 ['closeDialog','cancelPerson'].forEach(id=>$(id).addEventListener('click',()=>dialog(false)));
 $('personForm').addEventListener('submit',addPerson);
 $('clearForm').addEventListener('click',reset);
 $('saveOnly').addEventListener('click',persist);
 $('diariaForm').addEventListener('submit',async e=>{e.preventDefault();let r=persist();if(r)await generateWord(r)});
 $('processSearch').addEventListener('input',render);
 $('personSearch').addEventListener('input',render);
 $$('[id^=fStart],[id^=fEnd],[id^=fPerson],[id^=fDest],[id^=fMin],[id^=fMax],[id^=fDateType]').forEach(e=>e.addEventListener('input',render));
 $('resetFilters').addEventListener('click',()=>{['fStart','fEnd','fPerson','fDest','fMin','fMax'].forEach(x=>$(x).value='');$('fDateType').value='pagamento';render()});
 $('exportCsv').addEventListener('click',csvReport);
 ['backupBtn','backupShortcut'].forEach(id=>$(id).addEventListener('click',backup));
 $('importPeople').addEventListener('change',e=>{jsonFile(e.target.files[0],importPeople);e.target.value=''});
 $('restoreBackup').addEventListener('change',e=>{jsonFile(e.target.files[0],d=>{if(!Array.isArray(d.people)||!Array.isArray(d.records))throw Error('Arquivo de backup incompatível');if(!confirm('Restaurar backup e substituir todos os dados existentes neste navegador?'))return;state={people:d.people,records:d.records,holidays:Array.isArray(d.holidays)?d.holidays:[]};save();render();toast('Backup restaurado.')});e.target.value=''});
 $('saveHolidays').addEventListener('click',()=>{let dates=$('extraHolidays').value.split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean);if(dates.some(s=>!/^\d{4}-\d{2}-\d{2}$/.test(s))){toast('Use somente datas AAAA-MM-DD.');return}state.holidays=dates;save();toast('Calendário atualizado.')});
 document.addEventListener('click',e=>{const editButton=e.target.closest('[data-edit]'),wordButton=e.target.closest('[data-word]'),deleteButton=e.target.closest('[data-delete]');if(editButton)edit(editButton.dataset.edit);if(wordButton){let r=state.records.find(x=>x.id===wordButton.dataset.word);if(r)generateWord(r)}if(deleteButton)deleteRecord(deleteButton.dataset.delete)});
}
load();bind();render();$('todayText').textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
