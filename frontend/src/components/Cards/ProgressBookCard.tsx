import Image from 'next/image';
import Link from 'next/link';

interface ProgressBookCardProps {
  id: number;
  title: string;
  author: string;
  cover_url: string | null;
  progress: number; // 0 to 100
}

export default function ProgressBookCard({ id, title, author, cover_url, progress }: ProgressBookCardProps) {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full">
      <Link href={`/user/books/${id}`} className="flex flex-col h-full">
        <div className="relative aspect-2/3 w-full overflow-hidden bg-gray-100">
          <Image
            src={cover_url || '/Placeholders/book-placeholder.png'}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        <div className="p-4 flex flex-col grow">
          <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">{title}</h3>
          <p className="text-xs text-gray-500 mb-4">{author}</p>
          
          {/* Progress Bar Section */}
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-semibold text-[#14919B]">PROGRESS</span>
              <span className="text-[10px] font-bold text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#14919B] h-full transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}