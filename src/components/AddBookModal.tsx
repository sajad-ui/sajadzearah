import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Book } from '../types';
import { X, BookOpen, AlertCircle, FilePlus, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data';

interface AddBookModalProps {
  onClose: () => void;
  onAdd: (book: Omit<Book, 'rating' | 'reviewsCount'>) => void;
}

const AVAILABLE_SPINES = [
  { name: 'الأزرق النيلي الداكن', colorClass: 'bg-[#1e1b4b]', accent: 'text-[#38bdf8]' },
  { name: 'الأحمر القرمزي', colorClass: 'bg-[#991b1b]', accent: 'text-[#f5f5f4]' },
  { name: 'أخضر الغابات الأكاديمي', colorClass: 'bg-[#15803d]', accent: 'text-[#ffedd5]' },
  { name: 'التركواز المائي', colorClass: 'bg-[#0369a1]', accent: 'text-[#e0f2fe]' },
  { name: 'الدارسيني الدافئ', colorClass: 'bg-[#854d0e]', accent: 'text-[#fef08a]' },
  { name: 'الحجري الفحمي', colorClass: 'bg-[#1e293b]', accent: 'text-[#fbbf24]' },
  { name: 'البرقوقي الإمبراطوري', colorClass: 'bg-[#581c87]', accent: 'text-[#fae8ff]' },
  { name: 'الخشبي الوردي', colorClass: 'bg-[#9f1239]', accent: 'text-[#ffe4e6]' }
];

export default function AddBookModal({ onClose, onAdd }: AddBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1] || 'الكتب الأكاديمية');
  const [description, setDescription] = useState('');
  const [publishYear, setPublishYear] = useState<number>(2026);
  const [copiesTotal, setCopiesTotal] = useState<number>(3);
  const [tags, setTags] = useState('');
  
  // Selected visual index matching custom spines
  const [spineIndex, setSpineIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !isbn.trim() || !description.trim()) return;

    // Split tags csv
    const arrayTags = tags
      ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [category, 'وصول جديد'];

    const newBook: Omit<Book, 'rating' | 'reviewsCount'> = {
      id: Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      category,
      description: description.trim(),
      publishYear: publishYear || 2026,
      copiesTotal: copiesTotal || 1,
      copiesAvailable: copiesTotal || 1,
      tags: arrayTags,
      coverColor: AVAILABLE_SPINES[spineIndex].colorClass,
      accentColor: AVAILABLE_SPINES[spineIndex].accent,
    };

    onAdd(newBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-right" id="add-book-modal" dir="rtl">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Box container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 p-6 md:p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          id="close-addbook-btn"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="text-blue-600" size={20} />
          <h2 className="text-xl font-sans font-extrabold text-[#0f172a] tracking-tight flex items-center gap-1">
            منصة تسجيل وترميز المجلدات والكتب الأكاديمية <Sparkles size={14} className="text-blue-505" />
          </h2>
        </div>
        <p className="text-slate-550 text-xs mb-6 font-sans">
          قم بإدراج وتصنيف كتاب مادي أو مجلد بحثي جديد في فهرس جامعة العين العراقية. سيتاح فوراً للطلاب والأكاديميين للمعاينات الورقية والاستعارة الرقمية!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main info row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                عنوان المجلد / الكتاب المالي
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: مقدمة في خوارزميات الحوسبة"
                className="w-full text-xs border border-slate-200 bg-white px-3 py-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-right"
                id="addbook-title"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                الاسم الكامل للمؤلف الباحث
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="مثال: د. علي عبد الرحمن الرافدين"
                className="w-full text-xs border border-slate-200 bg-white px-3 py-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-right"
                id="addbook-author"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                رقم تصنيف الكتاب الموحد (ISBN)
              </label>
              <input
                type="text"
                required
                value={isbn}
                onChange={e => setIsbn(e.target.value)}
                placeholder="مثال: 978-0141439517"
                className="w-full text-xs border border-slate-200 bg-white px-3 py-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-right"
                id="addbook-isbn"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                قطاع تصنيف الكتب الأكاديمية
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-xs border border-slate-200 bg-white px-3 py-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-right"
                id="addbook-category"
              >
                {CATEGORIES.filter(c => c !== 'جميع الفئات').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                سنة وبداية النشر الفعلي
              </label>
              <input
                type="number"
                min="1000"
                max="2035"
                required
                value={publishYear}
                onChange={e => setPublishYear(Number(e.target.value))}
                placeholder="مثال: 2026"
                className="w-full text-xs border border-slate-200 bg-white px-3 py-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-right"
                id="addbook-year"
              />
            </div>
          </div>

          {/* Spine style picker with live preview */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
              تصميم ومظهر غلاف المجلد والظهر التجليدي
            </span>
            <div className="flex flex-wrap gap-2 justify-start">
              {AVAILABLE_SPINES.map((spine, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSpineIndex(i)}
                  className={`w-8 h-8 rounded-full ${spine.colorClass} border-2 ${
                    spineIndex === i ? 'ring-2 ring-blue-600 scale-110 border-white' : 'border-slate-300'
                  } transition-all`}
                  title={spine.name}
                  id={`spine-picker-${i}`}
                />
              ))}
            </div>

            {/* Custom live spine cover outline layout */}
            <div className="flex items-center gap-3 pt-2">
              <div className="text-xs text-slate-500 italic text-right">المعاينة المباشرة للغلاف:</div>
              <div className={`w-32 h-16 rounded-md ${AVAILABLE_SPINES[spineIndex].colorClass} p-2 flex flex-col justify-between shadow border border-black/10`}>
                <div className="h-1 w-full bg-black/10" />
                <div className="text-[10px] font-bold leading-tight line-clamp-1 text-center font-sans text-white px-1">
                  {title || 'عنوان المجلد'}
                </div>
                <div className="h-1 w-full bg-black/10" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              الملخص والنبذة التعريفية للكتاب
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="اكتب ملخصاً تعريفياً وافياً للباحثين والقراء الكرام في الفهرس..."
              className="w-full text-xs border border-slate-200 bg-white p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans leading-relaxed text-right"
              id="addbook-description"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                الكلمات المفتاحية المساعدة (مفصولة بفواصل)
              </label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="مثال: ذكاء، طاقة، تكنولوجيا، مجلد"
                className="w-full text-xs border border-slate-200 bg-white px-3 py-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-right"
                id="addbook-tags"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                إجمالي النسخ المادية المودعة عند البدء
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={copiesTotal}
                onChange={e => setCopiesTotal(Number(e.target.value))}
                placeholder="النسخ الإجمالية للمكتبة"
                className="w-full text-xs border border-slate-200 bg-white px-3 py-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-right"
                id="addbook-copies"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              id="addbook-cancel-btn"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 hover:border-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 border border-blue-750"
              id="addbook-submit-btn"
            >
              <FilePlus size={14} /> تسجيل وإدراج المجلد
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
