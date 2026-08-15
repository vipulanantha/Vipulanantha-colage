import React, { useState } from 'react';
import { LibraryBook, BookBorrowing } from '../types/sms';
import { BookOpen, Plus, Search, BookMarked, Clock, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface LibraryManagerProps {
  books: LibraryBook[];
  borrowings: BookBorrowing[];
  onAddBook: (book: Omit<LibraryBook, 'id'>) => void;
  onIssueBook: (borrowing: Omit<BookBorrowing, 'id'>) => void;
  onReturnBook: (borrowingId: string) => void;
  canEdit: boolean;
}

export const LibraryManager: React.FC<LibraryManagerProps> = ({
  books,
  borrowings,
  onAddBook,
  onIssueBook,
  onReturnBook,
  canEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'circulation'>('catalog');
  const [search, setSearch] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState<LibraryBook['category']>('Tamil Classics');
  const [copies, setCopies] = useState(5);
  const [rack, setRack] = useState('Shelf A-1');

  // Circulation Form State
  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id || '');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerId, setBorrowerId] = useState('');
  const [borrowerType, setBorrowerType] = useState<'Student' | 'Staff'>('Student');

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.includes(search)
  );

  const filteredBorrowings = borrowings.filter(
    (bor) =>
      bor.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      bor.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
      bor.borrowerId.toLowerCase().includes(search.toLowerCase())
  );

  const totalCopies = books.reduce((acc, b) => acc + b.copiesTotal, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.copiesAvailable, 0);
  const activeLoans = borrowings.filter((b) => b.status === 'Borrowed').length;
  const overdueLoans = borrowings.filter((b) => b.status === 'Overdue').length;

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    onAddBook({
      isbn: isbn.trim() || `978-955-${Math.floor(1000 + Math.random() * 9000)}-00`,
      title: title.trim(),
      author: author.trim(),
      category,
      copiesTotal: Number(copies),
      copiesAvailable: Number(copies),
      rackLocation: rack.trim() || 'General Stack Shelf 1',
    });

    setTitle('');
    setAuthor('');
    setIsbn('');
    setShowAddBookModal(false);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bk = books.find((b) => b.id === selectedBookId);
    if (!bk || !borrowerName.trim()) return;

    onIssueBook({
      bookId: bk.id,
      bookTitle: bk.title,
      borrowerType,
      borrowerName: borrowerName.trim(),
      borrowerId: borrowerId.trim() || 'VC/2024/0000',
      borrowDate: '2026-08-15',
      dueDate: '2026-08-29',
      status: 'Borrowed',
      fineAmount: 0,
    });

    setBorrowerName('');
    setBorrowerId('');
    setShowIssueModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Swami Vipulananda Memorial Library</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              {books.length} Titles
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Heritage archives, academic reference volumes, circulation desk & book loans
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowIssueModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-100 text-purple-900 font-bold text-xs hover:bg-purple-200 transition-all"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Issue Book</span>
            </button>
            <button
              onClick={() => setShowAddBookModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>+ Add Volume</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Catalog Books</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{totalCopies} Copies</div>
          <div className="text-[11px] text-slate-500 font-medium">{books.length} Distinct Titles</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-700 font-semibold uppercase">Available on Shelf</div>
          <div className="text-2xl font-bold text-emerald-700 mt-0.5">{availableCopies} Ready</div>
          <div className="text-[11px] text-emerald-600 font-medium">Ready for Issue</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-purple-900 font-semibold uppercase">Currently Borrowed</div>
          <div className="text-2xl font-bold text-purple-900 mt-0.5">{activeLoans} Active</div>
          <div className="text-[11px] text-slate-500 font-medium">14 Days Standard Loan</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-rose-700 font-semibold uppercase">Overdue Returns</div>
          <div className="text-2xl font-bold text-rose-700 mt-0.5">{overdueLoans} Books</div>
          <div className="text-[11px] text-rose-600 font-medium">Fine: LKR 10 / Day</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'catalog'
              ? 'bg-[#2A0845] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Book Catalog ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('circulation')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'circulation'
              ? 'bg-[#2A0845] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Circulation & Borrowings ({borrowings.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={activeTab === 'catalog' ? 'Search books by title, author, category, ISBN...' : 'Search borrowings by student, staff, or book...'}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 transition-all shadow-xs"
        />
      </div>

      {/* Catalog View */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBooks.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    {b.category}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{b.isbn}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{b.title}</h3>
                <p className="text-xs text-slate-600 mt-1">Author: <strong className="text-slate-800">{b.author}</strong></p>

                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Stack Rack:</span>
                    <strong className="text-slate-800">{b.rackLocation}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Available Copies:</span>
                    <span className="font-bold text-emerald-700">{b.copiesAvailable} / {b.copiesTotal}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                <span className="text-[11px] text-purple-900 font-semibold">Swami Vipulananda Collection</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Circulation View */}
      {activeTab === 'circulation' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Borrow Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBorrowings.map((bor) => (
                  <tr key={bor.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{bor.bookTitle}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{bor.borrowerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{bor.borrowerType} • {bor.borrowerId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{bor.borrowDate}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{bor.dueDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        bor.status === 'Returned' ? 'bg-slate-100 text-slate-700' :
                        bor.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {bor.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {bor.status !== 'Returned' && canEdit && (
                        <button
                          onClick={() => onReturnBook(bor.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-xs"
                        >
                          Mark Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Add Catalog Book</h3>
              </div>
              <button onClick={() => setShowAddBookModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yazh Nool or Modern Physics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Author *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swami Vipulananda"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as LibraryBook['category'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Tamil Classics">Tamil Classics</option>
                    <option value="Pure Science">Pure Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="History & Culture">History & Culture</option>
                    <option value="Information Tech">Information Tech</option>
                    <option value="Literature">Literature</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Copies</label>
                  <input
                    type="number"
                    min={1}
                    value={copies}
                    onChange={(e) => setCopies(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN Code</label>
                  <input
                    type="text"
                    placeholder="978-955-..."
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rack Location</label>
                  <input
                    type="text"
                    placeholder="Shelf B-3"
                    value={rack}
                    onChange={(e) => setRack(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold"
                >
                  Catalog Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookMarked className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Issue Book on Loan</h3>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Book</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.copiesAvailable} Available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Borrower Type</label>
                  <select
                    value={borrowerType}
                    onChange={(e) => setBorrowerType(e.target.value as 'Student' | 'Staff')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Student">Student</option>
                    <option value="Staff">Faculty / Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    placeholder="VC/2024/0482"
                    value={borrowerId}
                    onChange={(e) => setBorrowerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Borrower Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar Ramanathan"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold"
                >
                  Confirm Loan Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
