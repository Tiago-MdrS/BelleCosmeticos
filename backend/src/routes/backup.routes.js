import express from "express";
import {
  createBackup,
  listBackups,
  restoreBackup,
  openBackupFolder
} from "../utils/backup.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const backups = listBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.post("/criar", (req, res) => {
  try {
    const backup = createBackup();

    res.json({
      mensagem: "Backup criado com sucesso!",
      backup
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.post("/restaurar", (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ erro: "Nome do backup é obrigatório." });
    }

    const result = restoreBackup(fileName);

    res.json({
      mensagem: "Backup restaurado com sucesso! Reinicie o sistema.",
      result
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.post("/abrir-pasta", (req, res) => {
  try {
    const folder = openBackupFolder();

    res.json({
      mensagem: "Pasta de backups aberta.",
      folder
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

export default router;