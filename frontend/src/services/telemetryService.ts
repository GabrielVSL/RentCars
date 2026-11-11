// Serviço de Telemetria e Circuitos Oficiais com Dados Geográficos 100% Reais da FIA (bacinger/f1-circuits + OSM)
export type CircuitId =
  | 'nurburgring'
  | 'le_mans'
  | 'spa'
  | 'monza'
  | 'monaco'
  | 'silverstone'
  | 'interlagos'
  | 'suzuka';

export type CircuitCategory = 'ALL' | 'F1' | 'ENDURANCE' | 'LEGENDS';

export interface TrackCar {
  id: string;
  brand: string;
  model: string;
  power: string;
  acceleration: string;
  topSpeed: string;
  image: string;
}

export const TRACK_FLEET: Record<string, TrackCar> = {
  porsche: {
    id: 'porsche-gt3rs',
    brand: 'Porsche',
    model: '911 GT3 RS (992)',
    power: '525 CV',
    acceleration: '3.2s',
    topSpeed: '296 KM/H',
    image: '/cars/porsche.jpg',
  },
  bmw: {
    id: 'bmw-m4-comp',
    brand: 'BMW',
    model: 'M4 Competition Track Pack',
    power: '510 CV',
    acceleration: '3.5s',
    topSpeed: '290 KM/H',
    image: '/cars/bmw.jpg',
  },
  amg: {
    id: 'amg-gt-track',
    brand: 'Mercedes-AMG',
    model: 'GT Track Series',
    power: '734 CV',
    acceleration: '2.8s',
    topSpeed: '315 KM/H',
    image: '/cars/amg.jpg',
  },
  audi: {
    id: 'audi-r8-v10',
    brand: 'Audi',
    model: 'R8 V10 Performance',
    power: '620 CV',
    acceleration: '3.1s',
    topSpeed: '331 KM/H',
    image: '/cars/audi.jpg',
  },
};

export interface Circuit {
  id: CircuitId;
  code: string;
  shortCode: string;
  name: string;
  subname: string;
  location: string;
  region: string;
  country: string;
  flag: string;
  category: 'F1' | 'ENDURANCE' | 'LEGENDS';
  categoryLabel: string;
  lengthKm: string;
  corners: number;
  lapRecord: string;
  recordHolder: string;
  lat: number;
  lon: number;
  carBrand: string;
  carModel: string;
  carNumber: string;
  topSpeed: string;
  acceleration: string;
  power: string;
  trackSvgPath: string;
  svgViewBox: string;
  onboardYoutubeId: string;
  videoThumbnail: string;
  synopsis: string;
  nextDates: string[];
  availableCars: TrackCar[];
  sectors: { name: string; targetTime: string }[];
}

export interface CircuitLiveWeather {
  temperature: number;
  trackTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  gripStatus: 'OPTIMAL (DRY)' | 'DAMP' | 'WET TRACK' | 'COLD TARMAC';
  gripColor: string;
  lastUpdated: string;
}

