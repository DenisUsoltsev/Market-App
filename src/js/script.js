import axios from 'axios';               // Нужно использовать сборщики

const mainContent = document.getElementById('layout');
const breadcrumb = document.getElementById('breadcrumb');
const homeLink = document.getElementById('home-link');
const shopLink = document.getElementById('shop-link');
const addLink = document.getElementById('add-link');

const API_URL = "https://fakestoreapi.com/products";
const CATEGORY_API_URL = "https://fakestoreapi.com/products/categories";

// Страницы
const pages = {
  home: `<div class="home-page"><h1>Welcome to Market-App</h1><p>Discover amazing products at great prices!</p></div>`,
  shop: `<aside class="sidebar">
            <div class="sidebar-header" id="category-toggle">
                <span>Product Categories</span>
                <span class="arrow">▼</span>
            </div>
            <div class="sidebar-content" id="category-list">
                <button id="show-button" class="btn-show" style="display: none;">Show</button>
            </div>
          </aside>
          <main id="main-content">
            <section id="products-list">
              <h2>Products</h2>
              <div class="container" id="products"></div>
              <button id="load-more" class="btn-load-more">Загрузить ещё</button>
            </section>
          </main>`,
  add: `<aside class="sidebar"></aside>
        <main id="main-content">
          <div id="add-product-form-container">
            <h3>Добавить товар</h3>
            <form id="add-product-form">
              <label for="product-name">Название товара:</label>
              <input type="text" id="product-name" name="name" required>

              <label for="product-price">Цена:</label>
              <input type="number" id="product-price" name="price" step="0.01" required>

              <label for="product-description">Описание:</label>
              <textarea id="product-description" name="description" required></textarea>

              <label for="product-category">Категория:</label>
              <select id="product-category" name="category" required>
                <option value="">Выберите категорию</option>
                <!-- Категории будут добавлены динамически -->
              </select>

              <button type="submit">Добавить товар</button>
            </form>
            <div id="notification" style="display: none;"></div>
          </div>        
        </main>`
};

const items = 6;
let itemsPerPage = 12;
let loadedProducts = [];                                                         // Хранилище загруженных товаров
let displayedCount = 0;                                                          // Счетчик отображенных товаров
let cartCount = 0;                                                               // Хранение состояния корзины


function loadPage(page) {
  mainContent.innerHTML = pages[page];
  if (page === 'shop') {

    const categoryToggle = document.getElementById("category-toggle");
    const categoryList = document.getElementById("category-list");
    const arrow = categoryToggle.querySelector(".arrow");

    categoryList.classList.remove("open");
    arrow.classList.add("up");

    categoryToggle.addEventListener("click", () => {
      if (categoryList.classList.contains("open")) {
        categoryList.classList.remove("open");
        arrow.classList.add("up");
      } else {
        categoryList.classList.add("open");
        arrow.classList.remove("up");
      }
    });

    const products = document.getElementById("products");
    products.innerHTML = "<h3>Loading...</h3>";

    const loadMoreButton = document.getElementById("load-more");
    if (loadMoreButton) loadMoreButton.style.display = "none";

    loadMoreButton.addEventListener("click", () => {
      itemsPerPage = itemsPerPage + items;
      loadMoreProducts(itemsPerPage);
    });

    products.parentElement.appendChild(loadMoreButton);

  } else if (page === 'add') {

    const form = document.getElementById("add-product-form");
    const notification = document.getElementById("notification");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const productData = {
        title: form["product-name"].value,
        price: parseFloat(form["product-price"].value),
        description: form["product-description"].value,
        category: form["product-category"].value,
        // image: 'https://i.pravatar.cc',
      };

      try {
        const response = await axios.post(API_URL, productData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        console.log(response.data);

        if (!response) throw new Error("Ошибка при добавлении товара");

        // Оповещение об успехе
        notification.textContent = "Товар успешно добавлен!";
        notification.className = "success";
        notification.style.display = "block";

        // Очистка формы
        form.reset();
      } catch (error) {
        console.error('Ошибка при добавлении товара: ', error);
        notification.textContent = "Произошла ошибка при добавлении товара.";
        notification.className = "error";
        notification.style.display = "block";
      }
    });

  }
}


