/* ==========================================================================
   AZURA TOURISM PLATFORM — CENTRALIZED DUMMY DATASET
   ========================================================================== */

function uns(id, w, q) {
  return `https://images.unsplash.com/${id}?w=${w || 800}&q=${q || 75}&auto=format&fit=crop`;
}

const DESTINATIONS_DATA = [
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    tag: "Luxury",
    rating: 4.9,
    reviewsCount: 342,
    price: 1240,
    img: "photo-1696519669474-3001c0e2b548",
    gallery: [
      "photo-1696519669474-3001c0e2b548",
      "photo-1570077188670-e3a8d69ac5ff",
      "photo-1469854523086-cc02fe5d8800",
      "photo-1533105079780-92b9be482077",
      "photo-1516483638261-f4dbaf036963"
    ],
    overview: "Santorini is the crown jewel of the Aegean Sea, world-renowned for its white-washed cliffside villages, dramatic volcanic caldera views, and sapphire blue domes. Wander through cobblestone paths in Oia, sip indigenous Assyrtiko wine, and watch unforgettable sunsets from luxury infinity suites.",
    highlights: [
      "Sunset catamaran cruise along the volcanic caldera",
      "Private wine tasting at cliffside vineyards",
      "Exploring prehistoric ruins of Akrotiri",
      "Relaxing on Red Beach and Perissa Black Sand Beach"
    ],
    bestTime: "May – October",
    avgTemp: "26°C",
    idealDuration: "5 – 7 Days",
    language: "Greek / English",
    currency: "Euro (€)",
    weatherForecast: [
      { day: "Mon", temp: 27, icon: "sun" },
      { day: "Tue", temp: 28, icon: "sun" },
      { day: "Wed", temp: 26, icon: "cloud-sun" },
      { day: "Thu", temp: 29, icon: "sun" },
      { day: "Fri", temp: 27, icon: "sun" },
      { day: "Sat", temp: 25, icon: "cloud" },
      { day: "Sun", temp: 28, icon: "sun" }
    ],
    hotels: [
      { name: "Canaves Oia Suites", stars: 5, price: 680, img: "photo-1566073771259-6a8506099945", amenities: ["Infinity Pool", "Caldera View", "Spa & Wellness", "Free Breakfast"] },
      { name: "Grace Hotel Santorini", stars: 5, price: 820, img: "photo-1582719508461-905c673771fd", amenities: ["Fine Dining", "Private Plunge Pool", "24/7 Butler", "Helipad"] },
      { name: "Katikies Hotel Oia", stars: 5, price: 540, img: "photo-1542314831-068cd1dbfeeb", amenities: ["3 Swimming Pools", "Wine Bar", "Concierge", "Ocean View"] }
    ],
    packages: [
      { title: "Santorini Romantic Getaway", duration: "6 Days / 5 Nights", price: 1890, inclusions: ["5-Star Suite", "Caldera Sunset Cruise", "Daily Breakfast", "Airport Transfers"] },
      { title: "Aegean Luxury & Wine Experience", duration: "4 Days / 3 Nights", price: 1350, inclusions: ["Boutique Cave Hotel", "Sommelier Tour", "Private Yacht Ride"] }
    ],
    reviews: [
      { name: "Sophia Martinez", date: "June 2026", rating: 5, text: "Staying in Oia was a dream come true! AZURA organized seamless private transport and the caldera sunset cruise was magical.", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
      { name: "Liam Hemsworth", date: "May 2026", rating: 5, text: "The hotel recommendations were top tier. Waking up to the caldera view every morning made it worth every dollar.", avatar: "https://randomuser.me/api/portraits/men/32.jpg" }
    ]
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    tag: "Honeymoon",
    rating: 4.8,
    reviewsCount: 512,
    price: 890,
    img: "photo-1559628233-eb1b1a45564b",
    gallery: [
      "photo-1559628233-eb1b1a45564b",
      "photo-1537996194471-e657df975ab4",
      "photo-1518548419970-58e3b4079ab2",
      "photo-1544644181-1484b3fdfc62",
      "photo-1507525428034-b723cf961d3e"
    ],
    overview: "Known as the Island of the Gods, Bali captivates with lush tropical rainforests, ancient sea temples, terraced rice paddies in Ubud, and golden surf beaches in Uluwatu.",
    highlights: [
      "Private jungle villa with floating pool breakfast",
      "Sunrise hike up Mount Batur volcano",
      "Temple blessing at Tirta Empul",
      "Sunset seafood dinner at Jimbaran Bay"
    ],
    bestTime: "April – October",
    avgTemp: "29°C",
    idealDuration: "7 – 10 Days",
    language: "Indonesian / English",
    currency: "Indonesian Rupiah (IDR)",
    weatherForecast: [
      { day: "Mon", temp: 30, icon: "sun" },
      { day: "Tue", temp: 31, icon: "sun" },
      { day: "Wed", temp: 29, icon: "cloud-sun" },
      { day: "Thu", temp: 30, icon: "sun" },
      { day: "Fri", temp: 28, icon: "cloud-rain" },
      { day: "Sat", temp: 29, icon: "sun" },
      { day: "Sun", temp: 31, icon: "sun" }
    ],
    hotels: [
      { name: "Viceroy Bali Ubud", stars: 5, price: 490, img: "photo-1540555700478-4be289fbecef", amenities: ["Private Pool Villa", "Jungle Spa", "Helipad", "Fine Dining"] },
      { name: "Alila Villas Uluwatu", stars: 5, price: 620, img: "photo-1571896349842-33c89424de2d", amenities: ["Cliffside Pool", "Ocean View", "Personal Concierge", "Yoga Pavilion"] }
    ],
    packages: [
      { title: "Bali Paradise Escape", duration: "7 Days / 6 Nights", price: 1450, inclusions: ["3 Nights Ubud + 3 Nights Beach Resort", "Temple Tours", "Spa Treatments"] }
    ],
    reviews: [
      { name: "Chloe Dupont", date: "July 2026", rating: 5, text: "The jungle villa in Ubud exceeded all expectations. Incredible hospitality and culture!", avatar: "https://randomuser.me/api/portraits/women/68.jpg" }
    ]
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    tag: "Culture",
    rating: 4.9,
    reviewsCount: 289,
    price: 1050,
    img: "photo-1777633460098-697b03bc79e6",
    gallery: [
      "photo-1777633460098-697b03bc79e6",
      "photo-1493976040374-85c8e12f0c0e",
      "photo-1503899036084-c55cdd92da26",
      "photo-1492571350019-22de08371fd3",
      "photo-1528164344705-47542687990d"
    ],
    overview: "Kyoto is the cultural heart of Japan, home to thousands of classical Buddhist temples, serene Zen gardens, historic Ryokan inns, and traditional Geisha districts in Gion.",
    highlights: [
      "Walking through the thousand vermilion gates of Fushimi Inari",
      "Traditional tea ceremony in a historic machiya",
      "Visiting the Golden Pavilion (Kinkaku-ji)",
      "Staying in a luxury traditional Ryokan with private Onsen hot spring"
    ],
    bestTime: "March – May & Oct – Nov",
    avgTemp: "21°C",
    idealDuration: "4 – 6 Days",
    language: "Japanese / English",
    currency: "Japanese Yen (¥)",
    weatherForecast: [
      { day: "Mon", temp: 22, icon: "sun" },
      { day: "Tue", temp: 23, icon: "sun" },
      { day: "Wed", temp: 20, icon: "cloud-sun" },
      { day: "Thu", temp: 19, icon: "cloud" },
      { day: "Fri", temp: 21, icon: "sun" },
      { day: "Sat", temp: 24, icon: "sun" },
      { day: "Sun", temp: 22, icon: "sun" }
    ],
    hotels: [
      { name: "Four Seasons Hotel Kyoto", stars: 5, price: 750, img: "photo-1566073771259-6a8506099945", amenities: ["800-Year-Old Pond Garden", "Tea House", "Onsen Spa", "Michelin Dining"] }
    ],
    packages: [
      { title: "Kyoto Traditions & Zen Luxury", duration: "5 Days / 4 Nights", price: 1780, inclusions: ["Luxury Ryokan", "Private Geisha Experience", "Bullet Train Pass"] }
    ],
    reviews: [
      { name: "Kenji Sato", date: "April 2026", rating: 5, text: "Cherry blossom season in Kyoto was magical. The Ryokan arranged by AZURA was world class.", avatar: "https://randomuser.me/api/portraits/men/45.jpg" }
    ]
  },
  {
    id: "swiss-alps",
    name: "Swiss Alps",
    country: "Switzerland",
    tag: "Adventure",
    rating: 4.7,
    reviewsCount: 198,
    price: 1480,
    img: "photo-1600870402183-61e0c7429e5a",
    gallery: [
      "photo-1600870402183-61e0c7429e5a",
      "photo-1530122037265-a5f1f91d3b99",
      "photo-1464822759023-fed622ff2c3b",
      "photo-1502784444187-359ac186c5bb",
      "photo-1527668752968-14dc70a27c95"
    ],
    overview: "Experience alpine luxury in Switzerland. Towering snow-capped peaks like the Matterhorn, pristine glacier lakes, high-altitude scenic railways, and world-class ski resorts.",
    highlights: [
      "Riding the Glacier Express panoramic train",
      "Helicopter tour around the Matterhorn peak",
      "Swiss chocolate & fondue tasting in Zermatt",
      "Luxury thermal spa resort retreat"
    ],
    bestTime: "December – March & June – Sept",
    avgTemp: "18°C",
    idealDuration: "6 – 8 Days",
    language: "German / French / English",
    currency: "Swiss Franc (CHF)",
    weatherForecast: [
      { day: "Mon", temp: 17, icon: "sun" },
      { day: "Tue", temp: 16, icon: "cloud-sun" },
      { day: "Wed", temp: 14, icon: "cloud-rain" },
      { day: "Thu", temp: 18, icon: "sun" },
      { day: "Fri", temp: 19, icon: "sun" },
      { day: "Sat", temp: 15, icon: "cloud" },
      { day: "Sun", temp: 17, icon: "sun" }
    ],
    hotels: [
      { name: "The Chedi Andermatt", stars: 5, price: 850, img: "photo-1566073771259-6a8506099945", amenities: ["Alpine Spa", "Heated Outdoor Pool", "Cigar Lounge", "Ski Butler"] }
    ],
    packages: [
      { title: "Grand Alpine Express", duration: "8 Days / 7 Nights", price: 2390, inclusions: ["Zermatt & St. Moritz Stays", "First-Class Train Passes", "Guided Glacier Hikes"] }
    ],
    reviews: [
      { name: "Hannah Abbott", date: "Jan 2026", rating: 5, text: "The train rides and mountain views were unbelievable. Everything was so well organized!", avatar: "https://randomuser.me/api/portraits/women/33.jpg" }
    ]
  },
  {
    id: "maldives",
    name: "Maldives",
    country: "Indian Ocean",
    tag: "Beach",
    rating: 5.0,
    reviewsCount: 420,
    price: 2150,
    img: "photo-1573843981267-be1999ff37cd",
    gallery: [
      "photo-1573843981267-be1999ff37cd",
      "photo-1514282401047-d79a71a590e8",
      "photo-1540555700478-4be289fbecef",
      "photo-1507525428034-b723cf961d3e",
      "photo-1512100356356-de1b84283e18"
    ],
    overview: "The ultimate tropical luxury paradise. Turquoise lagoons, powder-white sand beaches, overwater villas with glass floor viewports, underwater dining, and swimming with manta rays.",
    highlights: [
      "Overwater villa with private slide into ocean lagoon",
      "Underwater glass restaurant dining experience",
      "Snorkeling with sea turtles and whale sharks",
      "Sunset dolphin cruise on traditional dhoni"
    ],
    bestTime: "November – April",
    avgTemp: "31°C",
    idealDuration: "5 – 7 Days",
    language: "Dhivehi / English",
    currency: "US Dollar ($)",
    weatherForecast: [
      { day: "Mon", temp: 31, icon: "sun" },
      { day: "Tue", temp: 32, icon: "sun" },
      { day: "Wed", temp: 31, icon: "sun" },
      { day: "Thu", temp: 30, icon: "cloud-sun" },
      { day: "Fri", temp: 31, icon: "sun" },
      { day: "Sat", temp: 32, icon: "sun" },
      { day: "Sun", temp: 31, icon: "sun" }
    ],
    hotels: [
      { name: "Soneva Jani Maldives", stars: 5, price: 1400, img: "photo-1571896349842-33c89424de2d", amenities: ["Retractable Roof", "Water Slide", "Private Island Cinema", "Astronomical Observatory"] }
    ],
    packages: [
      { title: "Maldives Overwater Dream", duration: "5 Days / 4 Nights", price: 2980, inclusions: ["Overwater Villa", "Seaplane Transfer", "All Meals Included", "Spa Voucher"] }
    ],
    reviews: [
      { name: "Marcus Vance", date: "Feb 2026", rating: 5, text: "Pure perfection. The overwater villa with private slide was surreal!", avatar: "https://randomuser.me/api/portraits/men/76.jpg" }
    ]
  }
];

