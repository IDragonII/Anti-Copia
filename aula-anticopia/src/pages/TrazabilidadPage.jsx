import { useState, useEffect } from 'react';
import {
  BarChart3, Users, CheckCircle, AlertTriangle,
  Package, Clock, MapPin, FileText,
} from 'lucide-react';
import Dashboard from '../components/Dashboard';
import TraceabilityLog from '../components/TraceabilityLog';
import ExportButtons from '../components/ExportButtons';

const CARD = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  padding: '20px',
};

const SECTION_TITLE = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const WORKER_ITEM = (registrado) => ({
  padding: '10px 12px',
  borderRadius: '10px',
  borderLeft: `4px solid ${registrado ? '#10B981' : '#F59E0B'}`,
  background: registrado ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.05)',
});

function TrazabilidadPage({ trabajadores, objetosDetectados, posicionGlobal, anguloBarrido, baseTrabajadores, eventos, estadisticas }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resumen = [
    { icon: Users, label: 'Detectados', value: trabajadores.length, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
    { icon: CheckCircle, label: 'Verificados', value: trabajadores.filter((t) => t.registrado).length, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { icon: AlertTriangle, label: 'Sin Verificar', value: trabajadores.filter((t) => !t.registrado).length, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { icon: Package, label: 'Objetos', value: objetosDetectados.length, color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 12px' }}>
      <div style={{
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        gap: '16px',
        alignItems: isDesktop ? 'stretch' : undefined,
      }}>
        {/* Left Column — Main Dashboard Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          minWidth: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
            }}>
              <BarChart3 style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Panel de Trazabilidad
            </h2>
          </div>

          <Dashboard
            trabajadores={trabajadores}
            objetos={objetosDetectados}
            posicionGlobal={posicionGlobal}
            anguloBarrido={anguloBarrido}
            baseTrabajadores={baseTrabajadores}
          />

          {/* Event Log Card */}
          <div style={CARD}>
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center',
              justifyContent: 'space-between', gap: '12px', marginBottom: '16px',
            }}>
              <h3 style={{ ...SECTION_TITLE, margin: 0 }}>
                <FileText style={{ width: '16px', height: '16px', color: '#2563EB' }} />
                Registro de Eventos
              </h3>
              <ExportButtons eventos={eventos} estadisticas={estadisticas} />
            </div>
            <TraceabilityLog eventos={eventos} maxEventos={20} />
          </div>
        </div>

        {/* Right Column — Sidebar */}
        <div style={{
          width: isDesktop ? '360px' : '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          ...(isDesktop ? { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' } : {}),
        }}>
          {/* Summary Stats — 2x2 Grid */}
          <div style={CARD}>
            <h3 style={SECTION_TITLE}>
              <BarChart3 style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
              Resumen del Inventario
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {resumen.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} style={{
                    background: '#F1F5F9', borderRadius: '12px',
                    padding: '16px 12px', textAlign: 'center',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: stat.bg, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 8px',
                    }}>
                      <Icon style={{ width: '20px', height: '20px', color: stat.color }} />
                    </div>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{stat.value}</p>
                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0' }}>{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workers in Warehouse */}
          <div style={CARD}>
            <h3 style={SECTION_TITLE}>
              <Users style={{ width: '16px', height: '16px', color: '#2563EB' }} />
              Trabajadores en el Almacen
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
              {trabajadores.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px 0', fontStyle: 'italic', margin: 0 }}>
                  No hay trabajadores detectados
                </p>
              ) : (
                trabajadores.map((t) => (
                  <div key={t.id} style={WORKER_ITEM(t.registrado)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>{t.nombre}</span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{t.registrado ? '\u2713 Verificado' : '? Sin verificar'}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{t.departamento} | {t.turno}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontFamily: 'monospace', color: '#2563EB' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '12px', height: '12px' }} />
                        ({t.posicion.x.toFixed(2)}, {t.posicion.y.toFixed(2)})
                      </span>
                      <span>Puntos: {t.historial.length}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Registered Workers */}
          <div style={CARD}>
            <h3 style={SECTION_TITLE}>
              <CheckCircle style={{ width: '16px', height: '16px', color: '#10B981' }} />
              Trabajadores Registrados
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {baseTrabajadores.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px 0', fontStyle: 'italic', margin: 0 }}>
                  No hay trabajadores registrados
                </p>
              ) : (
                baseTrabajadores.map((r, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', background: '#F1F5F9', borderRadius: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(37,99,235,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB' }}>
                          {r.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>{r.nombre}</span>
                        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0' }}>{r.id} | {r.departamento}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      {new Date(r.fechaRegistro).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrazabilidadPage;
