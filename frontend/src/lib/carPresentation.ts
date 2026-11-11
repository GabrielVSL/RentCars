import type { Automovel } from '@/features/cars/components/BookingModal';

export type BlueprintArchitecture = 'rear-engine' | 'mid-engine' | 'front-gt';

export interface CarSpecEntry {
  label: string;
  value: string;
}

export interface CarDetailSheet {
  blueprint: BlueprintArchitecture;
  heroTitleTop: string;
  heroTitleSub: string;
  designTitle: string;
  designDescription: string;
  leftSpecs: CarSpecEntry[];
  rightSpecs: CarSpecEntry[];
  extraSpecs: CarSpecEntry[];
}

interface CarProfileConfig {
  match: string[];
  studio: string;
  side?: string;
  editorial?: string;
  circuit: string;
  power: string;
  accel: string;
  topSpeed: string;
  category: string;
  detail: CarDetailSheet;
}

const CAR_PROFILES: CarProfileConfig[] = [
  {
    match: ['cayman', 'gt4'],
    studio: '/cars/cayman-studio.webp',
    circuit: 'Mônaco',
    power: '500 CV',
    accel: '3.4s',
    topSpeed: '315 km/h',
    category: 'GT4',
    detail: {
      blueprint: 'mid-engine',
      heroTitleTop: 'PORSCHE',
      heroTitleSub: '718 GT4 RS',
      designTitle: 'Equilíbrio Central',
      designDescription:
        'Motor central-traseiro boxer aspirado a 9.000 rpm combinado ao pacote Weissach em fibra de carbono. Projetado para precisão cirúrgica em curvas de baixa e média velocidade como as ruas de Mônaco.',
      leftSpecs: [
        { label: 'Motorização', value: '6 cil. Boxer 4.0L' },
        { label: 'Combustível', value: 'Gasolina 102 oct' },
        { label: 'Transmissão', value: 'PDK 7 marchas' },
        { label: 'Tração', value: 'Traseira (RWD)' },
        { label: 'Peso em ordem', value: '1.415 kg' },
      ],
      rightSpecs: [
        { label: 'Potência (kW)', value: '368 kW' },
        { label: 'Potência (CV)', value: '500 CV' },
        { label: 'Regime máximo', value: '9.000 rpm' },
        { label: 'Torque máximo', value: '450 Nm' },
        { label: 'Freios', value: 'PCCB Carbono' },
      ],
      extraSpecs: [
        { label: 'Aerodinâmica', value: 'Asa fixa Swan-Neck Weissach' },
        { label: 'Pneus homologados', value: 'Michelin Pilot Sport Cup 2 R' },
        { label: 'Telemetria', value: 'VBOX Dual HD + Lap Timing' },
        { label: 'Segurança', value: 'Gaiola Clubsport FIA + Cinto 6 pontos' },
      ],
    },
  },
  {
    match: ['porsche', 'gt3'],
    studio: '/cars/porsche-studio.webp',
    side: '/cars/porsche-side.webp',
    editorial: '/banner-gt3.jpg',
    circuit: 'Nürburgring',
    power: '525 CV',
    accel: '3.2s',
    topSpeed: '296 km/h',
    category: 'GT3',
    detail: {
      blueprint: 'rear-engine',
      heroTitleTop: 'PORSCHE',
      heroTitleSub: '911 GT3 RS',
      designTitle: 'Engenharia Aerodinâmica',
      designDescription:
        'Com até 860 kg de downforce ativo a 285 km/h e sistema DRS derivado da pista, o 911 GT3 RS (992) transforma cada curva de alta velocidade do Nordschleife em pura aderência mecânica.',
      leftSpecs: [
        { label: 'Motorização', value: '6 cil. Boxer 4.0L' },
        { label: 'Combustível', value: 'Gasolina 102 oct' },
        { label: 'Transmissão', value: 'PDK 7 marchas' },
        { label: 'Tração', value: 'Traseira (RWD)' },
        { label: 'Peso em ordem', value: '1.450 kg' },
      ],
      rightSpecs: [
        { label: 'Potência (kW)', value: '386 kW' },
        { label: 'Potência (CV)', value: '525 CV' },
        { label: 'Regime máximo', value: '9.000 rpm' },
        { label: 'Torque máximo', value: '465 Nm' },
        { label: 'Freios', value: 'PCCB 410 mm' },
      ],
      extraSpecs: [
        { label: 'Aerodinâmica', value: 'Asa DRS ativa + difusor dianteiro' },
        { label: 'Pneus homologados', value: 'Michelin Pilot Sport Cup 2 R' },
        { label: 'Telemetria', value: 'Porsche Track Precision + VBOX' },
        { label: 'Segurança', value: 'Rollcage carbono + extintor FIA' },
      ],
    },
  },
  {
    match: ['m8'],
    studio: '/cars/m8-studio.webp',
    circuit: 'Le Mans',
    power: '625 CV',
    accel: '3.2s',
    topSpeed: '305 km/h',
    category: 'GT3',
    detail: {
      blueprint: 'front-gt',
      heroTitleTop: 'BMW M',
      heroTitleSub: 'M8 COMPETITION',
      designTitle: 'Força em Alta Velocidade',
      designDescription:
        'Um V8 biturbo de 4,4 litros acoplado à tração integral M xDrive com modo traseiro puro. Estabilidade absoluta nas retas longas de Le Mans aliada a frenagens consistentes volta após volta.',
      leftSpecs: [
        { label: 'Motorização', value: 'V8 4.4L TwinPower' },
        { label: 'Combustível', value: 'Gasolina Podium' },
        { label: 'Transmissão', value: 'M Steptronic 8v' },
        { label: 'Tração', value: 'M xDrive / 2WD' },
        { label: 'Peso em ordem', value: '1.885 kg' },
      ],
      rightSpecs: [
        { label: 'Potência (kW)', value: '460 kW' },
        { label: 'Potência (CV)', value: '625 CV' },
        { label: 'Regime máximo', value: '7.200 rpm' },
        { label: 'Torque máximo', value: '750 Nm' },
        { label: 'Freios', value: 'M Carbon Ceramic' },
      ],
      extraSpecs: [
        { label: 'Chassi', value: 'Teto em CFRP + barra estabilizadora M' },
        { label: 'Pneus homologados', value: 'Michelin Pilot Sport 4S Track' },
        { label: 'Telemetria', value: 'M Laptimer + VBOX HD' },
        { label: 'Diferencial', value: 'Diferencial ativo M traseiro' },
      ],
    },
  },
  {
    match: ['bmw', 'm4'],
    studio: '/cars/bmw-studio.webp',
    side: '/cars/bmw-side.webp',
    circuit: 'Spa-Francorchamps',
    power: '510 CV',
    accel: '3.5s',
    topSpeed: '290 km/h',
    category: 'GT4',
    detail: {
      blueprint: 'front-gt',
      heroTitleTop: 'BMW M',
      heroTitleSub: 'M4 TRACK PACK',
      designTitle: 'Precisão de Chassi',
      designDescription:
        'Seis cilindros em linha biturbo com resposta imediata e acerto de suspensão calibrado para as transições rápidas de Eau Rouge e Blanchimont em Spa-Francorchamps.',
      leftSpecs: [
        { label: 'Motorização', value: '6 cil. 3.0L Biturbo' },
        { label: 'Combustível', value: 'Gasolina Podium' },
        { label: 'Transmissão', value: 'M Steptronic 8v' },
        { label: 'Tração', value: 'Traseira (RWD)' },
        { label: 'Peso em ordem', value: '1.725 kg' },
      ],
      rightSpecs: [
        { label: 'Potência (kW)', value: '375 kW' },
        { label: 'Potência (CV)', value: '510 CV' },
        { label: 'Regime máximo', value: '7.200 rpm' },
        { label: 'Torque máximo', value: '650 Nm' },
        { label: 'Freios', value: 'M Compound / Carbon' },
      ],
      extraSpecs: [
        { label: 'Chassi', value: 'Teto CFRP + reforço dianteiro em alumínio' },
        { label: 'Pneus homologados', value: 'Michelin Pilot Sport Cup 2' },
        { label: 'Telemetria', value: 'M Drive Professional + Drift Analyzer' },
        { label: 'Refrigeração', value: 'Pacote Track Cooling estendido' },
      ],
    },
  },
  {
    match: ['black series', 'gtbs'],
    studio: '/cars/amg-bs-studio.webp',
    circuit: 'Silverstone',
    power: '730 CV',
    accel: '3.2s',
    topSpeed: '325 km/h',
    category: 'GT2',
    detail: {
      blueprint: 'front-gt',
      heroTitleTop: 'MERCEDES-AMG',
      heroTitleSub: 'GT BLACK SERIES',
      designTitle: 'Aerodinâmica GT3 de Rua',
      designDescription:
        'V8 flat-plane biturbo de 730 CV e aerodinâmica ativa de dois estágios vinda diretamente do programa AMG GT3. Domina as sequências de alta velocidade como Maggotts e Becketts em Silverstone.',
      leftSpecs: [
        { label: 'Motorização', value: 'V8 4.0L Flat-Plane' },
        { label: 'Combustível', value: 'Gasolina 102 oct' },
        { label: 'Transmissão', value: 'AMG Speedshift 7v' },
        { label: 'Tração', value: 'Transaxle Traseira' },
        { label: 'Peso em ordem', value: '1.540 kg' },
      ],
      rightSpecs: [
        { label: 'Potência (kW)', value: '537 kW' },
        { label: 'Potência (CV)', value: '730 CV' },
        { label: 'Regime máximo', value: '7.200 rpm' },
        { label: 'Torque máximo', value: '800 Nm' },
        { label: 'Freios', value: 'Cerâmica Motorsport' },
      ],
      extraSpecs: [
        { label: 'Aerodinâmica', value: 'Asa dupla em carbono com flap móvel' },
        { label: 'Pneus homologados', value: 'Michelin Pilot Sport Cup 2 R MO' },
        { label: 'Controle de tração', value: 'AMG 9-stage Traction Control' },
        { label: 'Suspensão', value: 'Coilover ajustável manualmente' },
      ],
    },
  },
  {
    match: ['mercedes', 'amg'],
    studio: '/cars/amg-studio.webp',
    side: '/cars/amg-side.webp',
    circuit: 'Monza',
    power: '734 CV',
    accel: '2.8s',
    topSpeed: '315 km/h',
    category: 'GT2',
    detail: {
      blueprint: 'front-gt',
      heroTitleTop: 'MERCEDES-AMG',
      heroTitleSub: 'GT TRACK SERIES',
      designTitle: 'Brutalidade em Linha Reta',
      designDescription:
        'Edição limitada exclusiva para autódromos com câmbio sequencial de 6 marchas, cárter seco e V8 biturbo de 734 CV ajustado para extrair máxima velocidade nas retas de Monza.',
      leftSpecs: [
        { label: 'Motorização', value: 'V8 4.0L Biturbo' },
        { label: 'Combustível', value: 'Gasolina 102 oct' },
        { label: 'Transmissão', value: 'Hewland Seq. 6v' },
        { label: 'Tração', value: 'Traseira (RWD)' },
        { label: 'Peso em ordem', value: '1.400 kg' },
      ],
      rightSpecs: [
        { label: 'Potência (kW)', value: '540 kW' },
        { label: 'Potência (CV)', value: '734 CV' },
        { label: 'Regime máximo', value: '7.400 rpm' },
        { label: 'Torque máximo', value: '850 Nm' },
        { label: 'Freios', value: 'ABS Motorsport 12 níveis' },
      ],
      extraSpecs: [
        { label: 'Chassi', value: 'Célula de sobrevivência em carbono FIA' },
        { label: 'Pneus homologados', value: 'Slick Pirelli P Zero DHF' },
        { label: 'Telemetria', value: 'Bosch Motorsport DDU + VBOX' },
        { label: 'Amortecedores', value: 'Bilstein 4 vias reguláveis' },
      ],
    },
  },
  {
    match: ['e-tron', 'etron'],
    studio: '/cars/etrongt-studio.webp',
    circuit: 'Suzuka',
    power: '925 CV',
    accel: '2.5s',
    topSpeed: '250 km/h',
    category: 'ELECTRIC',
    detail: {
      blueprint: 'front-gt',
      heroTitleTop: 'AUDI SPORT',
      heroTitleSub: 'RS E-TRON GT',
      designTitle: 'Torque Instantâneo',
      designDescription:
        'Dois motores elétricos síncronos com arquitetura 800V e vetorização ativa de torque por roda. Entrega 925 CV com Push-to-Pass imediato para retomar velocidade nos esses de Suzuka.',
      leftSpecs: [
        { label: 'Propulsão', value: 'Dual Motor Elétrico' },
        { label: 'Arquitetura', value: '800V High-Power' },
        { label: 'Transmissão', value: '2 marchas traseira' },
        { label: 'Tração', value: 'e-quattro AWD' },
        { label: 'Bateria útil', value: '97 kWh líquida' },
      ],
      rightSpecs: [
        { label: 'Potência (kW)', value: '680 kW' },
        { label: 'Potência (CV)', value: '925 CV' },
        { label: 'Boost Push-to-Pass', value: '+95 CV por 10s' },
        { label: 'Torque máximo', value: '1.020 Nm' },
        { label: 'Freios', value: 'Cerâmica 420 mm' },
      ],
      extraSpecs: [
        { label: 'Suspensão', value: 'Ativa hidráulica anti-rolagem' },
        { label: 'Pneus homologados', value: 'Bridgestone Potenza Sport EV' },
        { label: 'Recarga rápida', value: '320 kW DC (10–80% em 18 min)' },
        { label: 'Esterçamento', value: 'Eixo traseiro direcional ativo' },
      ],
    },
  },
  {
    match: ['audi', 'r8'],
    studio: '/cars/audi-studio.webp',
    circuit: 'Interlagos',
    power: '620 CV',
    accel: '3.1s',
    topSpeed: '331 km/h',
    category: 'GT3',
    detail: {
      blueprint: 'mid-engine',
      heroTitleTop: 'AUDI SPORT',
      heroTitleSub: 'R8 V10',
      designTitle: 'V10 Atmosférico Puro',
      designDescription:
        'Dez cilindros em V naturalmente aspirados girando até 8.700 rpm atrás do cockpit. Tração quattro e equilíbrio neutro feitos sob medida para a subida dos boxes em Interlagos.',
      leftSpecs: [
        { label: 'Motorização', value: 'V10 5.2L FSI Aspirado' },
        { label: 'Combustível', value: 'Gasolina Podium' },
        { label: 'Transmissão', value: 'S tronic 7 marchas' },
        { label: 'Tração', value: 'quattro AWD' },
        { label: 'Peso em ordem', value: '1.595 kg' },
      ],
      rightSpecs: [
        { label: 'Potência (kW)', value: '456 kW' },
        { label: 'Potência (CV)', value: '620 CV' },
        { label: 'Regime máximo', value: '8.700 rpm' },
        { label: 'Torque máximo', value: '580 Nm' },
        { label: 'Freios', value: 'Cerâmica ventilada' },
      ],
      extraSpecs: [
        { label: 'Chassi', value: 'Audi Space Frame alumínio e carbono' },
        { label: 'Pneus homologados', value: 'Michelin Pilot Sport Cup 2' },
        { label: 'Telemetria', value: 'Audi Virtual Cockpit Track + VBOX' },
        { label: 'Direção', value: 'Dinâmica com relação variável' },
      ],
    },
  },
];

