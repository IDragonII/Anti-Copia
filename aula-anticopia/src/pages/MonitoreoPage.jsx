import { RotateCcw, Users, Package, Navigation } from 'lucide-react';
import CameraFeed from '../components/CameraFeed';
import OverlayCanvas from '../components/OverlayCanvas';
import useIsMobile from '../hooks/useIsMobile';

const CARD = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  padding: '16px',
};

const STAT_CARD = {
  ...CARD,
  textAlign: 'center',
  padding: '16px 12px',
};

const SIDEBAR_TITLE = {
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

const WORKER_ITEM = (registrado) => ({
  padding: '10px 12px',
  borderRadius: '10px',
  borderLeft: `4px solid ${registrado ? '#10B981' : '#F59E0B'}`,
  background: registrado ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.05)',
});

const OBJ_ITEM = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 12px',
  borderRadius: '10px',
  borderLeft: '4px solid #7C3AED',
  background: 'rgba(124,58,237,0.05)',
};

const ODOMETRY_BOX = {
  background: '#F1F5F9',
  borderRadius: '10px',
  padding: '10px',
  textAlign: 'center',
};

function MonitoreoPage({
  videoRef,
  modelosCargados,
  opencvCargado,
  trabajadoresDetectados,
  objetosDetectados,
  trabajadores,
  posicionGlobal,
  velocidad,
  anguloBarrido,
  reiniciarPosicion,
}) {
  const trabajadoresVerificados = trabajadores.filter((t) => t.registrado);
  const trabajadoresNoVerificados = trabajadores.filter((t) => !t.registrado);
  const isMobile = useIsMobile(1024);

  const stats = [
    { label: 'Rastreados', value: trabajadores.length, icon: Users },
    { label: 'Verificados', value: trabajadoresVerificados.length, icon: Users },
    { label: 'Sin Verificar', value: trabajadoresNoVerificados.length, icon: Users },
    { label: 'Objetos', value: objetosDetectados.length, icon: Package },
  ];

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      padding: '16px 12px',
      boxSizing: 'border-box',
    }}>
      {isMobile ? (
        /* ── Mobile layout ── */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          height: '100%',
          overflowY: 'auto',
        }}>
          {/* Camera */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '9/16',
            maxHeight: '500px',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#000',
            flexShrink: 0,
          }}>
            <CameraFeed videoRef={videoRef} />
            <OverlayCanvas
              videoRef={videoRef}
              rostros={trabajadoresDetectados}
              objetos={objetosDetectados}
              trabajadores={trabajadores}
            />
          </div>

          {/* Reset button */}
          <button
            onClick={reiniciarPosicion}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              flexShrink: 0,
            }}
          >
            <RotateCcw style={{ width: '16px', height: '16px' }} />
            Reiniciar Posicion
          </button>

          {/* Stats – horizontal scroll */}
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '4px',
            flexShrink: 0,
          }}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} style={{ ...STAT_CARD, minWidth: '120px', flex: '0 0 auto' }}>
                  <Icon style={{ width: '20px', height: '20px', color: '#2563EB', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{stat.value}</p>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0' }}>{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Lists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0 }}>
            <WorkersList
              trabajadores={trabajadores}
              modelosCargados={modelosCargados}
            />
            <ObjectsList objetosDetectados={objetosDetectados} />
            <OdometryCard
              posicionGlobal={posicionGlobal}
              velocidad={velocidad}
              anguloBarrido={anguloBarrido}
            />
          </div>
        </div>
      ) : (
        /* ── Desktop layout ── */
        <div style={{
          display: 'flex',
          gap: '16px',
          height: '100%',
        }}>
          {/* Left – Camera feed */}
          <div style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {/* Status badges */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {[
                { label: 'Face-API', ok: modelosCargados },
                { label: 'OpenCV', ok: opencvCargado },
              ].map((s) => (
                <div key={s.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: s.ok ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)',
                  color: s.ok ? '#10B981' : '#DC2626',
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: s.ok ? '#10B981' : '#DC2626',
                  }} />
                  {s.label}
                </div>
              ))}
            </div>

            {/* Camera */}
            <div style={{
              position: 'relative',
              width: '100%',
              flex: 1,
              minHeight: 0,
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#000',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}>
              <CameraFeed videoRef={videoRef} />
              <OverlayCanvas
                videoRef={videoRef}
                rostros={trabajadoresDetectados}
                objetos={objetosDetectados}
                trabajadores={trabajadores}
              />
            </div>

            {/* Reset button */}
            <button
              onClick={reiniciarPosicion}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => e.target.style.background = '#F1F5F9'}
              onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
            >
              <RotateCcw style={{ width: '16px', height: '16px' }} />
              Reiniciar Posicion
            </button>
          </div>

          {/* Right – Sidebar */}
          <div style={{
            width: '340px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
          }}>
            {/* Stats grid 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} style={STAT_CARD}>
                    <Icon style={{ width: '20px', height: '20px', color: '#2563EB', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{stat.value}</p>
                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0' }}>{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <WorkersList
              trabajadores={trabajadores}
              modelosCargados={modelosCargados}
            />
            <ObjectsList objetosDetectados={objetosDetectados} />
            <OdometryCard
              posicionGlobal={posicionGlobal}
              velocidad={velocidad}
              anguloBarrido={anguloBarrido}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function WorkersList({ trabajadores, modelosCargados }) {
  return (
    <div style={CARD}>
      <h3 style={SIDEBAR_TITLE}>
        <Users style={{ width: '16px', height: '16px', color: '#2563EB' }} />
        Trabajadores Detectados
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
        {trabajadores.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px 0', fontStyle: 'italic', margin: 0 }}>
            {modelosCargados ? 'Esperando deteccion...' : 'Cargando modelos...'}
          </p>
        ) : (
          trabajadores.map((t) => (
            <div key={t.id} style={WORKER_ITEM(t.registrado)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>{t.nombre}</span>
                <span style={{ fontSize: '14px' }}>{t.registrado ? '\u2713' : '?'}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>{t.departamento} | {t.turno}</div>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#2563EB' }}>
                X: {t.posicion.x.toFixed(2)}m | Y: {t.posicion.y.toFixed(2)}m
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ObjectsList({ objetosDetectados }) {
  return (
    <div style={CARD}>
      <h3 style={SIDEBAR_TITLE}>
        <Package style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
        Objetos Detectados
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {objetosDetectados.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px 0', fontStyle: 'italic', margin: 0 }}>
            No se detectaron objetos
          </p>
        ) : (
          objetosDetectados.map((obj, idx) => (
            <div key={idx} style={OBJ_ITEM}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#7C3AED' }}>{obj.class}</span>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>{Math.round(obj.score * 100)}%</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function OdometryCard({ posicionGlobal, velocidad, anguloBarrido }) {
  return (
    <div style={CARD}>
      <h3 style={SIDEBAR_TITLE}>
        <Navigation style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
        Odometria Visual
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Posicion X', val: `${posicionGlobal.x.toFixed(3)} m` },
          { label: 'Posicion Y', val: `${posicionGlobal.y.toFixed(3)} m` },
          { label: 'Angulo', val: `${anguloBarrido.toFixed(1)}\u00B0` },
          { label: 'Velocidad', val: Math.sqrt(velocidad.x ** 2 + velocidad.y ** 2).toFixed(4) },
        ].map((item) => (
          <div key={item.label} style={ODOMETRY_BOX}>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px' }}>{item.label}</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#2563EB', fontFamily: 'monospace', margin: 0 }}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Sweep Indicator */}
      <div>
        <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginBottom: '8px' }}>Barrido de Camara</p>
        <div style={{
          position: 'relative',
          height: '8px',
          background: '#F1F5F9',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
            left: `calc(${50 + anguloBarrido}% - 8px)`,
            transition: 'left 0.1s',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
          <span>-90&deg;</span><span>0&deg;</span><span>+90&deg;</span>
        </div>
      </div>
    </div>
  );
}

export default MonitoreoPage;