function renderProducts(productsToRender) {
  productsToRender.forEach(product => {
    const productCard = document.createElement("article");
    productCard.classList.add("card");
    productCard.innerHTML = `
      <div class="card-content">
        <div class="card-image">
          <img src="${product.image}" alt="${product.title}" />
          <button class="btn-add-to-cart">Add to Cart</button>
        </div>
        <h3 class="card-title">${truncateText(product.title, 70)}</h3>
        <p class="card-description">${truncateText(product.description, 150)}</p>
        <div class="card-footer">
          <p class="card-price">${product.price} $</p>
          <button class="btn-del">Удалить товар</button>
        </div>
      </div>
    `;

    // Удаление карточки
    const deleteBtn = productCard.querySelector(".btn-del");
    deleteBtn.addEventListener("click", () => {
      deleteProduct(product.id, productCard)
    });

    // Обработка нажатия на "Add to Cart"
    const addToCartBtn = productCard.querySelector(".btn-add-to-cart");
    addToCartBtn.addEventListener("click", () => {
      if (addToCartBtn.classList.contains("in-cart")) {
        // Убрать из корзины
        addToCartBtn.classList.remove("in-cart");
        addToCartBtn.textContent = "Add to Cart";
        updateCartCount(-1);
      } else {
        // Добавить в корзину
        addToCartBtn.classList.add("in-cart");
        addToCartBtn.textContent = "Del from Cart";
        updateCartCount(1);
      }
    });

    products.appendChild(productCard);
  });
}

// Функция обновления счётчика корзины
function updateCartCount(change) {
  const cartCounter = document.getElementById("cart-counter");
  cartCount += change;

  if (cartCount > 0) {
    cartCounter.style.display = "inline-block";
    cartCounter.textContent = cartCount;
  } else {
    cartCounter.style.display = "none"; // Скрываем счётчик, если товаров нет
  }
}


// Получение списка категорий
async function fetchCategories(page) {
  const categoryList = document.getElementById("category-list");
  try {
    const res = await axios.get(CATEGORY_API_URL);
    const categories = res.data;

    if (page === 'shop') {
      SidebarCategories(categories);
    } else if (page === 'add') {
      SelectCategories(categories);
    }
  } catch (error) {
    console.error("Ошибка загрузки категорий", error);

    // Обработка разных типов ошибок
    if (error.response) {
      // Сервер вернул ответ с ошибкой (ошибки сервера (404, 500...))
      categoryList.innerHTML = `<h3>Ошибка загрузки категорий: ${error.response.status} ${error.response.statusText}</h3>`;
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено (проблемы с сетью)
      categoryList.innerHTML = `<h3>Не удалось получить ответ от сервера. Проверьте подключение.</h3>`;
    } else {
      // Произошла другая ошибка
      categoryList.innerHTML = `<h3>Произошла ошибка: ${error.message}</h3>`;
    }
  }
}

