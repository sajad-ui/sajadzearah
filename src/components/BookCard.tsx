import { motion } from 'motion/react';
import { Book, BorrowRecord } from '../types';
import { Star, Bookmark, HelpCircle } from 'lucide-react';

interface BookCardProps {
  key?: string;
  book: Book;
  borrowedBooks: BorrowRecord[];
  onSelect: (book: Book) => void;
  onBorrow: (book: Book) => void;
}

export default function BookCard({ book, borrowedBooks, onSelect, onBorrow }: BookCardProps) {
  const isBorrowed = borrowedBooks.some(b => b.bookId === book.id && b.status === 'borrowed');
  const isAvailable = book.copiesAvailable > 0;

  return (
    <motion.div
      layout
      onClick={() => onSelect(book)}
      className="group relative cursor-pointer bg-white rounded-xl border border-slate-200 p-4 transition-all duration-300 hover:shadow-lg hover:border-slate-300 flex flex-col justify-between h-[360px] shadow-sm"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      id={`book-card-${book.id}`}
    >
      {/* Decorative vertical binding line inside */}
      <div className="absolute top-0 bottom-0 right-4 w-[1px] bg-slate-100 group-hover:bg-slate-200 transition-colors pointer-events-none" />

      <div>
        {/* Book Spine / Cover preview */}
        <div className={`relative h-44 rounded-md overflow-hidden ${book.coverColor} p-4 shadow-md flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.02]`} id={`book-cover-${book.id}`}>
          {/* Spine Binding Shadow - Adjusted for RTL/LTR cover aesthetics */}
          <div className="absolute top-0 right-0 bottom-0 w-3 bg-black/15 shadow-[inset_-1px_0_1px_rgba(255,255,255,0.1)]" />
          
          <div className="pr-4 text-right">
            <span className="text-[10px] uppercase tracking-widest font-mono opacity-80 text-white/90">
              {book.category}
            </span>
            <h4 className={`text-sm font-sans font-bold leading-tight mt-1 line-clamp-2 ${book.accentColor}`}>
              {book.title}
            </h4>
            <p className="text-[11px] font-sans text-white/80 mt-1 italic font-light">
              تأليف: {book.author}
            </p>
          </div>

          <div className="flex justify-between items-end pr-4 text-right">
            <span className="text-[9px] font-mono text-white/50">
              نشر عام {book.publishYear}
            </span>
            {book.rating >= 4.8 && (
              <div className="bg-blue-600 text-white font-sans font-bold text-[9px] px-1.5 py-0.5 rounded shadow-sm tracking-wider flex items-center gap-0.5">
                <Star fill="currentColor" size={8} /> كتاب مميز
              </div>
            )}
          </div>
        </div>

        {/* Text info */}
        <div className="mt-4 pr-1 text-right" id={`book-info-${book.id}`}>
          <div className="flex justify-between items-start gap-1">
            <h3 className="text-sm font-sans font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {book.title}
            </h3>
            <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-semibold text-slate-800">{book.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 text-right">
            {book.author}
          </p>
        </div>
      </div>

      <div className="mt-3 pr-1 flex items-center justify-between" id={`book-footer-${book.id}`}>
        {/* Availability status */}
        <div className="flex flex-col text-right">
          {isBorrowed ? (
            <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block border border-blue-200">
              على رفك الخاص
            </span>
          ) : isAvailable ? (
            <span className="text-[11px] font-serif font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block border border-emerald-100">
              بقي {book.copiesAvailable} نسخ متاحة
            </span>
          ) : (
            <span className="text-[11px] font-serif font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full inline-block border border-rose-100">
              مستعار بالكامل
            </span>
          )}
        </div>

        {isBorrowed ? (
          <button 
            disabled 
            className="text-slate-400 bg-slate-100 cursor-not-allowed text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200"
            id={`borrow-disabled-${book.id}`}
          >
            مستعار بالفعل
          </button>
        ) : isAvailable ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBorrow(book);
            }}
            className="bg-blue-600 border border-blue-700 text-white hover:bg-blue-500 hover:border-blue-600 transition-all text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
            id={`borrow-btn-${book.id}`}
          >
            استعارة
          </button>
        ) : (
          <button
            disabled
            className="bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed text-xs font-medium px-3 py-1.5 rounded-lg"
            id={`outofstock-btn-${book.id}`}
          >
            غير متاح حالياً
          </button>
        )}
      </div>
    </motion.div>
  );
}
