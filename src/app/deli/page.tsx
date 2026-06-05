import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const deliCategories = [
  {
    title: 'Nuestros Quesos',
    description: 'Selección premium de quesos nacionales e importados, desde un cremoso Brie hasta un robusto Manchego curado.',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800',
    count: '45+ Variedades'
  },
  {
    title: 'Charcutería',
    description: 'Cortes artesanales, jamón serrano de bellota, prosciuttos y embutidos curados con la mejor tradición europea.',
    image: 'https://images.unsplash.com/photo-1544073827-30452c24f9d6?auto=format&fit=crop&q=80&w=800',
    count: '30+ Productos'
  },
  {
      title: 'Tablas Gourmet',
      description: 'Combinaciones de quesos, embutidos y acompañamientos ideales para reuniones y eventos especiales.',
      image: '',
      count: '25+ Opciones'
  },
  {
    title: 'Especialidades Artesanales',
    description: 'Aceites de oliva, pastas artesanales, conservas y especias que no pueden faltar en una cocina de autor.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacabc88c5?auto=format&fit=crop&q=80&w=800',
    count: '120+ Artículos'
  }
]

export default function DeliPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center gap-6 mb-20">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Selección Gourmet</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-serif font-bold text-on-surface">Jamones y Embutidos</h1>
           <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed italic mt-4">
               Descubre nuestra selección de jamones, embutidos y especialidades gourmet cuidadosamente seleccionadas.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           {deliCategories.map((category) => (
              <div key={category.title} className="group flex flex-col gap-6 p-8 bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 rounded-none relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                       {category.count}
                    </span>
                 </div>
                 <h2 className="text-3xl font-serif font-bold text-on-surface group-hover:text-secondary transition-colors">
                    {category.title}
                 </h2>
                 <p className="text-muted-foreground leading-relaxed max-w-md">
                    {category.description}
                 </p>
                 <Link href="/market" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface group-hover:gap-4 transition-all">
                    Ver productos <ChevronRight className="h-4 w-4" />
                 </Link>
              </div>
           ))}
        </div>

        <div className="mt-32 grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 relative aspect-[21/9] bg-primary overflow-hidden flex items-center p-12">
              <div className="relative z-10 flex flex-col gap-4 text-white max-w-md">
                 <h3 className="text-4xl font-serif font-bold italic">Tablas Personalizadas</h3>
                 <p className="text-white/80 leading-relaxed italic">
                    Diseñamos la combinación perfecta para tus eventos, entregadas listas para disfrutar.
                 </p>
                 <Button className="w-fit mt-4 bg-white text-primary hover:bg-surface rounded-full px-8 font-bold uppercase tracking-widest text-[10px]">
                    Cotizar Ahora
                 </Button>
              </div>
              <div className="absolute inset-0 bg-black/20" />
           </div>
           <div className="bg-secondary p-12 flex flex-col justify-center gap-6 text-white">
              <h3 className="text-3xl font-serif font-bold">Club Gourmet</h3>
              <p className="text-white/80 text-sm leading-relaxed italic">
                  Recibe mensualmente una selección exclusiva de quesos, embutidos y productos gourmet seleccionados por nuestros expertos.
              </p>
              <Button variant="outline" className="w-fit border-white text-white hover:bg-white hover:text-secondary rounded-full px-8 font-bold uppercase tracking-widest text-[10px]">
                 Unirme al Club
              </Button>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