const CIRCUIT_SHORT_NAMES: Record<string, string> = {
  nurburgring: 'Nürburgring',
  spa: 'Spa-Francorchamps',
  monza: 'Monza',
  monaco: 'Mônaco',
  le_mans: 'Le Mans',
  silverstone: 'Silverstone',
  interlagos: 'Interlagos',
  suzuka: 'Suzuka',
};

function findCarProfile(car: Pick<Automovel, 'marca' | 'modelo'>): CarProfileConfig {
  const haystack = `${car.marca} ${car.modelo}`.toLowerCase();
  return (
    CAR_PROFILES.find((entry) => entry.match.some((kw) => haystack.includes(kw))) ??
    CAR_PROFILES[1]
  );
}

export function resolveStudioCarImage(car: Pick<Automovel, 'marca' | 'modelo' | 'imageUrl'>): string {
  const url = car.imageUrl || '';
  const isLegacyLocal =
    !url ||
    url === '/cars/porsche.jpg' ||
    url === '/cars/bmw.jpg' ||
    url === '/cars/amg.jpg' ||
    url === '/cars/audi.jpg';

  if (isLegacyLocal) {
    return findCarProfile(car).studio;
  }

  return url;
}

export function resolveSideCarImage(car: Pick<Automovel, 'marca' | 'modelo'>): string | null {
  return findCarProfile(car).side ?? null;
}

