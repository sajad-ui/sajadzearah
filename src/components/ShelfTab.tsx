import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, BorrowRecord, ReadingGoal } from '../types';
import { BookOpen, Calendar, CheckCircle, RotateCcw, Award, Plus, Minus, BookMarked, Sparkles } from 'lucide-react';

interface ShelfTabProps {
  borrowedBooks: BorrowRecord[];
  books: Book[];
  readingGoal: ReadingGoal;
  onReturn: (recordId: string) => void;
  onSetGoal: (target: number) => void;
}

export default function ShelfTab({
  borrowedBooks,
  books,
  readingGoal,
  onReturn,
  onSetGoal
}: ShelfTabProps) {
  const [goalEditing, setGoalEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState<number>(readingGoal.target);

  // Parse active vs history
  const activeRecords = borrowedBooks.filter(r => r.status === 'borrowed');
  const pastRecords = borrowedBooks.filter(r => r.status === 'returned');

  // Completed matches returned status in the database state log
  const booksReadCount = pastRecords.length;
  const goalPercent = Math.min(Math.round((booksReadCount / readingGoal.target) * 100), 100);

  // Determine late status based on local date
  const isRecordOverdue = (dueDateStr: string) => {
    const today = new Date('2026-06-10'); // Simulated local time
    return new Date(dueDateStr) < today;
  };

  const handleSaveGoal = () => {
    if (tempGoal < 1) return;
    onSetGoal(tempGoal);
    setGoalEditing(false);
  };

  return (
    <div className="space-y-8 text-right" id="shelf-tab" dir="rtl">
      {/* Visual Stats Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Goal Circle widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm" id="goal-tracker-card">
          <div className="absolute top-0 left-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -z-0 pointer-events-none" />
          
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 z-10 font-sans">
            <Award size={16} className="text-blue-600" /> تحدي القراءة لعام 2026
          </h3>
 
          <div className="relative w-32 h-32 flex items-center justify-center mb-4 z-10">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                stroke="#e2e8f0"
                strokeWidth="8"
                fill="transparent"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="54"
                stroke="#2563eb" // Blue-600
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={339.292} // 2 * PI * r (54)
                initial={{ strokeDashoffset: 339.292 }}
                animate={{ strokeDashoffset: 339.292 - (339.292 * goalPercent) / 100 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-sans font-black text-slate-900">{booksReadCount}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">من {readingGoal.target} كتب</span>
            </div>
          </div>
 
          {goalEditing ? (
            <div className="flex items-center gap-2 z-10">
              <button
                onClick={() => setTempGoal(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Minus size={14} />
              </button>
              <span className="font-mono text-sm font-bold text-slate-800 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                {tempGoal}
              </span>
              <button
                onClick={() => setTempGoal(prev => prev + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={handleSaveGoal}
                className="bg-blue-600 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold hover:bg-blue-500 transition-colors border border-blue-700"
              >
                حفظ
              </button>
            </div>
          ) : (
            <div className="z-10 text-center">
              <p className="text-xs text-slate-500 font-mono font-medium mb-2">
                هدف التحدي: اكتمل بنسبة {goalPercent}%
              </p>
              <button
                onClick={() => {
                  setTempGoal(readingGoal.target);
                  setGoalEditing(true);
                }}
                className="text-blue-600 hover:text-blue-550 text-xs font-semibold underline underline-offset-4 decoration-blue-100"
              >
                تعديل هدف القراءة
              </button>
            </div>
          )}
        </div>
 
        {/* Current Borrows and Streak details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm text-right" id="active-borrows-overview">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-400 opacity-80 uppercase tracking-widest mb-1">
              الاستعارات النشطة
            </h3>
            <p className="text-4xl font-sans font-black text-slate-900 animate-fade-in">
              {activeRecords.length}
            </p>
            <p className="text-xs text-slate-550 mt-2 font-sans italic">
              {activeRecords.length === 0 
                ? "يدك الحرة للقراءة فارغة الآن! قم بزيارة الفهرس للحصول على تحفة أدبية."
                : `لديك حالياً ${activeRecords.length} كتب مستعارة في حوزتك.`
              }
            </p>
          </div>
 
          <div className="border-t border-slate-150 pt-4 mt-4 flex items-center gap-3 text-xs text-blue-900">
            <span className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <BookOpen size={16} />
            </span>
            <div>
              <span className="font-semibold block text-slate-905">الحد الأقصى: 5 كتب</span>
              <span className="text-slate-500 text-[11px]">يرجى إعادتها حتى تتمكن من استعارة المزيد</span>
            </div>
          </div>
        </div>
 
        {/* Library Info Card / Delightful Micro Interactions */}
        <div className="bg-slate-900 text-white border border-transparent rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-md text-right" id="overdue-policy-card">
          {/* Subtle cosmic abstract graphic bg */}
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
          
          <div>
            <h3 className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={11} className="text-teal-300" /> إرشادات المكتبة الافتراضية
            </h3>
            <h4 className="text-base font-sans font-extrabold text-white mt-2 leading-snug">
              "العقول الرائعة تدرك قيمة الوقت وتبادر بإعادة الكتب."
            </h4>
            <p className="text-xs text-slate-300 mt-2 font-light leading-relaxed">
              فترة الاستعارة القياسية هي 14 يومًا. لا توجد رسوم مادية للتأخير، ولكن أمين المكتبة يحتفظ بسجل رقمي للكتب المتأخرة!
            </p>
          </div>
 
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>التاريخ الحالي المحاكى:</span>
            <span className="font-bold flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded text-white border border-slate-800">
              <Calendar size={11} /> 10 حزيران، 2026
            </span>
          </div>
        </div>
      </div>
 
      {/* Your Current Borrowed Book List */}
      <div>
        <h2 className="text-xl font-sans font-extrabold text-[#0f172a] mb-4 flex items-center gap-2 text-right">
          <BookMarked size={20} className="text-blue-600 animate-bounce" /> الكتب الحالية على رفك الخاصة
        </h2>
 
        {activeRecords.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl py-12 px-4 text-center">
            <p className="text-slate-500 text-sm font-sans italic">
              يبدو رف القراءة الخاص بك فارغًا وواسعًا بمظهر أنيق.
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans">
              تصفح كتالوج الكتب المنسقة واضغط على "استعارة" لأي مجلد لبدء رحلة القراءة ومراقبة تقدمك العلمي!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {activeRecords.map(record => {
                const book = books.find(b => b.id === record.bookId);
                const isOverdue = isRecordOverdue(record.dueDate);
                return (
                  <motion.div
                    key={record.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92, y: -10 }}
                    className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow text-right"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-1">
                        <div className="text-right">
                          <h4 className="text-sm font-sans font-bold text-slate-900 leading-tight line-clamp-1">
                            {record.bookTitle}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 italic font-sans">
                            {book ? `تأليف: ${book.author}` : 'مجلد مكتبة'}
                          </p>
                        </div>
                        {book && (
                          <div className={`w-8 h-10 shrink-0 rounded ${book.coverColor} shadow-sm border border-black/10`} />
                        )}
                      </div>
 
                      <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-mono text-[11px]">تاريخ الاستعارة:</span>
                          <span className="text-slate-800 font-medium font-mono text-[11px]">
                            {new Date(record.borrowDate).toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-mono text-[11px]">موعد الإرجاع:</span>
                          <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-bold ${
                            isOverdue 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-slate-100 text-slate-705'
                          }`}>
                            {new Date(record.dueDate).toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' })}
                            {isOverdue && ' (متأخر)'}
                          </span>
                        </div>
                      </div>
                    </div>
 
                    <div className="mt-5">
                      <button
                        onClick={() => onReturn(record.id)}
                        className="w-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 transition-colors py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                        id={`return-btn-${record.id}`}
                      >
                        <RotateCcw size={13} className="animate-spin-slow" /> إرجاع إلى مكتب الاستلام
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
 
      {/* Return History / Log Logbook */}
      <div className="border-t border-slate-200 pt-8" id="logbook">
        <h2 className="text-base font-sans font-bold text-slate-900 mb-3 flex items-center gap-1.5 text-right">
          <CheckCircle size={16} className="text-emerald-600" /> سجل القراءة التاريخي الافتراضي
        </h2>
        <p className="text-slate-500 text-xs mt-1 mb-4 font-sans text-right">
          قائمة تاريخية بالكتب والمجلدات التي قمت بقرائتها وإعادتها بنجاح إلى رفوف مكتبة جامعة العين الموقرة.
        </p>
 
        {pastRecords.length === 0 ? (
          <div className="border border-[#e2e8f0] rounded-xl bg-slate-50 p-6 text-center font-sans text-xs italic text-slate-400">
            لا توجد استعارات معادة ومكتملة حتى الآن. عندما تقوم بإتمام كتاب وإرجاعه، سيسجل هنا دعماً لجهودك.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" id="reading-logbook-table">
            <table className="w-full border-collapse text-xs text-right">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest font-mono text-[10px]">
                  <th className="py-3 px-4 text-right">عنوان الكتاب</th>
                  <th className="py-3 px-4 text-right">تاريخ الاستعارة</th>
                  <th className="py-3 px-4 text-right">تاريخ الإرجاع</th>
                  <th className="py-3 px-4 text-left">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50" id={`logbook-record-${record.id}`}>
                    <td className="py-3 px-4 font-sans font-bold text-slate-900 text-right">
                      {record.bookTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] text-right">
                      {new Date(record.borrowDate).toLocaleDateString('ar-IQ')}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] text-right">
                      {record.returnDate ? new Date(record.returnDate).toLocaleDateString('ar-IQ') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-left">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium">
                        مكتمل بنجاح
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
