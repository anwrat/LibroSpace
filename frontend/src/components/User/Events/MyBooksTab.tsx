import { BookOpen } from "lucide-react";
import Image from "next/image";

export default function MyBooksTab({ myListings }: any) {
  if (myListings.length === 0) return (
    <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
       <BookOpen size={48} className="mx-auto text-gray-100 mb-4" />
       <p className="text-gray-400 font-black text-xl italic">You haven't listed anything.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {myListings.map((listing: any) => (
        <MyListingCard key={listing.id} data={listing} />
      ))}
    </div>
  );
}

function MyListingCard({ data }: { data: any }) {
  return (
    <div className="group bg-white rounded-[2.5rem] p-5 border border-gray-100 hover:shadow-xl transition-all duration-500">
      <div className="relative aspect-3/4 rounded-[2rem] overflow-hidden mb-6 shadow-md">
        {data.image_url ? (
          <Image src={data.image_url} alt={data.book_title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-[#14919B]/5 flex items-center justify-center font-black text-[#14919B]/20 text-4xl italic">
            {data.book_title[0]}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-[#14919B] border border-[#14919B]/10">
          YOUR LISTING
        </div>
      </div>
      <h3 className="font-black text-gray-900 text-lg line-clamp-1 italic px-2">{data.book_title}</h3>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">{data.location_city}</p>
    </div>
  );
}