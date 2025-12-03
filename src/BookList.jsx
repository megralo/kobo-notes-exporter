import React from 'react';

export const BookList = ({ books, selectedBookId, onSelectBook, onExport }) => {

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {books.length > 0 ? (
        books.map((book) => (
          <li
            key={book.ContentID}
            className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${selectedBookId === book.ContentID ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
            onClick={() => onSelectBook(book.ContentID, book.BookTitle)}
          >
            <div className="font-medium">{book.BookTitle}</div>
            {book.Author && (
              <div className="text-sm text-gray-600 dark:text-gray-400">{book.Author}</div>
            )}
          </li>
        ))
      ) : (
        <li className="p-4 text-center text-gray-500 dark:text-gray-400">
          Nessun libro trovato. Assicurati che il file KoboReader.sqlite sia valido.
        </li>
      )}
    </ul>
  );
};