import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Menu, X } from 'lucide-react'

const links = [
  { label: 'Características', href: '#features' },
  { label: 'Hardware', href: '#hardware' },
  { label: 'Lista de Espera', href: '#waitlist' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass border-b border-white/5 py-3' : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan/20 to-brand-violet/20 border border-brand-cyan/30 group-hover:glow-cyan transition-all duration-300">
            <Activity className="w-5 h-5 text-brand-cyan" />
            <div className="absolute inset-0 rounded-xl bg-brand-cyan/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Nutri<span className="text-gradient-cyan">Stream</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#waitlist"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-dark-950 font-semibold text-sm hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-brand-cyan/20"
        >
          Únete a la lista
        </a>

        {/* Mobile menu icon */}
        <button
          className="md:hidden text-slate-300 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass border-t border-white/5 mt-3 px-6 py-4 flex flex-col gap-4"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#waitlist"
              onClick={() => setOpen(false)}
              className="mt-2 text-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-dark-950 font-semibold text-sm"
            >
              Únete a la lista
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