const PACKAGES_DATA = [
  {
    id: "pkg-1",
    title: "Santorini Escape & Volcanic Wine",
    destName: "Santorini, Greece",
    days: "6 Days / 5 Nights",
    durationCategory: "medium",
    styleCategory: "honeymoon",
    price: 1890,
    img: "photo-1696519669474-3001c0e2b548",
    rating: 4.9,
    reviews: 124,
    inclusions: ["5-Star Suite", "Caldera Sunset Cruise", "Daily Gourmet Breakfast", "Private Airport Transfers", "Sommelier Wine Tasting"],
    itinerary: [
      { day: 1, title: "Arrival in Oia & Sunset Welcome", desc: "Private VIP transfer to your cliffside cave suite. Enjoy a welcome bottle of Assyrtiko wine while watching the famous Oia sunset." },
      { day: 2, title: "Volcanic Caldera Catamaran Cruise", desc: "Board a private luxury catamaran. Swim in hot volcanic springs, snorkel in crystal clear waters, and enjoy a freshly cooked seafood lunch on board." },
      { day: 3, title: "Ancient Akrotiri & Wine Tasting", desc: "Morning private tour of the prehistoric Minoan city of Akrotiri. Afternoon sommelier guided wine tour across 3 historic cliffside estates." },
      { day: 4, title: "Fira to Oia Cliffside Hike", desc: "Scenic morning hike along the volcanic rim with panoramic Aegean views. Afternoon at leisure with private spa massage in your suite." },
      { day: 5, title: "Red Beach & Fine Dining", desc: "Private chauffeur to the dramatic Red Beach and Pyrgos village. Farewell 5-course dinner at a Michelin-recommended cliffside terrace." },
      { day: 6, title: "Departure", desc: "Leisurely breakfast overlooking the caldera followed by private transfer to Santorini International Airport." }
    ]
  },
  {
    id: "pkg-2",
    title: "Bali Romance & Jungle Sanctuary",
    destName: "Bali, Indonesia",
    days: "7 Days / 6 Nights",
    durationCategory: "medium",
    styleCategory: "honeymoon",
    price: 1450,
    img: "photo-1559628233-eb1b1a45564b",
    rating: 4.8,
    reviews: 98,
    inclusions: ["Private Pool Villa", "Floating Breakfast", "Temple Purification Tour", "Mount Batur Sunrise Hike", "Jimbaran Sunset Dinner"],
    itinerary: [
      { day: 1, title: "Arrival in Ubud Rainforest", desc: "Chauffeur transfer to your secluded luxury jungle villa in Ubud complete with private infinity plunge pool." },
      { day: 2, title: "Floating Breakfast & Tirta Empul Blessing", desc: "Start your day with a floating pool breakfast. Guided visit to Tirta Empul water temple for a traditional spiritual blessing." },
      { day: 3, title: "Tegallalang Rice Terraces & Swing", desc: "Explore the iconic green rice fields of Tegallalang, followed by an artisanal coffee tasting session." },
      { day: 4, title: "Mount Batur Sunrise Volcano Hike", desc: "Early morning jeep safari or trek to Mount Batur peak. Enjoy breakfast cooked over natural volcanic steam at sunrise." },
      { day: 5, title: "Transfer to Uluwatu Cliff Resort", desc: "Move to a cliffside beach resort in Uluwatu. Watch the traditional Kecak Fire Dance at Uluwatu Temple." },
      { day: 6, title: "Jimbaran Bay Candlelight Seafood", desc: "Relaxing beach day followed by a private seafood dinner served directly on Jimbaran beach sand." },
      { day: 7, title: "Departure", desc: "Morning spa treatment and private airport transfer." }
    ]
  },
  {
    id: "pkg-3",
    title: "Swiss Alps Express & Glacier Spa",
    destName: "Swiss Alps, Switzerland",
    days: "8 Days / 7 Nights",
    durationCategory: "long",
    styleCategory: "adventure",
    price: 2390,
    img: "photo-1600870402183-61e0c7429e5a",
    rating: 4.9,
    reviews: 86,
    inclusions: ["Zermatt & St. Moritz Hotels", "Glacier Express Train Pass", "Helicopter Matterhorn Tour", "Thermal Spa Access", "Fondue Evening"],
    itinerary: [
      { day: 1, title: "Arrival in Zermatt", desc: "Arrive via car-free electric train in Zermatt. Check into your luxury alpine chalet hotel facing the Matterhorn." },
      { day: 2, title: "Gornergrat Panoramic Railway", desc: "Ride Europe's highest open-air cogwheel railway up to 3,089 meters for breathtaking glacier views." },
      { day: 3, title: "Helicopter Flight Over the Matterhorn", desc: "Exhilarating 20-minute VIP helicopter flight circling the Matterhorn peak and alpine glaciers." },
      { day: 4, title: "Glacier Express First Class Journey", desc: "Board the world-famous slow express train across 291 bridges and 91 tunnels to St. Moritz." },
      { day: 5, title: "St. Moritz Mineral Spa & Thermal Springs", desc: "Rejuvenate in heated outdoor thermal baths surrounded by snow-covered pine forests." },
      { day: 6, title: "Swiss Chocolate & Cheese Fondue Night", desc: "Private culinary workshop making traditional Swiss chocolates followed by a cozy fondue dinner." },
      { day: 7, title: "Alpine Hiking & Lake St. Moritz", desc: "Guided nature walk around the frozen alpine lake and mountain trails." },
      { day: 8, title: "Departure", desc: "First-class Swiss rail transfer to Zurich International Airport." }
    ]
  },
  {
    id: "pkg-4",
    title: "Maldives Overwater Dream Sanctuary",
    destName: "Maldives, Indian Ocean",
    days: "5 Days / 4 Nights",
    durationCategory: "short",
    styleCategory: "luxury",
    price: 2980,
    img: "photo-1573843981267-be1999ff37cd",
    rating: 5.0,
    reviews: 142,
    inclusions: ["Overwater Lagoon Villa", "Roundtrip Seaplane Flight", "All-Inclusive Fine Dining", "Underwater Restaurant Experience", "Spa Voucher"],
    itinerary: [
      { day: 1, title: "Scenic Seaplane Arrival", desc: "Fly high over turquoise coral atolls via private seaplane. Arrive at your overwater ocean villa with direct lagoon access." },
      { day: 2, title: "Underwater Glass Restaurant Fine Dining", desc: "Snorkel right off your villa deck. Evening dinner 5 meters underwater surrounded by sea life." },
      { day: 3, title: "Sunset Dolphin & Manta Ray Safari", desc: "Guided boat excursion tracking wild spinner dolphins and swimming with gentle manta rays." },
      { day: 4, title: "Overwater Couple Spa & Cinema Night", desc: "Relaxing 90-minute massage in an ocean spa pavilion, followed by an open-air private movie screening under the stars." },
      { day: 5, title: "Departure", desc: "Champagne breakfast in villa and return seaplane transfer to Male Airport." }
    ]
  }
];

