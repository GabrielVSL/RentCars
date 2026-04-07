import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clienteService } from '../services/clienteService';
import Modal from '../components/Modal';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.getAll();
      setClientes(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar clientes. A API pode estar offline.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const confirmDelete = (cliente) => {
    setClienteToDelete(cliente);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!clienteToDelete) return;
    try {
      await clienteService.delete(clienteToDelete.id);
      setClientes(clientes.filter(c => c.id !== clienteToDelete.id));
    } catch (err) {
      alert('Erro ao excluir cliente.');
    } finally {
      setModalOpen(false);
      setClienteToDelete(null);
    }
  };

  return (
    <div className="section">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="mb-2">Clientes</h1>
          <p>Gerenciamento de clientes cadastrados.</p>
        </div>
        <Link to="/clientes/novo" className="btn btn-primary">
          + Novo cliente
        </Link>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md mb-6">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-muted">Carregando clientes...</div>
      ) : clientes.length === 0 ? (
        <div className="card text-center py-12 text-muted">
          Nenhum cliente cadastrado. Clique em "Novo cliente" para começar.
        </div>
      ) : (
        <div className="card card-flush">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>CPF</th>
                <th>Profissão</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar">{getInitials(cliente.nome)}</div>
                      {cliente.nome}
                    </div>
                  </td>
                  <td className="text-muted">{cliente.cpf}</td>
                  <td className="text-muted">{cliente.profissao}</td>
                  <td><span className="badge badge-success">Ativo</span></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/clientes/editar/${cliente.id}`)}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(cliente)}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        title="Excluir cliente"
        message={`Tem certeza que deseja excluir ${clienteToDelete?.nome}?`}
        onConfirm={handleDelete}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}