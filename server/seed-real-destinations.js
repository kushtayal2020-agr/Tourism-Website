// ============================================================
// seed-real-destinations.js
// Syncs the rich website destinations, packages, hotels, & experiences into MySQL
// ============================================================
const db = require('./db');

const REAL_DESTINATIONS = [
  {
    id: 5,
    name: "Santorini",
    country: "Greece",
    rating: 4.9,
    price: 1240.00,
    description: "Santorini is the crown jewel of the Aegean Sea, world-renowned for its white-washed cliffside villages, dramatic volcanic caldera views, and sapphire blue domes.",
    packages: [
      { name: "Santorini Romantic Getaway", duration: 6, price: 1890.00, style: "Honeymoon", rating: 4.9 },
      { name: "Aegean Luxury & Wine Experience", duration: 4, price: 1350.00, style: "Luxury", rating: 4.8 }
    ],
    hotels: [
      { name: "Canaves Oia Suites", stars: 5.0, price: 680.00, amenities: "Infinity Pool, Caldera View, Spa & Wellness, Free Breakfast" },
      { name: "Grace Hotel Santorini", stars: 5.0, price: 820.00, amenities: "Fine Dining, Private Plunge Pool, 24/7 Butler, Helipad" }
    ],
    experiences: [
      { title: "Sunset Catamaran Cruise along Caldera", category: "Water", duration: 5, price: 180.00, rating: 4.9 },
      { title: "Private Assyrtiko Wine Tasting Tour", category: "Culinary", duration: 4, price: 140.00, rating: 4.8 }
    ]
  },
  {
    id: 6,
    name: "Bali",
    country: "Indonesia",
    rating: 4.8,
    price: 890.00,
    description: "Known as the Island of the Gods, Bali captivates with lush tropical rainforests, ancient sea temples, terraced rice paddies in Ubud, and golden surf beaches in Uluwatu.",
    packages: [
      { name: "Bali Tropical Honeymoon & Spa", duration: 7, price: 1420.00, style: "Honeymoon", rating: 4.9 },
      { name: "Ubud Culture & Volcano Trek", duration: 5, price: 920.00, style: "Adventure", rating: 4.7 }
    ],
    hotels: [
      { name: "Viceroy Bali Ubud", stars: 5.0, price: 490.00, amenities: "Private Pool Villa, Jungle Spa, Helipad, Fine Dining" },
      { name: "Alila Villas Uluwatu", stars: 5.0, price: 620.00, amenities: "Cliffside Pool, Ocean View, Personal Concierge, Yoga Pavilion" }
    ],
    experiences: [
      { title: "Mount Batur Sunrise Volcano Trek", category: "Adventure", duration: 6, price: 85.00, rating: 4.8 },
      { title: "Tirta Empul Holy Water Temple Blessing", category: "Culture", duration: 3, price: 60.00, rating: 4.7 }
    ]
  },
  {
    id: 7,
    name: "Kyoto",
    country: "Japan",
    rating: 4.9,
    price: 1050.00,
    description: "Ancient temples, bamboo groves, and tranquil Zen gardens in Japan's historic capital. Experience geisha tea ceremonies, traditional ryokans, and seasonal cherry blossoms.",
    packages: [
      { name: "Kyoto Heritage & Zen Retreat", duration: 6, price: 1680.00, style: "Culture", rating: 4.9 },
      { name: "Japan Golden Route (Tokyo & Kyoto)", duration: 8, price: 2350.00, style: "Luxury", rating: 4.8 }
    ],
    hotels: [
      { name: "The Ritz-Carlton Kyoto", stars: 5.0, price: 750.00, amenities: "River View, Michelin Dining, Spa, Bonsai Garden" },
      { name: "Hoshinoya Kyoto", stars: 5.0, price: 690.00, amenities: "Riverside Boat Arrival, Kaiseki Dining, Tea House" }
    ],
    experiences: [
      { title: "Arashiyama Bamboo Forest & Monkey Park", category: "Nature", duration: 4, price: 75.00, rating: 4.9 },
      { title: "Private Matcha Tea Ceremony & Kimono Experience", category: "Culture", duration: 3, price: 120.00, rating: 4.8 }
    ]
  },
  {
    id: 8,
    name: "Swiss Alps",
    country: "Switzerland",
    rating: 4.7,
    price: 1480.00,
    description: "Majestic snow-capped peaks, alpine lakes, scenic cogwheel trains, and luxury ski chalets in Zermatt, Grindelwald, and St. Moritz.",
    packages: [
      { name: "Glacier Express & Alpine Luxury", duration: 7, price: 2450.00, style: "Luxury", rating: 4.9 },
      { name: "Matterhorn Ski & Snow Adventure", duration: 5, price: 1850.00, style: "Adventure", rating: 4.7 }
    ],
    hotels: [
      { name: "The Chedi Andermatt", stars: 5.0, price: 850.00, amenities: "Thermal Spa, Ski Butler, Wine Library, Indoor Pool" },
      { name: "Badrutt's Palace Hotel", stars: 5.0, price: 920.00, amenities: "Lake View, Rolls-Royce Transfer, Michelin Star Dining" }
    ],
    experiences: [
      { title: "Jungfraujoch Top of Europe Train Excursion", category: "Adventure", duration: 8, price: 220.00, rating: 4.9 },
      { title: "Helicopter Flight around the Matterhorn", category: "Adventure", duration: 2, price: 380.00, rating: 4.9 }
    ]
  },
  {
    id: 9,
    name: "Maldives",
    country: "Indian Ocean",
    rating: 5.0,
    price: 2150.00,
    description: "Crystal-clear turquoise lagoons, private overwater bungalows, coral atolls, and vibrant marine life in an idyllic tropical paradise.",
    packages: [
      { name: "Overwater Villa Luxury Escape", duration: 7, price: 3200.00, style: "Luxury", rating: 5.0 },
      { name: "Maldives Coral Reef Diving Safari", duration: 5, price: 2400.00, style: "Water", rating: 4.9 }
    ],
    hotels: [
      { name: "Soneva Jani", stars: 5.0, price: 1200.00, amenities: "Water Slides, Retractable Roof, Private Lagoon, Butler" },
      { name: "Cheval Blanc Randheli", stars: 5.0, price: 1400.00, amenities: "Private Seaplane, Spa Island, Infinity Pool" }
    ],
    experiences: [
      { title: "Manta Ray & Whale Shark Snorkeling", category: "Water", duration: 4, price: 190.00, rating: 5.0 },
      { title: "Undersea Restaurant 5-Course Dinner", category: "Culinary", duration: 3, price: 320.00, rating: 4.9 }
    ]
  },
  {
    id: 10,
    name: "Machu Picchu",
    country: "Peru",
    rating: 4.8,
    price: 1320.00,
    description: "The iconic 15th-century Inca citadel perched high in the Andes mountains surrounded by mystical cloud forests and ancient stone terraces.",
    packages: [
      { name: "Classic Inca Trail & Machu Picchu", duration: 6, price: 1650.00, style: "Adventure", rating: 4.9 },
      { name: "Sacred Valley & Hiram Bingham Luxury Train", duration: 5, price: 2100.00, style: "Luxury", rating: 4.8 }
    ],
    hotels: [
      { name: "Belmond Sanctuary Lodge", stars: 5.0, price: 950.00, amenities: "Direct Citadel Access, Orchid Garden, Andean Spa" },
      { name: "Inkaterra Machu Picchu Pueblo Hotel", stars: 5.0, price: 580.00, amenities: "Cloud Forest Villas, Hot Spring, Bird Watching" }
    ],
    experiences: [
      { title: "Huayna Picchu Summit Climb", category: "Adventure", duration: 4, price: 110.00, rating: 4.9 },
      { title: "Traditional Pachamanca Earth Oven Cooking Class", category: "Culinary", duration: 3, price: 95.00, rating: 4.7 }
    ]
  },
  {
    id: 11,
    name: "Serengeti Safari",
    country: "Tanzania",
    rating: 4.9,
    price: 1950.00,
    description: "Witness the Great Migration, vast golden savannahs, and the African Big Five in world-class luxury tented camps.",
    packages: [
      { name: "Great Wildebeest Migration Safari", duration: 7, price: 2850.00, style: "Adventure", rating: 4.9 },
      { name: "Serengeti & Ngorongoro Crater Expedition", duration: 6, price: 2400.00, style: "Family", rating: 4.8 }
    ],
    hotels: [
      { name: "Singita Sasakwa Lodge", stars: 5.0, price: 1350.00, amenities: "Private Concession, Infinity Pool, Equestrian Center" },
      { name: "Four Seasons Safari Lodge Serengeti", stars: 5.0, price: 1100.00, amenities: "Waterhole View, Spa, Discovery Centre" }
    ],
    experiences: [
      { title: "Sunrise Hot Air Balloon Safari & Champagne Breakfast", category: "Adventure", duration: 4, price: 450.00, rating: 5.0 },
      { title: "Private 4x4 Big Five Game Drive with Expert Guide", category: "Wildlife", duration: 8, price: 250.00, rating: 4.9 }
    ]
  },
  {
    id: 12,
    name: "Dubai",
    country: "United Arab Emirates",
    rating: 4.8,
    price: 1100.00,
    description: "Futuristic skyscrapers, ultra-luxury shopping, desert safaris with dune bashing, and iconic architecture.",
    packages: [
      { name: "Dubai Modern Marvels & Desert Safari", duration: 5, price: 1450.00, style: "Luxury", rating: 4.8 },
      { name: "Arabian Nights & Marina Cruise", duration: 4, price: 1150.00, style: "Family", rating: 4.7 }
    ],
    hotels: [
      { name: "Burj Al Arab Jumeirah", stars: 5.0, price: 1500.00, amenities: "Helipad, Private Beach, 24k Gold Accents, Butler" },
      { name: "Atlantis The Royal", stars: 5.0, price: 890.00, amenities: "Rooftop Sky Pool, 17 Celebrity Restaurants, Aquaventure" }
    ],
    experiences: [
      { title: "Sunset Desert Safari with Dune Bashing & BBQ", category: "Adventure", duration: 6, price: 95.00, rating: 4.8 },
      { title: "Burj Khalifa At the Top SKY (Level 148)", category: "Sightseeing", duration: 2, price: 130.00, rating: 4.9 }
    ]
  },
  {
    id: 13,
    name: "Amalfi Coast",
    country: "Italy",
    rating: 4.9,
    price: 1650.00,
    description: "Spectacular vertical cliffs, pastel-hued fishing villages, fragrant lemon groves, and azure Mediterranean seas.",
    packages: [
      { name: "Amalfi & Capri Private Yacht Odyssey", duration: 6, price: 2600.00, style: "Honeymoon", rating: 4.9 },
      { name: "Positano Romance & Lemon Grove Walk", duration: 5, price: 1980.00, style: "Luxury", rating: 4.8 }
    ],
    hotels: [
      { name: "Le Sirenuse Positano", stars: 5.0, price: 1100.00, amenities: "Pool Terrace, Champagne Bar, Positano Bay View" },
      { name: "Belmond Hotel Caruso", stars: 5.0, price: 1250.00, amenities: "Infinity Pool at Cliff Edge, 11th-Century Palace" }
    ],
    experiences: [
      { title: "Private Capri Island Speedboat Excursion", category: "Water", duration: 7, price: 340.00, rating: 4.9 },
      { title: "Path of the Gods Cliffside Trek", category: "Adventure", duration: 4, price: 80.00, rating: 4.8 }
    ]
  },
  {
    id: 14,
    name: "Banff",
    country: "Canada",
    rating: 4.7,
    price: 1180.00,
    description: "Pristine glacial lakes, towering Canadian Rockies, hot springs, and rugged alpine wilderness.",
    packages: [
      { name: "Canadian Rockies & Glacial Lakes Tour", duration: 6, price: 1750.00, style: "Nature", rating: 4.8 },
      { name: "Banff Winter Wonderland & Ski Safari", duration: 7, price: 2100.00, style: "Adventure", rating: 4.7 }
    ],
    hotels: [
      { name: "Fairmont Banff Springs", stars: 5.0, price: 620.00, amenities: "Castle in the Rockies, Mineral Pools, Championship Golf" },
      { name: "Fairmont Chateau Lake Louise", stars: 5.0, price: 710.00, amenities: "Lakefront View, Canoe Docks, Mountain View Spa" }
    ],
    experiences: [
      { title: "Canoeing on Turquoise Lake Louise", category: "Water", duration: 3, price: 90.00, rating: 4.9 },
      { title: "Columbia Icefield Skywalk & Glacier Adventure", category: "Adventure", duration: 5, price: 145.00, rating: 4.8 }
    ]
  }
];

