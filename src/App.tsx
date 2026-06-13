import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, BorrowRecord, BookReview, ReadingGoal } from './types';
import { INITIAL_BOOKS, INITIAL_REVIEWS, CATEGORIES } from './data';
import BookCard from './components/BookCard';
import BookDetailModal from './components/BookDetailModal';
import ShelfTab from './components/ShelfTab';
import AddBookModal from './components/AddBookModal';
import { 
  Library, 
  Search, 
  Sparkles, 
  BookMarked, 
  BookOpen, 
  FilePlus, 
  HelpCircle,
  TrendingUp,
  Award,
  Plus,
  Smile,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // --- States ---
  const [books, setBooks] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowRecord[]>([]);
  const [readingGoal, setReadingGoal] = useState<ReadingGoal>({ target: 10, current: 0 });

  const [activeTab, setActiveTab] = useState<'catalog' | 'shelf'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('جميع الفئات');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // Modals
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);

  // App notification banner state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // --- Initializer from localStorage ---
  useEffect(() => {
    const savedBooks = localStorage.getItem('virtual_library_books');
    const savedReviews = localStorage.getItem('virtual_library_reviews');
    const savedBorrows = localStorage.getItem('virtual_library_borrows');
    const savedGoal = localStorage.getItem('virtual_library_goal');

    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    } else {
      setBooks(INITIAL_BOOKS);
      localStorage.setItem('virtual_library_books', JSON.stringify(INITIAL_BOOKS));
    }

    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews(INITIAL_REVIEWS);
      localStorage.setItem('virtual_library_reviews', JSON.stringify(INITIAL_REVIEWS));
    }

    if (savedBorrows) {
      setBorrowedBooks(JSON.parse(savedBorrows));
    } else {
      setBorrowedBooks([]);
    }

    if (savedGoal) {
      setReadingGoal(JSON.parse(savedGoal));
    } else {
      setReadingGoal({ target: 8, current: 0 });
    }
  }, []);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // --- Handlers ---
  const handleBorrow = (book: Book) => {
    const activeBorrows = borrowedBooks.filter(b => b.status === 'borrowed');
    
    // Check limit
    if (activeBorrows.length >= 5) {
      triggerToast('لقد وصلت إلى الحد الأقصى للاستعارة! يرجى إرجاع بعض الكتب لاستعارة المزيد.', 'error');
      return;
    }

    // Check availability
    if (book.copiesAvailable <= 0) {
      triggerToast('عذرًا، لا تتوفر نسخ من هذا الكتاب حاليًا للاستعارة.', 'error');
      return;
    }

    // Check duplicate
    const isAlreadyBorrowed = activeBorrows.some(b => b.bookId === book.id);
    if (isAlreadyBorrowed) {
      triggerToast(`"${book.title}" مستعار بالفعل وموجود على رفك النشط!`, 'info');
      return;
    }

    // Create record
    const today = new Date('2026-06-10T10:57:12Z'); // Current simulated platform date
    const dueDate = new Date('2026-06-10T10:57:12Z');
    dueDate.setDate(today.getDate() + 14); // 2-week borrowing duration

    const newRecord: BorrowRecord = {
      id: Math.random().toString(36).substring(2, 9),
      bookId: book.id,
      bookTitle: book.title,
      borrowDate: today.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'borrowed'
    };

    // Update lists
    const updatedBorrows = [newRecord, ...borrowedBooks];
    const updatedBooks = books.map(b => {
      if (b.id === book.id) {
        return { ...b, copiesAvailable: b.copiesAvailable - 1 };
      }
      return b;
    });

    setBorrowedBooks(updatedBorrows);
    setBooks(updatedBooks);
    
    // Update local storages
    localStorage.setItem('virtual_library_borrows', JSON.stringify(updatedBorrows));
    localStorage.setItem('virtual_library_books', JSON.stringify(updatedBooks));

    // Update active modal selected book references to match newest state
    if (selectedBook && selectedBook.id === book.id) {
      setSelectedBook({ ...selectedBook, copiesAvailable: selectedBook.copiesAvailable - 1 });
    }

    triggerToast(`تمت استعارة "${book.title}" بنجاح! وإضافته إلى رفك الخاص.`, 'success');
  };

  const handleReturn = (recordId: string) => {
    const today = new Date('2026-06-10T10:57:12Z');

    const updatedBorrows = borrowedBooks.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          status: 'returned' as const,
          returnDate: today.toISOString()
        };
      }
      return rec;
    });

    const record = borrowedBooks.find(r => r.id === recordId);
    if (!record) return;

    const updatedBooks = books.map(b => {
      if (b.id === record.bookId) {
        return { ...b, copiesAvailable: Math.min(b.copiesAvailable + 1, b.copiesTotal) };
      }
      return b;
    });

    setBorrowedBooks(updatedBorrows);
    setBooks(updatedBooks);

    localStorage.setItem('virtual_library_borrows', JSON.stringify(updatedBorrows));
    localStorage.setItem('virtual_library_books', JSON.stringify(updatedBooks));

    triggerToast(`تم إرجاع "${record.bookTitle}" إلى مكتبة الجامعة بنجاح! قراءة ممتعة.`, 'success');
  };

  const handleAddReview = (bookId: string, rating: number, reviewText: string, reviewerName: string) => {
    const newReview: BookReview = {
      id: `rev-${Math.random().toString(36).substring(2, 7)}`,
      bookId,
      reviewerName,
      rating,
      reviewText,
      date: new Date('2026-06-10T10:57:12Z').toISOString()
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('virtual_library_reviews', JSON.stringify(updatedReviews));

    // Recalculate book average rating
    const bookReviews = updatedReviews.filter(r => r.bookId === bookId);
    const avgRating = bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;

    const updatedBooks = books.map(b => {
      if (b.id === bookId) {
        return {
          ...b,
          rating: Number(avgRating.toFixed(1)),
          reviewsCount: bookReviews.length
        };
      }
      return b;
    });

    setBooks(updatedBooks);
    localStorage.setItem('virtual_library_books', JSON.stringify(updatedBooks));

    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook({
        ...selectedBook,
        rating: Number(avgRating.toFixed(1)),
        reviewsCount: bookReviews.length
      });
    }
  };

  const handleAddNewBook = (newBookData: Omit<Book, 'rating' | 'reviewsCount'>) => {
    const fullBook: Book = {
      ...newBookData,
      rating: 5.0, // Default pure 5 stars for custom additions
      reviewsCount: 0
    };

    const updatedBooks = [fullBook, ...books];
    setBooks(updatedBooks);
    localStorage.setItem('virtual_library_books', JSON.stringify(updatedBooks));
    triggerToast(`تم إدراج كتاب "${fullBook.title}" للكاتب ${fullBook.author} في الفهرس بنجاح!`, 'success');
  };

  const handleSetGoal = (target: number) => {
    const newGoal = { ...readingGoal, target };
    setReadingGoal(newGoal);
    localStorage.setItem('virtual_library_goal', JSON.stringify(newGoal));
    triggerToast(`تم تحديث هدف تحدي القراءة إلى ${target} كُتب!`, 'info');
  };

  // --- Computed Books List Filter ---
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.isbn.includes(searchQuery) ||
                          book.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'جميع الفئات' || book.category === selectedCategory;
    const matchesAvailable = !showAvailableOnly || book.copiesAvailable > 0;

    return matchesSearch && matchesCategory && matchesAvailable;
  });

  // Spotlight Book (the highest rated book in our catalog)
  const spotlightBook = books.reduce((max, book) => book.rating > max.rating ? book : max, books[0] || null);

  const activeLoansCount = borrowedBooks.filter(b => b.status === 'borrowed').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900" dir="rtl">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            id="toast-banner"
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border ${
              toast.type === 'success' 
                ? 'bg-slate-900 text-emerald-300 border-slate-800' 
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-50 border-rose-800'
                : 'bg-slate-900 text-blue-200 border-slate-800'
            }`}
          >
            {toast.type === 'success' ? <Smile size={16} className="text-emerald-400" /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern High-End Site Header */}
      <header className="sticky top-0 bg-slate-900 text-white border-b-4 border-blue-600 shadow-md z-30 py-4 px-4 md:px-6" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm inline-flex justify-center items-center">
              <Library size={20} />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                مكتبة جامعة العين العراقية
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#94a3b8] font-bold block mt-1">
                المكتبة الافتراضية الرسمية • صرح المعرفة الأكاديمي
              </span>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-4">
            <nav className="bg-slate-800 border border-slate-700 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'catalog' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:text-white'
                }`}
                id="catalog-tab-btn"
              >
                فهرس الكتب
              </button>
              <button
                onClick={() => setActiveTab('shelf')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 relative ${
                  activeTab === 'shelf' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:text-white'
                }`}
                id="shelf-tab-btn"
              >
                <BookMarked size={13} />
                رفي الخاص
                {activeLoansCount > 0 && (
                  <span className="bg-slate-900 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                    {activeLoansCount}
                  </span>
                )}
              </button>
            </nav>

            <button
              onClick={() => setIsAddBookOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4.5 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors border border-blue-700"
              id="header-add-book-btn"
            >
              <FilePlus size={14} /> إضافة كتاب
            </button>
          </div>

        </div>
      </header>

      {/* Active Tab viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6" id="main-workbench">
        {activeTab === 'catalog' ? (
          <div className="space-y-8" id="catalog-view">
            
            {/* Elegant Hero / Search Section */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm border-r-4 border-[#2563eb]" id="curated-search-hero">
              <div className="absolute top-0 left-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-60 -z-0 pointer-events-none" />
              
              <div className="max-w-2xl relative z-10">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#2563eb] font-bold bg-blue-50 px-2.5 py-1 rounded-full">
                  كتالوج التميز العلمي والبحثي
                </span>
                <h2 className="text-2xl md:text-3.5xl font-serif font-black text-[#0f172a] mt-3 leading-tight tracking-tight text-right">
                  اكتشف منارة المعرفة والبحث العلمي في جامعة العين
                </h2>
                <p className="text-slate-500 text-xs md:text-sm mt-1.5 font-serif italic text-right">
                  استكشف مجموعتنا المتميزة والمنسقة حديثاً للأكاديميين والطلاب؛ للارتقاء بمسيرتكم المعرفية والبحثية.
                </p>

                {/* Search Bar Input */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن الكتب بواسطة العنوان، الكاتب، التصنيف، الكلمات المفتاحية، أو الرقم الدولي (ISBN)..."
                      className="w-full pr-9 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 font-medium text-right"
                      id="catalog-search-input"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-mono"
                      >
                        مسح
                      </button>
                    )}
                  </div>

                  {/* Show Available Filter checkbox */}
                  <button
                    onClick={() => setShowAvailableOnly(p => !p)}
                    className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border text-xs font-semibold transition-all select-none ${
                      showAvailableOnly 
                        ? 'bg-blue-50 border-blue-200 text-[#1e40af]' 
                        : 'bg-[#f1f5f9] border border-[#cbd5e1] text-[#334155] hover:bg-slate-200'
                    }`}
                    id="available-only-toggle"
                  >
                    <BookOpen size={14} />
                    {showAvailableOnly ? 'عرض المتاح فقط' : 'عرض كافة الكتب'}
                  </button>
                </div>
              </div>
            </section>

            {/* Split layout: Category and books list */}
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Sidebar Category Segment */}
              <div className="lg:w-1/4 space-y-6 shrink-0">
                <div className="bg-white border border-slate-200 rounded-2xl p-5" id="genre-sidebar">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 text-right">
                    تصنيفات الكتب
                  </h3>
                  <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                    {CATEGORIES.map(category => {
                      const count = category === 'جميع الفئات' 
                        ? books.length 
                        : books.filter(b => b.category === category).length;

                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`text-xs font-semibold px-3 py-2 rounded-lg text-right transition-all flex justify-between items-center whitespace-nowrap lg:w-full ${
                            selectedCategory === category 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                          id={`category-btn-${category.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          <span>{category}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                            selectedCategory === category
                              ? 'bg-blue-800 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Spotlight "Recommended Picker" panel */}
                {spotlightBook && (
                  <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-md text-right" id="spotlight-panel">
                    <div className="absolute top-0 left-0 p-3 text-blue-400">
                      <Sparkles size={16} />
                    </div>
                    
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-400">
                      ترشيح متميز وخاص
                    </span>
                    <h4 className="text-sm font-sans font-extrabold text-white mt-1">
                      {spotlightBook.title}
                    </h4>
                    <p className="text-slate-400 text-xs mt-0.5 font-sans italic">
                      بواسطة الكاتب: {spotlightBook.author}
                    </p>
                    <p className="text-slate-300 text-xs font-sans leading-relaxed line-clamp-3 mt-3">
                      {spotlightBook.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-0.5 text-xs text-blue-300">
                        <span className="font-bold">{spotlightBook.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-500 mr-1">({spotlightBook.reviewsCount} تقييم)</span>
                      </div>
                      <button
                        onClick={() => setSelectedBook(spotlightBook)}
                        className="bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[10px] font-bold py-1.5 px-3 rounded-lg"
                        id="view-spotlight-btn"
                      >
                        معاينة الكتاب
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid content */}
              <div className="lg:w-3/4 space-y-4 flex-1">
                <div className="flex justify-between items-center text-xs text-slate-550 font-mono text-right pb-1">
                  <span>تم العثور على {filteredBooks.length} كتب متاحة في الفهرس</span>
                  {selectedCategory !== 'جميع الفئات' && (
                    <span>التصفية حسب: <strong>{selectedCategory}</strong></span>
                  )}
                </div>

                {filteredBooks.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl py-16 px-4 text-center">
                    <HelpCircle size={36} className="mx-auto text-slate-300" />
                    <p className="text-slate-600 font-sans italic mt-3 font-medium">
                      لم يتم العثور على أي مجلدات مطابقة لبحثك في الفهرس.
                    </p>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                      يرجى التحقق من صياغة جملة البحث، أو تصفية الخيارات، أو تسجيل كتاب جديد بالضغط على زر "إضافة كتاب" أعلاه.
                    </p>
                    {(searchQuery || selectedCategory !== 'جميع الفئات' || showAvailableOnly) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('جميع الفئات');
                          setShowAvailableOnly(false);
                        }}
                        className="mt-4 bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                        id="clear-filters-btn"
                      >
                        إعادة تعيين كافة المرشحات
                      </button>
                    )}
                  </div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    id="catalog-grid"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredBooks.map(book => (
                        <BookCard
                          key={book.id}
                          book={book}
                          borrowedBooks={borrowedBooks}
                          onSelect={setSelectedBook}
                          onBorrow={handleBorrow}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

            </div>

          </div>
        ) : (
          /* Shelf management View Tab */
          <ShelfTab
            borrowedBooks={borrowedBooks}
            books={books}
            readingGoal={readingGoal}
            onReturn={handleReturn}
            onSetGoal={handleSetGoal}
          />
        )}
      </main>

      {/* Modern High-End Site Footer */}
      <footer className="bg-slate-900 text-[#cbd5e1] border-t border-slate-950 py-8 mt-12 text-xs" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-right">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 rounded text-white">
              <Library size={13} />
            </span>
            <span>نظام مكتبة جامعة العين العراقية • واجهة الصرح المعرفي الأكاديمي المطور.</span>
          </div>

          <div className="flex gap-6 text-[11px] text-[#94a3b8] font-mono">
            <a href="#" className="hover:text-blue-400 transition-colors">اتصل بأمين المكتبة</a>
            <a href="#" className="hover:text-blue-400 transition-colors">المساهمات المعرفية</a>
            <span>وقت النظام المحاكى: 2026-06-10</span>
          </div>
        </div>
      </footer>

      {/* Book details inspecting modal */}
      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            reviews={reviews}
            borrowedBooks={borrowedBooks}
            onClose={() => setSelectedBook(null)}
            onBorrow={handleBorrow}
            onAddReview={handleAddReview}
          />
        )}
      </AnimatePresence>

      {/* Add new custom book to catalog modal */}
      <AnimatePresence>
        {isAddBookOpen && (
          <AddBookModal
            onClose={() => setIsAddBookOpen(false)}
            onAdd={handleAddNewBook}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
