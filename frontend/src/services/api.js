const API_URL = 'http://localhost:3333';

async function handleResponse(response) {
  const text = await response.text();

  try {
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(data?.erro || data?.error || 'Erro na requisição');
    }

    return data;
  } catch {
    throw new Error(text || 'Resposta inválida do servidor');
  }
}

export async function getProducts() {
  const response = await fetch(`${API_URL}/produtos`);
  return handleResponse(response);
}

export async function createProduct(product) {
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