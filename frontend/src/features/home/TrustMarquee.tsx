import { motion } from 'framer-motion';

const brandLogos = [
  "/logos/vw.webp",
  "/logos/fiat.svg",
  "/logos/chevrolet.webp",
  "/logos/byd.svg",
  "/logos/bmw.svg",
  "/logos/audi.svg",
  "/logos/jeep.svg",
  "/logos/toyota.svg",
  "/logos/honda.svg",
  "/logos/lexus.svg",
  "/logos/renault.svg",
  "/logos/tesla.svg"
];

export function TrustMarquee() {
  return (
    <div className="relative py-12 bg-white overflow-hidden flex items-center border-y border-gray-100">
      
      {/* Gradientes laterais para suavizar a entrada/saída */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex whitespace-nowrap gap-16 md:gap-24 items-center"
        initial={{ x: 0 }}
        animate={{ x: "-50%" }} // Estratégia sênior: move exatamente metade do conteúdo duplicado
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 25,
          ease: "linear",
        }}
      >
        {/* Duplicamos o array para um loop infinito sem saltos */}
        {[...brandLogos, ...brandLogos].map((src, i) => (
          <div key={i} className="flex-shrink-0 flex items-center justify-center w-32 md:w-40 h-16">
            <img 
              src={src} 
              alt="Logo Marca"
              className="max-h-full max-w-full object-contain"
              // Se a imagem falhar por algum motivo, esse log aparecerá no console (F12)
              onError={(e) => console.error(`Falha ao carregar: ${src}`)}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}