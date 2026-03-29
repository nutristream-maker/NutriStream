import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Brain, Activity, Utensils, Users, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: Activity,
    title: 'Biometría en Tiempo Real',
    desc: 'Monitorización continua de 30+ métricas: HRV, saturación O₂, recuperación muscular y carga de entrenamiento. Sin lagunas.',
    color: 'from-brand-cyan/20 to-brand-cyan/5',
    border: 'border-brand-cyan/20',
    iconColor: 'text-brand-cyan',
    glow: 'group-hover:glow-cyan',
  },
  {
    icon: Brain,
    title: 'Motor IA Deportivo',
    desc: 'El núcleo de NutriStream analiza tus datos históricos y predice fatiga, riesgo de lesión y ventanas óptimas de entrenamiento.',
    color: 'from-brand-violet/20 to-brand-violet/5',
    border: 'border-brand-violet/20',
    iconColor: 'text-brand-violet',
    glow: 'group-hover:glow-violet',
  },
  {
    icon: Utensils,
    title: 'Chef AI — Nutrición Adaptativa',
    desc: 'Planes nutricionales generados por IA y ajustados diariamente según tu carga de entrenamiento, sueño y objetivos personales.',
    color: 'from-brand-emerald/20 to-brand-emerald/5',
    border: 'border-brand-emerald/20',
    iconColor: 'text-brand-emerald',
    glow: '',
  },
  {
    icon: Shield,
    title: 'Análisis Corporal y Lesiones',
    desc: 'Mapas musculares interactivos que visualizan fatiga por zonas y permiten registrar y dar seguimiento a lesiones en tiempo real.',
    color: 'from-brand-rose/20 to-brand-rose/5',
    border: 'border-brand-rose/20',
    iconColor: 'text-brand-rose',
    glow: '',
  },
  {
    icon: Zap,
    title: 'Análisis de Técnica Deportiva',
    desc: 'La IA procesa datos vectoriales de tus wearables para corregir postura, detectar asimetrías y mejorar tu biomecánica.',
    color: 'from-brand-cyan/15 to-brand-violet/10',
    border: 'border-brand-cyan/15',
    iconColor: 'text-brand-cyan',
    glow: 'group-hover:glow-cyan',
  },
  {
    icon: Users,
    title: 'Nexus — Red Social de Rendimiento',
    desc: 'Conecta con atletas de élite, sube tus métricas, únete a clubes y accede al marketplace de especialistas certificados.',
    color: 'from-brand-violet/15 to-brand-rose/10',
    border: 'border-brand-violet/15',
    iconColor: 'text-brand-violet',
    glow: 'group-hover:glow-violet',
  },
]

function FeatureCard({ f, index }: { f: typeof features[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.7, ease: 'easeOut' }}
      className={`group relative glass rounded-2xl p-6 border ${f.border} bg-gradient-to-br ${f.color} cursor-default transition-all duration-300 hover:-translate-y-1 ${f.glow}`}
    >
      <div className={`w-11 h-11 rounded-xl bg-dark-800 flex items-center justify-center mb-4 border ${f.border}`}>
        <f.icon className={`w-5 h-5 ${f.iconColor}`} />
      </div>
      <h3 className="font-display font-bold text-lg text-white mb-2">{f.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
    </motion.div>
  )
}

export default function Features() {
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true })

  return (
    <section id="features" className="py-28 relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-brand-violet/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-brand-cyan text-sm font-semibold uppercase tracking-widest mb-4">El sistema operativo del atleta</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
            Todo lo que necesitas,<br />
            <span className="text-gradient-violet">en un solo lugar.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Desde tus músculos hasta tus platos. NutriStream conecta los puntos entre hardware, datos e inteligencia artificial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => <FeatureCard key={f.title} f={f} index={i} />)}
        </div>

        {/* Real App Screenshots Showcase */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={titleInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.4, duration: 0.8 }} className="rounded-2xl border border-brand-emerald/20 overflow-hidden shadow-2xl shadow-brand-emerald/5 relative group cursor-pointer aspect-video bg-dark-800 flex items-center justify-center">
            <img src="/images/chef.png" alt="Chef AI" className="w-full h-full object-cover object-top transform group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-dark-950 via-dark-950/80 to-transparent opacity-90" />
            <div className="absolute bottom-6 left-6">
              <span className="text-xs font-semibold px-3 py-1 bg-brand-emerald/20 text-brand-emerald rounded-full mb-2 inline-block">Nutrición</span>
              <p className="text-white font-display font-bold text-2xl">Chef AI Integrado</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 30 }} animate={titleInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.5, duration: 0.8 }} className="rounded-2xl border border-brand-rose/20 overflow-hidden shadow-2xl shadow-brand-rose/5 relative group cursor-pointer aspect-video bg-dark-800 flex items-center justify-center">
            <img src="/images/cuerpo.png" alt="Análisis Corporal" className="w-full h-full object-cover object-left-top transform group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-dark-950 via-dark-950/80 to-transparent opacity-90" />
            <div className="absolute bottom-6 left-6">
              <span className="text-xs font-semibold px-3 py-1 bg-brand-rose/20 text-brand-rose rounded-full mb-2 inline-block">Prevención</span>
              <p className="text-white font-display font-bold text-2xl">Mapa Muscular Interactivo</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
