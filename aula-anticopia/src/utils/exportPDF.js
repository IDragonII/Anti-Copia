import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function exportPDF(eventos, estadisticas) {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129);
  doc.text('InvenTrack - Reporte de Trazabilidad', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32);
  doc.text(`Total de eventos: ${eventos.length}`, 14, 38);

  doc.setDrawColor(16, 185, 129);
  doc.line(14, 42, 196, 42);

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Resumen por Trabajador', 14, 52);

  const trabajadores = Object.entries(estadisticas.porTrabajador || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (trabajadores.length > 0) {
    doc.autoTable({
      startY: 56,
      head: [['Trabajador', 'Eventos']],
      body: trabajadores.map(([nombre, count]) => [nombre, count.toString()]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 14 },
    });
  }

  const startYObjetos = doc.lastAutoTable?.finalY || 56;
  doc.text('Resumen por Objeto', 14, startYObjetos + 10);

  const objetos = Object.entries(estadisticas.porObjeto || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (objetos.length > 0) {
    doc.autoTable({
      startY: startYObjetos + 14,
      head: [['Objeto', 'Eventos']],
      body: objetos.map(([clase, count]) => [clase, count.toString()]),
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
      margin: { left: 14 },
    });
  }

  const startYZonas = doc.lastAutoTable?.finalY || startYObjetos + 14;
  doc.text('Resumen por Zona', 14, startYZonas + 10);

  const zonas = Object.entries(estadisticas.porZona || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (zonas.length > 0) {
    doc.autoTable({
      startY: startYZonas + 14,
      head: [['Zona', 'Eventos']],
      body: zonas.map(([nombre, count]) => [nombre, count.toString()]),
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      margin: { left: 14 },
    });
  }

  doc.addPage();

  doc.setFontSize(12);
  doc.text('Detalle de Eventos', 14, 22);

  const eventosTabla = eventos.slice(0, 50).map((evento) => [
    new Date(evento.timestamp).toLocaleTimeString(),
    evento.tipo,
    evento.trabajador?.nombre || '-',
    evento.objeto?.clase || '-',
    evento.zona?.nombre || '-',
    evento.nivelAlerta,
  ]);

  if (eventosTabla.length > 0) {
    doc.autoTable({
      startY: 26,
      head: [['Hora', 'Tipo', 'Trabajador', 'Objeto', 'Zona', 'Alerta']],
      body: eventosTabla,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 14 },
      styles: { fontSize: 7 },
    });
  }

  doc.save(`trazabilidad_${new Date().toISOString().split('T')[0]}.pdf`);

  return true;
}

export default exportPDF;
