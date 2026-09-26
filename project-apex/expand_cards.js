const fs = require('fs');
const path = './src/components/HomeClient.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /const QUAD_CARDS = \[[\s\S]*?\];\n/;

const newQuadCards = `const QUAD_CARDS = [
  // ROW 1
  {
    title: "Trending in Fashion",
    link: "/departments/apparel",
    items: [
      { img: "/college.jpg", label: "Streetwear", badge: "Min 40% Off" },
      { img: "/office.webp", label: "Workwear", badge: "Hot" },
      { img: "/datenight.webp", label: "Evening", badge: "" },
      { img: "/festive.avif", label: "Ethnic Wear", badge: "Up to 50% Off" }
    ]
  },
  {
    title: "Elevate Your Home",
    link: "/departments/home-kitchen",
    items: [
      { img: "/kitchen.avif", label: "Kitchenware", badge: "Starting ₹299" },
      { img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=300&q=80", label: "Living Room", badge: "" },
      { img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80", label: "Home Decor", badge: "" },
      { img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=300&q=80", label: "Lighting", badge: "Bestsellers" }
    ]
  },
  {
    title: "Tech & Accessories",
    link: "/departments/computers",
    items: [
      { img: "/computer_accessories.webp", label: "Accessories", badge: "Top Rated" },
      { img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=300&q=80", label: "Smartwatches", badge: "" },
      { img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80", label: "Laptops", badge: "Under ₹499" },
      { img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&q=80", label: "Gadgets", badge: "" }
    ]
  },
  {
    title: "Beauty & Grooming",
    link: "/departments/beauty",
    items: [
      { img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&q=80", label: "Skincare", badge: "New" },
      { img: "https://images.unsplash.com/photo-1522335158144-67253503f191?w=300&q=80", label: "Makeup", badge: "" },
      { img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=300&q=80", label: "Fragrances", badge: "Min 30% Off" },
      { img: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300&q=80", label: "Haircare", badge: "" }
    ]
  },
  
  // ROW 2: Deals / Offers
  {
    title: "Steal Deals: All Under ₹499",
    link: "/search?q=under-499",
    items: [
      { img: "/vacation.webp", label: "Under ₹99", badge: "Free Del." },
      { img: "/college.jpg", label: "Under ₹199", badge: "" },
      { img: "/office.webp", label: "Under ₹299", badge: "" },
      { img: "/datenight.webp", label: "Under ₹499", badge: "Hot" }
    ]
  },
  {
    title: "Big Savings For You",
    link: "/search?q=sale",
    items: [
      { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80", label: "Audio", badge: "75% Off" },
      { img: "/computer_accessories.webp", label: "Peripherals", badge: "50% Off" },
      { img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=300&q=80", label: "Wearables", badge: "40% Off" },
      { img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&q=80", label: "Gadgets", badge: "Sale" }
    ]
  },
  {
    title: "Household Needs",
    link: "/departments/home-kitchen",
    items: [
      { img: "/kitchen.avif", label: "Cleaning", badge: "Up to 60%" },
      { img: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&q=80", label: "Storage", badge: "" },
      { img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80", label: "Decor", badge: "" },
      { img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&q=80", label: "Dining", badge: "New" }
    ]
  },
  {
    title: "Latest Launches",
    link: "/search?q=new",
    items: [
      { img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80", label: "Laptops", badge: "Just In" },
      { img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&q=80", label: "Apparel", badge: "" },
      { img: "https://images.unsplash.com/photo-1522335158144-67253503f191?w=300&q=80", label: "Beauty", badge: "Trending" },
      { img: "/college.jpg", label: "Footwear", badge: "" }
    ]
  },
  
  // ROW 3
  {
    title: "Gaming Zone",
    link: "/departments/computers",
    items: [
      { img: "/computer_accessories.webp", label: "Consoles", badge: "Extra ₹50 CB" },
      { img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80", label: "Laptops", badge: "" },
      { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80", label: "Headsets", badge: "" },
      { img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&q=80", label: "Accessories", badge: "Lowest" }
    ]
  },
  {
    title: "PEHNO Business",
    link: "/about",
    items: [
      { img: "/office.webp", label: "Office Wear", badge: "Bulk Pricing" },
      { img: "/computer_accessories.webp", label: "Tech", badge: "10% Cashback" },
      { img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=300&q=80", label: "Furniture", badge: "" },
      { img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=300&q=80", label: "Supplies", badge: "Wholesale" }
    ]
  },
  {
    title: "Starting at ₹129",
    link: "/search?q=essentials",
    items: [
      { img: "/college.jpg", label: "Tees", badge: "Sale Price" },
      { img: "/vacation.webp", label: "Shorts", badge: "" },
      { img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&q=80", label: "Socks", badge: "" },
      { img: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=300&q=80", label: "Accessories", badge: "Live" }
    ]
  },
  {
    title: "Deals You Might Like",
    link: "/search?mode=ai",
    items: [
      { img: "/datenight.webp", label: "Party Wear", badge: "AI Pick" },
      { img: "/festive.avif", label: "Ethnic", badge: "" },
      { img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=300&q=80", label: "Perfumes", badge: "" },
      { img: "/wedding.webp", label: "Jewelry", badge: "20% Off" }
    ]
  },
  
  // ROW 4
  {
    title: "Up to 80% Off on Home",
    link: "/departments/home-kitchen",
    items: [
      { img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80", label: "Furnishings", badge: "80% Off" },
      { img: "/kitchen.avif", label: "Cookware", badge: "" },
      { img: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&q=80", label: "Storage", badge: "Clearance" },
      { img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=300&q=80", label: "Lighting", badge: "" }
    ]
  },
  {
    title: "Smart Devices",
    link: "/departments/computers",
    items: [
      { img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=300&q=80", label: "Smart Watches", badge: "Save Big" },
      { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80", label: "Smart Audio", badge: "" },
      { img: "https://images.unsplash.com/photo-1601522582258-f365bc934338?w=300&q=80", label: "Smart Trackers", badge: "" },
      { img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&q=80", label: "Smart Home", badge: "Deals" }
    ]
  },
  {
    title: "Lowest Prices of the Year",
    link: "/todays-deals",
    items: [
      { img: "/college.jpg", label: "Fashion", badge: "Starts ₹99" },
      { img: "/office.webp", label: "Work", badge: "Starts ₹199" },
      { img: "/computer_accessories.webp", label: "Tech", badge: "Starts ₹299" },
      { img: "/kitchen.avif", label: "Home", badge: "Starts ₹399" }
    ]
  },
  {
    title: "Curated by Creators",
    link: "/search?q=creators",
    items: [
      { img: "/datenight.webp", label: "Street Style", badge: "Exclusive" },
      { img: "/vacation.webp", label: "Resort", badge: "" },
      { img: "https://images.unsplash.com/photo-1522335158144-67253503f191?w=300&q=80", label: "Glam", badge: "" },
      { img: "/festive.avif", label: "Fusion", badge: "Collab" }
    ]
  }
];\n`;

code = code.replace(regex, newQuadCards);
fs.writeFileSync(path, code);
console.log('Expanded QUAD_CARDS array successfully!');
