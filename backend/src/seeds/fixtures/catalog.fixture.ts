export interface CatalogCategorySeed {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface CatalogProductSeed {
  name: string;
  categorySlug: string;
  price: string;
  originalPrice?: string;
  tag?: string;
  sku: string;
  stock: number;
  rating?: number;
  weight?: string;
  warranty?: string;
  description: string;
  imageId: string;
}

export const CATALOG_CATEGORIES: CatalogCategorySeed[] = [
  { slug: 'herramientas-electricas', name: 'Herramientas Eléctricas', description: 'Taladros, amoladoras, sierras y más herramientas a motor.', sortOrder: 1 },
  { slug: 'herramientas-manuales', name: 'Herramientas Manuales', description: 'Herramientas de mano para todo tipo de trabajo.', sortOrder: 2 },
  { slug: 'pinturas', name: 'Pinturas', description: 'Pinturas, esmaltes, barnices y accesorios para pintar.', sortOrder: 3 },
  { slug: 'plomeria', name: 'Plomería', description: 'Cañerías, accesorios y herramientas para instalaciones sanitarias.', sortOrder: 4 },
  { slug: 'electricidad', name: 'Electricidad', description: 'Material eléctrico, cables, llaves térmicas e instalación.', sortOrder: 5 },
  { slug: 'accesorios-y-repuestos', name: 'Accesorios y Repuestos', description: 'Repuestos, fijaciones y accesorios para taller y hogar.', sortOrder: 6 },
  { slug: 'calefaccion', name: 'Calefacción', description: 'Estufas, calefactores y sistemas de calefacción.', sortOrder: 7 },
  { slug: 'climatizacion', name: 'Climatización', description: 'Aires acondicionados, ventiladores y climatización.', sortOrder: 8 },
];

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&auto=format`;

export const CATALOG_PRODUCTS: CatalogProductSeed[] = [
  { name: 'Taladro Percutor Eléctrico 750W', categorySlug: 'herramientas-electricas', price: '79.99', originalPrice: '99.99', tag: 'Oferta', sku: 'HEL-001', stock: 42, rating: 4.8, weight: '2.1kg', warranty: '12 meses de garantía', description: 'Taladro percutor de 750W con mandril de 13mm, dos velocidades y función de percusión. Incluye maletín.', imageId: '1572981779307-38b8cabb2407' },
  { name: 'Amoladora Angular 115mm 850W', categorySlug: 'herramientas-electricas', price: '54.99', sku: 'HEL-002', stock: 35, rating: 4.7, weight: '1.9kg', warranty: '12 meses de garantía', description: 'Amoladora angular de 850W para disco de 115mm, con protector ajustable y empuñadura antivibración.', imageId: '1502343019212-cc6a09783255' },
  { name: 'Sierra Circular 1200W', categorySlug: 'herramientas-electricas', price: '89.99', originalPrice: '109.99', tag: 'Nuevo', sku: 'HEL-003', stock: 18, rating: 4.6, weight: '3.4kg', warranty: '12 meses de garantía', description: 'Sierra circular de 1200W con disco de 185mm, guía láser y ajuste de profundidad e inclinación.', imageId: '1505855796860-aa05646cbf1f' },
  { name: 'Atornillador Inalámbrico 20V', categorySlug: 'herramientas-electricas', price: '64.99', tag: 'Popular', sku: 'HEL-004', stock: 26, rating: 4.8, weight: '1.2kg', warranty: '18 meses de garantía', description: 'Atornillador/taladro inalámbrico de 20V con batería de litio y 20 posiciones de torque.', imageId: '1596496182209-5193de4ed72d' },
  { name: 'Kit Combo Taladro y Amoladora', categorySlug: 'herramientas-electricas', price: '119.99', originalPrice: '149.99', tag: 'Oferta', sku: 'HEL-005', stock: 12, rating: 4.7, weight: '4.5kg', warranty: '12 meses de garantía', description: 'Combo de taladro percutor y amoladora angular en maletín rígido para equipar tu taller.', imageId: '1518709414768-a88981a4515d' },
  { name: 'Atornillador Impacto 20V', categorySlug: 'herramientas-electricas', price: '71.99', tag: 'Nuevo', sku: 'HEL-006', stock: 20, rating: 4.5, weight: '1.4kg', warranty: '18 meses de garantía', description: 'Atornillador de impacto inalámbrico 20V con luz LED y portapuntas magnético.', imageId: '1622025731868-6d9b8f8c2e2a' },
  { name: 'Set de Destornilladores Profesional 6 Piezas', categorySlug: 'herramientas-manuales', price: '18.99', originalPrice: '26.99', tag: 'Oferta', sku: 'HMA-001', stock: 60, rating: 4.6, weight: '500g', warranty: '24 meses de garantía', description: 'Set de 6 destornilladores profesionales con puntas planas y Phillips, mango ergonómico.', imageId: '1581783898377-1c85bf937427' },
  { name: 'Martillo de Carpintero 16oz', categorySlug: 'herramientas-manuales', price: '14.99', sku: 'HMA-002', stock: 45, rating: 4.7, weight: '650g', warranty: '12 meses de garantía', description: 'Martillo de carpintero de 16oz con cabeza forjada y mango de fibra antivibración.', imageId: '1571505280193-4b4e29712a77' },
  { name: 'Caja de Herramientas 40 Piezas', categorySlug: 'herramientas-manuales', price: '45.99', originalPrice: '58.99', tag: 'Oferta', sku: 'HMA-003', stock: 22, rating: 4.8, weight: '3.8kg', warranty: '24 meses de garantía', description: 'Caja con 40 piezas: dados, llaves, alicates y accesorios en maletín organizador.', imageId: '1530124566582-a618bc2615dc' },
  { name: 'Pinza de Presión 10"', categorySlug: 'herramientas-manuales', price: '22.99', tag: 'Nuevo', sku: 'HMA-004', stock: 33, rating: 4.5, weight: '450g', warranty: '12 meses de garantía', description: 'Pinza de presión universal de 10 pulgadas con apertura regulable.', imageId: '1586864387967-d02ef85d93e8' },
  { name: 'Nivel de Mano 24"', categorySlug: 'herramientas-manuales', price: '12.99', sku: 'HMA-005', stock: 40, rating: 4.4, weight: '700g', warranty: '12 meses de garantía', description: 'Nivel de burbuja de 24 pulgadas con cuerpo de aluminio reforzado.', imageId: '1581092160562-6b6f8a2b0f3a' },
  { name: 'Pintura Látex Interior Blanco 4L', categorySlug: 'pinturas', price: '38.99', originalPrice: '47.99', tag: 'Oferta', sku: 'PIN-001', stock: 55, rating: 4.6, weight: '4.5kg', warranty: 'Garantía de calidad', description: 'Pintura látex interior lavable, cubritivo y de bajo olor. Cobertura estimada 40 m2 por mano.', imageId: '1562259949-e8e7689d7828' },
  { name: 'Esmalte Sintético Rojo 1L', categorySlug: 'pinturas', price: '15.99', sku: 'PIN-002', stock: 38, rating: 4.5, weight: '1.1kg', warranty: 'Garantía de calidad', description: 'Esmalte sintético brillante para superficies de madera y metal.', imageId: '1589939705384-5185137a7f0f' },
  { name: 'Kit Rodillos y Pinceles Pro', categorySlug: 'pinturas', price: '11.99', tag: 'Nuevo', sku: 'PIN-003', stock: 70, rating: 4.4, weight: '800g', warranty: 'Sin garantía', description: 'Kit con rodillos de repuesto, pinceles planos y bandeja para pintar.', imageId: '1585128792020-cf5c3c8a7f9b' },
  { name: 'Pintura Asfáltica Impermeabilizante 4L', categorySlug: 'pinturas', price: '26.99', sku: 'PIN-004', stock: 25, rating: 4.3, weight: '4.3kg', warranty: 'Garantía de calidad', description: 'Impermeabilizante asfáltico para techos y superficies expuestas.', imageId: '1622025731868-6d9b8f8c2e2a' },
  { name: 'Sellador de Grietas Silicona x300g', categorySlug: 'pinturas', price: '8.99', tag: 'Popular', sku: 'PIN-005', stock: 90, rating: 4.5, weight: '300g', warranty: 'Sin garantía', description: 'Sellador acrílico blanco listo para usar en grietas y juntas.', imageId: '1581092160562-6b6f8a2b0f3a' },
  { name: 'Kit de Llaves para Cañerías', categorySlug: 'plomeria', price: '34.99', originalPrice: '42.99', tag: 'Oferta', sku: 'PLO-001', stock: 30, rating: 4.7, weight: '2.2kg', warranty: '12 meses de garantía', description: 'Set de llaves inglesa, stilson y para tubo en estuche.', imageId: '1504328345606-18bbc8c9d7d3' },
  { name: 'Soldador de Caños de PVC', categorySlug: 'plomeria', price: '64.99', tag: 'Nuevo', sku: 'PLO-002', stock: 15, rating: 4.6, weight: '1.5kg', warranty: '12 meses de garantía', description: 'Soldador térmico para caños de PVC con control de temperatura.', imageId: '1611856604288-1a6c0e2e8a9d' },
  { name: 'Válvula Esférica 1/2" Bronce', categorySlug: 'plomeria', price: '6.99', sku: 'PLO-003', stock: 120, rating: 4.5, weight: '250g', warranty: 'Sin garantía', description: 'Válvula esférica de bronce para instalaciones domiciliarias.', imageId: '1581092918056-0c4c3acd3789' },
  { name: 'Flexible Acero Inoxidable 40cm', categorySlug: 'plomeria', price: '5.49', tag: 'Popular', sku: 'PLO-004', stock: 150, rating: 4.4, weight: '200g', warranty: 'Sin garantía', description: 'Flexible de acero inoxidable trenzado con tuercas de 1/2".', imageId: '1621905251189-08b45d6a269e' },
  { name: 'Cinta Teflón x10m', categorySlug: 'plomeria', price: '1.49', sku: 'PLO-005', stock: 300, rating: 4.6, weight: '50g', warranty: 'Sin garantía', description: 'Cinta de teflón para sellado de roscas en instalaciones sanitarias.', imageId: '1611856604288-1a6c0e2e8a9d' },
  { name: 'Llave Térmica 20A Monofásica', categorySlug: 'electricidad', price: '12.99', originalPrice: '15.99', tag: 'Oferta', sku: 'ELE-001', stock: 80, rating: 4.7, weight: '350g', warranty: '12 meses de garantía', description: 'Llave térmica 1 polo 20A para protección de circuitos.', imageId: '1621905251189-08b45d6a269e' },
  { name: 'Cable Unipolar 2.5mm x100m', categorySlug: 'electricidad', price: '84.99', sku: 'ELE-002', stock: 40, rating: 4.6, weight: '3.5kg', warranty: 'Sin garantía', description: 'Cable de cobre unipolar 2.5mm en rollo de 100 metros.', imageId: '1504328345606-18bbc8c9d7d3' },
  { name: 'Multímetro Digital True RMS', categorySlug: 'electricidad', price: '57.99', tag: 'Nuevo', sku: 'ELE-003', stock: 25, rating: 4.8, weight: '600g', warranty: '24 meses de garantía', description: 'Multímetro digital profesional con medición True RMS.', imageId: '1581092160562-6b6f8a2b0f3a' },
  { name: 'Toma Corriente Doble Blindado', categorySlug: 'electricidad', price: '4.59', sku: 'ELE-004', stock: 200, rating: 4.4, weight: '150g', warranty: 'Sin garantía', description: 'Toma doble con tapa de seguridad para instalaciones residenciales.', imageId: '1581092918056-0c4c3acd3789' },
  { name: 'Cinta Aisladora Vinílica x20m', categorySlug: 'electricidad', price: '2.49', tag: 'Popular', sku: 'ELE-005', stock: 260, rating: 4.5, weight: '90g', warranty: 'Sin garantía', description: 'Cinta aisladora de vinilo de alta adherencia.', imageId: '1586864387967-d02ef85d93e8' },
  { name: 'Juego de Brocas para Metal 13pzs', categorySlug: 'accesorios-y-repuestos', price: '23.99', originalPrice: '29.99', tag: 'Oferta', sku: 'ACC-001', stock: 48, rating: 4.6, weight: '600g', warranty: '12 meses de garantía', description: 'Set de 13 brocas HSS progresivas para metal.', imageId: '1572981779307-38b8cabb2407' },
  { name: 'Disco de Corte 4.1/2 x10pzs', categorySlug: 'accesorios-y-repuestos', price: '16.99', tag: 'Nuevo', sku: 'ACC-002', stock: 75, rating: 4.5, weight: '1.2kg', warranty: 'Sin garantía', description: 'Paquete de 10 discos de corte para metal de 4 1/2 pulgadas.', imageId: '1502343019212-cc6a09783255' },
  { name: 'Guantes de Trabajo Reforzados', categorySlug: 'accesorios-y-repuestos', price: '5.99', sku: 'ACC-003', stock: 140, rating: 4.7, weight: '150g', warranty: 'Sin garantía', description: 'Guantes de trabajo con palma reforzada y puño elástico.', imageId: '1611856604288-1a6c0e2e8a9d' },
  { name: 'Gafas de Protección Transparentes', categorySlug: 'accesorios-y-repuestos', price: '3.49', tag: 'Popular', sku: 'ACC-004', stock: 90, rating: 4.4, weight: '80g', warranty: 'Sin garantía', description: 'Gafas de seguridad antiimpacto con tratamiento antiempaño.', imageId: '1581092918056-0c4c3acd3789' },
  { name: 'Calefactor Eléctrico 2000W', categorySlug: 'calefaccion', price: '119.99', originalPrice: '149.99', tag: 'Oferta', sku: 'CAL-001', stock: 14, rating: 4.6, weight: '4kg', warranty: '24 meses de garantía', description: 'Calefactor eléctrico de 2000W con termostato y protección térmica.', imageId: '1611856604288-1a6c0e2e8a9d' },
  { name: 'Estufa a Gas Catalítica', categorySlug: 'calefaccion', price: '159.99', tag: 'Nuevo', sku: 'CAL-002', stock: 9, rating: 4.5, weight: '11kg', warranty: '12 meses de garantía', description: 'Estufa catalítica a gas de 2.500 kcal con corte de seguridad.', imageId: '1621905251189-08b45d6a269e' },
  { name: 'Panel Radiante 1200W', categorySlug: 'calefaccion', price: '89.99', sku: 'CAL-003', stock: 17, rating: 4.4, weight: '6.5kg', warranty: '12 meses de garantía', description: 'Panel radiante de bajo consumo para interiores.', imageId: '1504328345606-18bbc8c9d7d3' },
  { name: 'Aire Acondicionado Split Frío/Calor', categorySlug: 'climatizacion', price: '899.99', originalPrice: '1099.99', tag: 'Oferta', sku: 'CLI-001', stock: 6, rating: 4.8, weight: '28kg', warranty: '36 meses de garantía', description: 'Equipo split frío/calor con control remoto y modo inverter.', imageId: '1581092160562-6b6f8a2b0f3a' },
  { name: 'Ventilador de Pie 18"', categorySlug: 'climatizacion', price: '42.99', tag: 'Nuevo', sku: 'CLI-002', stock: 32, rating: 4.5, weight: '4.8kg', warranty: '12 meses de garantía', description: 'Ventilador de pie con 3 velocidades y oscilación.', imageId: '1611856604288-1a6c0e2e8a9d' },
  { name: 'Extractor de Aire de Pared', categorySlug: 'climatizacion', price: '34.99', sku: 'CLI-003', stock: 22, rating: 4.3, weight: '2.4kg', warranty: '12 meses de garantía', description: 'Extractor de aire para baños y ambientes cerrados.', imageId: '1581092918056-0c4c3acd3789' },
];

export const productImage = (seed: CatalogProductSeed): string => img(seed.imageId);
