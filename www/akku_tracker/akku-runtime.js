// SPDX-License-Identifier: MIT
// Original data/save acknowledgement flow, with bilingual status text.
const trackerBaseRender=render;
render=function(){
  trackerBaseRender();
  const banner=document.querySelector('#connection');
  if(window.AKKU_HA_MODE){
    setLocalizedText(banner,()=>window.AKKU_HA_CONNECTED?'Home Assistant · gemeinsamer Bestand':'Home Assistant wird verbunden');
  }else setLocalizedText(banner,()=> 'Offline · Daten nur in diesem Browser · Open-Source-Entwurf');
};
if(window.AKKU_HA_MODE){
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||!event.data)return;
    const msg=event.data;
    if(msg.type==='akku-tracker-data'&&Array.isArray(msg.data?.batteries)&&Array.isArray(msg.data?.devices)&&Array.isArray(msg.data?.history)){
      state=structuredClone(msg.data);
      haLastSavedState=structuredClone(state);
      window.AKKU_HA_CONNECTED=true;
      message='✓ Mit Home Assistant verbunden';
      render();
    }else if(msg.type==='akku-tracker-data-updated'&&Array.isArray(msg.data?.batteries)){
      state=structuredClone(msg.data);
      haLastSavedState=structuredClone(state);
      message='Änderungen vom anderen Gerät übernommen';
      render();
    }else if(msg.type==='akku-tracker-save-result'){
      const requestId=Number(msg.requestId);
      if(msg.saved){
        haLastSavedState=structuredClone(msg.data||state);
        if(requestId===haLatestSaveSequence){message='✓ In Home Assistant gespeichert';render();}
      }else if(requestId===haLatestSaveSequence){
        if(haLastSavedState)state=structuredClone(haLastSavedState);
        message='Nicht in Home Assistant gespeichert: '+String(msg.error||'Verbindung fehlgeschlagen');
        render();
      }
    }
  });
  window.parent.postMessage({type:'akku-tracker-ready'},location.origin);
}
render();
