const { contextBridge, ipcRenderer } = require('electron');

const validChannels = ['message']; // define os canais permitidos

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, callback) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  }
});