const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

let mainWindow;
let backendProcess;

const isDev = !app.isPackaged;

function startBackend() {
  const backendPath = isDev
    ? path.join(__dirname, '../backend/src/server.js')
    : path.join(process.resourcesPath, 'backend/src/server.js');

  backendProcess = spawn('node', [backendPath], {
    cwd: isDev
      ? path.join(__dirname, '../backend')
      : path.join(process.resourcesPath, 'backend'),
    shell: true,
    stdio: 'inherit',
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1100,
    minHeight: 700,
    icon: path.join(__dirname, '../assets/loja.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    await waitOn({
      resources: ['http://localhost:3333/produtos'],
      timeout: 15000,
    });

    mainWindow.loadURL('http://localhost:5173');
  } else {
    await waitOn({
      resources: ['http://localhost:3333/produtos'],
      timeout: 15000,
    });

    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  startBackend();

  setTimeout(() => {
    createWindow();
  }, 1000);
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});