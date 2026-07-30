import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, FileSpreadsheet, Loader2 } from 'lucide-react';

function ExportButtons({ eventos }) {
  const [exportando, setExportando] = useState(null);

  const exportarCSV = async () => {
    setExportando('csv');
    try {
      const { default: exportCSV } = await import('../utils/exportCSV');
      exportCSV(eventos);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
    } finally {
      setExportando(null);
    }
  };

  const exportarPDF = async () => {
    setExportando('pdf');
    try {
      const { default: exportPDF } = await import('../utils/exportPDF');
      exportPDF(eventos);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    } finally {
      setExportando(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportarCSV}
        disabled={exportando !== null || eventos.length === 0}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-success/10 text-success hover:bg-success/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {exportando === 'csv' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5" />
        )}
        CSV
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportarPDF}
        disabled={exportando !== null || eventos.length === 0}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {exportando === 'pdf' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileText className="w-3.5 h-3.5" />
        )}
        PDF
      </motion.button>
    </div>
  );
}

export default ExportButtons;
