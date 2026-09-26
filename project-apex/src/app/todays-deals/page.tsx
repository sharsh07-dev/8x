export const metadata = { title: "Today's Deals | PEHNO" };

export default function TodaysDealsPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-20 min-h-[60vh]">
      <h1 className="text-4xl font-normal text-[#171717] mb-4">Today's Deals</h1>
      <p className="text-[#6B7280] mb-12">Discover the best daily offers across top brands on PEHNO.</p>
      
      <div className="flex flex-col items-center justify-center p-12 bg-[#F9F6F1] rounded-3xl text-center border border-[#E3E1DD]">
        <h2 className="text-2xl font-bold text-[#171717] mb-2">New Deals Dropping Soon</h2>
        <p className="text-[#4b5563]">Check back daily at 12:00 AM for exclusive 24-hour offers.</p>
      </div>
    </div>
  );
}
