import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isPistasPage = location.pathname === '/pistas';

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#08090C] text-white selection:bg-[#FF1717] selection:text-white ${
        isPistasPage ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : ''
      }`}
    >
      <Header />
      <main className={isPistasPage ? 'h-full w-full overflow-hidden relative' : 'flex-1'}>
        <Outlet />
      </main>
      {!isPistasPage && <Footer />}
    </div>
  );
}
