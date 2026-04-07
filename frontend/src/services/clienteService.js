const API_URL = 'http://localhost:8080/api/clientes';

// Função auxiliar para lidar com as respostas
const handleResponse = async (res) => {
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || 'Ocorreu um erro na comunicação com o servidor.');
  }
  // Se for status 204 (No Content - Exclusão), não tenta fazer o parse do JSON
  if (res.status === 204) return true; 
  return res.json();
};

export const clienteService = {
  getAll: async () => {
    const res = await fetch(API_URL);
    return handleResponse(res);
  },
  getById: async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  }
};