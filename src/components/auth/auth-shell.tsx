import Link from 'next/link'

// Marco centrado compartido por las pantallas de auth. Mantiene el estilo del
// resto de la tienda (serif + tokens surface/primary).
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-serif text-2xl font-bold text-on-surface tracking-tight"
          >
            Charcutería Gourmet
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-black/5 p-8">
          <h1 className="font-serif text-2xl font-bold text-on-surface mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}
          {children}
        </div>
      </div>
    </main>
  )
}

// Estilos compartidos para campos y botón, alineados con checkout-modal.
export const authLabelClass =
  'text-[10px] font-bold uppercase tracking-widest text-on-surface'
export const authInputClass =
  'bg-white border-black/10 focus:border-secondary rounded-lg'
export const authButtonClass =
  'w-full h-14 rounded-full bg-primary text-on-primary hover:bg-primary-container transition-all font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg'
