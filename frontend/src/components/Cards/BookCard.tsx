import Image from 'next/image';
import Link from 'next/link';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  cover_url: string | null;
}

export default function BookCard({ id, title, author, cover_url }: BookCardProps) {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full">
      <Link href={`/user/books/${id}`} className="flex flex-col h-full">
        {/* Aspect ratio 2/3 is standard for book covers */}
        <div className="relative aspect-2/3 w-full overflow-hidden bg-gray-100">
          <Image
            src={cover_url || '/Placeholders/book-placeholder.png'} // Fallback image
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        <div className="p-4 flex flex-col grow">
          <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug mb-1">
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-auto">{author}</p>
        </div>
      </Link>
    </div>
  );
}