# Market-App

# Практическая работа по модулю 10 "JS: асинхронность"

Создать интернет-магазин с возможность посмотреть все товары, добавление товара и удаление

## Интерфейс пользователя:

- Разработайте интерфейс сайта по собственному усмотрению (по желанию, можно за основу взять макет )
- Стилизуйте интерфейс с использованием CSS для улучшения пользовательского опыта. Создайте привлекательный и удобочитаемый дизайн для карточек товаров, формы добавления товара и других элементов интерфейса.

## Получение данных:

- Для получения товаров , редактирования , добавления и удаления используйте Fake Store API.
- Для запросов можно использовать fetch или axios
- Все запросы к API должны быть обработаны с использованием конструкции '''try...catch''', с выводом соответствующих сообщений об ошибках на странице

___

## Добавление товара:

### 1. Форма добавления товара:

Форма должна быть создана для добавления товара, содержащая поля для названия товара, цены, описания и категории.

### 2. Отправка запроса:

После нажатия пользователем кнопки "Добавить товар", необходимо отправить запрос на сервер для добавления товара.

### 3. Обратная связь пользователю:

После получения успешного ответа от сервера, пользователь должен быть оповещен об успешном выполнении операции добавления товара.



## Удаление товара:

### 1. Удаление через карточку товара:

Каждая карточка товара должна содержать кнопку "Удалить товар" (может быть в виде крестика или другого элемента).

### 2. Отправка запроса на удаление:

При клике на кнопку "Удалить товар" необходимо отправить соответствующий запрос на сервер для удаления товара.

### 3. Обратная связь пользователю:

После успешного удаления товара сервером, пользователь должен быть оповещен о выполнении этой операции.

___

## Дополнительно

### 1. Фильтрация по категории
- Реализуйте возможность выбора категории товаров и отображение товаров по выбранной категории.
- Обеспечить корректную работу фильтрации товаров и обновление интерфейса в зависимости от выбранной категории.

Для выполнения данного пункта нужно получить все категории ( https://fakestoreapi.com/products/categories ) , отобразить полученные данные в качестве выпадающего списка и при выборе категории обновить карточки товаров

### 2. Пагинация:
Для улучшения пользовательского опыта и управления большим количеством товаров, реализуйте пагинацию. На первой загрузке страницы отображаются первые 6 товаров. Под каждым списком товаров разместите кнопку "Загрузить еще", которая при клике будет загружать следующую порцию товаров.

При клике на кнопку "Загрузить еще", скрипт JavaScript должен отправлять запрос на сервер, который вернет следующие 6 товаров. Полученные товары должны быть добавлены к уже отображаемым товарам без перезагрузки страницы.