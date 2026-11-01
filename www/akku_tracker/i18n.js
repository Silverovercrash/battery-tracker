// SPDX-License-Identifier: MIT
// Translate presentation only. Escaped inventory values are restored as literal text/attributes.
let trackerLanguage=(()=>{
  const explicit=new URLSearchParams(location.search).get('lang');
  let saved;try{saved=localStorage.getItem('akku-tracker-oss-language');}catch{}
  return ['en','de'].includes(explicit)?explicit:['en','de'].includes(saved)?saved:navigator.language.toLowerCase().startsWith('de')?'de':'en';
})();
const trackerLocale=()=>trackerLanguage==='de'?'de-DE':'en-GB';
const localizationSources=new WeakMap();
let localizationFrame=null;
const translationEntries=Object.entries(TRACKER_TRANSLATIONS).sort((a,b)=>b[0].length-a[0].length);
const translationPattern=new RegExp(translationEntries.map(([key])=>key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gu');
function uiIs(value,canonical){return value===canonical||value===uiText(canonical);}
function uiText(value){
  const text=String(value??'');
  if(trackerLanguage==='de')return text;
  return text.replace(translationPattern,source=>TRACKER_TRANSLATIONS[source]);
}
function restoreLocalizedTokens(text,tokens){
  return text.replace(/AKKUPROTECTEDTOKEN\d+END/g,key=>tokens.get(key)??key);
}
function rememberText(node,source,tokens=new Map(),replace=false){
  if(localizationSources.has(node)&&!replace)return;
  const record={source,tokens};localizationSources.set(node,record);
  node.nodeValue=restoreLocalizedTokens(uiText(source),tokens);
}
function localizeFragment(root,tokens=new Map()){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(node.nodeType===Node.TEXT_NODE){
      if(['SCRIPT','STYLE','TEXTAREA'].includes(node.parentElement?.tagName))continue;
      rememberText(node,node.nodeValue,tokens);
    }else{
      // An implicit option value must stay canonical when its visible label changes.
      if(node.tagName==='OPTION'&&!node.hasAttribute('value'))node.setAttribute('value',restoreLocalizedTokens(node.textContent,tokens));
      for(const attr of [...node.attributes]){
        if(['placeholder','title','aria-label','data-label','label'].includes(attr.name))rememberText(attr,attr.value,tokens);
        else if(/AKKUPROTECTEDTOKEN\d+END/.test(attr.value))attr.value=restoreLocalizedTokens(attr.value,tokens);
      }
    }
  }
}
function setLocalizedHTML(element,factory){
  const previous=localizationFrame;
  const tokens=new Map();localizationFrame=tokens;
  let markup;try{markup=String(factory());}finally{localizationFrame=previous;}
  const template=document.createElement('template');template.innerHTML=markup;
  localizeFragment(template.content,tokens);
  element.replaceChildren(template.content);
  return markup;
}
function getLocalizedHTML(element){
  if(!localizationFrame)return element.innerHTML;
  const clone=element.cloneNode(true);
  function copySources(source,target){
    const record=localizationSources.get(source);
    if(record){
      target.nodeValue=record.source.replace(/AKKUPROTECTEDTOKEN\d+END/g,key=>{
        if(!record.tokens.has(key))return key;
        const next='AKKUPROTECTEDTOKEN'+localizationFrame.size+'END';
        localizationFrame.set(next,record.tokens.get(key));return next;
      });
    }
    if(source.nodeType===Node.ELEMENT_NODE)for(const attr of source.attributes)copySources(attr,target.getAttributeNode(attr.name));
    source.childNodes.forEach((child,index)=>copySources(child,target.childNodes[index]));
  }
  copySources(element,clone);return clone.innerHTML;
}
function setLocalizedText(element,factory){
  const previous=localizationFrame,tokens=new Map();localizationFrame=tokens;
  let text;try{text=String(factory()??'');}finally{localizationFrame=previous;}
  element.textContent=text;
  if(element.nodeType===Node.TEXT_NODE)rememberText(element,text,tokens,true);
  else if(element.firstChild)rememberText(element.firstChild,text,tokens,true);
  return text;
}
function newLocalizedOption(label,value){
  const option=new Option(label,value);
  if(option.firstChild)rememberText(option.firstChild,label);
  return option;
}
function initializeTrackerI18n(){
  // The core application declares esc as a variable; preserve its normal escaping outside render frames.
  if(typeof esc==='function'&&!window.trackerEscInstalled){
    const originalEsc=esc;
    esc=value=>{
      if(!localizationFrame)return originalEsc(value);
      const key='AKKUPROTECTEDTOKEN'+localizationFrame.size+'END';
      localizationFrame.set(key,String(value??''));return key;
    };
    window.trackerEscInstalled=true;
  }
  for(const selector of ['header','#connection','.controls']){
    const root=document.querySelector(selector);if(root)localizeFragment(root);
  }
  const select=document.querySelector('#tracker-language');
  if(select){
    select.value=trackerLanguage;
    select.addEventListener('change',()=>setTrackerLanguage(select.value));
  }
  document.documentElement.lang=trackerLanguage;
  document.title=uiText('Akkus & Batterien');
}
function setTrackerLanguage(language){
  if(!['en','de'].includes(language))return;
  trackerLanguage=language;
  try{localStorage.setItem('akku-tracker-oss-language',language);}catch{}
  document.documentElement.lang=language;
  document.title=uiText('Akkus & Batterien');
  // Update remembered nodes in place, including open dialogs. Form values and focus survive.
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  let node;while((node=walker.nextNode())){
    const targets=node.nodeType===Node.ELEMENT_NODE?[...node.attributes]:[node];
    for(const target of targets){const record=localizationSources.get(target);if(record)target.nodeValue=restoreLocalizedTokens(uiText(record.source),record.tokens);}
  }
}