function SidebarCategories(categories) {
  const categoryList = document.getElementById("category-list");

  // Удаляем всё, что есть, кроме кнопки "Show"
  const showButton = document.getElementById("show-button");
  categoryList.innerHTML = "";
  if (showButton) categoryList.appendChild(showButton);

  // Добавляем чекбокс "All Categories"
  const allCategoriesCheckbox = document.createElement("label");
  allCategoriesCheckbox.innerHTML = `<input type="checkbox" id="all-categories" checked> All Categories`;
  categoryList.insertBefore(allCategoriesCheckbox, showButton);

  // Добавляем остальные категории
  categories.forEach(category => {
    const categoryCheckbox = document.createElement("label");
    categoryCheckbox.innerHTML = `<input type="checkbox" value="${category}" checked /> ${capitalize(category)}`;
    categoryList.insertBefore(categoryCheckbox, showButton);
  });

  // Событие для кнопки "Show"
  const checkboxes = categoryList.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", (event) => {
      if (event.target.checked) {
        document.getElementById("show-button").style.display = "inline-block";
        checkboxes.forEach(cb => {
          if (cb !== event.target) cb.checked = false;
        });
      } else {
        checkboxes.forEach(cb => {
          if (cb !== event.target) cb.checked = false;
        });
      }
    });
  });

  document.getElementById("show-button").addEventListener("click", () => {
    const allCategoriesCheckbox = document.getElementById("all-categories");
    if (allCategoriesCheckbox.checked) {
      // Если выбрано "All Categories", передаём "all"
      updateProductsByCategory("all");
    } else {
      // Если выбраны конкретные категории, передаём их
      const selectedCategories = Array.from(
        document.querySelectorAll("#category-list input[type='checkbox']:checked")
      )
        .filter(checkbox => checkbox.id !== "all-categories")
        .map(checkbox => checkbox.value);

      updateProductsByCategory(selectedCategories);
      // Изменяем навигацию
      updateBreadcrumb(['Shop', capitalize(selectedCategories.toString())]);
    }

    // Прячем кнопку "Show" после отображения товаров
    document.getElementById("show-button").style.display = "none";
  });

  document.getElementById("all-categories").addEventListener("change", (event) => {
    const checkboxes = document.querySelectorAll("#category-list input[type='checkbox']");
    checkboxes.forEach(checkbox => checkbox.checked = event.target.checked);
  });

  // Если любой другой чекбокс снимается, снимаем "All Categories"
  document.querySelectorAll("#category-list input[type='checkbox']").forEach(checkbox => {
    if (checkbox.id !== "all-categories") {
      checkbox.addEventListener("change", () => {
        const allChecked = Array.from(
          document.querySelectorAll("#category-list input[type='checkbox']:not(#all-categories)")
        ).every(checkbox => checkbox.checked);

        document.getElementById("all-categories").checked = allChecked;
      });
    }
  });
}

function SelectCategories(categories) {
  const form = document.getElementById("add-product-form");
  const notification = document.getElementById("notification");
  const categorySelect = document.getElementById("product-category");

  // Загружаем категории динамически
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = capitalize(category);
    categorySelect.appendChild(option);
  });

}

// Функция для преобразования текста (например, electronics -> Electronics)
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

async function fetchProductsByCategory(category) {
  try {
    if (category === "all") {
      // Если выбрана категория "all", отображаем то, что уже было загружено
      if (loadedProducts.length > displayedCount) {
        const loadMoreButton = document.getElementById("load-more");
        if (loadMoreButton) loadMoreButton.style.display = "block";
      }
      return loadedProducts.slice(0, displayedCount);
    } else {
      // Иначе выполняем запрос к API по категории
      const url = `${API_URL}/category/${category}`;
      const res = await axios.get(url);
      return res.data;
    }
  } catch (error) {
    console.error("Ошибка загрузки товаров", error);

    if (error.response) {
      products.innerHTML = `<h3>Ошибка загрузки товаров: ${error.response.status} ${error.response.statusText}</h3>`;
    } else if (error.request) {
      products.innerHTML = `<h3>Не удалось получить ответ от сервера. Проверьте подключение.</h3>`;
    } else {
      products.innerHTML = `<h3>Произошла ошибка: ${error.message}</h3>`;
    }

    return [];
  }
}

async function updateProductsByCategory(category) {
  const products = document.getElementById("products");

  let displayedProducts = [];

  products.innerHTML = "<h3>Loading...</h3>";
  const loadMoreButton = document.getElementById("load-more");
  if (loadMoreButton) loadMoreButton.style.display = "none";

  displayedProducts = await fetchProductsByCategory(category);

  products.innerHTML = "";
  renderProducts(displayedProducts);
}

