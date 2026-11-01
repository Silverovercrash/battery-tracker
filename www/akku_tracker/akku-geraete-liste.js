// SPDX-License-Identifier: MIT
// Alle Geräte bleiben sichtbar. Native <details>/<summary> klappt jede Karte einzeln auf.
const deviceListStyle=document.createElement('style');
setLocalizedText(deviceListStyle,()=>(`
.device-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px}
.device-entry{display:grid;grid-template-columns:42px minmax(0,1fr);gap:10px;align-items:start}
.device-index{width:38px;height:38px;margin-top:7px;border-radius:50%;display:grid;place-items:center;background:#e7effa;color:#174f97;font-size:15px;font-weight:800}
.device-list .compactdevice{min-width:0;width:100%;padding:0;align-self:stretch;overflow:hidden}
.device-details>summary{list-style:none;cursor:pointer;padding:13px 16px;position:relative}
.device-details>summary::-webkit-details-marker{display:none}
.device-details>summary:after{content:'▸';position:absolute;right:16px;top:16px;color:#174f97;font-size:21px;font-weight:800;transition:transform .15s}
.device-details[open]>summary:after{transform:rotate(90deg)}
.device-list .device-titleline{display:flex;align-items:center;gap:12px;min-height:38px;padding-right:24px}
.device-list .device-titleline h3{display:flex;align-items:center;gap:7px;flex:1;margin:0;font-size:19px}
.device-list .device-icon{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:8px;background:#e7effa;font-size:20px;flex:0 0 30px}
.device-list .device-facts{display:flex;flex-wrap:wrap;gap:7px 14px;margin:9px 0 0;color:#465a70}
.device-list .device-facts span{display:inline-flex;align-items:center;gap:5px}
.device-list .batterycount{font-size:17px;margin:9px 0 0;padding:8px 11px}
.device-content{padding:0 16px 14px}
.device-list .compactmeta{margin:8px 0 0;min-height:0;line-height:1.55}
.device-list .device-readings{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
.device-list .device-reading{background:#f1f5f9;border-radius:7px;padding:8px 10px;min-width:0}
.device-list .device-reading b,.device-list .device-reading small{display:block}
.device-list .device-reading b{margin-top:3px;overflow-wrap:anywhere}
.device-list .individualbattery{padding:12px;margin:9px 0}
.device-list .cellmeasure{gap:8px}
@media(max-width:700px){.device-entry{grid-template-columns:32px minmax(0,1fr);gap:7px}.device-index{width:30px;height:30px;margin-top:10px;font-size:13px}.device-details>summary{padding:11px}.device-list .device-titleline{gap:7px}.device-list .device-titleline h3{font-size:17px}.device-details>summary:after{right:11px;top:12px}.device-list .device-readings{grid-template-columns:1fr 1fr}.device-content{padding:0 11px 11px}}
`));
document.head.append(deviceListStyle);

views['Geräte']=()=>`<div class="toolbar"><h2>Geräte (${state.devices.length})</h2><button class="primary" onclick="deviceForm()">＋ Gerät anlegen</button></div><ol class="device-list">${state.devices.map((d,i)=>{const bs=d.set?members(d.set):[],n=bs.length,last=deviceHistory(d)[0],brands=[...new Set(bs.map(b=>[b.brand,b.model].filter(Boolean).join(' · ')).filter(Boolean))].join(' / '),sizes=[...new Set(bs.map(b=>b.size).filter(Boolean))].join(' / '),currentIn=bs.map(b=>`${esc(b.id)} ${volt(batteryInValue(d,b))}`).join(' · '),previousOut=last?(last.snapshot||[]).map(b=>`${esc(b.id)} ${volt(last.measurements?.[b.id]?.out)}`).join(' · '):'';return `<li class="device-entry"><span class="device-index" aria-label="Gerät ${i+1}">${String(i+1).padStart(2,'0')}</span><article class="device compactdevice"><details class="device-details"><summary><div class="device-titleline"><h3>${esc(d.name)}</h3>${badge(d.set?'Im Einsatz':'Nicht bestückt')}</div><div class="device-facts"><span>📍 ${esc(d.place||'Ort nicht eingetragen')}</span><span>🔋 ${d.count} ${d.count===1?'Batterieplatz':'Batterieplätze'}</span>${d.size?`<span>📐 Größe ${esc(d.size)}</span>`:''}</div><div class="batterycount">${n>1?`1 Satz · ${n} Batterien`:n===1?'1 einzelne Batterie':'Noch keine Batterie eingelegt'}</div></summary><div class="device-content">${d.set?`<p class="compactmeta"><b>🧪 ${esc(brands||'Bezeichnung noch offen')}</b><br><small>📅 Eingelegt ${fmtDate(d.since)} · ⏱ Bisher ${duration(d.since,today())} Tage im Gerät${sizes?' · Größe '+esc(sizes):''}</small></p>`:`<p class="compactmeta">Bereit zum Einlegen</p>`}<div class="device-readings"><div class="device-reading"><small>⚡ IN · je Batterie</small><b>${d.set?currentIn:'Noch nicht eingelegt'}</b></div><div class="device-reading"><small>↘ OUT · letzte Entnahme</small><b>${previousOut||'Noch keine Entnahme'}</b></div></div>${n>1?`<p class="setexplanation"><b>Dieser Satz besteht aus genau ${n} Batterien:</b><br><small>Satzname: ${esc(d.set)}</small></p>`:n===1?'<p class="setexplanation"><b>Diese eine Batterie ist eingelegt:</b></p>':''}<div class="batterylist">${bs.map((b,j)=>`<section class="individualbattery"><div class="batteryidentity"><span>Batterie ${j+1} von ${n}</span><b>${esc(b.id)}</b><small>Steckplatz ${esc(b.slot||j+1)}</small></div><div class="cellmeasure"><div><small>IN · beim Einlegen</small><strong>${volt(batteryInValue(d,b))}</strong></div><div><small>OUT · beim Entnehmen</small><strong>${last?volt(last.measurements?.[b.id]?.out):'–'}</strong><small>${last?'Letzte Entnahme · '+fmtDate(last.end):'Noch im Gerät'}</small></div></div><small>${esc(typeOf(b))}${b.note&&b.note.trim()!==[b.model,b.brand].filter(Boolean).join(' ')?' · '+esc(b.note):''}</small></section>`).join('')}</div><div class="row">${d.set?`<button class="primary" onclick="cycleForm(${i},'swap')">Wechseln</button><button onclick="cycleForm(${i},'out')">Herausnehmen</button>`:`<button class="primary" onclick="cycleForm(${i},'in')">Einlegen</button>`}</div>${d.set?`<button onclick="editCurrent(${i})">Einzelspannungen / Datum bearbeiten</button>`:''}<div class="row"><button onclick="showHistory(decodeURIComponent('${uriArg(d.uid)}'))">Frühere Einsätze (${deviceHistory(d).length})</button><button onclick="showStats(decodeURIComponent('${uriArg(d.uid)}'))">Statistik</button></div></div></details></article></li>`}).join('')}</ol>`;
render();
