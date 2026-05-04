const API_URL = 'http://localhost:3333';

async function handleResponse(response) {
  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    console.error('Erro ao parsear JSON:', text);
    throw new Error('Resposta inválida do servidor');
  }

  if (!response.ok) {
    console.error('Erro da API:', data);
    throw new Error(data?.erro || data?.error || 'Erro na requisição');
  }

  return data;
}

// ==================== PRODUTOS ====================

export async function getProducts() {
  const response = await fetch(`${API_URL}/produtos`);
  return handleResponse(response);
}

export async function createProduct(product) {
  console.log('ENVIANDO PRODUTO:', product);

  const response = await fetch(`${API_URL}/produtos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  return handleResponse(response);
}

export async function editProduct(id, product) {
  const response = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  return handleResponse(response);
}

export async function removeProduct(id) {
  const response = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'DELETE',
  });

  return handleResponse(response);
}

// ==================== VENDAS ====================

export async function getSales() {
  const response = await fetch(`${API_URL}/vendas`);
  return handleResponse(response);
}

export async function createSale(sale) {
  const response = await fetch(`${API_URL}/vendas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sale),
  });

  return handleResponse(response);
}

export async function cancelSale(id, motivo) {
  const response = await fetch(`${API_URL}/vendas/${id}/cancelar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ motivo }),
  });

  return handleResponse(response);
}

// ==================== BACKUP ====================

export async function getBackups() {
  const response = await fetch(`${API_URL}/backup`);
  return handleResponse(response);
}

export async function createBackup() {
  const response = await fetch(`${API_URL}/backup/criar`, {
    method: "POST"
  });

  return handleResponse(response);
}

export async function restoreBackup(fileName) {
  const response = await fetch(`${API_URL}/backup/restaurar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fileName })
  });

  return handleResponse(response);
}

export async function openBackupFolder() {
  const response = await fetch(`${API_URL}/backup/abrir-pasta`, {
    method: "POST"
  });

  return handleResponse(response);
}