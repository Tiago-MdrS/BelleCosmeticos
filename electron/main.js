const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let backendProcess;

function startBackend() {
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, "backend", "src", "server.js")
    : path.join(__dirname, "..", "backend", "src", "server.js");

  backendProcess = spawn("node", [backendPath], {
    cwd: path.dirname(backendPath),
    shell: true,
    stdio: "ignore"
  });

  backendProcess.on("error", (err) => {
    console.error("Erro ao iniciar backend:", err);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
  } else {
    win.loadURL("http://localhost:5173");
  }
}

app.whenReady().then(() => {
  startBackend();

  setTimeout(() => {
    createWindow();
  }, 1500);
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});