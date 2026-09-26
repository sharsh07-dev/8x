export const metadata = { title: 'Help & Customer Support | PEHNO' };

export default function HelpPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-20 min-h-[60vh]">
      <h1 className="text-4xl font-normal text-[#171717] mb-8">Help & Support</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Your Orders', desc: 'Track packages, edit or cancel orders' },
          { title: 'Returns & Refunds', desc: 'Return or exchange items, print return mailing labels' },
          { title: 'Shipping & Delivery', desc: 'Shipping rates, delivery options and timelines' },
          { title: 'Payment & Security', desc: 'Manage payment methods, secure your account' },
        ].map(item => (
          <div key={item.title} className="p-6 border border-[#E3E1DD] rounded-2xl bg-white hover:border-[#E67661] cursor-pointer transition-colors">
            <h3 className="text-lg font-bold text-[#171717] mb-2">{item.title}</h3>
            <p className="text-sm text-[#6B7280]">{item.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-8 bg-[#F9F6F1] rounded-3xl text-center">
        <h2 className="text-2xl font-normal text-[#171717] mb-4">Need more help?</h2>
        <p className="text-[#4b5563] mb-6">Our customer support team is available 24/7 to assist you.</p>
        <button className="px-6 py-3 bg-[#171717] text-white font-bold rounded-full hover:bg-[#E67661] transition-colors">
          Contact Us
        </button>
      </div>
    </div>
  );
}
