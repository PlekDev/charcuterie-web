import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

const menuSections = [
    {
        title: 'Quesos Maduros',
        items: [
            {
                name: 'Queso Manchego Curado',
                price: 220,
                description: 'Madurado durante varios meses para obtener un sabor intenso y textura firme.'
            },
            {
                name: 'Parmesano Importado',
                price: 280,
                description: 'Ideal para tablas gourmet y acompañamientos especiales.'
            },
            {
                name: 'Gouda Añejo',
                price: 240,
                description: 'Queso de sabor profundo con notas ligeramente dulces.'
            }
        ]
    },

    {
        title: 'Quesos Suaves',
        items: [
            {
                name: 'Brie Francés',
                price: 260,
                description: 'Textura cremosa y sabor delicado.'
            },
            {
                name: 'Camembert',
                price: 250,
                description: 'Perfecto para reuniones y tablas gourmet.'
            },
            {
                name: 'Queso de Cabra',
                price: 190,
                description: 'Sabor fresco y ligeramente ácido.'
            }
        ]
    },

    {
        title: 'Especialidades',
        items: [
            {
                name: 'Tabla Gourmet Premium',
                price: 650,
                description: 'Selección de quesos, embutidos y acompañamientos.'
            },
            {
                name: 'Tabla Mediterránea',
                price: 720,
                description: 'Inspirada en sabores europeos tradicionales.'
            },
            {
                name: 'Tabla para Eventos',
                price: 950,
                description: 'Ideal para reuniones y celebraciones.'
            }
        ]
    }
]

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-casita-cream flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col items-center text-center gap-6 mb-20">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-casita-terracotta">Quesos Artesanales</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-serif font-bold text-casita-charcoal italic">Quesos Artesanales</h1>
           <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed italic">
               Selección de quesos nacionales e importados cuidadosamente elegidos para nuestros clientes.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
           {menuSections.map((section) => (
             <div key={section.title} className="flex flex-col gap-10">
                <h2 className="text-3xl font-serif font-bold text-casita-olive border-b border-casita-olive/10 pb-4 italic">
                   {section.title}
                </h2>
                <div className="flex flex-col gap-8">
                   {section.items.map((item) => (
                      <div key={item.name} className="flex flex-col gap-2">
                         <div className="flex justify-between items-baseline gap-4">
                            <h3 className="text-xl font-serif font-bold text-casita-charcoal">{item.name}</h3>
                            <div className="flex-1 border-b border-dotted border-black/20" />
                            <span className="font-bold text-casita-terracotta">${item.price}</span>
                         </div>
                         <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.description}
                         </p>
                      </div>
                   ))}
                </div>
             </div>
           ))}
        </div>

        <div className="mt-32 p-12 bg-white rounded-none border border-black/5 shadow-sm flex flex-col items-center text-center gap-8">
           <div className="flex flex-col gap-2">
              <h3 className="text-3xl font-serif font-bold text-casita-charcoal">¿Buscas una recomendación personalizada?</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                  Te ayudamos a seleccionar los mejores quesos y acompañamientos para cualquier ocasión.
              </p>
           </div>
           <Link href="/market">
              <Button className="rounded-full h-14 px-12 bg-casita-charcoal hover:bg-casita-olive transition-all font-bold uppercase tracking-widest text-[10px]">
                  Ver Catálogo
              </Button>
           </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
