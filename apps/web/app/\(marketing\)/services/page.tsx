import Link from "next/link";
import { fetchJson } from "@/app/lib/api";

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  priceNote?: string;
  unit?: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  services: Service[];
}

function formatPrice(price: number): string {
  return String(Math.round(price)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default async function ServicesPage() {
  const categories = await fetchJson<ServiceCategory[]>("/services/categories", {}, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Наши услуги</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Полный спектр услуг по ремонту и обслуживанию автомобилей
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id} id={category.slug} className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h2>

              <div className="space-y-3 mb-6">
                {category.services.map((service) => (
                  <div key={service.id} className="flex justify-between items-start border-b border-gray-200 pb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      )}
                    </div>
                    <p className="text-orange-600 font-bold whitespace-nowrap ml-4">
                      {service.price ? `${formatPrice(service.price)} руб.${service.unit ? '/' + service.unit : ''}` : service.priceNote || 'по запросу'}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/#contact"
                className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                Записаться
              </Link>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center text-gray-600">
            <p>Услуги загружаются...</p>
          </div>
        )}
      </div>
    </div>
  );
}