async function fetchProducts(limit) {
  try {
    const res = await axios.get(`${API_URL}?limit=${limit}`);
    return res.data;
  } catch (error) {
    console.error("Ошибка загрузки товаров", error);

    if (error.response) {
      products.innerHTML = `<h3>Ошибка загрузки товаров: ${error.response.status} ${error.response.statusText}</h3>`;
    } else if (error.request) {
      products.innerHTML = `<h3>Не удалось получить ответ от сервера. Проверьте подключение.</h3>`;
    } else {
      products.innerHTML = `<h3>Произошла ошибка: ${error.message}</h3>`;
    }

    return [];
  }
}


// Обрезаем слишком длинный текст
function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}


async function displayProducts() {
  // Загрузка 12 товаров и отображение первых 6
  const initialProducts = await fetchProducts(itemsPerPage);
  loadedProducts.push(...initialProducts);

  const products = document.getElementById("products");
  products.innerHTML = "";

  const firstBatch = loadedProducts.slice(0, items);
  renderProducts(firstBatch);
  displayedCount += firstBatch.length;

  // Показываем кнопку "Загрузить ещё"
  const loadMoreButton = document.getElementById("load-more");
  if (loadMoreButton) loadMoreButton.style.display = "block";

  // Если товаров меньше, чем можно загрузить за раз, скрываем кнопку
  if (loadedProducts.length <= displayedCount) {
    if (loadMoreButton) loadMoreButton.style.display = "none";
  }
}


async function loadMoreProducts(limit) {
  // Отображаем следующие 6 товаров из хранилища
  const nextBatch = loadedProducts.slice(displayedCount, displayedCount + items);
  renderProducts(nextBatch);
  displayedCount += nextBatch.length;

  const newProducts = await fetchProducts(limit);
  // Фильтруем, чтобы не добавлять уже загруженные товары
  const filteredProducts = newProducts.filter(product =>
    !loadedProducts.find(loadedProduct => loadedProduct.id === product.id)
  );
  // Добавляем новые товары к хранилищу
  loadedProducts = [...loadedProducts, ...filteredProducts];

  // Если больше нечего отображать, скрываем кнопку
  if (loadedProducts.length <= displayedCount) {
    const loadMoreButton = document.getElementById("load-more");
    if (loadMoreButton) loadMoreButton.style.display = "none";
  }
}

async function deleteProduct(id, productCard) {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    alert(`Товар удален: ${res.data.title}`);
    // loadedProducts = loadedProducts.filter(product => product.id !== id);  // Удаляем из массива
    productCard.remove();                                                     // Удаляем карточку из DOM
  } catch (error) {
    console.error("Ошибка при удалении товара:", error);

    // Обработка разных типов ошибок
    if (error.response) {
      // Сервер вернул ответ с ошибкой (ошибки сервера (404, 500...))
      alert(`Ошибка удаления: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      // Запрос был сделан, но ответа не получено (проблемы с сетью)
      alert("Не удалось получить ответ от сервера. Проверьте соединение.");
    } else {
      // Другая ошибка (например, ошибка в коде)
      alert("Произошла ошибка при удалении товара. Попробуйте снова.");
    }
  }
}


// Обновляем навигацию
function updateBreadcrumb(pathArray) {
  breadcrumb.innerHTML = pathArray.map((path, index) => {
    if (index === pathArray.length - 1) {
      return `<span>${path}</span>`;
    } else {
      return `<span>${path}</span>`;
    }
  }).join('');
}

homeLink.addEventListener('click', (event) => {
  event.preventDefault();
  loadPage('home');
  updateBreadcrumb(['Home']);
});

shopLink.addEventListener('click', async (event) => {
  event.preventDefault();
  loadPage('shop');
  updateBreadcrumb(['Shop', 'All Products']);
  await displayProducts();
  await fetchCategories('shop');
});

addLink.addEventListener('click', async (event) => {
  event.preventDefault();
  loadPage('add');
  updateBreadcrumb(['Add a product']);
  await fetchCategories('add');
});


document.addEventListener("DOMContentLoaded", () => {
  loadPage('home');
});