const EXPERIENCES_DATA = [
  {
    id: "exp-1",
    title: "Private Sunset Catamaran Cruise in Santorini",
    category: "water",
    location: "Santorini, Greece",
    duration: "5 Hours",
    groupSize: "Max 8 Guests",
    price: 220,
    rating: 4.9,
    img: "photo-1570077188670-e3a8d69ac5ff",
    desc: "Sail past the Red Beach, White Beach, and Indian Rocks. Swim in warm volcanic hot springs and savor a gourmet BBQ seafood meal on deck as the sun sets over Oia."
  },
  {
    id: "exp-2",
    title: "Helicopter Flight Tour Around Matterhorn",
    category: "adventure",
    location: "Swiss Alps, Switzerland",
    duration: "30 Mins",
    groupSize: "Max 4 Guests",
    price: 450,
    rating: 5.0,
    img: "photo-1502784444187-359ac186c5bb",
    desc: "Soar alongside the sheer granite faces of the world's most iconic mountain peak with panoramic aerial views of glacier ice falls."
  },
  {
    id: "exp-3",
    title: "Private Sommelier Wine Tasting in Tuscany & Cliffside",
    category: "culinary",
    location: "Santorini & Florence",
    duration: "4 Hours",
    groupSize: "Max 6 Guests",
    price: 180,
    rating: 4.8,
    img: "photo-1510812431401-41d2bd2722f3",
    desc: "Guided sommelier tour through ancient wine cellars. Taste rare volcanic vintages paired with local artisanal cheeses and olive oils."
  },
  {
    id: "exp-4",
    title: "Floating Lagoon Massage & Thermal Spa",
    category: "wellness",
    location: "Maldives & Bali",
    duration: "2.5 Hours",
    groupSize: "Private Couple",
    price: 290,
    rating: 4.9,
    img: "photo-1540555700478-4be289fbecef",
    desc: "Experience deep relaxation in an open-air wooden pavilion constructed over crystal clear turquoise waters accompanied by gentle ocean breezes."
  },
  {
    id: "exp-5",
    title: "Traditional Tea Ceremony with Master in Kyoto",
    category: "cultural",
    location: "Kyoto, Japan",
    duration: "2 Hours",
    groupSize: "Max 4 Guests",
    price: 130,
    rating: 4.9,
    img: "photo-1493976040374-85c8e12f0c0e",
    desc: "Step inside a 200-year-old preserved Machiya townhome for an authentic tea preparation ritual led by a certified Japanese Tea Master."
  }
];

