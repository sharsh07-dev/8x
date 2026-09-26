export const metadata = {
  title: 'About PEHNO',
  description: 'Learn about PEHNO - India\'s AI-first fashion platform',
};

export default function AboutPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-20 min-h-[60vh]">
      <h1 className="text-4xl font-normal text-[#171717] mb-6">About PEHNO</h1>
      <div className="prose prose-sm md:prose-base prose-neutral max-w-none text-[#4b5563]">
        <p>
          Welcome to <strong className="text-[#171717]">PEHNO</strong>, India's premier AI-first fashion & lifestyle platform. 
          We believe that finding the perfect look should be intuitive, exciting, and effortless.
        </p>
        <p className="mt-4">
          Our mission is to revolutionize how you discover, try, and decide what to wear. 
          With state-of-the-art virtual try-on, AI-powered outfit building, and a curated selection of top-tier brands and independent designers, PEHNO isn't just a store—it's your personal stylist.
        </p>
        <h2 className="text-2xl font-normal text-[#171717] mt-10 mb-4">Our Story</h2>
        <p>
          Born from a desire to blend cutting-edge technology with high-fashion aesthetics, PEHNO was founded to solve the modern wardrobe dilemma. We combine the vast selection of traditional e-commerce with the personalized touch of boutique shopping.
        </p>
      </div>
    </div>
  );
}
