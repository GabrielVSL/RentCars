import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clienteService } from '../services/clienteService';

export default function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    profissao: '',
    endereco: '',
    rendimentos: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      clienteService.getById(id)
        .then(data => {
          setFormData({
            ...data,
            rendimentos: data.rendimentos || []
          });
        })
        .catch(() => setError('Erro ao buscar dados do cliente.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleMaskCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cpf' ? handleMaskCPF(value) : value
    }));
  };

  const handleAddRendimento = () => {
    if (formData.rendimentos.length >= 3) return;
    setFormData(prev => ({
      ...prev,
      rendimentos: [...prev.rendimentos, { empregadora: '', valor: '' }]
    }));
  };

  const handleRemoveRendimento = (index) => {
    setFormData(prev => ({
      ...prev,
      rendimentos: prev.rendimentos.filter((_, i) => i !== index)
    }));
  };

  const handleRendimentoChange = (index, field, value) => {
    const newRendimentos = [...formData.rendimentos];
    newRendimentos[index][field] = field === 'valor' ? Number(value) || '' : value;
    setFormData(prev => ({ ...prev, rendimentos: newRendimentos }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEditing) {
        await clienteService.update(id, formData);
      } else {
        await clienteService.create(formData);
      }
      navigate('/clientes');
    } catch (err) {
      setError(err.message); 
      setLoading(false);
    }
  };

  if (loading && isEditing) return <div className="py-12 text-center text-muted">Carregando...</div>;

  return (
    <div className="section">
      <h1 className="mb-2">{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h1>
      <p className="mb-8">Preencha as informações abaixo.</p>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <h3 className="mb-5">Dados Pessoais</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Nome completo *</label>
            <input required className="form-input" name="nome" value={formData.nome} onChange={handleChange} placeholder="João da Silva" />
          </div>
          <div className="form-group">
            <label className="form-label">CPF *</label>
            <input required className="form-input" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength="14" />
          </div>
          <div className="form-group">
            <label className="form-label">RG *</label>
            <input required className="form-input" name="rg" value={formData.rg} onChange={handleChange} placeholder="MG-00.000.000" />
          </div>
          <div className="form-group">
            <label className="form-label">Profissão *</label>
            <input required className="form-input" name="profissao" value={formData.profissao} onChange={handleChange} placeholder="Engenheiro de Software" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Endereço *</label>
          <input required className="form-input" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Rua das Flores, 123 — Belo Horizonte, MG" />
        </div>

        <hr className="divider" />

        <div className="flex justify-between items-center mb-4">
          <h3>Rendimentos (máx. 3)</h3>
          {formData.rendimentos.length < 3 && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddRendimento}>
              + Adicionar rendimento
            </button>
          )}
        </div>

        {formData.rendimentos.map((rendimento, index) => (
          <div key={index} className="grid-2 items-end mb-4 bg-neutral-50 p-4 rounded-md">
            <div className="form-group mb-0">
              <label className="form-label">Empregadora</label>
              <input required className="form-input" value={rendimento.empregadora} onChange={(e) => handleRendimentoChange(index, 'empregadora', e.target.value)} placeholder="Empresa S.A." />
            </div>
            <div className="flex items-center gap-3">
              <div className="form-group mb-0 flex-1">
                <label className="form-label">Rendimento (R$)</label>
                <input required type="number" step="0.01" className="form-input" value={rendimento.valor} onChange={(e) => handleRendimentoChange(index, 'valor', e.target.value)} placeholder="5000.00" />
              </div>
              <button type="button" className="btn btn-danger btn-sm mb-[2px]" onClick={() => handleRemoveRendimento(index)}>
                Remover
              </button>
            </div>
          </div>
        ))}
        {formData.rendimentos.length === 0 && (
          <p className="text-muted text-sm mb-6">Nenhum rendimento adicionado.</p>
        )}

        <div className="flex justify-end gap-2 mt-8">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/clientes')} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}