const BLOG_POSTS_DATA = [
  {
    id: "post-1",
    title: "The Ultimate Guide to Island Hopping in Greece",
    cat: "Guides",
    readTime: "7 min read",
    date: "July 24, 2026",
    author: "Elena Vos",
    authorTitle: "Senior Travel Editor",
    avatar: "https://randomuser.me/api/portraits/women/56.jpg",
    img: "photo-1696519669474-3001c0e2b548",
    excerpt: "How to string together Santorini, Naxos, and Milos without wasting a single ferry day or compromising on luxury.",
    content: `
      <p>Greece is home to over 6,000 islands and islets scattered across the Aegean and Ionian Seas. For travelers seeking the ultimate summer getaway, balancing iconic views with serene privacy is an art form.</p>
      <h4>1. Santorini: The Dramatic Opener</h4>
      <p>Begin your journey in Santorini. Spend three days soaking in the famous caldera views in Oia, indulging in volcanic wines, and sailing along the crater walls on a private catamaran.</p>
      <h4>2. Naxos: Culinary & Authentic Roots</h4>
      <p>A short high-speed ferry ride takes you to Naxos, famous for its lush valleys, ancient marble portals, and uncrowded golden beaches. Don't leave without tasting local Naxian cheeses and mountain olive oil.</p>
      <h4>3. Milos: Surreal Volcanic Landscapes</h4>
      <p>End your journey on Milos, famous for Sarakiniko Beach — a lunar landscape of chalk-white volcanic rock dropping into vivid turquoise waters.</p>
    `
  },
  {
    id: "post-2",
    title: "7 Hidden Gems of the Swiss Alps",
    cat: "Tips",
    readTime: "5 min read",
    date: "July 18, 2026",
    author: "Tomas Keller",
    authorTitle: "Alpine Guide & Photographer",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    img: "photo-1600870402183-61e0c7429e5a",
    excerpt: "Beyond Zermatt and St. Moritz: the pristine alpine valley towns, high lakes, and panoramic trails most travelers miss.",
    content: `
      <p>While famous resorts like Zermatt draw global crowds, Switzerland holds secret alpine sanctuaries that offer pristine beauty with total tranquility.</p>
      <h4>Lauterbrunnen Valley: The Valley of 72 Waterfalls</h4>
      <p>Deep inside a glacial trench surrounded by vertical rock faces lies Lauterbrunnen. Staubbach Falls plunges nearly 300 meters right behind wood-carved chalets.</p>
      <h4>Lake Oeschinen: A Turquoise Mirror</h4>
      <p>Tucked above Kandersteg, Lake Oeschinen reflects snow-capped peaks in still glacial waters perfect for rowing boats in summer or ice walking in winter.</p>
    `
  },
  {
    id: "post-3",
    title: "Packing Light for a Month in Tropical Paradises",
    cat: "Packing",
    readTime: "4 min read",
    date: "July 10, 2026",
    author: "Aisha Malik",
    authorTitle: "Luxury Travel Concierge",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    img: "photo-1573843981267-be1999ff37cd",
    excerpt: "The carry-on-only capsule wardrobe system our expert guides use on multi-country island trips.",
    content: `
      <p>Traveling lightweight doesn't mean sacrificing style. With linen fabrics, versatile footwear, and smart packing cubes, you can easily travel for weeks with a single carry-on bag.</p>
    `
  }
];

