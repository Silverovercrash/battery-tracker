// SPDX-License-Identifier: MIT
const uriArg=value=>encodeURIComponent(String(value)).replace(/'/g,'%27');
function persistTrackerState(){
  const data=structuredClone(state);
  localStorage.setItem(KEY,JSON.stringify(data));
  if(window.AKKU_HA_MODE&&window.AKKU_HA_CONNECTED){
    const requestId=++haSaveSequence;
    haLatestSaveSequence=requestId;
    window.parent.postMessage({type:'akku-tracker-save',requestId,data},location.origin);
  }
}
