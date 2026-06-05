import Link from 'next/link'
import { Globe, Mail } from 'lucide-react'

// Pie de página común a toda la tienda: marca, enlaces y redes.
export function Footer() {
  return (
      <footer className="w-full mt-auto bg-surface-container-low border-t border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-12 max-w-7xl mx-auto w-full gap-8">

          <div className="flex flex-col items-center md:items-start">
          <span className="font-headline font-bold text-xl text-primary">
            Charcutería Gourmet
          </span>

            <p className="font-body uppercase text-[10px] tracking-widest text-on-surface-variant/60">
              © {new Date().getFullYear()} Charcutería Gourmet. Calidad artesanal.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 font-label uppercase text-[10px] tracking-widest text-on-surface-variant/60">
            <Link href="#" className="hover:text-primary transition-colors">
              Nosotros
            </Link>

            <Link href="#" className="hover:text-primary transition-colors">
              Productos
            </Link>

            <Link href="#" className="hover:text-primary transition-colors">
              Contacto
            </Link>

            <Link href="#" className="hover:text-primary transition-colors">
              Aviso de Privacidad
            </Link>
          </div>

          <div className="flex gap-4">
            <a href="#" className="p-2 text-on-surface-variant/60 hover:text-primary transition-colors">
              <Globe className="w-4 h-4" />
            </a>

            <a href="#" className="p-2 text-on-surface-variant/60 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>

        </div>
      </footer>
  )
}