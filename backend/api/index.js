import express from 'express';
import produtos from '../routes/produtos.routes.js';
import vendas from '../routes/vendas.routes.js';

const app = express();
app.use(express.json());

app.use('/produtos', produtos);
app.use('/vendas', vendas);

export default app;