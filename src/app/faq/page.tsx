'use client'

import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Search, Mail, Phone, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

const faqs = [
    {
        category: 'Productos',
        questions: [
            {
                q: '¿Cómo debo conservar los quesos?',
                a: 'Recomendamos mantenerlos refrigerados entre 2°C y 6°C y almacenarlos en recipientes adecuados para conservar su sabor y textura.'
            },
            {
                q: '¿Los productos son frescos?',
                a: 'Sí. Trabajamos con proveedores seleccionados y realizamos controles de calidad para garantizar la frescura de nuestros productos.'
            },
            {
                q: '¿Puedo solicitar una tabla personalizada?',
                a: 'Sí. Ofrecemos tablas gourmet personalizadas para reuniones, eventos y celebraciones especiales.'
            }
        ]
    },

    {
        category: 'Pagos',
        questions: [
            {
                q: '¿Cómo puedo pagar mi pedido?',
                a: 'Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, American Express), así como pagos a través de nuestra plataforma segura. También puedes optar por transferencia bancaria si lo prefieres.'
            },
            {
                q: 'Si selecciono la opción de pickup, ¿puedo pagar en persona?',
                a: 'Por el momento, todos los pedidos deben ser liquidados a través de la plataforma para garantizar la reserva de tus productos.'
            },
            {
                q: '¿Por qué mi pedido no ha sido confirmado completamente?',
                a: 'Algunos productos artesanales tienen disponibilidad limitada. Si un artículo no está disponible, te contactaremos para ofrecer alternativas o realizar el reembolso correspondiente.'
            }
        ]
    },

    {
        category: 'Envíos y Reembolsos',
        questions: [
            {
                q: '¿Cuánto tiempo tardará en llegar mi orden?',
                a: 'Los pedidos locales suelen entregarse en un plazo de 24 a 48 horas hábiles.'
            },
            {
                q: '¿Cuál es el costo de envío?',
                a: 'El costo de envío se calcula automáticamente al finalizar tu compra según tu ubicación.'
            },
            {
                q: '¿Puedo cambiar mi pedido a modalidad pickup?',
                a: 'Sí, siempre que el pedido aún no haya sido despachado.'
            }
        ]
    }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-6 mb-20">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Centro de Ayuda</span>
           </div>
           <h1 className="text-5xl md:text-6xl font-serif font-bold text-on-surface">Preguntas Frecuentes</h1>
           <p className="text-muted-foreground text-sm max-w-lg mt-2">
               Todo lo que necesitas saber sobre nuestros productos, envíos y pedidos.
           </p>

           <div className="relative w-full max-w-2xl group mt-8">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
              <input
                type="text"
                placeholder="Buscar preguntas frecuentes"
                className="w-full pl-14 pr-8 py-5 bg-white border border-black/5 rounded-none text-base focus:outline-none focus:ring-1 focus:ring-secondary transition-all shadow-sm"
              />
           </div>
        </div>

        {/* FAQ Content */}
        <div className="flex flex-col gap-16">
           {faqs.map((section) => (
              <div key={section.category} className="flex flex-col gap-6">
                 <h2 className="text-2xl font-serif font-bold text-primary mb-4">
                    {section.category}
                 </h2>
                 <Accordion type="single" collapsible className="w-full">
                    {section.questions.map((faq, index) => (
                       <AccordionItem key={index} value={`${section.category}-${index}`} className="border-b border-black/10">
                          <AccordionTrigger className="text-left font-serif font-medium text-xl hover:text-secondary transition-colors py-8">
                             {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-lg leading-relaxed pb-8">
                             {faq.a}
                          </AccordionContent>
                       </AccordionItem>
                    ))}
                 </Accordion>
              </div>
           ))}
        </div>

        {/* Contact Section */}
        <div className="mt-32 p-12 bg-white rounded-none border border-black/5 shadow-sm flex flex-col items-center text-center gap-8 relative overflow-hidden">
           <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <MessageSquare className="h-8 w-8" />
           </div>

           <div className="flex flex-col gap-2">
              <h3 className="text-3xl font-serif font-bold text-on-surface">¿Aún tienes dudas?</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                  Nuestro equipo está listo para ayudarte a elegir los mejores productos para tu ocasión especial.
              </p>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button className="rounded-full h-12 px-8 bg-on-surface hover:bg-primary transition-all font-bold uppercase tracking-widest text-[10px] gap-2">
                 <Mail className="h-4 w-4" /> Envíanos un correo
              </Button>
              <Button variant="outline" className="rounded-full h-12 px-8 border-black/10 font-bold uppercase tracking-widest text-[10px] gap-2">
                 <Phone className="h-4 w-4" /> Llámanos ahora
              </Button>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
