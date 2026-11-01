// SPDX-License-Identifier: MIT
// Fügt passende Geräte-Symbole an die Überschriften an. Alle Geräte bleiben in der Liste.
const deviceListDefaultView=views['Geräte'];
function deviceIconFor(d){
  if(d.icon)return d.icon;
  const name=String(d.name||'').toLowerCase();
  if(/uhr|clock/.test(name))return '🕒';
  if(/temp|thermo|klima|feucht/.test(name))return '🌡️';
  if(/rauchmelder|rauch/.test(name))return '🔥';
  if(/tür|fenster|door/.test(name))return '🚪';
  if(/lampe|licht|leuchte/.test(name))return '💡';
  return '📦';
}
const deviceUiStyle=document.createElement('style');
setLocalizedText(deviceUiStyle,()=>('.device-list .device-titleline h3{display:flex;align-items:center;gap:7px}.device-list .device-icon{flex:0 0 30px}'));
document.head.append(deviceUiStyle);
views['Geräte']=()=>{
  let html=deviceListDefaultView();
  for(const d of state.devices){
    const title=`<h3>${esc(d.name)}</h3>`;
    const titleWithIcon=`<h3><span class="device-icon" aria-hidden="true">${esc(deviceIconFor(d))}</span>${esc(d.name)}</h3>`;
    html=html.replace(title,titleWithIcon);
  }
  return html;
};
render();

// Ältere oder zwischengespeicherte UI-Skripte haben die Liste auf zwei Geräte
// begrenzt. Entferne diese globale Begrenzung; jedes Gerät bleibt separat
// über sein natives <details>/<summary> auf- und zuklappbar.
function showAllDeviceSummaries(){
  const list=document.querySelector('#main .device-list');
  if(!list)return;
  if(list.classList.contains('collapsed'))list.classList.remove('collapsed');
  document.querySelectorAll('#main .device-list-toggle').forEach(button=>button.remove());
}
const showAllDeviceSummariesStyle=document.createElement('style');
setLocalizedText(showAllDeviceSummariesStyle,()=>('.device-list .device-entry{display:grid!important}.device-list.collapsed .device-entry{display:grid!important}.device-list-toggle{display:none!important}'));
document.head.append(showAllDeviceSummariesStyle);
showAllDeviceSummaries();
const deviceSummaryObserver=new MutationObserver(showAllDeviceSummaries);
deviceSummaryObserver.observe(document.querySelector('#main'),{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
