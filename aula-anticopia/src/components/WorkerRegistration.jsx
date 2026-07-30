import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, CheckCircle, AlertCircle, Users } from 'lucide-react';

function WorkerRegistration({
  onRegistrar,
  onEliminar,
  baseRegistrada,
  capturando,
  progresoCaptura,
  muestrasCapturadas,
}) {
  const [nombre, setNombre] = useState('');
  const [empleadoId, setEmpleadoId] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [turno, setTurno] = useState('matutino');
  const [mensaje, setMensaje] = useState('');

  const handleRegistrar = async () => {
    if (!nombre.trim() || !empleadoId.trim()) {
      setMensaje('Ingresa nombre y ID de empleado');
      return;
    }

    setMensaje('Capturando rostro durante 5 segundos...');
    const exito = await onRegistrar({
      nombre: nombre.trim(),
      id: empleadoId.trim(),
      departamento: departamento.trim() || 'General',
      turno,
    });

    if (exito) {
      setMensaje(`Trabajador registrado: ${nombre} (${muestrasCapturadas} muestras)`);
      setNombre('');
      setEmpleadoId('');
      setDepartamento('');
      setTimeout(() => setMensaje(''), 3000);
    } else {
      setMensaje('No se detecto rostro. Mira a la camara.');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            <UserPlus style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
            Registro de Trabajadores
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748B', marginBottom: '6px' }}>
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan Perez"
              disabled={capturando}
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: '10px', color: '#0F172A', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563EB'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748B', marginBottom: '6px' }}>
              ID Empleado
            </label>
            <input
              type="text"
              value={empleadoId}
              onChange={(e) => setEmpleadoId(e.target.value)}
              placeholder="Ej: EMP001"
              disabled={capturando}
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: '10px', color: '#0F172A', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563EB'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748B', marginBottom: '6px' }}>
              Departamento
            </label>
            <input
              type="text"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              placeholder="Ej: Almacen"
              disabled={capturando}
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: '10px', color: '#0F172A', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563EB'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748B', marginBottom: '6px' }}>
              Turno
            </label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              disabled={capturando}
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: '10px', color: '#0F172A', outline: 'none',
                appearance: 'none', cursor: 'pointer',
              }}
            >
              <option value="matutino">Matutino</option>
              <option value="vespertino">Vespertino</option>
              <option value="nocturno">Nocturno</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <AnimatePresence mode="wait">
          {capturando ? (
            <motion.div
              key="capturando"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ marginBottom: '16px' }}
            >
              <div style={{
                height: '8px', background: '#E2E8F0',
                borderRadius: '4px', overflow: 'hidden', marginBottom: '8px',
              }}>
                <motion.div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #2563EB, #7C3AED)',
                    borderRadius: '4px',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progresoCaptura}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#2563EB', fontWeight: 500 }}>Capturando...</span>
                <span style={{ color: '#94A3B8' }}>{muestrasCapturadas} muestras</span>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="boton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleRegistrar}
              disabled={!nombre.trim() || !empleadoId.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                width: '100%', padding: '12px', fontSize: '15px', fontWeight: 600,
                background: (nombre.trim() && empleadoId.trim())
                  ? 'linear-gradient(135deg, #2563EB, #3B82F6)'
                  : '#F1F5F9',
                color: (nombre.trim() && empleadoId.trim()) ? '#FFFFFF' : '#94A3B8',
                border: 'none', borderRadius: '10px', cursor: (nombre.trim() && empleadoId.trim()) ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: (nombre.trim() && empleadoId.trim()) ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                marginBottom: '16px',
              }}
            >
              <UserPlus style={{ width: '18px', height: '18px' }} />
              Iniciar Registro (5s)
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mensaje && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                padding: '10px', borderRadius: '8px', marginBottom: '16px',
                fontSize: '13px', textAlign: 'center',
                background: mensaje.includes('registrado') ? '#F0FDF4' : '#FEF3C7',
                color: mensaje.includes('registrado') ? '#16A34A' : '#D97706',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              {mensaje.includes('registrado') ? (
                <CheckCircle style={{ width: '16px', height: '16px' }} />
              ) : (
                <AlertCircle style={{ width: '16px', height: '16px' }} />
              )}
              {mensaje}
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '13px', fontWeight: 500, color: '#64748B', marginBottom: '10px',
          }}>
            <Users style={{ width: '16px', height: '16px' }} />
            Trabajadores Registrados ({baseRegistrada.length})
          </div>

          <AnimatePresence>
            {baseRegistrada.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>
                No hay trabajadores registrados aun
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {baseRegistrada.map((trabajador) => (
                  <motion.div
                    key={trabajador.id || trabajador.nombre}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', background: '#F8FAFC',
                      borderRadius: '10px', border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: '#EFF6FF', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB' }}>
                          {trabajador.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A', margin: 0 }}>
                          {trabajador.nombre}
                        </p>
                        <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                          ID: {trabajador.id} | {trabajador.departamento} | {trabajador.turno}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onEliminar(trabajador.nombre)}
                      style={{
                        padding: '6px', background: 'none', border: 'none',
                        cursor: 'pointer', color: '#94A3B8', borderRadius: '6px',
                      }}
                      onMouseEnter={(e) => { e.target.style.color = '#DC2626'; e.target.style.background = '#FEF2F2'; }}
                      onMouseLeave={(e) => { e.target.style.color = '#94A3B8'; e.target.style.background = 'none'; }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default WorkerRegistration;
