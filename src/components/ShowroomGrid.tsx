import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { doors, type Door } from '@/data/doors';
import DoorPreviewModal from './DoorPreviewModal';

// Extend to ~24 items by repeating with variant names
const gridDoors: Door[] = [
  ...doors,
  ...doors.map((d, i) => ({ ...d, id: `dup-${i}`, name: `${d.name} II` })),
];

const ShowroomGrid = () => {
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <>
      <section ref={ref} className="px-6 md:px-12 lg:px-20 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <h2 className="font-serif text-3xl md:text-5xl font-light text-foreground mb-4">
            Showroom
          </h2>
          <p className="text-sm text-muted-foreground tracking-wide max-w-lg">
            Исследуйте нашу коллекцию дверей — каждая модель создана с вниманием к деталям и материалам.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-16">
          {gridDoors.map((door, i) => (
            <motion.div
              key={door.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.8) }}
              className="group cursor-pointer"
              onClick={() => {
                setSelectedDoor(door);
                setIsPreviewOpen(true);
              }}
            >
              <div className="relative overflow-hidden mb-4">
                <img
                  src={door.image}
                  alt={door.name}
                  className="w-full aspect-[3/5] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500 flex items-end p-5">
                  <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-sm font-medium text-foreground">{door.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{door.collection}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <DoorPreviewModal
        door={selectedDoor}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onClosed={() => setSelectedDoor(null)}
      />
    </>
  );
};

export default ShowroomGrid;
