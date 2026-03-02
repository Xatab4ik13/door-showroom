import type { CatalogProduct } from '@/data/catalog';

interface ProductGalleryProps {
  product: CatalogProduct;
}

const ProductGallery = ({ product }: ProductGalleryProps) => {
  return (
    <div className="w-full">
      <div className="rounded-lg overflow-hidden bg-secondary flex items-center justify-center p-6 min-h-[500px]">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-[70vh] w-auto object-contain"
        />
      </div>
      {/* Thumbnail strip — can be expanded later with more images */}
      <div className="flex gap-2 mt-3">
        {[product.image].map((img, i) => (
          <div
            key={i}
            className="w-16 h-20 rounded-md overflow-hidden border-2 border-primary bg-secondary"
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
