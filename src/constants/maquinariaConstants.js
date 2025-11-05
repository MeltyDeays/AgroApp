// Opciones de tipo de maquinaria
export const TIPOS_MAQUINARIA = [
  { label: 'Tractor', value: 'tractor' },
  { label: 'Cosechadora', value: 'cosechadora' },
  { label: 'Sembradora', value: 'sembradora' },
  { label: 'Pulverizadora', value: 'pulverizadora' },
  { label: 'Remolque', value: 'remolque' },
  { label: 'Otro', value: 'otro' },
];

// Opciones para el filtro (incluye "Todos")
export const FILTRO_TIPOS_MAQUINARIA = [
  { label: 'Filtrar por Tipo', value: 'todos' },
  ...TIPOS_MAQUINARIA,
];

// Opciones de estado para el filtro
export const FILTRO_ESTADOS_MAQUINARIA = [
  { label: 'Filtrar por Estado', value: 'todos' },
  { label: 'Disponible', value: 'available' },
  { label: 'En Uso', value: 'in-use' },
  { label: 'Mantenimiento', value: 'maintenance' },
  { label: 'Averiada', value: 'broken' },
];