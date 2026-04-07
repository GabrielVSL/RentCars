import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import ClienteForm from './pages/ClienteForm';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/novo" element={<ClienteForm />} />
        <Route path="clientes/editar/:id" element={<ClienteForm />} />
      </Route>
    </Routes>
  );
}

export default App;