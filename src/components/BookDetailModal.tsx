import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, BookReview, BorrowRecord } from '../types';
import { X, Star, Calendar, Bookmark, Tag, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

interface BookDetailModalProps {
  book: Book;
  reviews: BookReview[];
  borrowedBooks: BorrowRecord[];
  onClose: () => void;
  onBorrow: (book: Book) => void;
  onAddReview: (bookId: string, rating: number, reviewText: string, reviewerName: string) => void;
}

export default function BookDetailModal({
  book,
  reviews,
  borrowedBooks,
  onClose,
  onBorrow,
  onAddReview
}: BookDetailModalProps) {
  const [reviewerName, setReviewerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isBorrowed = borrowedBooks.some(b => b.bookId === book.id && b.status === 'borrowed');
  const filteredReviews = reviews.filter(rev => rev.bookId === book.id);
  const isAvailable = book.copiesAvailable > 0;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewText.trim()) return;

    onAddReview(book.id, newRating, reviewText, reviewerName);
    setReviewerName('');
    setReviewText('');
    setSuccessMsg('شكراً لك! لقد تم نشر مراجعتك بنجاح.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-right" id="book-detail-modal" dir="rtl">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Content container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto z-10 p-6 md:p-8 flex flex-col md:flex-row gap-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          id="close-modal-btn"
        >
          <X size={20} />
        </button>

        {/* Cover Spine / Structural Left Side */}
        <div className="md:w-1/3 flex flex-col gap-4 text-right">
          <div className={`aspect-[3/4] rounded-xl overflow-hidden ${book.coverColor} p-6 shadow-xl relative flex flex-col justify-between`}>
            {/* Binding shadow */}
            <div className="absolute top-0 bottom-0 right-0 w-4 bg-black/20 shadow-[inset_-1px_0_1px_rgba(255,255,255,0.1)]" />
            
            <div className="pr-3 text-right">
              <span className="text-[11px] uppercase tracking-widest font-mono text-white/70">
                {book.category}
              </span>
              <h2 className={`text-2xl font-sans font-bold leading-tight mt-2 ${book.accentColor}`}>
                {book.title}
              </h2>
              <p className="text-sm font-sans text-white/90 italic font-light mt-1">
                تأليف: {book.author}
              </p>
            </div>

            <div className="flex justify-between items-end pr-3">
              <span className="text-xs font-mono text-white/40">
                ردمك: {book.isbn.split('-')[1] || book.isbn}
              </span>
              {book.rating >= 4.8 && (
                <div className="bg-blue-600 text-white font-sans font-bold text-[10px] px-2 py-0.5 rounded shadow-sm tracking-wider">
                  موصى به
                </div>
              )}
            </div>
          </div>

          {/* Book Details Info list */}
          <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 text-xs space-y-2.5 text-right">
            <div className="flex justify-between border-b border-slate-200/50 pb-2">
              <span className="text-slate-500 font-medium">تاريخ نشر المجلد</span>
              <span className="text-slate-900 font-semibold">{book.publishYear}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/50 pb-2">
              <span className="text-slate-500 font-medium font-mono">ردمك (ISBN-13)</span>
              <span className="text-slate-900 font-medium font-mono">{book.isbn}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/50 pb-2">
              <span className="text-slate-500 font-medium">حالة التوفر على الرفوف</span>
              <span className="text-slate-900 font-semibold text-emerald-700">
                متاح {book.copiesAvailable} من أصل {book.copiesTotal} نسخ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">المجال الأكاديمي</span>
              <span className="text-blue-600 font-semibold">{book.category}</span>
            </div>
          </div>

          {/* Checkout Action */}
          <div className="mt-2 text-right">
            {isBorrowed ? (
              <div className="w-full bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold rounded-xl py-3 px-4 flex items-center justify-center gap-2">
                <Bookmark className="fill-blue-600 stroke-blue-600" size={16} /> متوفر حالياً على رفك النشط!
              </div>
            ) : isAvailable ? (
              <button
                onClick={() => onBorrow(book)}
                className="w-full bg-blue-600 hover:bg-blue-550 text-white active:scale-[0.98] transition-all font-semibold text-sm rounded-xl py-3 px-4 shadow-md flex items-center justify-center gap-2 border border-blue-750"
                id="modal-checkout-btn"
              >
                استعارة الكتاب الآن
              </button>
            ) : (
              <div className="w-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl py-3 px-4 flex items-start gap-1">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="text-right">
                  <span className="block font-bold">غير متوفر حالياً للاستعارة</span>
                  جميع النسخ المادية المودعة قيد الاستعارة والقراءة الورقية حالياً.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews and Details / Structural Right Side */}
        <div className="md:w-2/3 flex flex-col gap-6 text-right" id="book-expanded-details">
          <div>
            <div className="flex items-center gap-3 justify-start">
              <span className="bg-blue-50 text-blue-700 font-mono text-[11px] px-2.5 py-1 rounded-full font-bold">
                {book.category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
                <Star fill="currentColor" size={15} /> {book.rating.toFixed(1)} / 5.0
                <span className="text-slate-400 font-normal mr-1.5 font-sans">({filteredReviews.length} {filteredReviews.length === 1 ? 'تقييم طالب' : 'تقييمات قراء'})</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-slate-900 mt-2 tracking-tight text-right animate-fade-in">
              {book.title}
            </h1>
            <p className="text-slate-600 text-sm italic mt-1 font-sans text-right">
              بقلم الكاتب والباحث الموقر <span className="font-semibold text-slate-900">{book.author}</span>
            </p>

            <h3 className="text-sm font-bold text-slate-900 mt-5 border-b border-slate-200 pb-1 uppercase tracking-wider text-right">
              ملخص وتعريف المجلد
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed mt-2.5 font-sans text-right">
              {book.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4 justify-start">
              {book.tags.map((tag, i) => (
                <span key={i} className="bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 text-xs rounded-lg px-2.5 py-1 flex items-center gap-1 font-mono">
                  <Tag size={10} className="text-slate-405" /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Reader Notes / Public Reviews */}
          <div className="border-t border-slate-200 pt-6 text-right">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-4 justify-start">
              <MessageSquare size={16} /> مراجعات وآراء قراء مجتمع جامعة العين
            </h3>

            {/* Review List */}
            <div className="space-y-4 max-h-56 overflow-y-auto pl-3 mb-6">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-slate-500 text-xs font-sans italic">
                    هذا الكتاب المتميز لا يزال بانتظار تقييمه الأول. بادر بمشاركة مراجعتك الأكاديمية الأولى!
                  </p>
                </div>
              ) : (
                filteredReviews.map((rev) => (
                  <div key={rev.id} className="bg-[#f8fafc]/50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-right">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-900">{rev.reviewerName}</span>
                      <span className="text-slate-400 font-mono">
                        {new Date(rev.date).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex gap-0.5 text-amber-500 justify-start">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < rev.rating ? 'currentColor' : 'none'}
                          className={i < rev.rating ? 'text-amber-500' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                    <p className="text-slate-600 text-xs font-sans leading-relaxed italic pr-2 text-right">
                      "{rev.reviewText}"
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Write a review */}
            <form onSubmit={handleSubmitReview} className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 space-y-3 text-right">
              <h4 className="text-xs font-bold text-slate-955 uppercase tracking-wide flex items-center gap-1.5 justify-start">
                <Sparkles size={13} className="text-blue-500" /> دون انطباعاتك ورأيك الأكاديمي المفصل
              </h4>

              {successMsg && (
                <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg font-medium text-right">
                  {successMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1 text-right">
                    اسمك أو صفتك المفضلة
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={e => setReviewerName(e.target.value)}
                    placeholder="مثال: باحث أكاديمي، طالب"
                    className="w-full text-xs border border-slate-200 bg-white px-3 py-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                    id="reviewer-name-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1 text-right">
                    درجة التقييم
                  </label>
                  <div className="flex gap-1 py-1.5 justify-start">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setNewRating(i + 1)}
                        className="text-amber-500 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          size={16}
                          fill={i < newRating ? 'currentColor' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1 text-right">
                  ملاحظات القارئ ورأيه
                </label>
                <textarea
                  required
                  rows={2}
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="اكتب مراجعتك أو رأيك حول الكتاب بموضوعية ووجازة..."
                  className="w-full text-xs border border-slate-200 bg-white p-3 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-right"
                  id="review-text-input"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-550 hover:border-blue-700 text-xs font-semibold px-4 py-2 rounded-lg shadow transition-colors"
                  id="submit-review-btn"
                >
                  نشر تقييمي ومراجعتي
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
