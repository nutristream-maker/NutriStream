import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

export default function Waitlist() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) { setStatus('error'); return }
    setStatus('loading')
    // Simulate async submission
    setTimeout(() => setStatus('success'), 1500)
  }

  return (
    <section id="waitlist" className="py-28 relative">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[500px] bg-gradient-to-r from-brand-cyan/8 via-brand-violet/8 to-brand-rose/8 blur-[80px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="text-brand-cyan text-sm font-semibold uppercase tracking-widest mb-4">Acceso anticipado</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
            Sé el primero en<br />
            <span className="text-gradient-cyan">experimentarlo.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Regístrate ahora y obtén acceso prioritario, precio especial de lanzamiento y comunicaciones exclusivas del equipo fundador de NutriStream.
          </p>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass border border-brand-emerald/30 rounded-2xl p-8 flex flex-col items-center gap-3"
            >
              <CheckCircle2 className="w-12 h-12 text-brand-emerald" />
              <p className="font-display font-bold text-xl text-white">¡Ya estás en la lista!</p>
              <p className="text-slate-400 text-sm">Te avisaremos en cuanto NutriStream esté disponible.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
                placeholder="tucorreo@ejemplo.com"
                className={`flex-1 glass rounded-xl px-5 py-4 text-white placeholder-slate-600 text-sm outline-none border transition-all duration-200 focus:border-brand-cyan/50 focus:glow-cyan ${
                  status === 'error' ? 'border-brand-rose/50' : 'border-white/8'
                }`}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-dark-950 font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all duration-200 glow-cyan shrink-0"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Únete ahora
                  </>
                )}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 text-brand-rose text-xs">Por favor, introduce un correo electrónico válido.</p>
          )}

          <p className="text-xs text-slate-600 mt-4">
            Sin spam. Sin compromisos. Solo NutriStream cuando esté listo.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
