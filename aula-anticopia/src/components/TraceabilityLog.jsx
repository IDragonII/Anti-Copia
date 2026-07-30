import { Clock, User, Package, MapPin } from 'lucide-react';

const TIPO_CONFIG = {
  manipulacion: { color: '#DC2626', bg: 'rgba(220,38,38,0.1)', icon: Package, label: 'Manipulacion' },
  proximidad: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: MapPin, label: 'Proximidad' },
  inicio_proximidad: { color: '#2563EB', bg: 'rgba(37,99,235,0.1)', icon: User, label: 'Inicio' },
  fin_proximidad: { color: '#94A3B8', bg: '#F1F5F9', icon: Clock, label: 'Fin' },
};

function TraceabilityLog({ eventos, maxEventos = 50 }) {
  const eventosMostrar = eventos.slice(0, maxEventos);

  if (eventosMostrar.length === 0) {
    return (
      <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '24px 0', fontStyle: 'italic' }}>
        No hay eventos de trazabilidad registrados
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {eventosMostrar.map((evento) => {
        const config = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.proximidad;
        const Icono = config.icon;

        return (
          <div key={evento.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            padding: '10px 12px', borderRadius: '10px',
            borderLeft: `4px solid ${config.color}`,
            background: config.bg,
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: config.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icono style={{ width: '16px', height: '16px', color: config.color }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                  borderRadius: '6px', background: config.bg, color: config.color,
                }}>
                  {config.label}
                </span>
                {evento.nivelAlerta === 'alta' && (
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                    borderRadius: '6px', background: 'rgba(220,38,38,0.1)', color: '#DC2626',
                  }}>
                    ALERTA
                  </span>
                )}
              </div>

              <p style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {evento.trabajador?.nombre || 'Desconocido'}
                {evento.trabajador?.departamento && (
                  <span style={{ fontWeight: 400, color: '#94A3B8' }}> ({evento.trabajador.departamento})</span>
                )}
              </p>

              {evento.objeto && (
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0' }}>
                  {evento.objeto.clase} ({Math.round(evento.objeto.score * 100)}%)
                </p>
              )}
            </div>

            <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace', flexShrink: 0 }}>
              {new Date(evento.timestamp).toLocaleTimeString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default TraceabilityLog;
