import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, AlertTriangle, Radio, MapPin,
  Users, Package, Bell, Clock, Shield,
} from 'lucide-react';

const CARD = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  padding: '16px',
};

const SECTION_TITLE = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

function Dashboard({ trabajadores, objetos, posicionGlobal, anguloBarrido, baseTrabajadores }) {
  const [alertas, setAlertas] = useState([]);
  const [historialObjetos, setHistorialObjetos] = useState([]);
  const alertasRef = useRef([]);
  const historialRef = useRef([]);

  useEffect(() => {
    if (objetos.length > 0) {
      const nuevaAlerta = {
        id: Date.now(),
        tipo: 'objeto',
        mensaje: `Objeto detectado: ${objetos.map((o) => o.class).join(', ')}`,
        timestamp: new Date().toLocaleTimeString(),
        nivel: 'baja',
      };
      alertasRef.current = [nuevaAlerta, ...alertasRef.current].slice(0, 20);
      objetos.forEach((obj) => {
        historialRef.current = [
          { clase: obj.class, score: obj.score, timestamp: new Date().toLocaleTimeString() },
          ...historialRef.current,
        ].slice(0, 50);
      });
      setAlertas([...alertasRef.current]);
      setHistorialObjetos([...historialRef.current]);
    }
  }, [objetos]);

  useEffect(() => {
    const desconocidos = trabajadores.filter((t) => !t.registrado);
    if (desconocidos.length > 0) {
      const nuevaAlerta = {
        id: Date.now(),
        tipo: 'identidad',
        mensaje: `${desconocidos.length} trabajador(es) no verificado(s) detectado(s)`,
        timestamp: new Date().toLocaleTimeString(),
        nivel: 'media',
      };
      alertasRef.current = [nuevaAlerta, ...alertasRef.current].slice(0, 20);
      setAlertas([...alertasRef.current]);
    }
  }, [trabajadores]);

  const trabajadoresVerificados = trabajadores.filter((t) => t.registrado);
  const trabajadoresNoVerificados = trabajadores.filter((t) => !t.registrado);
  const coberturaBarrido = Math.abs(anguloBarrido) / 90 * 100;

  const stats = [
    { icon: CheckCircle, label: 'Verificados', value: trabajadoresVerificados.length, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { icon: AlertTriangle, label: 'No Verificados', value: trabajadoresNoVerificados.length, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { icon: Package, label: 'Objetos', value: objetos.length, color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
    { icon: Bell, label: 'Alertas', value: alertas.length, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={CARD}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: stat.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: stat.color }} />
                </div>
                <div>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{stat.value}</p>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Camera Coverage */}
      <div style={CARD}>
        <h3 style={SECTION_TITLE}>
          <Radio style={{ width: '16px', height: '16px', color: '#2563EB' }} />
          Cobertura de Camara
        </h3>
        <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
          <div style={{
            height: '100%', borderRadius: '4px',
            background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
            width: `${coberturaBarrido}%`,
            transition: 'width 0.5s',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8' }}>
          <span>Angulo: {anguloBarrido.toFixed(1)}&deg;</span>
          <span style={{ fontWeight: 600, color: '#2563EB' }}>{coberturaBarrido.toFixed(0)}%</span>
        </div>
      </div>

      {/* Position */}
      <div style={CARD}>
        <h3 style={SECTION_TITLE}>
          <MapPin style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
          Posicion Global
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: '#F1F5F9', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px' }}>Eje X</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#2563EB', fontFamily: 'monospace', margin: 0 }}>
              {posicionGlobal.x.toFixed(3)} m
            </p>
          </div>
          <div style={{ background: '#F1F5F9', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px' }}>Eje Y</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#2563EB', fontFamily: 'monospace', margin: 0 }}>
              {posicionGlobal.y.toFixed(3)} m
            </p>
          </div>
        </div>
      </div>

      {/* Workers */}
      <div style={CARD}>
        <h3 style={SECTION_TITLE}>
          <Users style={{ width: '16px', height: '16px', color: '#2563EB' }} />
          Trabajadores en el Almacen
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
          {trabajadores.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px 0', fontStyle: 'italic', margin: 0 }}>
              No hay trabajadores detectados
            </p>
          ) : (
            trabajadores.map((t) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: '10px',
                borderLeft: `4px solid ${t.registrado ? '#10B981' : '#F59E0B'}`,
                background: t.registrado ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: t.registrado ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontSize: '13px', fontWeight: 600,
                      color: t.registrado ? '#10B981' : '#F59E0B',
                    }}>
                      {t.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A', margin: 0 }}>{t.nombre}</p>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{t.departamento} | {t.turno}</p>
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#2563EB' }}>
                  ({t.posicion.x.toFixed(2)}, {t.posicion.y.toFixed(2)})
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Registered Workers */}
      <div style={CARD}>
        <h3 style={SECTION_TITLE}>
          <Shield style={{ width: '16px', height: '16px', color: '#10B981' }} />
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

      {/* Object History */}
      <div style={CARD}>
        <h3 style={SECTION_TITLE}>
          <Package style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
          Historial de Objetos
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
          {historialObjetos.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px 0', fontStyle: 'italic', margin: 0 }}>
              No hay objetos registrados
            </p>
          ) : (
            historialObjetos.slice(0, 10).map((obj, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', background: '#F1F5F9', borderRadius: '10px',
                borderLeft: '4px solid #7C3AED',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#7C3AED' }}>{obj.clase}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#94A3B8' }}>
                  <span>{Math.round(obj.score * 100)}%</span>
                  <span>{obj.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alerts */}
      <div style={CARD}>
        <h3 style={SECTION_TITLE}>
          <Bell style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
          Alertas Recientes
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
          {alertas.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px 0', fontStyle: 'italic', margin: 0 }}>
              No hay alertas
            </p>
          ) : (
            alertas.map((alerta) => (
              <div key={alerta.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: '10px',
                borderLeft: `4px solid ${alerta.nivel === 'alta' ? '#DC2626' : alerta.nivel === 'media' ? '#F59E0B' : '#2563EB'}`,
                background: alerta.nivel === 'alta' ? 'rgba(220,38,38,0.05)' : alerta.nivel === 'media' ? 'rgba(245,158,11,0.05)' : 'rgba(37,99,235,0.05)',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#0F172A', margin: 0 }}>{alerta.mensaje}</p>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0' }}>{alerta.timestamp}</p>
                </div>
                <span style={{
                  padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                  background: alerta.nivel === 'alta' ? '#DC2626' : alerta.nivel === 'media' ? '#F59E0B' : '#2563EB',
                  color: '#FFFFFF',
                }}>
                  {alerta.nivel.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