async function seed() {
  console.log('Seeding real website destinations into MySQL...');

  for (const d of REAL_DESTINATIONS) {
    // 1. Upsert destination
    await db.query(
      `UPDATE destinations 
       SET name = ?, country = ?, rating = ?, price = ?, description = ?
       WHERE destination_id = ?`,
      [d.name, d.country, d.rating, d.price, d.description, d.id]
    );

    // 2. Add / Update packages
    for (let i = 0; i < d.packages.length; i++) {
      const p = d.packages[i];
      const [[existingPkg]] = await db.query(
        'SELECT package_id FROM packages WHERE destination_id = ? AND package_name = ?',
        [d.id, p.name]
      );
      if (!existingPkg) {
        await db.query(
          'INSERT INTO packages (destination_id, package_name, duration, price, travel_style, rating) VALUES (?, ?, ?, ?, ?, ?)',
          [d.id, p.name, p.duration, p.price, p.style, p.rating]
        );
      }
    }

    // 3. Add / Update hotels
    for (let i = 0; i < d.hotels.length; i++) {
      const h = d.hotels[i];
      const [[existingHtl]] = await db.query(
        'SELECT hotel_id FROM hotels WHERE destination_id = ? AND hotel_name = ?',
        [d.id, h.name]
      );
      if (!existingHtl) {
        await db.query(
          'INSERT INTO hotels (destination_id, hotel_name, stars, price, amenities) VALUES (?, ?, ?, ?, ?)',
          [d.id, h.name, h.stars, h.price, h.amenities]
        );
      }
    }

    // 4. Add / Update experiences
    for (let i = 0; i < d.experiences.length; i++) {
      const e = d.experiences[i];
      const [[existingExp]] = await db.query(
        'SELECT experience_id FROM experiences WHERE destination_id = ? AND title = ?',
        [d.id, e.title]
      );
      if (!existingExp) {
        await db.query(
          'INSERT INTO experiences (destination_id, title, category, duration, price, rating) VALUES (?, ?, ?, ?, ?, ?)',
          [d.id, e.title, e.category, e.duration, e.price, e.rating]
        );
      }
    }
  }

  console.log('✅ Real destinations, packages, hotels, and experiences successfully synced!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
