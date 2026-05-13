const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Nao foi possivel comunicar com a API.'
    try {
      const body = await response.json()
      message = body.message || message
    } catch {
      // Keeps the generic message when the backend returns no JSON body.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const api = {
  listProducts: () => request('/produtos'),
  createProduct: (product) => request('/produtos', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id, product) => request(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  updateStock: (id, sizes) => request(`/produtos/${id}/estoque`, { method: 'PATCH', body: JSON.stringify({ sizes }) }),

  listSuppliers: () => request('/fornecedores'),
  createSupplier: (supplier) => request('/fornecedores', { method: 'POST', body: JSON.stringify(supplier) }),
  updateSupplier: (id, supplier) => request(`/fornecedores/${id}`, { method: 'PUT', body: JSON.stringify(supplier) }),

  listClients: () => request('/clientes'),
  createClient: (client) => request('/clientes', { method: 'POST', body: JSON.stringify(client) }),
  updateClient: (id, client) => request(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(client) }),

  listOrders: () => request('/pedidos'),
  finalizeOrder: (order) => request('/pedidos/finalizar', { method: 'POST', body: JSON.stringify(order) }),
  updateOrderStatus: (id, status) =>
    request(`/pedidos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}
