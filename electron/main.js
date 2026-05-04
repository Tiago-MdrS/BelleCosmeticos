const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess;

const isDev = !app.isPackaged;

function startBackend() {
  const backendDir = path.join(app.getAppPath(), 'backend');
  const serverPath = path.join(backendDir, 'src', 'server.js');

  backendProcess = spawn(process.execPath, [serverPath], {
    cwd: backendDir,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: '3333'
    },
    stdio: 'pipe',
    windowsHide: true
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[BACKEND] ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[BACKEND ERROR] ${data}`);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    title: 'Belle Cosméticos',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  startBackend();

  setTimeout(() => {
    createWindow();
  }, 1500);
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