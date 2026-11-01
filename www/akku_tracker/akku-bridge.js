// SPDX-License-Identifier: MIT
class AkkuTrackerCard extends HTMLElement {
  setConfig(config) { this.config = config || {}; this.render(); }
  set hass(hass) {
    this._hass = hass;
    if (this._ready) this._sendData();
    clearTimeout(this._hassTimer);
    this._hassTimer = setTimeout(() => this._sendData(), 250);
  }
  get hass() { return this._hass; }
  render() {
    if (this._frame) return;
    this.innerHTML = '<iframe title="Battery & Cell Tracker" style="width:100%;height:calc(100vh - 130px);min-height:720px;border:0;border-radius:12px;background:#f2f5f8"></iframe>';
    this._frame = this.querySelector('iframe');
    this._frame.src = new URL('./index.html?ha=1&build=oss-0.1.0', import.meta.url).href;
    this._frame.addEventListener('load', () => {
      this._ready = true;
      this._sendData();
    });
    this._onMessage = async (event) => {
      if (event.origin !== location.origin) return;
      const msg = event.data || {};
      if (msg.type === 'akku-tracker-ready') {
        this._ready = true;
        this._sendData();
      } else if (msg.type === 'akku-tracker-save' && this._hass) {
        try {
          await this._hass.callWS({ type: 'akku_tracker/save', data: msg.data });
          this._frame.contentWindow.postMessage({ type: 'akku-tracker-save-result', requestId: msg.requestId, saved: true, data: msg.data }, location.origin);
        } catch (error) {
          this._frame.contentWindow.postMessage({ type: 'akku-tracker-save-result', requestId: msg.requestId, saved: false, error: String(error) }, location.origin);
        }
      }
    };
    window.addEventListener('message', this._onMessage);
  }
  async _sendData() {
    if (!this._hass || !this._frame || !this._ready) return;
    try {
      const result = await this._hass.callWS({ type: 'akku_tracker/get' });
      const data = structuredClone(result.data);
      this._frame.contentWindow.postMessage({ type: 'akku-tracker-data', data }, location.origin);
    } catch (error) {
      console.warn('Akku Tracker: HA-Daten konnten nicht geladen werden', error);
    }
  }
  disconnectedCallback() { if (this._onMessage) window.removeEventListener('message', this._onMessage); }
}
customElements.define('akku-tracker-card', AkkuTrackerCard);
window.customCards = window.customCards || [];
window.customCards.push({type:'akku-tracker-card',name:'Battery & Cell Tracker',description:'Devices, batteries, sets and replacement history'});