export function resolveEditorialCarImage(
  car: Pick<Automovel, 'marca' | 'modelo' | 'imageUrl'>
): { src: string; isDedicatedRear: boolean } {
  const profile = findCarProfile(car);
  if (profile.editorial) {
    return { src: profile.editorial, isDedicatedRear: true };
  }
  return { src: resolveStudioCarImage(car), isDedicatedRear: false };
}

export function getCarDisplaySpecs(car: Automovel) {
  const profile = findCarProfile(car);
  const circuitId = car.circuito?.id;
  const circuitName =
    (circuitId && CIRCUIT_SHORT_NAMES[circuitId]) ||
    car.circuito?.nome ||
    profile.circuit;

  return {
    category: car.categoria || profile.category,
    power: car.potenciaCv ? `${car.potenciaCv} CV` : profile.power,
    accel: car.aceleracao0a100 || profile.accel,
    topSpeed: car.velocidadeMaxima || profile.topSpeed,
    circuit: circuitName,
    circuitId: circuitId || '',
  };
}

export function getCarDetailSheet(car: Automovel): CarDetailSheet {
  const profile = findCarProfile(car);
  const display = getCarDisplaySpecs(car);
  const baseDetail = profile.detail;

  // Se o carro vier com marca/modelo customizados cadastrados pela empresa, adapta cabeçalho
  const isKnownProfile = CAR_PROFILES.some((entry) =>
    entry.match.some((kw) => `${car.marca} ${car.modelo}`.toLowerCase().includes(kw))
  );

  if (isKnownProfile) {
    return baseDetail;
  }

  return {
    blueprint: 'front-gt',
    heroTitleTop: car.marca.toUpperCase(),
    heroTitleSub: car.modelo.toUpperCase(),
    designTitle: 'Preparação de Pista',
    designDescription:
      'Configuração calibrada para sessões cronometradas em circuito fechado, com telemetria embarcada, inspeção pré-stint e cobertura de pista homologada.',
    leftSpecs: [
      { label: 'Categoria', value: display.category },
      { label: 'Ano / Spec', value: `${car.ano}` },
      { label: 'Circuito Base', value: display.circuit },
      { label: 'Matrícula', value: car.matricula },
      { label: 'Placa', value: car.placa },
    ],
    rightSpecs: [
      { label: 'Potência', value: display.power },
      { label: '0–100 km/h', value: display.accel },
      { label: 'Vel. Máxima', value: display.topSpeed },
      { label: 'Status Box', value: 'Homologado' },
      { label: 'Telemetria', value: 'VBOX Dual HD' },
    ],
    extraSpecs: [
      { label: 'Inspeção', value: 'Checklist pré-bateria incluso' },
      { label: 'Pneus', value: 'Alta aderência de pista' },
      { label: 'Acesso', value: 'Pitlane oficial no circuito base' },
      { label: 'Garantia', value: 'Cobertura ApexPay integrada' },
    ],
  };
}
