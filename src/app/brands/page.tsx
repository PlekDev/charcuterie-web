import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Lista estática de proveedores/marcas que se muestran en la página
// "Nosotros". Cada uno enlaza al market filtrado por su nombre.
const brands = [
    {
        name: 'Quesos Selectos de Jalisco',
        origin: 'México',
        description: 'Productores especializados en quesos artesanales elaborados con procesos tradicionales.',
        tag: 'Quesos'
    },
    {
        name: 'Ibéricos Premium',
        origin: 'España',
        description: 'Distribuidores de jamones y embutidos seleccionados de origen español.',
        tag: 'Charcutería'
    },
    {
        name: 'Mediterranean Foods',
        origin: 'Italia',
        description: 'Importadores de productos gourmet y especialidades mediterráneas.',
        tag: 'Importación'
    },
    {
        name: 'Delicias Artesanales',
        origin: 'México',
        description: 'Especialistas en acompañamientos, mermeladas y productos para tablas gourmet.',
        tag: 'Complementos'
    },
    {
        name: 'European Selection',
        origin: 'Francia',
        description: 'Selección de quesos y productos premium de origen europeo.',
        tag: 'Quesos Premium'
    },
    {
        name: 'Reserva Gourmet',
        origin: 'España',
        description: 'Productos artesanales cuidadosamente seleccionados para eventos y ocasiones especiales.',
        tag: 'Especialidades'
    }
]

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center gap-6 mb-20">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Nuestros Provedores</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-serif font-bold text-on-surface">Provedores Seleccionados</h1>
           <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed italic mt-4">
               Trabajamos con productores y distribuidores especializados para ofrecer productos gourmet de la más alta calidad.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {brands.map((brand) => (
              <div key={brand.name} className="p-10 bg-white border border-black/5 flex flex-col gap-6 hover:border-secondary/20 transition-all group">
                 <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{brand.origin}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">{brand.tag}</span>
                 </div>
                 <h2 className="text-4xl font-serif font-bold text-on-surface group-hover:text-secondary transition-colors">{brand.name}</h2>
                 <p className="text-sm text-muted-foreground leading-relaxed italic">
                    {brand.description}
                 </p>
                 <div className="mt-auto pt-6 border-t border-black/5">
                    <Link href={`/market?search=${brand.name}`} className="text-[10px] font-bold uppercase tracking-widest text-on-surface hover:text-secondary transition-colors">
                       Explorar Productos
                    </Link>
                 </div>
              </div>
           ))}
        </div>

        <div className="mt-32 p-16 bg-on-surface text-white text-center flex flex-col items-center gap-8">
           <h2 className="text-4xl font-serif font-bold italic">¿Quieres ser proveedor?</h2>
           <p className="text-white/60 max-w-lg leading-relaxed italic">
               Buscamos proveedores comprometidos con la calidad y la excelencia gastronómica.
           </p>
           <Button className="rounded-full bg-white text-on-surface hover:bg-surface px-12 h-14 font-bold uppercase tracking-widest text-[10px]">
               Solicitar Información
           </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
