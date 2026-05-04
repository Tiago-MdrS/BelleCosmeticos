const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

let mainWindow;
let backendProcess;

const BACKEND_PORT = 3333;

function getBackendPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend", "src", "server.js");
  }

  return path.join(__dirname, "..", "backend", "src", "server.js");
}

function startBackend() {
  const backendPath = getBackendPath();

  backendProcess = spawn(process.execPath, [backendPath], {
    cwd: app.getPath("userData"),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: app.isPackaged ? "production" : "development",
      PORT: String(BACKEND_PORT),
      BELLE_DB_PATH: path.join(app.getPath("userData"), "belle.db"),
    },
    stdio: "ignore",
    windowsHide: true,
  });

  backendProcess.on("error", (error) => {
    console.error("Erro ao iniciar backend:", error);
  });
}

function waitForBackend(retries = 40) {
  return new Promise((resolve) => {
    const check = () => {
      const req = http.get(`http://localhost:${BACKEND_PORT}`, (res) => {
        res.resume();
        resolve(true);
      });

      req.on("error", () => {
        if (retries <= 0) {
          resolve(false);
          return;
        }

        retries--;
        setTimeout(check, 300);
      });

      req.setTimeout(1000, () => {
        req.destroy();
      });
    };

    check();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (app.isPackaged) {
    mainWindow.loadFile(
      path.join(__dirname, "..", "frontend", "dist", "index.html")
    );
  } else {
    mainWindow.loadURL("http://localhost:5173");
  }
}

app.whenReady().then(async () => {
  startBackend();

  const backendOk = await waitForBackend();

  if (!backendOk) {
    console.error("Backend não iniciou corretamente.");
  }

  await createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});