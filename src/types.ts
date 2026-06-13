export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  publishYear: number;
  copiesTotal: number;
  copiesAvailable: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  coverColor: string; // Tailwind bg color class, e.g., 'bg-amber-800'
  accentColor: string; // Tailwind text color class, e.g., 'text-amber-300'
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowDate: string; // ISO String
  dueDate: string; // ISO String
  returnDate?: string; // ISO String
  status: 'borrowed' | 'returned' | 'overdue';
}

export interface BookReview {
  id: string;
  bookId: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  date: string; // ISO String
}

export interface ReadingGoal {
  target: number;
  current: number;
}