export const CIRCUITS: Circuit[] = [
  {
    "id": "nurburgring",
    "code": "NBR-GRN",
    "shortCode": "NBR",
    "name": "Nürburgring Nordschleife",
    "subname": "The Green Hell",
    "location": "Nürburg, Eifel",
    "region": "Alemanha Ocidental",
    "country": "Alemanha",
    "flag": "🇩🇪",
    "category": "ENDURANCE",
    "categoryLabel": "ENDURANCE // VLN & 24H",
    "lat": 50.3356,
    "lon": 6.9478,
    "lengthKm": "20.832 km",
    "corners": 73,
    "lapRecord": "6:49.328",
    "recordHolder": "Porsche 911 GT3 RS (J. Bergmeister)",
    "carBrand": "Porsche",
    "carModel": "911 GT3 RS (992)",
    "carNumber": "46",
    "topSpeed": "296 KM/H",
    "acceleration": "3.2s",
    "power": "525 CV",
    "svgViewBox": "0 0 400 240",
    "trackSvgPath": "M 245.3,163.7 L 184.3,190.4 L 169.5,204.1 L 161.8,210.5 L 157.4,211.5 L 151.6,213.2 L 142.0,206.7 L 140.5,206.2 L 135.8,210.9 L 126.4,215.0 L 113.1,211.8 L 101.9,212.2 L 97.3,208.6 L 92.4,205.1 L 81.5,202.1 L 79.9,198.9 L 62.4,189.9 L 49.2,178.2 L 52.3,167.9 L 53.1,157.3 L 48.7,146.2 L 40.8,133.9 L 27.6,127.7 L 25.1,124.9 L 39.4,119.6 L 49.5,114.3 L 65.3,102.0 L 67.8,92.8 L 72.3,89.6 L 70.8,86.6 L 79.7,80.6 L 96.1,68.3 L 97.3,64.4 L 94.4,58.5 L 89.8,58.2 L 81.2,54.5 L 81.3,52.2 L 89.4,49.1 L 93.5,45.7 L 96.8,40.5 L 100.0,38.6 L 105.6,38.6 L 116.2,43.4 L 118.5,45.8 L 121.3,44.3 L 125.3,43.3 L 137.9,42.9 L 146.3,43.7 L 149.4,39.1 L 151.1,35.6 L 164.7,32.3 L 188.6,25.2 L 193.2,25.9 L 193.7,33.5 L 196.6,45.0 L 214.3,52.6 L 240.5,54.0 L 254.5,57.4 L 267.7,62.7 L 276.9,60.9 L 293.0,53.9 L 307.4,52.6 L 307.9,55.6 L 297.3,61.5 L 293.0,64.0 L 294.7,65.4 L 297.3,63.6 L 311.6,58.4 L 319.9,56.9 L 327.5,50.5 L 327.3,46.7 L 333.2,42.3 L 342.0,44.3 L 351.9,48.3 L 357.5,50.4 L 366.4,55.3 L 367.0,58.6 L 363.7,64.8 L 368.4,68.1 L 374.1,69.9 L 374.1,77.5 L 359.8,77.8 L 357.0,80.8 L 350.3,88.8 L 350.8,98.8 L 346.9,102.5 L 334.3,107.8 L 325.8,116.8 L 317.5,120.4 L 300.5,124.0 L 292.0,123.3 L 285.6,120.7 L 275.4,125.3 L 275.9,127.3 L 291.5,132.7 L 296.3,139.0 L 294.6,143.3 L 245.3,163.7 Z",
    "onboardYoutubeId": "_6Dz8RdjCFw",
    videoThumbnail: '/circuits/nurburgring-video.jpg',
    synopsis: "Conhecido mundialmente como o 'Inferno Verde', Nürburgring Nordschleife é a meca absoluta do automobilismo. São mais de 20 km de asfalto encravados nas montanhas alemãs de Eifel. Ao reservar sua sessão, você recebe suporte de box privativo, seguro de pista internacional e o carro calibrado para voltas rápidas inesquecíveis.",
    nextDates: ['15 Nov · Sáb', '22 Nov · Dom', '06 Dez · Sáb'],
    availableCars: [TRACK_FLEET.porsche, TRACK_FLEET.bmw, TRACK_FLEET.amg],
    "sectors": [
      {
        "name": "Sector 1 (Hatzenbach / Flugplatz)",
        "targetTime": "1:42.100"
      },
      {
        "name": "Sector 2 (Karussell / Wippermann)",
        "targetTime": "2:15.320"
      },
      {
        "name": "Sector 3 (Döttinger Höhe Straight)",
        "targetTime": "2:51.908"
      }
    ]
  },
  {
    "id": "le_mans",
    "code": "LM24-SAR",
    "shortCode": "LM24",
    "name": "Circuit de la Sarthe",
    "subname": "24 Heures du Mans",
    "location": "Le Mans",
    "region": "Pays de la Loire",
    "country": "França",
    "flag": "🇫🇷",
    "category": "ENDURANCE",
    "categoryLabel": "24H LE MANS // FIA WEC",
    "lat": 47.9547,
    "lon": 0.2078,
    "lengthKm": "13.626 km",
    "corners": 38,
    "lapRecord": "3:14.791",
    "recordHolder": "Toyota TS050 Hybrid (Kamui Kobayashi)",
    "carBrand": "Porsche",
    "carModel": "963 LMDh Hypercar",
    "carNumber": "05",
    "topSpeed": "343 KM/H",
    "acceleration": "2.4s",
    "power": "680 CV",
    "svgViewBox": "0 0 1424 983",
    "trackSvgPath": "m 63.119622,954.63891 c -16.381656,2.86118 -32.658217,6.32181 -49.021838,9.29172 -13.64756997,2.47696 -27.280604,5.20441 -41.011734,7.04889 -7.73595,1.03916 -15.584272,1.32326 -23.389505,1.60202 -7.146962,0.25525 -14.34431,0.46327 -21.46708,0 -6.013801,-0.39114 -12.036555,-1.3489 -17.942633,-2.56323 -5.52167,-1.1353 -11.398962,-1.98827 -16.340612,-4.48566 -4.99088,-2.52227 -9.34078,-6.64424 -13.45698,-10.57334 -7.63195,-7.28505 -14.22928,-15.79083 -21.78748,-23.0691 -1.09271,-1.05224 -2.74792,-2.16773 -4.16525,-1.92242 -4.13634,0.71591 -8.27988,3.85152 -12.49577,4.80606 -1.44459,0.32708 -3.36667,0.0507 -4.48566,-0.96121 -11.16317,-10.09538 -21.25458,-21.95974 -32.36082,-32.36082 -2.35073,-2.20148 -5.1513,-3.96818 -8.0101,-5.44687 -6.43292,-3.32737 -13.72513,-5.23672 -19.86506,-8.97132 -4.2198,-2.56668 -8.0435,-6.16364 -11.21415,-9.93253 -2.48982,-2.9596 -4.58864,-6.54457 -5.76727,-10.25293 -3.20023,-10.06902 -3.82775,-21.22446 -7.3693,-31.07921 -1.37131,-3.81583 -4.39916,-7.29992 -7.36929,-9.93253 -1.72913,-1.53264 -4.40224,-2.11778 -6.72849,-2.56323 -2.69342,-0.51576 -5.58866,-0.58404 -8.33051,-0.3204 -2.81183,0.27037 -5.52084,1.71037 -8.33051,1.92242 -2.8508,0.21515 -5.9587,0.18334 -8.65091,-0.64081 -2.54105,-0.77787 -4.86814,-2.5396 -7.04889,-4.16525 -3.69333,-2.75321 -7.17349,-5.84565 -10.57334,-8.97132 -3.22184,-2.96201 -6.72084,-5.76221 -9.29172,-9.29172 -10.03168,-13.77231 -19.87405,-28.03053 -28.51597,-42.61376 -1.61102,-2.71859 -2.443,-6.23918 -2.24283,-9.29172 0.22704,-3.46234 1.8569,-7.06413 3.52444,-10.25293 4.42014,-8.45255 9.56827,-16.62018 14.7386,-24.67112 2.30577,-3.59041 4.69511,-7.21262 7.6897,-10.25293 24.98737,-25.36886 50.39768,-50.49642 76.25619,-74.97458 4.15268,-3.93101 8.81582,-7.40108 13.77738,-10.25293 108.56832,-62.4038 217.707586,-124.07031 326.812255,-185.51402 1.648375,-0.9283 3.647235,-1.6993 5.446875,-1.60202 2.15201,0.11633 4.21242,1.73966 6.40808,2.24283 2.93081,0.67164 6.17758,1.79475 8.97132,1.28161 2.43953,-0.44808 4.974,-2.30757 6.72848,-4.16525 1.87677,-1.98717 2.78191,-4.91001 4.16526,-7.3693 1.50029,-2.66718 2.6211,-5.61964 4.48566,-8.0101 2.3007,-2.94961 4.74016,-6.12827 8.0101,-8.0101 131.83381,-75.86958 265.45617,-149.45426 397.30117,-225.24414 2.29755,-1.32073 3.756,-3.86883 5.12647,-6.08768 0.87236,-1.41239 1.3026,-3.15926 1.60202,-4.80606 0.34139,-1.87764 -0.0116,-3.88565 0.32041,-5.76727 0.30876,-1.74962 0.61797,-3.72809 1.60202,-5.12647 1.04518,-1.48526 2.79787,-2.78604 4.48566,-3.52445 1.72986,-0.75681 3.8267,-0.93225 5.76727,-0.96121 5.21513,-0.0778 10.48871,0.83146 15.69981,0.64081 3.54661,-0.12975 7.24916,-0.46089 10.57333,-1.60202 3.83152,-1.3153 7.28678,-3.79985 10.89374,-5.76728 12.84046,-7.00388 25.41352,-14.55511 38.44851,-21.14667 5.76206,-2.91377 11.73564,-5.5728 17.94263,-7.3693 59.47586,-17.21415 119.30112,-33.493457 179.10593,-49.662645 30.65596,-8.28833 61.41921,-16.500285 92.2764,-23.709909 3.42606,-0.80048 7.04938,-0.381162 10.57334,-0.320404 8.86501,0.152845 17.97756,-0.17018 26.59355,0.961213 1.95735,0.257025 4.08533,1.734204 5.12646,3.204041 0.77449,1.093397 0.39643,2.98884 0.32041,4.485659 -3.02122,59.486775 -5.84261,119.045515 -9.61213,178.465125 -0.28893,4.55442 -1.40437,9.0413 -2.56323,13.45697 -11.2301,42.79055 -22.44384,85.64875 -34.60365,128.16167 -1.83117,6.40212 -4.54232,12.55087 -7.3693,18.58344 -21.09653,45.01849 -41.54083,90.8112 -64.40124,134.56976 -2.02431,3.87487 -6.5084,6.04219 -10.25293,8.33051 -9.71245,5.93538 -20.74015,10.20895 -30.11799,16.34061 -1.7295,1.13083 -3.00569,3.46338 -3.20404,5.44687 -0.33566,3.35658 -0.17509,7.52895 1.60202,10.57334 11.25266,19.2771 25.41506,37.39221 37.48729,56.39113 0.95754,1.50695 1.78848,3.57263 1.60202,5.12647 -0.13394,1.11619 -1.40357,2.33389 -2.56324,2.88364 -44.12412,20.91733 -89.12961,40.53236 -133.28813,61.5176 -3.2613,1.54985 -6.11528,3.87489 -8.97132,6.08768 -20.85387,16.15705 -41.35547,32.78923 -62.15841,49.02183 -7.39263,5.76849 -15.14843,11.08223 -22.42829,16.98143 -5.1091,4.14013 -10.10915,8.46887 -14.73859,13.13657 -8.29353,8.36206 -15.6125,17.7322 -24.03032,25.95273 -5.25276,5.12965 -10.92208,10.10749 -16.98142,14.09779 -2.69837,1.77698 -6.10853,2.5366 -9.29172,3.20404 -3.4385,0.72097 -7.06651,1.11368 -10.57334,0.96121 -3.86247,-0.16793 -7.95252,-0.57267 -11.53455,-1.92242 -3.78726,-1.42708 -7.01503,-4.32948 -10.57333,-6.40809 -7.22864,-4.22267 -14.30085,-8.86821 -21.78749,-12.49576 -2.8731,-1.39212 -6.1366,-2.19513 -9.29172,-2.56323 -3.25296,-0.37951 -6.65278,-0.056 -9.93253,0.3204 -3.23513,0.37124 -6.46702,1.04879 -9.61212,1.92243 -8.38945,2.3304 -16.84267,4.70447 -24.99153,7.6897 -2.63808,0.96642 -5.158,2.46426 -7.36929,4.16525 -1.95396,1.50305 -3.73517,3.40962 -5.12647,5.44687 -1.59914,2.3416 -2.50846,5.15517 -3.84485,7.6897 -1.76085,3.33954 -3.39983,6.77424 -5.44687,9.93253 -1.69101,2.60899 -3.43746,5.36565 -5.76728,7.3693 -3.01025,2.58881 -6.77646,4.37467 -10.25293,6.40808 -2.184,1.27743 -4.31032,2.96021 -6.72849,3.52445 -3.98992,0.93098 -8.3298,0.89903 -12.49576,0.96121 -2.98973,0.0446 -6.18609,0.27238 -8.97132,-0.64081 -3.72966,-1.22284 -7.15126,-3.67376 -10.57334,-5.76727 -5.65604,-3.46017 -10.82743,-7.87153 -16.66101,-10.89375 -3.03093,-1.57024 -6.55828,-2.57216 -9.93253,-2.88363 -3.56784,-0.32934 -7.44322,-0.10531 -10.89374,0.96121 -8.29764,2.56472 -16.11441,6.95229 -24.35072,9.93253 -7.99751,2.89383 -16.15354,5.45411 -24.35072,7.6897 -3.55097,0.96845 -7.23105,1.64068 -10.89374,1.92242 -4.66782,0.35906 -9.45153,-0.44553 -14.09778,0 -3.15025,0.30208 -6.44111,0.85272 -9.29172,2.24283 -14.45122,7.0472 -28.30818,15.57132 -42.61376,23.0691 -18.90966,9.91085 -38.4057,18.89334 -57.03194,29.15678 -2.30683,1.27111 -4.40204,3.36309 -5.76728,5.44687 -0.66399,1.01346 0.20138,2.72101 -0.3204,3.84485 -0.86663,1.8666 -2.03319,4.08477 -3.84485,5.12647 -6.73245,3.87116 -15.13055,5.72172 -21.78748,9.61213 -1.56678,0.91565 -2.53657,2.85487 -2.64927,4.77481 -0.0485,0.82635 0.0596,1.58884 -0.0625,2.37573 -0.27584,1.77758 -2.10171,3.39239 -3.69632,3.7432 -14.425599,3.17363 -29.731828,4.4632 -44.536178,7.04889 z",
    "onboardYoutubeId": "AQslKnt4DJE",
    videoThumbnail: '/circuits/le_mans-video.jpg',
    synopsis: "Palco lendário das 24 Horas de Le Mans, este circuito combina o traçado de pista fechada com estradas rurais históricas da França. Sinta a velocidade contínua na reta Mulsanne em sessões exclusivas de track day com mecânicos de apoio dedicados e credencial VIP para o paddock.",
    nextDates: ['18 Nov · Ter', '29 Nov · Sáb', '13 Dez · Dom'],
    availableCars: [TRACK_FLEET.porsche, TRACK_FLEET.audi, TRACK_FLEET.amg],
    "sectors": [
      {
        "name": "Sector 1 (Dunlop / Tertre Rouge)",
        "targetTime": "32.100"
      },
      {
        "name": "Sector 2 (Mulsanne Straight / Chicanes)",
        "targetTime": "1:54.400"
      },
      {
        "name": "Sector 3 (Porsche Curves / Ford Chicane)",
        "targetTime": "48.291"
      }
    ]
  },
  {
    "id": "spa",
    "code": "SPA-EAU",
    "shortCode": "SPA",
    "name": "Circuit de Spa-Francorchamps",
    "subname": "The Rollercoaster of the Ardennes",
    "location": "Stavelot, Liège",
    "region": "Ardenas Belgas",
    "country": "Bélgica",
    "flag": "🇧🇪",
    "category": "F1",
    "categoryLabel": "FÓRMULA 1 // FIA GRADE 1",
    "lat": 50.4372,
    "lon": 5.9714,
    "lengthKm": "7.004 km",
    "corners": 19,
    "lapRecord": "1:41.252",
    "recordHolder": "Mercedes-AMG F1 / Lewis Hamilton",
    "carBrand": "Mercedes-AMG",
    "carModel": "GT Track Series",
    "carNumber": "77",
    "topSpeed": "315 KM/H",
    "acceleration": "3.1s",
    "power": "730 CV",
    "svgViewBox": "0 0 400 240",
    "trackSvgPath": "M 130.6,45.1 L 99.4,26.9 L 99.1,26.1 L 100.4,25.3 L 103.3,25.0 L 106.5,25.3 L 116.8,27.0 L 141.7,31.0 L 153.7,33.5 L 166.2,36.6 L 177.4,39.7 L 186.3,43.0 L 233.9,62.0 L 237.3,63.1 L 243.0,64.3 L 253.3,66.5 L 257.8,68.0 L 261.6,70.0 L 264.0,71.9 L 265.6,73.9 L 267.0,77.8 L 267.8,79.1 L 269.2,80.4 L 271.9,82.0 L 295.4,94.6 L 310.4,102.6 L 314.5,105.6 L 317.2,107.9 L 320.3,111.4 L 339.1,133.4 L 368.0,166.8 L 374.6,174.8 L 375.0,176.1 L 374.3,177.6 L 372.0,178.7 L 368.6,179.7 L 364.4,180.5 L 361.8,181.3 L 360.1,182.2 L 358.7,183.7 L 359.0,185.1 L 364.7,193.8 L 364.6,195.3 L 363.7,196.6 L 360.6,198.1 L 356.9,199.2 L 291.1,214.4 L 287.0,215.0 L 282.8,215.0 L 278.4,214.6 L 274.9,213.7 L 272.3,212.4 L 271.3,211.2 L 271.1,209.8 L 272.3,208.6 L 274.6,207.3 L 278.0,206.4 L 306.7,200.4 L 309.8,199.4 L 311.5,198.3 L 312.2,197.0 L 311.9,195.5 L 300.0,183.8 L 296.3,179.0 L 287.9,164.3 L 283.7,155.8 L 282.8,154.4 L 280.7,152.8 L 278.0,151.6 L 273.8,150.2 L 269.2,149.2 L 264.1,148.5 L 258.8,148.2 L 241.6,147.9 L 235.1,148.1 L 229.1,148.7 L 223.0,149.5 L 218.0,150.7 L 212.2,152.4 L 208.5,154.2 L 204.5,156.8 L 188.2,170.4 L 173.7,182.5 L 170.6,184.4 L 166.9,185.7 L 161.8,186.7 L 156.7,187.2 L 152.0,187.2 L 147.3,186.9 L 143.2,186.3 L 136.5,184.8 L 132.2,184.2 L 126.9,183.9 L 121.6,184.1 L 116.7,184.6 L 112.5,185.6 L 109.9,186.7 L 106.7,188.2 L 80.0,202.2 L 77.4,203.0 L 74.1,203.6 L 70.2,203.9 L 65.8,203.8 L 62.0,203.2 L 44.0,198.8 L 33.4,196.2 L 30.8,195.1 L 28.0,193.7 L 26.4,192.3 L 25.2,190.7 L 25.0,189.1 L 25.8,187.1 L 27.7,185.4 L 30.1,183.2 L 33.7,179.9 L 39.9,176.2 L 46.7,173.0 L 57.1,169.1 L 74.4,163.4 L 84.5,160.8 L 93.2,159.1 L 137.7,151.3 L 144.2,149.9 L 150.3,148.3 L 155.9,146.5 L 160.8,144.6 L 165.3,142.6 L 171.3,138.9 L 176.1,135.3 L 187.2,127.0 L 189.1,125.2 L 190.3,123.3 L 190.5,120.9 L 189.4,118.7 L 182.8,113.1 L 175.7,106.8 L 167.0,99.1 L 164.8,96.2 L 162.7,92.7 L 161.5,89.5 L 160.6,86.8 L 158.1,74.3 L 158.6,73.5 L 160.1,72.9 L 162.4,72.7 L 166.3,72.9 L 170.4,72.9 L 173.1,72.7 L 175.0,72.1 L 175.4,71.3 L 174.3,70.3 L 160.1,62.5 L 130.6,45.1 Z",
    "onboardYoutubeId": "EOyQBtOh2YM",
    videoThumbnail: '/circuits/spa-video.jpg',
    synopsis: "Localizado no coração das densas florestas das Ardenas, Spa é aclamado como a mais espetacular montanha-russa do motorsport mundial. Acelere montanha acima pela mítica Eau Rouge e Raidillon com nossa equipe no pitlane e cobertura securitária completa para o seu supercarro.",
    nextDates: ['16 Nov · Dom', '23 Nov · Dom', '07 Dez · Dom'],
    availableCars: [TRACK_FLEET.porsche, TRACK_FLEET.bmw, TRACK_FLEET.audi],
    "sectors": [
      {
        "name": "Sector 1 (Eau Rouge / Raidillon)",
        "targetTime": "30.120"
      },
      {
        "name": "Sector 2 (Bruxelles / Pouhon)",
        "targetTime": "45.310"
      },
      {
        "name": "Sector 3 (Blanchimont / Bus Stop)",
        "targetTime": "25.822"
      }
    ]
  },
  {
    "id": "monza",
    "code": "MNZ-PAR",
    "shortCode": "MNZ",
    "name": "Autodromo Nazionale Monza",
    "subname": "Temple of Speed",
    "location": "Monza, Milão",
    "region": "Lombardia",
    "country": "Itália",
    "flag": "🇮🇹",
    "category": "F1",
    "categoryLabel": "FÓRMULA 1 // SPEED TEMPLE",
    "lat": 45.6189,
    "lon": 9.2811,
    "lengthKm": "5.793 km",
    "corners": 11,
    "lapRecord": "1:18.887",
    "recordHolder": "Mercedes-AMG F1 (Lewis Hamilton)",
    "carBrand": "Ferrari",
    "carModel": "488 Challenge Evo",
    "carNumber": "16",
    "topSpeed": "335 KM/H",
    "acceleration": "2.8s",
    "power": "670 CV",
    "svgViewBox": "0 0 400 240",
    "trackSvgPath": "M 36.4,145.7 L 46.6,108.1 L 51.2,92.4 L 51.7,91.7 L 53.1,91.3 L 54.9,91.3 L 57.1,91.3 L 59.1,91.4 L 61.0,91.3 L 62.3,91.0 L 63.3,90.6 L 63.6,90.2 L 63.6,89.7 L 56.4,81.1 L 55.4,78.8 L 55.0,76.7 L 55.5,74.4 L 58.2,63.2 L 59.2,61.3 L 60.5,59.6 L 62.4,57.8 L 65.0,55.8 L 68.0,53.9 L 72.3,51.7 L 76.8,49.9 L 82.8,47.9 L 89.4,46.1 L 96.7,44.5 L 104.5,43.0 L 113.3,41.7 L 122.2,40.7 L 131.9,39.8 L 143.0,39.2 L 154.2,38.9 L 198.2,37.7 L 252.1,36.7 L 255.3,36.6 L 256.9,36.3 L 258.3,35.9 L 260.1,33.9 L 260.9,33.4 L 262.2,33.0 L 264.4,32.8 L 271.7,32.3 L 279.6,31.8 L 290.9,30.6 L 341.3,25.3 L 345.6,25.0 L 349.7,25.0 L 353.7,25.2 L 356.5,25.6 L 359.2,26.1 L 361.8,26.7 L 365.0,27.8 L 366.8,28.6 L 368.1,29.7 L 368.7,30.9 L 370.9,38.4 L 375.0,51.3 L 374.9,52.4 L 374.2,53.2 L 373.2,53.8 L 371.5,54.3 L 368.5,54.9 L 335.5,60.5 L 308.7,65.2 L 292.0,68.1 L 284.0,69.6 L 274.9,71.6 L 268.3,73.2 L 262.7,74.7 L 233.5,82.6 L 212.7,88.5 L 168.8,100.7 L 142.4,108.0 L 138.8,109.1 L 137.4,109.9 L 137.2,110.6 L 137.2,111.5 L 138.1,113.4 L 138.3,114.4 L 138.3,116.0 L 138.0,116.8 L 136.9,117.8 L 135.4,119.1 L 132.8,120.3 L 129.4,121.6 L 125.4,122.7 L 122.2,123.4 L 120.5,124.0 L 119.2,124.9 L 118.1,126.4 L 115.4,133.3 L 112.6,140.7 L 90.8,207.0 L 89.9,209.4 L 89.0,210.5 L 87.2,211.6 L 84.7,212.6 L 81.9,213.4 L 78.0,214.2 L 73.6,214.7 L 68.6,215.0 L 64.4,214.9 L 60.4,214.6 L 55.8,214.1 L 51.3,213.4 L 48.0,212.7 L 44.0,211.7 L 39.5,210.2 L 36.4,208.8 L 33.7,207.4 L 31.4,205.6 L 29.2,203.7 L 27.6,201.7 L 26.8,200.0 L 25.9,197.5 L 25.8,194.9 L 25.6,192.5 L 25.3,187.6 L 25.0,183.4 L 25.3,178.8 L 26.9,172.8 L 33.2,153.8 L 36.4,145.7 Z",
    "onboardYoutubeId": "SFN2udiMN_U",
    videoThumbnail: '/circuits/monza-video.jpg',
    synopsis: "O histórico 'Templo da Velocidade' nos arredores de Milão é o autódromo mais rápido da Europa. Ideal para quem deseja explorar o limite de aceleração em retas monumentais e frear forte nas icônicas chicanes de Ascari e Parabolica com suporte técnico de ponta.",
    nextDates: ['17 Nov · Seg', '24 Nov · Seg', '08 Dez · Seg'],
    availableCars: [TRACK_FLEET.amg, TRACK_FLEET.porsche, TRACK_FLEET.audi],
    "sectors": [
      {
        "name": "Sector 1 (Variante del Rettifilo)",
        "targetTime": "26.890"
      },
      {
        "name": "Sector 2 (Curva Grande / Lesmo)",
        "targetTime": "27.410"
      },
      {
        "name": "Sector 3 (Variante Ascari / Parabolica)",
        "targetTime": "24.587"
      }
    ]
  },
  {
    "id": "monaco",
    "code": "MCO-CAS",
    "shortCode": "MCO",
    "name": "Circuit de Monaco",
    "subname": "The Crown Jewel of the Riviera",
    "location": "Monte Carlo",
    "region": "Principado de Mônaco",
    "country": "Mônaco",
    "flag": "🇲🇨",
    "category": "F1",
    "categoryLabel": "FÓRMULA 1 // STREET CIRCUIT",
    "lat": 43.737,
    "lon": 7.4246,
    "lengthKm": "3.337 km",
    "corners": 19,
    "lapRecord": "1:10.166",
    "recordHolder": "Mercedes-AMG F1 (Lewis Hamilton)",
    "carBrand": "BMW",
    "carModel": "M4 Competition Track",
    "carNumber": "99",
    "topSpeed": "290 KM/H",
    "acceleration": "3.5s",
    "power": "510 CV",
    "svgViewBox": "0 0 400 240",
    "trackSvgPath": "M 253.6,62.1 L 252.9,60.2 L 253.9,58.4 L 256.7,56.0 L 259.3,54.3 L 267.4,50.1 L 308.6,27.1 L 311.5,25.5 L 315.7,25.0 L 320.9,25.6 L 324.5,26.8 L 327.1,28.7 L 327.6,30.9 L 327.7,32.7 L 328.2,34.1 L 330.3,35.9 L 332.8,37.2 L 337.4,39.8 L 340.6,42.2 L 341.8,43.6 L 343.4,44.5 L 345.8,44.8 L 348.7,44.4 L 350.9,43.5 L 351.5,42.2 L 350.1,41.1 L 346.5,40.0 L 335.7,34.4 L 334.2,33.1 L 334.1,31.8 L 335.0,30.8 L 336.1,29.8 L 341.2,28.8 L 349.0,28.0 L 353.2,27.3 L 357.6,26.6 L 363.6,25.7 L 370.2,25.5 L 373.7,26.2 L 375.0,28.5 L 373.8,41.4 L 368.9,54.7 L 363.9,63.2 L 358.2,69.2 L 348.6,76.1 L 337.5,81.9 L 321.4,89.1 L 298.4,94.9 L 284.7,97.7 L 258.3,102.7 L 240.6,105.2 L 214.4,107.8 L 197.5,108.9 L 188.5,109.6 L 187.0,110.6 L 186.9,111.6 L 186.4,112.6 L 185.2,113.7 L 181.4,114.2 L 176.1,114.6 L 170.1,113.2 L 166.9,113.1 L 119.7,115.7 L 96.2,117.1 L 74.6,118.5 L 68.7,118.8 L 64.7,119.1 L 61.8,120.3 L 57.3,124.0 L 53.5,127.5 L 50.4,131.1 L 49.1,133.6 L 47.7,138.0 L 47.5,145.5 L 47.7,147.3 L 49.1,148.6 L 51.7,149.9 L 57.7,151.6 L 61.7,153.1 L 63.4,154.7 L 64.1,157.1 L 70.8,173.0 L 72.5,175.8 L 73.1,176.7 L 72.9,177.9 L 71.2,178.9 L 67.4,180.0 L 63.6,180.7 L 62.7,181.8 L 63.5,184.1 L 67.8,189.3 L 71.7,193.2 L 75.7,196.3 L 82.6,200.3 L 91.3,203.9 L 97.6,205.4 L 104.7,206.8 L 108.3,207.4 L 110.1,208.2 L 112.2,210.8 L 111.2,212.1 L 108.0,212.9 L 93.7,214.4 L 85.7,215.0 L 80.5,215.0 L 75.8,214.7 L 72.9,213.8 L 71.1,213.0 L 71.0,211.3 L 70.3,209.8 L 68.9,208.1 L 60.9,204.0 L 55.0,200.1 L 50.4,197.2 L 45.5,191.7 L 34.8,176.4 L 31.8,171.4 L 29.8,166.1 L 27.1,158.4 L 25.0,148.3 L 25.0,141.8 L 25.7,136.8 L 27.0,131.5 L 29.4,127.9 L 32.1,124.7 L 33.4,122.7 L 34.0,120.9 L 33.7,118.2 L 33.6,116.6 L 34.9,115.6 L 38.2,115.0 L 46.4,114.2 L 53.6,114.0 L 63.5,113.5 L 77.3,112.8 L 89.6,111.9 L 120.7,108.2 L 138.1,106.2 L 154.1,105.2 L 165.0,104.8 L 173.5,103.5 L 198.2,98.7 L 209.0,96.9 L 224.9,95.4 L 238.1,94.7 L 250.6,93.8 L 257.7,92.8 L 266.3,90.6 L 273.8,87.4 L 278.0,84.7 L 279.9,81.9 L 279.6,78.9 L 278.3,76.1 L 275.7,73.1 L 272.1,70.2 L 266.5,68.4 L 261.2,66.3 L 258.6,65.4 L 256.2,64.4 L 253.6,62.1 Z",
    "onboardYoutubeId": "-c0pMUQr-Og",
    videoThumbnail: '/circuits/monaco-video.jpg',
    synopsis: "O traçado urbano mais glamoroso e lendário do automobilismo. Pilotar pelas avenidas de Monte Carlo, contornar a curva do Cassino e atravessar o famoso túnel à beira do Mar Mediterrâneo é uma experiência inesquecível com atendimento exclusivo de concierge.",
    nextDates: ['20 Nov · Qui', '28 Nov · Sex', '12 Dez · Sex'],
    availableCars: [TRACK_FLEET.porsche, TRACK_FLEET.amg],
    "sectors": [
      {
        "name": "Sector 1 (Sainte-Dévote / Beau Rivage)",
        "targetTime": "18.910"
      },
      {
        "name": "Sector 2 (Mirabeau / Tunnel / Chicane)",
        "targetTime": "33.520"
      },
      {
        "name": "Sector 3 (Tabac / Piscine / Rascasse)",
        "targetTime": "20.479"
      }
    ]
  },
  {
    "id": "silverstone",
    "code": "SIL-COP",
    "shortCode": "SIL",
    "name": "Silverstone Circuit",
    "subname": "Home of British Motorsport",
    "location": "Silverstone",
    "region": "Northamptonshire",
    "country": "Reino Unido",
    "flag": "🇬🇧",
    "category": "F1",
    "categoryLabel": "FÓRMULA 1 // FIA GRADE 1",
    "lat": 52.0786,
    "lon": -1.0169,
    "lengthKm": "5.891 km",
    "corners": 18,
    "lapRecord": "1:24.303",
    "recordHolder": "Mercedes-AMG F1 (Lewis Hamilton)",
    "carBrand": "Aston Martin",
    "carModel": "Vantage GT3 Special",
    "carNumber": "07",
    "topSpeed": "310 KM/H",
    "acceleration": "3.0s",
    "power": "640 CV",
    "svgViewBox": "0 0 400 240",
    "trackSvgPath": "M 217.8,25.8 L 251.7,24.0 L 257.8,24.2 L 262.4,25.2 L 265.4,26.4 L 269.0,29.0 L 271.3,31.9 L 273.2,35.6 L 275.8,41.9 L 278.4,48.1 L 279.9,54.9 L 280.6,59.1 L 281.5,69.5 L 281.9,78.4 L 282.4,81.9 L 284.6,85.1 L 288.6,89.6 L 290.3,92.2 L 290.3,94.1 L 289.5,96.4 L 283.8,105.7 L 283.4,109.5 L 284.3,112.2 L 286.4,114.5 L 292.0,119.3 L 293.4,121.6 L 293.5,124.2 L 292.5,126.6 L 289.1,129.3 L 284.7,131.2 L 278.6,133.4 L 273.9,135.1 L 270.6,137.1 L 266.8,141.0 L 259.2,149.7 L 217.9,196.5 L 204.3,209.4 L 200.5,212.6 L 197.4,214.3 L 193.8,215.4 L 190.1,216.0 L 186.6,215.8 L 182.8,215.3 L 179.5,214.4 L 176.6,213.0 L 174.2,210.8 L 173.5,209.9 L 169.8,205.0 L 165.7,200.6 L 161.2,196.9 L 158.2,194.7 L 154.8,192.4 L 148.9,188.6 L 135.5,178.9 L 134.2,178.3 L 132.4,178.2 L 130.5,178.7 L 124.9,181.9 L 123.0,182.3 L 121.1,182.1 L 119.5,181.7 L 117.2,180.4 L 114.7,178.9 L 111.7,176.4 L 109.5,173.7 L 108.0,171.0 L 106.6,168.0 L 106.5,166.8 L 106.9,165.5 L 108.0,164.4 L 110.6,161.8 L 151.3,129.2 L 160.4,121.9 L 162.3,120.6 L 165.7,119.2 L 169.6,118.6 L 172.9,118.6 L 177.4,118.8 L 189.9,120.0 L 194.0,120.3 L 198.3,120.4 L 203.2,120.0 L 207.6,119.3 L 211.6,117.9 L 237.5,105.3 L 239.2,104.6 L 241.3,103.9 L 243.4,103.8 L 245.0,104.2 L 246.5,105.0 L 247.4,105.9 L 251.8,115.4 L 253.1,116.8 L 255.0,117.6 L 257.1,117.7 L 259.5,117.0 L 260.9,115.8 L 261.9,114.6 L 263.7,111.5 L 265.2,108.9 L 266.3,106.3 L 266.9,103.7 L 267.3,101.1 L 267.0,98.3 L 266.1,97.1 L 263.8,95.5 L 179.7,48.4 L 177.5,47.5 L 174.3,46.5 L 170.4,46.1 L 166.3,46.4 L 162.2,47.6 L 160.7,48.8 L 159.7,50.4 L 158.0,59.0 L 157.0,60.7 L 155.0,62.1 L 151.9,63.1 L 148.5,63.4 L 144.7,62.8 L 142.1,61.7 L 140.5,60.4 L 139.2,58.9 L 139.0,57.2 L 139.5,55.4 L 141.6,52.6 L 152.4,39.4 L 155.9,36.8 L 159.3,34.7 L 164.1,32.2 L 168.1,30.4 L 173.1,29.2 L 177.5,28.3 L 186.7,27.6 L 217.8,25.8 Z",
    "onboardYoutubeId": "-yRcQa2xDWI",
    videoThumbnail: '/circuits/silverstone-video.jpg',
    synopsis: "O berço histórico da Fórmula 1 e capital do motorsport britânico. Com curvas de altíssima velocidade como Copse, Maggotts e Becketts, Silverstone testa a precisão aerodinâmica do carro. Nossa equipe recepciona você no complexo The Wing com estrutura de box privativo.",
    nextDates: ['19 Nov · Qua', '27 Nov · Qui', '10 Dez · Qua'],
    availableCars: [TRACK_FLEET.bmw, TRACK_FLEET.porsche, TRACK_FLEET.amg],
    "sectors": [
      {
        "name": "Sector 1 (Abbey / Copse)",
        "targetTime": "27.420"
      },
      {
        "name": "Sector 2 (Maggotts / Becketts / Chapel)",
        "targetTime": "34.810"
      },
      {
        "name": "Sector 3 (Stowe / Club / Vale)",
        "targetTime": "22.073"
      }
    ]
  },
  {
    "id": "interlagos",
    "code": "INT-SEN",
    "shortCode": "INT",
    "name": "Autódromo de Interlagos",
    "subname": "José Carlos Pace // Senna S",
    "location": "São Paulo",
    "region": "São Paulo",
    "country": "Brasil",
    "flag": "🇧🇷",
    "category": "F1",
    "categoryLabel": "FÓRMULA 1 // FIA GRADE 1",
    "lat": -23.7036,
    "lon": -46.6997,
    "lengthKm": "4.309 km",
    "corners": 15,
    "lapRecord": "1:07.281",
    "recordHolder": "Mercedes-AMG F1 (Valtteri Bottas)",
    "carBrand": "Porsche",
    "carModel": "911 GT3 Cup (992)",
    "carNumber": "11",
    "topSpeed": "320 KM/H",
    "acceleration": "3.2s",
    "power": "510 CV",
    "svgViewBox": "0 0 400 240",
    "trackSvgPath": "M 146.6,161.8 L 158.4,203.4 L 159.6,207.8 L 160.8,210.3 L 163.7,214.1 L 165.1,215.2 L 167.2,216.0 L 169.2,216.0 L 171.5,215.6 L 172.7,215.0 L 176.3,211.9 L 179.9,208.3 L 181.3,207.3 L 183.1,206.7 L 185.0,206.6 L 187.7,207.4 L 193.4,210.6 L 197.9,212.3 L 201.3,213.1 L 204.3,213.5 L 207.2,213.6 L 211.3,213.2 L 214.5,212.6 L 218.3,211.3 L 222.0,209.3 L 225.6,206.8 L 228.5,203.9 L 230.8,200.9 L 232.5,198.1 L 233.9,195.0 L 239.5,178.1 L 241.9,169.6 L 245.9,155.2 L 250.9,136.9 L 259.5,106.8 L 262.6,95.9 L 264.8,88.3 L 265.8,84.7 L 266.2,82.5 L 266.0,80.4 L 265.4,79.0 L 264.2,77.3 L 261.9,75.9 L 259.3,74.9 L 255.6,74.1 L 244.3,72.1 L 239.9,71.7 L 237.2,71.8 L 233.8,72.3 L 230.7,73.1 L 227.9,74.6 L 225.2,76.1 L 222.6,78.1 L 220.0,80.6 L 216.5,84.7 L 205.1,98.9 L 198.4,107.6 L 192.7,115.0 L 186.4,122.6 L 183.1,126.8 L 180.5,129.9 L 178.8,131.7 L 176.8,132.8 L 174.0,133.7 L 170.9,134.1 L 166.2,134.0 L 163.1,133.5 L 160.7,132.8 L 158.5,131.9 L 154.7,130.0 L 152.8,128.5 L 151.6,127.0 L 150.4,124.8 L 149.5,121.9 L 148.3,117.5 L 147.4,113.5 L 146.1,106.2 L 145.9,103.2 L 146.0,100.1 L 146.7,97.7 L 148.0,96.6 L 148.9,96.1 L 150.0,95.8 L 151.6,95.6 L 153.2,96.0 L 154.9,96.6 L 159.4,99.8 L 161.3,100.8 L 162.7,101.3 L 164.2,101.6 L 165.6,101.7 L 167.2,101.5 L 169.3,100.8 L 171.8,98.9 L 173.2,97.0 L 174.0,94.9 L 174.1,93.1 L 173.8,91.0 L 172.9,89.4 L 171.0,86.8 L 169.2,85.1 L 162.9,79.5 L 159.7,76.2 L 157.5,73.2 L 155.9,69.1 L 154.6,64.1 L 154.1,61.1 L 153.8,58.3 L 154.0,56.1 L 154.9,54.6 L 155.7,53.7 L 157.0,53.3 L 158.1,53.0 L 159.4,53.2 L 161.0,53.8 L 168.7,61.8 L 175.3,68.5 L 176.4,69.3 L 178.9,70.9 L 181.1,71.8 L 183.0,72.3 L 185.3,72.7 L 187.4,72.9 L 189.9,72.9 L 193.8,72.4 L 196.7,71.5 L 199.9,69.9 L 203.0,67.5 L 204.8,65.4 L 206.7,63.0 L 211.8,55.7 L 217.4,47.1 L 223.7,37.7 L 224.1,36.6 L 224.2,35.3 L 223.8,34.0 L 223.1,32.6 L 221.7,31.4 L 218.4,29.8 L 213.6,28.2 L 203.8,24.8 L 201.8,24.3 L 199.4,24.0 L 194.5,24.5 L 190.2,25.2 L 180.7,27.0 L 177.6,28.0 L 171.3,30.4 L 168.3,31.6 L 160.9,35.2 L 158.0,37.1 L 155.5,39.1 L 153.0,41.2 L 150.9,43.5 L 149.1,46.1 L 147.4,49.4 L 146.1,52.9 L 144.0,60.2 L 141.7,69.3 L 140.1,77.8 L 137.5,87.0 L 135.8,93.9 L 134.4,98.6 L 133.9,102.1 L 133.8,106.8 L 134.1,112.4 L 134.7,116.6 L 135.9,121.4 L 137.8,128.4 L 143.6,150.6 L 146.6,161.8 Z",
    "onboardYoutubeId": "WTMxWS3nu0Y",
    videoThumbnail: '/circuits/interlagos-video.jpg',
    synopsis: "Com seu lendário S do Senna e traçado técnico ondulado no sentido anti-horário, Interlagos é um dos circuitos mais reverenciados do automobilismo mundial. Alugue seu supercarro para uma bateria cronometrada com telemetria e suporte mecânico completo.",
    nextDates: ['21 Nov · Sex', '30 Nov · Dom', '14 Dez · Dom'],
    availableCars: [TRACK_FLEET.porsche, TRACK_FLEET.bmw, TRACK_FLEET.audi],
    "sectors": [
      {
        "name": "Sector 1 (S do Senna / Curva do Sol)",
        "targetTime": "18.420"
      },
      {
        "name": "Sector 2 (Descida do Lago / Laranjinha)",
        "targetTime": "34.190"
      },
      {
        "name": "Sector 3 (Bico de Pato / Subida dos Boxes)",
        "targetTime": "14.671"
      }
    ]
  },
  {
    "id": "suzuka",
    "code": "SUZ-130",
    "shortCode": "SUZ",
    "name": "Suzuka International Circuit",
    "subname": "Figure 8 // 130R Master",
    "location": "Suzuka, Mie",
    "region": "Kansai",
    "country": "Japão",
    "flag": "🇯🇵",
    "category": "F1",
    "categoryLabel": "FÓRMULA 1 // FIGURE 8",
    "lat": 34.8431,
    "lon": 136.541,
    "lengthKm": "5.807 km",
    "corners": 18,
    "lapRecord": "1:27.064",
    "recordHolder": "Ferrari F1 (Sebastian Vettel)",
    "carBrand": "Nissan",
    "carModel": "GT-R Nismo Track Pack",
    "carNumber": "23",
    "topSpeed": "318 KM/H",
    "acceleration": "2.7s",
    "power": "600 CV",
    "svgViewBox": "0 0 400 240",
    "trackSvgPath": "M 324.6,125.3 L 346.3,146.7 L 371.7,172.3 L 374.0,175.0 L 375.3,177.8 L 376.0,180.3 L 376.0,182.8 L 375.6,184.7 L 372.6,192.2 L 371.2,194.2 L 369.2,195.7 L 367.4,196.5 L 364.3,197.1 L 361.5,197.0 L 358.4,196.2 L 355.5,194.3 L 352.6,190.7 L 337.6,171.8 L 334.8,169.8 L 332.4,169.2 L 328.7,168.7 L 320.9,168.6 L 317.0,167.7 L 314.3,166.1 L 312.2,164.0 L 311.2,162.0 L 307.7,151.1 L 306.3,148.3 L 303.9,145.9 L 301.2,144.3 L 297.8,143.0 L 294.3,142.5 L 285.3,142.4 L 281.2,141.7 L 278.3,140.6 L 275.4,138.7 L 273.2,136.1 L 271.9,133.5 L 271.3,131.0 L 271.3,128.6 L 271.9,126.5 L 276.3,116.6 L 277.0,114.6 L 277.1,111.9 L 276.6,110.2 L 275.4,107.7 L 273.7,105.5 L 270.4,103.6 L 266.3,101.8 L 261.5,99.8 L 257.3,98.4 L 254.2,97.7 L 249.8,97.1 L 244.7,97.0 L 240.8,97.1 L 237.5,97.8 L 234.8,98.8 L 230.7,100.2 L 226.3,102.2 L 221.3,105.6 L 217.3,109.0 L 200.8,125.5 L 200.0,126.4 L 197.3,126.9 L 173.2,128.7 L 171.6,128.6 L 170.0,127.6 L 169.3,126.1 L 169.0,124.8 L 165.3,112.4 L 160.5,89.1 L 159.5,84.9 L 159.3,82.7 L 159.5,80.5 L 160.1,78.2 L 161.2,75.8 L 162.4,73.4 L 166.3,66.1 L 166.8,64.9 L 166.5,63.9 L 165.7,63.0 L 164.5,62.3 L 163.0,61.9 L 161.6,62.0 L 160.0,62.8 L 158.7,64.4 L 153.0,72.5 L 148.4,78.6 L 145.4,82.2 L 142.9,84.5 L 140.7,86.0 L 137.0,88.4 L 133.2,90.1 L 129.1,91.1 L 122.0,92.0 L 115.3,92.2 L 110.3,91.9 L 104.3,90.8 L 97.7,89.3 L 90.3,87.0 L 85.7,85.3 L 81.6,83.3 L 77.8,80.9 L 73.8,78.0 L 69.7,74.3 L 67.0,71.0 L 64.6,67.4 L 58.5,54.3 L 55.3,48.5 L 53.7,46.2 L 51.4,44.5 L 48.5,43.4 L 45.0,42.9 L 40.9,43.0 L 37.0,43.4 L 33.2,44.1 L 29.5,45.4 L 26.5,47.2 L 24.7,49.6 L 24.0,52.0 L 24.2,54.9 L 25.0,57.1 L 26.2,59.3 L 28.3,61.2 L 32.3,64.3 L 37.4,67.7 L 42.3,71.3 L 48.6,75.2 L 55.8,79.2 L 63.1,83.0 L 71.3,86.2 L 78.6,89.3 L 86.2,91.6 L 98.4,95.1 L 111.9,99.4 L 128.2,104.1 L 144.3,108.3 L 155.5,111.5 L 170.0,116.0 L 173.3,116.7 L 176.6,116.8 L 180.1,116.2 L 183.5,115.4 L 189.6,113.5 L 195.2,111.2 L 199.9,108.8 L 204.8,105.7 L 213.9,98.7 L 226.4,89.1 L 229.9,86.8 L 232.3,85.3 L 234.6,84.1 L 236.2,83.3 L 237.1,83.3 L 238.2,83.7 L 241.0,85.7 L 243.1,87.1 L 244.7,87.5 L 246.3,87.3 L 248.1,86.3 L 251.1,84.0 L 254.5,82.0 L 258.3,80.7 L 262.9,80.4 L 267.2,80.6 L 271.8,81.4 L 276.3,82.8 L 280.2,84.3 L 285.0,87.0 L 289.4,90.4 L 293.9,94.5 L 324.6,125.3 Z",
    "onboardYoutubeId": "wXUkJ_M_LBA",
    videoThumbnail: '/circuits/suzuka-video.jpg',
    synopsis: "Famoso por seu desenho em formato de '8' com cruzamento em desnível e pelas míticas curvas dos Esses e da 130R, Suzuka é a obra-prima das pistas asiáticas. Desfrute de voltas rápidas com suporte operacional completo no pitlane oficial.",
    nextDates: ['25 Nov · Ter', '02 Dez · Ter', '16 Dez · Ter'],
    availableCars: [TRACK_FLEET.amg, TRACK_FLEET.porsche, TRACK_FLEET.bmw],
    "sectors": [
      {
        "name": "Sector 1 (S Curves / Dunlop)",
        "targetTime": "31.200"
      },
      {
        "name": "Sector 2 (Degner / Hairpin / Spoon)",
        "targetTime": "39.810"
      },
      {
        "name": "Sector 3 (130R / Casio Triangle)",
        "targetTime": "16.054"
      }
    ]
  }
];

