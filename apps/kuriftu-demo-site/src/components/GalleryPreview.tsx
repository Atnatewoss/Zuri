import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import bishoftu from "@/assets/resort-bishoftu.jpg";
import tana from "@/assets/resort-tana.jpg";
import coffee from "@/assets/exp-coffee.jpg";

const images = [hero1, bishoftu, hero2, coffee, tana, hero3];

const GalleryPreview = () => {
  return (
    <section id="gallery" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <p className="section-label mb-4">Gallery</p>
        <h2 className="section-heading mb-16">Moments at Kuriftu</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {images.map((img, i) => (
            <div
              key={i}
              className={`overflow-hidden cursor-pointer group ${
                i === 0 ? "row-span-2" : ""
              }`}
            >
              <img
                src={img}
                alt={`Kuriftu gallery ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview;
