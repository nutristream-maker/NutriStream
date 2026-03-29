
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'

const stats = [
  { value: '98%', label: 'Precisión biométrica' },
  { value: '<1ms', label: 'Latencia del sensor' },
  { value: '6+ h', label: 'Batería wearable' },
]

// Animated floating biometric card
function BiometricCard({ label, value, unit, color, delay }: {
  label: string; value: string; unit: string; color: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: 'easeOut' }}
      style={{ animationDelay: `${delay}s` }}
      className="glass rounded-2xl p-4 flex flex-col gap-1 min-w-[140px] animate-float"
    >
      <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{label}</p>
      <p className={`font-display font-bold text-2xl ${color}`}>
        {value}<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
      </p>
      <div className="h-1 rounded-full bg-white/5 mt-1 overflow-hidden">
        <div className={`h-full rounded-full w-3/4 bg-gradient-to-r ${color.includes('cyan') ? 'from-brand-cyan to-brand-violet' : 'from-brand-violet to-brand-rose'}`} />
      </div>
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg pt-24 pb-16">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-violet/8 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-brand-cyan/20 text-brand-cyan text-xs font-semibold uppercase tracking-widest"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
          Próximamente · 2025
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="font-display font-black text-5xl sm:text-6xl md:text-7xl xl:text-8xl leading-none tracking-tight mb-6"
        >
          Tu cuerpo,{' '}
          <span className="block text-gradient-cyan">optimizado por IA.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed mb-10"
        >
          NutriStream fusiona sensores avanzados, análisis biométrico en tiempo real e inteligencia artificial 
          para llevar tu rendimiento físico al siguiente nivel. Una plataforma. Un ecosistema completo.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <a
            href="#waitlist"
            className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-cyan to-brand-violet text-dark-950 font-bold text-base glow-cyan hover:opacity-90 transition-all duration-300"
          >
            Únete a la lista de espera
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </a>
          <a
            href="#features"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass text-slate-300 font-medium text-base hover:text-white hover:border-white/15 transition-all duration-300"
          >
            Ver características
          </a>
        </motion.div>

        {/* Floating biometric cards */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <BiometricCard label="Recuperación" value="87" unit="%" color="text-brand-cyan" delay={0.6} />
          <BiometricCard label="Ritmo cardíaco" value="62" unit="bpm" color="text-brand-violet" delay={0.75} />
          <BiometricCard label="HRV" value="94" unit="ms" color="text-brand-emerald" delay={0.9} />
          <BiometricCard label="Strain" value="12.4" unit="" color="text-brand-violet" delay={1.05} />
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-10 mb-20"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display font-bold text-3xl text-gradient-cyan">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Real App Screenshot Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="relative w-full max-w-5xl mx-auto rounded-xl sm:rounded-2xl border border-white/10 glass overflow-hidden shadow-2xl shadow-brand-cyan/20 group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent z-10 opacity-60"></div>
          <img 
            src="/images/dashboard.png" 
            alt="NutriStream Dashboard Interface" 
            className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
          />
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 flex flex-col items-center gap-1"
      >
        <span className="text-xs tracking-widest uppercase">Descubre más</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </motion.div>
    </section>
  )
}