const TEAM_DATA = [
  {
    name: "Alexander Sterling",
    role: "Founder & Chief Executive Officer",
    bio: "Former luxury hospitality executive with 15+ years curating high-net-worth travel experiences across 80+ countries.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Dr. Victoria Vance",
    role: "Head of Global Concierge Services",
    bio: "Oversees AZURA's 24/7 global concierge network, ensuring every trip transfer and special request is executed seamlessly.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    name: "Hiroshi Tanaka",
    role: "Chief Destination Curator",
    bio: "Passionate explorer who personally inspects 5-star properties, private yachts, and local guides across Asia & Europe.",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg"
  }
];

const FAQS_DATA = [
  {
    q: "How does booking through AZURA work?",
    a: "AZURA simplifies luxury travel. Browse our curated destinations or packages, choose your preferred travel dates and traveler details, and reserve instantly. Our 24/7 dedicated concierge will contact you immediately to customize your itinerary, handle special requests, and arrange private transfers."
  },
  {
    q: "What is your cancellation and refund policy?",
    a: "We offer flexible cancellation policies. Most bookings can be modified or cancelled free of charge up to 7 days prior to departure. Detailed cancellation windows for specific private villas or charter flights are clearly listed during checkout."
  },
  {
    q: "Are flights and airport transfers included in packages?",
    a: "Yes! All AZURA featured packages include roundtrip airport/seaplane transfers. Flight arrangements can either be bundled into your package or arranged independently with our flight concierge desk."
  },
  {
    q: "What is the Best Price Guarantee?",
    a: "If you find the exact same hotel suite, villa, or package published cheaper elsewhere within 24 hours of booking, AZURA will match the lower price and credit your account an additional 10% discount."
  },
  {
    q: "Do I have access to a dedicated concierge during my trip?",
    a: "Absolutely. Every AZURA traveler receives direct access to a personal 24/7 concierge via phone, WhatsApp, or the AZURA mobile app throughout their entire journey."
  }
];
