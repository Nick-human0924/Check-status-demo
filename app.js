import data from './data.mjs';
import {lookupRecords} from './lookup.mjs';
const form=document.querySelector('#query-form'),results=document.querySelector('#results'),notice=document.querySelector('#service-notice'),submit=document.querySelector('#submit');
let clearTimer,generation=0;
function clear(){clearTimeout(clearTimer);generation++;form.reset();results.replaceChildren();results.hidden=true;notice.hidden=true;submit.disabled=false;submit.textContent='查询打款状态 →';}
function showNotice(text){notice.textContent=text;notice.hidden=false;}
function element(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!form.reportValidity())return;
 const active=++generation;clearTimeout(clearTimer);results.replaceChildren();results.hidden=true;notice.hidden=true;
 submit.disabled=true;submit.textContent='正在查询…';
 try{
  const records=await lookupRecords(data,form.elements.namedItem('name').value,form.elements.namedItem('suffix').value);
  if(active!==generation)return;
  if(!records.length){showNotice('未匹配到记录，请核对姓名和身份证后四位。');return;}
  results.append(element('h3','查询结果'));
  for(const record of records){
   const card=element('article','','receipt'),head=element('div','','receipt-head');head.append(element('strong',record.name),element('span',record.status,record.status==='支付成功'?'status success':'status'));card.append(head);
   const dl=document.createElement('dl');for(const[label,value]of[['账单状态日期',record.date],['账单状态',record.status],['打款金额（税前）','¥1,000.00'],['支付方',record.payer]])dl.append(element('dt',label),element('dd',value,label==='打款金额（税前）'?'amount-value':undefined));card.append(dl);
   card.append(element('p','以上为税前金额。因个人适用税率及扣税情况不同，实际到账金额可能有所不同，请以银行实际入账金额为准。','tax-note'));results.append(card);
  }
  results.append(element('p','到账情况以银行实际入账为准。页面闲置2分钟后自动清除。','result-note'));
  const button=element('button','清除本次查询','clear');button.type='button';button.addEventListener('click',clear);results.append(button);results.hidden=false;results.focus();
 }catch{if(active===generation)showNotice('查询未完成，请刷新页面后重试。');}
 finally{if(active===generation){submit.disabled=false;submit.textContent='查询打款状态 →';clearTimer=setTimeout(clear,120000);}}
});
form.addEventListener('input',()=>{generation++;submit.disabled=false;submit.textContent='查询打款状态 →';results.replaceChildren();results.hidden=true;notice.hidden=true;clearTimeout(clearTimer);clearTimer=setTimeout(clear,120000);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});window.addEventListener('pagehide',clear);window.addEventListener('pageshow',event=>{if(event.persisted)clear();});
const dialog=document.querySelector('#privacy-dialog');document.querySelector('#privacy').onclick=()=>dialog.showModal();document.querySelector('#close-privacy').onclick=()=>dialog.close();
