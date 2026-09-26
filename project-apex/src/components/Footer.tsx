'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Share2, MessageCircle, Link2 } from 'lucide-react';
import YourBrowsingHistory from '@/components/YourBrowsingHistory';

import { DEPARTMENTS } from '@/data/departments';

const FOOTER_COLS = [
  {
    heading: 'Discover',
    links: [
      { label: 'About PEHNO',       href: '/about' },
      { label: 'Our Story',             href: '/about' },
      { label: '✨ PEHNO Stylist',      href: '/stylist' },
      { label: 'Virtual Try-On',        href: '/search?mode=tryon' },
      { label: "Today's Deals",         href: '/todays-deals' },
      { label: 'All Departments',       href: '/departments' },
    ],
  },
  {
    heading: 'Shop',
    links: DEPARTMENTS.slice(0, 6).map(d => ({
      label: d.shortName.replace(/&/g, ' & ').replace(/([a-z])([A-Z])/g, '$1 $2'),
      href: `/${d.slug}`
    })),
  },
  {
    heading: 'Help',
    links: [
      { label: 'Your Account',       href: '/account' },
      { label: 'Your Orders',        href: '/account/orders' },
      { label: 'Shipping & Delivery',href: '/help' },
      { label: 'Returns & Refunds',  href: '/help' },
      { label: 'Customer Support',   href: '/help' },
      { label: 'Login & Security',   href: '/account/security' },
    ],
  },
  {
    heading: 'Trust',
    links: [
      { label: 'Conditions of Use',       href: '/legal/conditions-of-use' },
      { label: 'Privacy Notice',          href: '/legal/privacy-notice' },
      { label: 'Seller Transparency',     href: '/help' },
      { label: 'Accessibility',           href: '/help' },
      { label: 'Payment Security',        href: '/help' },
    ],
  },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <YourBrowsingHistory />
      
      {/* Back to top */}
      <button 
        onClick={scrollToTop}
        className="w-full bg-[#37475A] hover:bg-[#485769] text-white text-[13px] py-[15px] font-medium transition-colors focus:outline-none"
      >
        Back to top
      </button>

      <footer className="bg-[#232F3E] text-white" role="contentinfo">
        {/* Main footer grid */}
      <div className="max-w-[1280px] mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {FOOTER_COLS.map((col) => (
          <div key={col.heading}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-4">
              {col.heading}
            </h3>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#D1D5DB] hover:text-[#F6B7A3] transition-colors duration-140"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* SEO Information & Registered Office */}
      <div className="border-t border-[#2A2A2A]">
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div>
              <h3 className="text-sm font-bold text-white mb-4">ONLINE SHOPPING MADE EASY AT PEHNO</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                If you would like to experience the best of online shopping for men, women and kids in India, you are at the right place. Pehno is the ultimate destination for fashion and lifestyle, being host to a wide array of merchandise including clothing, footwear, accessories, jewellery, personal care products and more. It is time to redefine your style statement with our treasure-trove of trendy items. Our online store brings you the latest in designer products straight out of fashion houses. You can shop online at Pehno from the comfort of your home and get your favourites delivered right to your doorstep.
              </p>
              <h3 className="text-sm font-bold text-white mb-4">BEST ONLINE SHOPPING SITE IN INDIA FOR FASHION</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Be it clothing, footwear or accessories, Pehno offers you the ideal combination of fashion and functionality for men, women and kids. You will realise that the sky is the limit when it comes to the types of outfits that you can purchase for different occasions.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">Registered Office Address</h3>
              <div className="flex flex-col sm:flex-row justify-between gap-6 text-xs text-[#9CA3AF] leading-relaxed">
                <p>
                  Buildings Alyssa,<br/>
                  Begonia and Clover situated in Embassy Tech Village,<br/>
                  Outer Ring Road,<br/>
                  Devarabeesanahalli Village,<br/>
                  Varthur Hobli,<br/>
                  Bengaluru – 560103, India
                </p>
                <div className="whitespace-nowrap">
                  <p className="mb-1">CIN: U72300KA2007PTC041799</p>
                  <p>Telephone: <a href="tel:080-40011450" className="text-[#00a8e1] hover:underline">080-40011450</a></p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-xs text-[#9CA3AF] leading-relaxed border-t border-[#2A2A2A] pt-10">
            <div>
              <p><strong className="text-white">1. Smart men's clothing</strong> - At Pehno you will find myriad options in smart formal shirts and trousers, cool T-shirts and jeans, or kurta and pyjama combinations for men. Wear your attitude with printed T-shirts. Create the back-to-campus vibe with varsity T-shirts and distressed jeans. Be it gingham, buffalo, or window-pane style, checked shirts are unbeatably smart. Team them up with chinos, cuffed jeans or cropped trousers for a smart casual look. Opt for a stylish layered look with biker jackets. Head out in cloudy weather with courage in water-resistant jackets. Browse through our innerwear section to find supportive garments which would keep you confident in any outfit.</p>
            </div>
            <div>
              <p><strong className="text-white">2. Trendy women's clothing</strong> - Online shopping for women at Pehno is a mood-elevating experience. Look hip and stay comfortable with chinos and printed shorts this summer. Look hot on your date dressed in a little black dress, or opt for red dresses for a sassy vibe. Striped dresses and T-shirts represent the classic spirit of nautical fashion. Choose your favourites from among Bardot, off-shoulder, shirt-style, blouson, embroidered and peplum tops, to name a few. Team them up with skinny-fit jeans, skirts or palazzos. Kurtis and jeans make the perfect fusion-wear combination for the cool urbanite. Our grand sarees and lehenga-choli selections are perfect to make an impression at big social events such as weddings. Our salwar-kameez sets, kurtas and Patiala suits make comfortable options for regular wear.</p>
            </div>
            <div>
              <p><strong className="text-white">3. Fashionable footwear</strong> - While clothes maketh the man, the type of footwear you wear reflects your personality. We bring you an exhaustive lineup of options in casual shoes for men, such as sneakers and loafers. Make a power statement at work dressed in brogues and oxfords. Practice for your marathon with running shoes for men and women. Choose shoes for individual games such as tennis, football, basketball, and the like. Or step into the casual style and comfort offered by sandals, sliders, and flip-flops. Explore our lineup of fashionable footwear for ladies, including pumps, heeled boots, wedge-heels, and pencil-heels. Or enjoy the best of comfort and style with embellished and metallic flats.</p>
            </div>
            <div>
              <p><strong className="text-white">4. Stylish accessories</strong> - Pehno is one of the best online shopping sites for classy accessories that perfectly complement your outfits. You can select smart analogue or digital watches and match them up with belts and ties. Pick up spacious bags, backpacks, and wallets to store your essentials in style. Whether you prefer minimal jewellery or grand and sparkling pieces, our online jewellery collection offers you many impressive options.</p>
            </div>
            <div>
              <p><strong className="text-white">5. Fun and frolic</strong> - Online shopping for kids at Pehno is a complete joy. Your little princess is going to love the wide variety of pretty dresses, ballerina shoes, headbands and clips. Delight your son by picking up sports shoes, superhero T-shirts, football jerseys and much more from our online store. Check out our lineup of toys with which you can create memories to cherish.</p>
            </div>
            <div>
              <p><strong className="text-white">6. Beauty begins here</strong> - You can also refresh, rejuvenate and reveal beautiful skin with personal care, beauty and grooming products from Pehno. Our soaps, shower gels, skin care creams, lotions and other ayurvedic products are specially formulated to reduce the effect of aging and offer the ideal cleansing experience. Keep your scalp clean and your hair uber-stylish with shampoos and hair care products. Choose makeup to enhance your natural beauty.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand bar */}
      <div className="border-t border-[#2A2A2A]">
        <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-white hover:text-[#F6B7A3] transition-colors"
           
            aria-label="PEHNO Home"
          >
            PEHNO
          </Link>

          {/* Tagline */}
          <p className="text-xs text-[#6B7280] text-center md:text-left max-w-xs">
            Discover · Try · Compare · Decide · Buy<br />
            India's AI-first fashion & lifestyle platform.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {[
              { icon: Share2,          label: 'Instagram' },
              { icon: MessageCircle,   label: 'Twitter / X' },
              { icon: Link2,           label: 'LinkedIn' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="w-9 h-9 rounded-full border border-[#2A2A2A] hover:border-[#E67661] flex items-center justify-center text-[#6B7280] hover:text-[#E67661] transition-colors duration-140"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-footer */}
      <div className="bg-[#0D0D0D] py-5 px-6 text-center">
        <p className="text-xs text-[#4B5563]">
          © {new Date().getFullYear()} PEHNO. All rights reserved. · Warm editorial · Modern commerce · Restrained AI.
        </p>
      </div>
    </footer>
    </>
  );
}