// Cache em memória para evitar rate-limits de requisições de clima
const weatherCache = new Map<string, { data: CircuitLiveWeather; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getCircuitLiveWeather(circuit: Circuit): Promise<CircuitLiveWeather> {
  const cached = weatherCache.get(circuit.id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${circuit.lat}&longitude=${circuit.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error: ${res.statusText}`);
    const data = await res.json();
    const current = data.current;

    const temp = Math.round(current.temperature_2m ?? 17);
    const precip = current.precipitation ?? 0;
    const humidity = Math.round(current.relative_humidity_2m ?? 55);
    const wind = Math.round(current.wind_speed_10m ?? 12);

    const trackTemp = precip > 0 ? Math.max(temp - 2, 4) : temp + 6;

    let gripStatus: CircuitLiveWeather['gripStatus'] = 'OPTIMAL (DRY)';
    let gripColor = '#FF1717'; // Racing Red

    if (precip > 0.5) {
      gripStatus = 'WET TRACK';
      gripColor = '#38BDF8';
    } else if (precip > 0 || humidity > 85) {
      gripStatus = 'DAMP';
      gripColor = '#FBBF24';
    } else if (temp < 10) {
      gripStatus = 'COLD TARMAC';
      gripColor = '#94A3B8';
    }

    const weather: CircuitLiveWeather = {
      temperature: temp,
      trackTemperature: trackTemp,
      humidity,
      precipitation: precip,
      windSpeed: wind,
      gripStatus,
      gripColor,
      lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    weatherCache.set(circuit.id, { data: weather, timestamp: Date.now() });
    return weather;
  } catch {
    return {
      temperature: 21,
      trackTemperature: 28,
      humidity: 48,
      precipitation: 0,
      windSpeed: 9,
      gripStatus: 'OPTIMAL (DRY)',
      gripColor: '#FF1717',
      lastUpdated: 'LIVE',
    };
  }
}

export async function getEurToBrlRate(): Promise<number> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR');
    if (!res.ok) return 6.15;
    const data = await res.json();
    return data.rates?.BRL || 6.15;
  } catch {
    return 6.15;
  }
}
