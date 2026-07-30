import { Camera } from 'lucide-react';
import CameraFeed from '../components/CameraFeed';
import WorkerRegistration from '../components/WorkerRegistration';
import useIsMobile from '../hooks/useIsMobile';

function TrabajadoresPage({
  videoRef,
  registrarTrabajador,
  eliminarTrabajador,
  baseTrabajadores,
  modelosCargados,
  capturando,
  progresoCaptura,
  muestrasCapturadas,
}) {
  const isMobile = useIsMobile();

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 12px' }}>
      {isMobile ? (
        /* ── Mobile: stacked vertical ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)', flexShrink: 0,
              }}>
                <Camera style={{ width: '18px', height: '18px', color: '#FFFFFF' }} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Camara
              </h2>
            </div>

            <div style={{
              position: 'relative', width: '100%',
              aspectRatio: '9/16', maxHeight: '500px',
              borderRadius: '16px', overflow: 'hidden',
              background: '#000', border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}>
              <CameraFeed videoRef={videoRef} />
            </div>

            <p style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', marginTop: '8px', lineHeight: '1.4' }}>
              Posiciona el rostro del trabajador frente a la camara. El sistema capturara automaticamente durante 5 segundos.
            </p>
          </div>

          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', marginBottom: '12px',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: modelosCargados ? '#10B981' : '#F59E0B', flexShrink: 0,
              }} />
              <span style={{ fontSize: '13px', color: '#0F172A' }}>
                {modelosCargados ? 'Modelos de reconocimiento listos' : 'Cargando modelos...'}
              </span>
            </div>

            <WorkerRegistration
              onRegistrar={registrarTrabajador}
              onEliminar={eliminarTrabajador}
              baseRegistrada={baseTrabajadores}
              capturando={capturando}
              progresoCaptura={progresoCaptura}
              muestrasCapturadas={muestrasCapturadas}
            />
          </div>
        </div>
      ) : (
        /* ── Desktop: two-column ── */
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', minHeight: 0 }}>
          {/* Left column — camera ~60% */}
          <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)', flexShrink: 0,
              }}>
                <Camera style={{ width: '18px', height: '18px', color: '#FFFFFF' }} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Camara
              </h2>
            </div>

            <div style={{
              position: 'relative', width: '100%', flex: 1, minHeight: 0,
              borderRadius: '16px', overflow: 'hidden',
              background: '#000', border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}>
              <CameraFeed videoRef={videoRef} />
            </div>

            <p style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', marginTop: '8px', lineHeight: '1.4' }}>
              Posiciona el rostro del trabajador frente a la camara. El sistema capturara automaticamente durante 5 segundos.
            </p>
          </div>

          {/* Right column — form + status ~40% */}
          <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', marginBottom: '12px',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: modelosCargados ? '#10B981' : '#F59E0B', flexShrink: 0,
              }} />
              <span style={{ fontSize: '13px', color: '#0F172A' }}>
                {modelosCargados ? 'Modelos de reconocimiento listos' : 'Cargando modelos...'}
              </span>
            </div>

            <WorkerRegistration
              onRegistrar={registrarTrabajador}
              onEliminar={eliminarTrabajador}
              baseRegistrada={baseTrabajadores}
              capturando={capturando}
              progresoCaptura={progresoCaptura}
              muestrasCapturadas={muestrasCapturadas}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TrabajadoresPage;
