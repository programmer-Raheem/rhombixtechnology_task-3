/* Personal Book Library - plain JS with persistence */
document.addEventListener("DOMContentLoaded", () => {
  // DOM refs
  const bookListEl = document.getElementById("bookList");
  const historyListEl = document.getElementById("historyList");
  const searchEl = document.getElementById("search");
  const categoryEl = document.getElementById("category");
  const clearBtn = document.getElementById("clearFilters");

  const addForm = document.getElementById("addBookForm");
  const titleEl = document.getElementById("title");
  const authorEl = document.getElementById("author");
  const newCategoryEl = document.getElementById("newCategory");
  const imgUrlEl = document.getElementById("imgUrl");

  // localStorage keys
  const BOOKS_KEY = "booklib_books_v1";
  const HISTORY_KEY = "booklib_history_v1";

  // default books (used if localStorage empty)
  const defaultBooks = [
    { id: 1, title: "Atomic Habits", author: "James Clear", category: "Self-help", status: "Available", image: "https://m.media-amazon.com/images/I/91bYsX41DVL.jpg" },
    { id: 2, title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "Programming", status: "Available", image: "https://m.media-amazon.com/images/I/81Apz7r0w-L.jpg" },
    { id: 3, title: "Clean Code", author: "Robert C. Martin", category: "Programming", status: "Borrowed", image: "https://m.media-amazon.com/images/I/41xShlnTZTL.jpg" },
    { id: 4, title: "1984", author: "George Orwell", category: "Fiction", status: "Available", image: "https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg" }
  ];

  // load state
  let books = load(BOOKS_KEY) || defaultBooks.slice();
  let history = load(HISTORY_KEY) || [];

  // helpers
  function load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
  }
  function placeholderImageDataURL() {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='600'><rect fill='#2b2b2b' width='100%' height='100%'/><text x='50%' y='50%' fill='#9aa' font-size='20' font-family='Arial' text-anchor='middle'>No Image</text></svg>`
    );
  }

  // render functions
  function renderBooks() {
    bookListEl.innerHTML = "";
    const q = (searchEl.value || "").trim().toLowerCase();
    const cat = (categoryEl.value || "All");

    const filtered = books.filter(b => {
      const matchesQuery = b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      const matchesCategory = cat === "All" || b.category === cat;
      return matchesQuery && matchesCategory;
    });

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "card";
      empty.innerHTML = "<p style='text-align:center;color:rgba(255,255,255,0.8)'>No books found.</p>";
      bookListEl.appendChild(empty);
      return;
    }

    filtered.forEach(book => {
      const card = document.createElement("div");
      card.className = "book";

      const img = document.createElement("img");
      img.className = "cover";
      img.src = book.image || placeholderImageDataURL();
      img.alt = book.title;
      img.onerror = () => { img.src = placeholderImageDataURL(); };

      const title = document.createElement("h3");
      title.textContent = book.title;

      const author = document.createElement("p");
      author.textContent = `👤 ${book.author}`;

      const category = document.createElement("p");
      category.textContent = `🏷️ ${book.category}`;

      const status = document.createElement("span");
      status.className = `status ${book.status === "Available" ? "available" : "borrowed"}`;
      status.textContent = book.status;

      const meta = document.createElement("div");
      meta.className = "meta";

      const btn = document.createElement("button");
      btn.textContent = book.status === "Available" ? "Borrow" : "Return";
      btn.onclick = () => toggleBorrow(book.id);

      meta.appendChild(status);
      meta.appendChild(btn);

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(author);
      card.appendChild(category);
      card.appendChild(meta);

      bookListEl.appendChild(card);
    });
  }

  function renderHistory() {
    historyListEl.innerHTML = "";
    if (!history.length) {
      historyListEl.innerHTML = "<li style='color:rgba(255,255,255,0.8)'>No history yet.</li>";
      return;
    }
    history.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.date} → ${item.action}: ${item.title}`;
      historyListEl.appendChild(li);
    });
  }

  // actions
  function toggleBorrow(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    book.status = book.status === "Available" ? "Borrowed" : "Available";
    history.unshift({ action: book.status === "Borrowed" ? "Borrowed" : "Returned", title: book.title, date: new Date().toLocaleString() });
    saveState();
    renderBooks();
    renderHistory();
  }

  function addBook(e) {
    e.preventDefault();
    const title = (titleEl.value || "").trim();
    const author = (authorEl.value || "").trim();
    const category = (newCategoryEl.value || "").trim();
    const image = (imgUrlEl.value || "").trim();

    if (!title || !author || !category) {
      alert("Please fill Title, Author and Category.");
      return;
    }

    const newBook = {
      id: Date.now(),
      title, author, category,
      status: "Available",
      image: image || placeholderImageDataURL()
    };
    books.unshift(newBook);
    // auto-add category to select if missing
    addCategoryIfMissing(category);

    saveState();
    renderBooks();
    addForm.reset();
  }

  function addCategoryIfMissing(cat) {
    const exists = Array.from(categoryEl.options).some(o => o.value === cat);
    if (!exists) {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryEl.appendChild(opt);
    }
    // also in newCategory select
    const exists2 = Array.from(newCategoryEl.options).some(o => o.value === cat);
    if (!exists2) {
      const opt2 = document.createElement("option");
      opt2.value = cat;
      opt2.textContent = cat;
      newCategoryEl.appendChild(opt2);
    }
  }

  function saveState() {
    save(BOOKS_KEY, books);
    save(HISTORY_KEY, history);
  }

  // events
  searchEl.addEventListener("input", renderBooks);
  categoryEl.addEventListener("change", renderBooks);
  clearBtn.addEventListener("click", () => { searchEl.value = ""; categoryEl.value = "All"; renderBooks(); });
  addForm.addEventListener("submit", addBook);

  // initial render
  renderBooks();
  renderHistory();
});
