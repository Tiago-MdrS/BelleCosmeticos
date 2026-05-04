import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";

const DB_PATH = path.resolve("belle.db");

const BACKUP_DIR = path.join(
  os.homedir(),
  "Documents",
  "BelleCosmeticos",
  "backups"
);

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function formatDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
}

export function createBackup() {
  ensureBackupDir();

  if (!fs.existsSync(DB_PATH)) {
    throw new Error("Banco de dados belle.db não encontrado.");
  }

  const backupName = `belle-backup-${formatDate()}.db`;
  const backupPath = path.join(BACKUP_DIR, backupName);

  fs.copyFileSync(DB_PATH, backupPath);

  return {
    name: backupName,
    path: backupPath,
    createdAt: new Date().toISOString()
  };
}

export function listBackups() {
  ensureBackupDir();

  return fs
    .readdirSync(BACKUP_DIR)
    .filter((file) => file.endsWith(".db"))
    .map((file) => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);

      return {
        name: file,
        path: filePath,
        size: stats.size,
        createdAt: stats.birthtime
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function restoreBackup(fileName) {
  ensureBackupDir();

  const backupPath = path.join(BACKUP_DIR, fileName);

  if (!fs.existsSync(backupPath)) {
    throw new Error("Backup não encontrado.");
  }

  const safetyBackup = createBackup();

  fs.copyFileSync(backupPath, DB_PATH);

  return {
    restored: fileName,
    safetyBackup
  };
}

export function openBackupFolder() {
  ensureBackupDir();

  if (process.platform === "win32") {
    exec(`start "" "${BACKUP_DIR}"`);
  } else if (process.platform === "darwin") {
    exec(`open "${BACKUP_DIR}"`);
  } else {
    exec(`xdg-open "${BACKUP_DIR}"`);
  }

  return BACKUP_DIR;
}

export function startAutoBackup() {
  try {
    createBackup();
    console.log("Backup automático inicial criado.");
  } catch (error) {
    console.log("Backup automático inicial ignorado:", error.message);
  }

  setInterval(() => {
    try {
      createBackup();
      console.log("Backup automático criado.");
    } catch (error) {
      console.error("Erro no backup automático:", error.message);
    }
  }, 1000 * 60 * 60);
}