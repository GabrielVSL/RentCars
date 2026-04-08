export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">RentCars</h3>
            <p className="text-sm leading-relaxed">
              A melhor plataforma para alugar carros no Brasil. Preços transparentes, cancelamento grátis e KM livre.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Para Clientes</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Como funciona</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Perguntas frequentes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de cancelamento</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termos de uso</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Para Empresas</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Parcerias</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Adicione sua frota</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Planos empresariais</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li>Suporte 24h</li>
              <li>contato@rentcars.com.br</li>
              <li>+55 31 99999-9999</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} RentCars. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
