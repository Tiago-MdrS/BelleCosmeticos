import express from "express";
import cors from "cors";

import produtosRoutes from "./routes/produtos.routes.js";
import vendasRoutes from "./routes/vendas.routes.js";
import estoqueRoutes from "./routes/estoque.routes.js";
import backupRoutes from "./routes/backup.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "Backend Belle Cosméticos rodando!" });
});

app.use("/produtos", produtosRoutes);
app.use("/vendas", vendasRoutes);
app.use("/estoque", estoqueRoutes);
app.use("/backup", backupRoutes);
const PORT = process.env.PORT || 3333;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});