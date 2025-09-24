document.addEventListener('DOMContentLoaded', () => {
    const books = [];
    const RENDER_EVENT = 'render-book';
    const STORAGE_KEY = 'BOOKSHELF_APPS';
  
    const bookForm = document.getElementById('bookForm');
    const searchForm = document.getElementById('searchBook');
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    
    let editingBookId = null;
  
    function isStorageExist() {
      if (typeof(Storage) === 'undefined') {
        alert('Browser Anda tidak mendukung local storage');
        return false;
      }
      return true;
    }
  
    function saveData() {
      if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
      }
    }
  
    function loadDataFromStorage() {
      const serializedData = localStorage.getItem(STORAGE_KEY);
      let data = JSON.parse(serializedData);
      if (data !== null) {
        for (const book of data) {
          books.push(book);
        }
      }
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  
    function generateId() {
      return +new Date();
    }
  
    function generateBookObject(id, title, author, year, isComplete) {
      return { id, title, author, year: parseInt(year), isComplete };
    }
  
    function findBook(bookId) {
      return books.find(book => book.id === bookId) || null;
    }
  
    function findBookIndex(bookId) {
      return books.findIndex(book => book.id === bookId);
    }
  
    // --- DOM Manipulation ---
  
    function makeBook(bookObject) {
      const bookItem = document.createElement('div');
      bookItem.setAttribute('data-bookid', bookObject.id);
      bookItem.setAttribute('data-testid', 'bookItem');
  
      const bookTitle = document.createElement('h3');
      bookTitle.setAttribute('data-testid', 'bookItemTitle');
      bookTitle.innerText = bookObject.title;
  
      const bookAuthor = document.createElement('p');
      bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
      bookAuthor.innerText = `Penulis: ${bookObject.author}`;
  
      const bookYear = document.createElement('p');
      bookYear.setAttribute('data-testid', 'bookItemYear');
      bookYear.innerText = `Tahun: ${bookObject.year}`;
  
      const buttonContainer = document.createElement('div');
  
      const moveButton = document.createElement('button');
      moveButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
      moveButton.innerText = bookObject.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
      moveButton.addEventListener('click', () => {
        bookObject.isComplete ? undoBookFromCompleted(bookObject.id) : addBookToCompleted(bookObject.id);
      });
  
      const deleteButton = document.createElement('button');
      deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
      deleteButton.innerText = 'Hapus buku';
      deleteButton.addEventListener('click', () => removeBook(bookObject.id));
      
      const editButton = document.createElement('button');
      editButton.setAttribute('data-testid', 'bookItemEditButton');
      editButton.innerText = 'Edit buku';
      editButton.addEventListener('click', () => startEditing(bookObject.id));
  
      buttonContainer.append(moveButton, deleteButton, editButton);
      bookItem.append(bookTitle, bookAuthor, bookYear, buttonContainer);
      return bookItem;
    }
  
    function addBook() {
      const title = document.getElementById('bookFormTitle').value;
      const author = document.getElementById('bookFormAuthor').value;
      const year = document.getElementById('bookFormYear').value;
      const isComplete = document.getElementById('bookFormIsComplete').checked;
      const generatedID = generateId();
      const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
      books.push(bookObject);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
    }
  
    function updateBook() {
      if (editingBookId === null) return;
      const bookTarget = findBook(editingBookId);
      if (bookTarget == null) return;
  
      bookTarget.title = document.getElementById('bookFormTitle').value;
      bookTarget.author = document.getElementById('bookFormAuthor').value;
      bookTarget.year = parseInt(document.getElementById('bookFormYear').value);
      bookTarget.isComplete = document.getElementById('bookFormIsComplete').checked;
      
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();

      cancelEditing();
    }
  
    function startEditing(bookId) {
      editingBookId = bookId;
      const bookToEdit = findBook(bookId);
      if (bookToEdit == null) return;
  
      document.getElementById('bookFormTitle').value = bookToEdit.title;
      document.getElementById('bookFormAuthor').value = bookToEdit.author;
      document.getElementById('bookFormYear').value = bookToEdit.year;
      document.getElementById('bookFormIsComplete').checked = bookToEdit.isComplete;
      
      const submitButton = document.getElementById('bookFormSubmit');
      submitButton.innerText = 'Simpan Perubahan';
      submitButton.style.backgroundColor = '#28a745'; 

      const cancelButton = document.createElement('button');
      cancelButton.innerText = 'Batal';
      cancelButton.type = 'button';
      cancelButton.id = 'cancelEditButton';
      cancelButton.addEventListener('click', cancelEditing);
      submitButton.after(cancelButton);
    }
  
    function cancelEditing() {
      editingBookId = null;
      bookForm.reset();
      
      const submitButton = document.getElementById('bookFormSubmit');
      submitButton.innerHTML = 'Masukkan Buku ke rak <span>Belum selesai dibaca</span>';
      submitButton.style.backgroundColor = '';
      
      const cancelButton = document.getElementById('cancelEditButton');
      if (cancelButton) {
        cancelButton.remove();
      }
    }
  
    function addBookToCompleted(bookId) {
      const bookTarget = findBook(bookId);
      if (bookTarget == null) return;
      bookTarget.isComplete = true;
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
    }
  
    function undoBookFromCompleted(bookId) {
      const bookTarget = findBook(bookId);
      if (bookTarget == null) return;
      bookTarget.isComplete = false;
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
    }
  
    function removeBook(bookId) {
      const bookTarget = findBookIndex(bookId);
      if (bookTarget === -1) return;
      const isConfirmed = confirm('Apakah Anda yakin ingin menghapus buku ini?');
      if (isConfirmed) {
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
      }
    }
    
    function searchBooks() {
      const query = document.getElementById('searchBookTitle').value.toLowerCase();
      const allBookItems = document.querySelectorAll('[data-testid="bookItem"]');
      allBookItems.forEach(item => {
        const title = item.querySelector('[data-testid="bookItemTitle"]').innerText.toLowerCase();
        item.style.display = title.includes(query) ? '' : 'none';
      });
    }
  
    bookForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (editingBookId !== null) {
        updateBook();
      } else {
        addBook();
      }
      bookForm.reset();
    });
    
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      searchBooks();
    });
    document.getElementById('searchBookTitle').addEventListener('input', searchBooks);
  
    document.addEventListener(RENDER_EVENT, () => {
      incompleteBookList.innerHTML = '';
      completeBookList.innerHTML = '';
      for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isComplete) {
          completeBookList.append(bookElement);
        } else {
          incompleteBookList.append(bookElement);
        }
      }
    });
  
    if (isStorageExist()) {
      loadDataFromStorage();
    }
  });