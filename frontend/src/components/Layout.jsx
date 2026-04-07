import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen font-body text-neutral-900" style={{ background: 'var(--background)' }}>
      <Sidebar />
      <main className="flex-1 p-12 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}