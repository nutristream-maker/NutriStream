import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const devices = [
  {
    name: 'NeuralSkin Pod',
    tag: 'Biometría continua',
    desc: 'El sensor de piel más avanzado del mercado. Mide temperatura, sudoración, frecuencia cardíaca y parámetros neuromusculares las 24 horas.',
    color: 'brand-cyan',
    specs: ['30+ sensores', '72h batería', 'IP68 waterproof'],
  },
  {
    name: 'GroundTruth Insoles',
    tag: 'Biomecánica del pie',
    desc: 'Plantillas inteligentes que analizan distribución de carga, simetría de pisada y transferencia de potencia en cada paso.',
    color: 'brand-violet',
    specs: ['Presión 256 puntos', 'Tiempo real 1kHz', 'Talla universal'],
  },
  {
    name: 'Racket Sensor',
    tag: 'Análisis de golpeo',
    desc: 'Micro-sensor para raquetas que desglosa velocidad, ángulo de impacto, spin y eficiencia energética en cada golpe.',
    color: 'brand-emerald',
    specs: ['IMU 9 ejes', '<2g peso', 'Todos los deportes'],
  },
  {
    name: 'AeroLung Mask',
    tag: 'Métricas respiratorias',
    desc: 'Máscara de entrenamiento que cuantifica VO2max, resistencia ventilatoria y composición del aire espirado en tiempo real.',
    color: 'brand-rose',
    specs: ['VO₂max directo', 'SpO₂ continuo', 'Compatible iOS/Android'],
  },
]

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  'brand-cyan':    { bg: 'bg-brand-cyan/10',    border: 'border-brand-cyan/25',    text: 'text-brand-cyan',    badge: 'bg-brand-cyan/15 text-brand-cyan' },
  'brand-violet':  { bg: 'bg-brand-violet/10',  border: 'border-brand-violet/25',  text: 'text-brand-violet',  badge: 'bg-brand-violet/15 text-brand-violet' },
  'brand-emerald': { bg: 'bg-brand-emerald/10', border: 'border-brand-emerald/25', text: 'text-brand-emerald', badge: 'bg-brand-emerald/15 text-brand-emerald' },
  'brand-rose':    { bg: 'bg-brand-rose/10',    border: 'border-brand-rose/25',    text: 'text-brand-rose',    badge: 'bg-brand-rose/15 text-brand-rose' },
}

export default function Hardware() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="hardware" className="py-28 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[700px] h-[500px] rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-brand-violet text-sm font-semibold uppercase tracking-widest mb-4">Ecosistema de wearables</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
            Hardware diseñado para<br />
            <span className="text-gradient-cyan">rendimiento extremo.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Cada dispositivo está pensado para deportistas serios. Todos conectados, todos sincronizados en tiempo real con NutriStream.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {devices.map((d, i) => {
            const c = colorMap[d.color]
            return (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: 'easeOut' }}
                className={`glass rounded-2xl p-7 border ${c.border} hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${c.badge} mb-3`}>
                      {d.tag}
                    </span>
                    <h3 className={`font-display font-bold text-xl ${c.text}`}>{d.name}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                    <div className={`w-4 h-4 rounded-full ${c.bg} border-2 ${c.border.replace('/25', '/60')}`} />
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{d.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {d.specs.map((s) => (
                    <span key={s} className="text-xs text-slate-500 bg-white/5 border border-white/8 px-3 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Real Hardware Dashboard Screenshot */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6, duration: 0.8 }} className="mt-20 rounded-2xl border border-brand-violet/20 overflow-hidden shadow-2xl shadow-brand-violet/10 relative group cursor-pointer">
          <img src="/images/dispositivos.png" alt="Centro de Dispositivos" className="w-full h-auto object-cover object-top transform group-hover:scale-[1.02] transition-transform duration-700 ease-out" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-dark-950 to-transparent opacity-90" />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center w-full">
            <p className="text-white font-display font-medium text-lg md:text-xl inline-flex items-center gap-3 bg-dark-950/50 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse"></span> 
              Sincronización Bluetooth Inactiva
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
