function exportCSV(eventos) {
  const encabezados = [
    'ID',
    'Fecha',
    'Hora',
    'Tipo',
    'Trabajador',
    'Departamento',
    'Turno',
    'Objeto',
    'Confianza',
    'Zona',
    'Tipo Zona',
    'Nivel Alerta',
  ];

  const filas = eventos.map((evento) => [
    evento.id,
    new Date(evento.timestamp).toLocaleDateString(),
    new Date(evento.timestamp).toLocaleTimeString(),
    evento.tipo,
    evento.trabajador?.nombre || '',
    evento.trabajador?.departamento || '',
    evento.trabajador?.turno || '',
    evento.objeto?.clase || '',
    evento.objeto?.score ? `${Math.round(evento.objeto.score * 100)}%` : '',
    evento.zona?.nombre || '',
    evento.zona?.tipo || '',
    evento.nivelAlerta,
  ]);

  const csvContenido = [
    encabezados.join(','),
    ...filas.map((fila) => fila.map((celda) => `"${celda}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `trazabilidad_${new Date().toISOString().split('T')[0]}.csv`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}

export default exportCSV;
