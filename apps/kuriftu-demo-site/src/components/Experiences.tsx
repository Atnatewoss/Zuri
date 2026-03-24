import coffee from "@/assets/exp-coffee.jpg";
import spa from "@/assets/exp-spa.jpg";
import waterpark from "@/assets/exp-waterpark.jpg";
import events from "@/assets/exp-events.jpg";

const experiences = [
  {
    image: coffee,
    label: "CULTURE",
    name: "Coffee Ceremony",
    description: "Experience Ethiopia's ancient coffee ritual, a sensory journey through aromatic traditions.",
  },
  {
    image: spa,
    label: "WELLNESS",
    name: "Spa & Relaxation",
    description: "Indulge in holistic treatments using indigenous ingredients in our tranquil spa sanctuaries.",
  },
  {
    image: waterpark,
    label: "ADVENTURE",
    name: "Water Park",
    description: "Thrilling rides and family fun at East Africa's premier water park destination.",
  },
  {
    image: events,
    label: "CELEBRATIONS",
    name: "Events & Weddings",
    description: "Celebrate life's most cherished moments in unparalleled luxury with stunning lakeside backdrops.",
  },
];

const Experiences = () => {
  return (
    <section id="experiences" className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-6">
        <p className="section-label mb-4">Experiences</p>
        <h2 className="section-heading mb-6">Thrills, Nature, and Memories</h2>
        <p className="font-body text-muted-foreground max-w-xl mb-16 leading-relaxed">
          Indulge in an exquisite collection of curated experiences designed to awaken your senses.
        </p>

        <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
          {experiences.map((exp) => (
            <div
              key={exp.name}
              className="min-w-[280px] md:min-w-[320px] snap-start group cursor-pointer flex-shrink-0"
            >
              <div className="aspect-square overflow-hidden mb-5">
                <img
                  src={exp.image}
                  alt={exp.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="section-label mb-2">{exp.label}</p>
              <h3 className="font-display text-xl font-normal mb-2">{exp.name}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experiences;
