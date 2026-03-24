import bishoftu from "@/assets/resort-bishoftu.jpg";
import entoto from "@/assets/resort-entoto.jpg";
import tana from "@/assets/resort-tana.jpg";
import africanVillage from "@/assets/resort-african-village.jpg";

const resorts = [
  {
    image: bishoftu,
    label: "BISHOFTU",
    name: "Kuriftu Resort & Spa",
    description: "Nestled on the shores of Lake Bishoftu, a serene escape featuring world-class dining and breathtaking crater lake views.",
  },
  {
    image: tana,
    label: "LAKE TANA",
    name: "Kuriftu Resort Lake Tana",
    description: "Discover the source of the Blue Nile with luxury villas perched above Ethiopia's largest lake.",
  },
  {
    image: entoto,
    label: "ENTOTO PARK, ADDIS ABABA",
    name: "Entoto Park",
    description: "High in the eucalyptus forests above Addis Ababa, an adventure retreat blending nature with luxury.",
  },
  {
    image: africanVillage,
    label: "SHAGGAR CITY",
    name: "African Village",
    description: "A cultural immersion experience celebrating the rich heritage of Ethiopia through authentic village life.",
  },
];

const FeaturedResorts = () => {
  return (
    <section id="resorts" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <p className="section-label mb-4">Resorts</p>
        <h2 className="section-heading mb-6">Extraordinary Destinations</h2>
        <p className="font-body text-muted-foreground max-w-xl mb-16 leading-relaxed">
          Immerse yourself in the breathtaking beauty of Ethiopia's landscapes, where nature's splendor meets the elegance of world-class hospitality.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {resorts.map((resort) => (
            <div key={resort.name} className="group cursor-pointer">
              <div className="aspect-[4/3] overflow-hidden mb-5">
                <img
                  src={resort.image}
                  alt={resort.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="section-label mb-2">{resort.label}</p>
              <h3 className="font-display text-xl font-normal mb-3">{resort.name}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                {resort.description}
              </p>
              <a href="#" className="underline-link">Explore</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedResorts;
