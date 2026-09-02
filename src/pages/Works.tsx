import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageSEO from '@/components/PageSEO';
import { fetchContent } from '@/lib/api';

interface Block { title: string; text: string; images: string[]; }
interface PageData { title: string; subtitle: string; blocks: Block[]; }

const Works = () => {
  const [data, setData] = useState<PageData>({ title: 'Наши двери и работы', subtitle: 'Фото с наших объектов и монтажей', blocks: [] });

  useEffect(() => {
    fetchContent<PageData>('page_works').then((d) => { if (d) setData((prev) => ({ ...prev, ...d, blocks: d.blocks || [] })); });
  }, []);

  const allImages = data.blocks.flatMap((b) => b.images || []);

  return (
    <>
      <PageSEO
        title="Наши двери и работы — фото монтажей RUSDOORS"
        description="Портфолио RUSDOORS: фотографии установленных межкомнатных и входных дверей на объектах в Москве и Московской области."
        canonical="https://rusdoors.su/works"
      />
      <main>
        <section className="pt-32 md:pt-40 pb-10 md:pb-14 px-4 md:px-8 lg:px-12">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide text-foreground"
              style={{ fontFamily: "'Oswald', sans-serif" }}>
              {data.title}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {data.subtitle}
            </p>
          </div>
        </section>

        <section className="pb-24 px-4 md:px-8 lg:px-12">
          <div className="max-w-[1600px] mx-auto space-y-14">
            {data.blocks.length === 0 && (
              <p className="text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Фотографии работ скоро появятся.
              </p>
            )}

            {data.blocks.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5 }} className="space-y-5">
                {b.title && (
                  <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    {b.title}
                  </h2>
                )}
                {b.text && (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line max-w-3xl" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {b.text}
                  </p>
                )}
                {(b.images || []).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {b.images.map((img, ii) => (
                      <div key={ii} className="aspect-[4/5] rounded-xl overflow-hidden bg-secondary">
                        <img src={img} alt={b.title || 'Монтаж дверей RUSDOORS'} loading="lazy"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      {allImages.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: data.title,
          image: allImages.slice(0, 20),
        }) }} />
      )}
    </>
  );
};

export default Works;
