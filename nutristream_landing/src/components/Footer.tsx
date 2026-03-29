
import { Activity, Github, Twitter, Instagram } from 'lucide-react'

const links = {
  Producto: ['Características', 'Hardware', 'Precios', 'Changelog'],
  Empresa: ['Sobre nosotros', 'Blog', 'Prensa', 'Contacto'],
  Legal: ['Privacidad', 'Términos', 'Cookies'],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-cyan/20 to-brand-violet/20 border border-brand-cyan/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-brand-cyan" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Nutri<span className="text-gradient-cyan">Stream</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              El sistema operativo del atleta de alto rendimiento.
            </p>
            <div className="flex gap-3">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:border-white/15 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <p className="text-white font-semibold text-sm mb-4">{section}</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-500 text-sm hover:text-white transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600 text-xs">
          <p>© {new Date().getFullYear()} NutriStream. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con <span className="text-brand-rose">♥</span> para atletas que no se conforman.
          </p>
        </div>
      </div>
    </footer>
  )
}
