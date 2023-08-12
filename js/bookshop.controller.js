'use strict'

function onInit() {
    renderFilterByQueryParams()
    renderBooks()
    renderPriceGroupingStats()
}

function renderBooks() {
    var books = getBooks()
    var strHTMLS = books.map(book => `<tr>
    <td class="book-id">${book.id}</td>
    <td class="book-name">${book.name}</td>
    <td class="book-price">$${book.price}</td>
    <td class="book-rate">${book.rate}</td>
    <td><button title="Read book" class="btn-read" 
        onclick="onReadBook(${book.id})">Read</button></td>
    <td><button title="Update book" class="btn-update"
        onclick="onUpdateBook(${book.id})">Update</button></td>
    <td><button title="Delete book" class="btn-remove"
        onclick="onRemoveBook(${book.id})">Delete</button></td>
    </tr>`
    )
    document.querySelector('.books-table').innerHTML = strHTMLS.join('')
}

function onPageNavigation(value) {
    value = value === 'prev' ? 'prev' : 'next'
    pageNavigation(value)
    renderBooks()
}

function onAddBook() {                 //Create
    var name = prompt('Name of the book?')
    var price = +prompt('Book\'s price?')
    addBook(name, price)
    renderBooks()
    renderPriceGroupingStats()
    flashMsg(`Book Added`)
}

function onReadBook(bookId) {          //Read
    const book = getBookById(bookId)
    const elModal = document.querySelector('.modal')

    elModal.querySelector('h3').innerText = book.name
    elModal.querySelector('h4 span').innerText = book.rate
    elModal.querySelector('p').innerText = book.desc

    elModal.classList.add('open')
}

function onUpdateBook(bookId) {        //Update
    const book = getBookById(bookId)
    var newPrice = +prompt('New price?', book.price)

    if (newPrice && book.price !== newPrice) {
        const book = updateBook(bookId, newPrice)
        renderBooks()
        renderPriceGroupingStats()
        flashMsg(`Price updated to: ${book.price}`)
    }
}

function onRatingBook(value) {
    console.log(value);
    value = value === 'increase' ? 'increase' : 'decrease'
    rateBook(value)
    updateRate(value)
    renderBooks()
    flashMsg(`Book Rated`)
}

function onRemoveBook(bookId) {       //Delete
    removeBook(bookId)
    renderBooks()
    renderPriceGroupingStats()
    flashMsg(`Book Deleted`)
}

function onSetFilterBy(filterBy) {
    filterBy = setBookFilter(filterBy)
    renderBooks()

    const queryParams = `?name=${filterBy.name}&minRate=${filterBy.minRate}`
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryParams

    window.history.pushState({ path: newUrl }, '', newUrl)
}

function renderFilterByQueryParams() {
    const queryParams = new URLSearchParams(window.location.search)
    const filterBy = {
        name: queryParams.get('name') || '',
        minRate: +queryParams.get('minRate') || 0
    }

    if (!filterBy.name && !filterBy.minRate) return
    
    document.querySelector('.filter-by-name').value = filterBy.name
    document.querySelector('.filter-rate-range').value = filterBy.name
    setBookFilter(filterBy)
}

function onSetSortBy(value) {
    const sortBy = {}
    sortBy[value.toLowerCase()] = 1
    setBookSort(sortBy)
    renderBooks()
}

function renderPriceGroupingStats() {
    const expensive = document.querySelector('.expensive')
    const normal = document.querySelector('.normal')
    const cheap = document.querySelector('.cheap')

    const stats = getBookCountByPriceMap()

    expensive.innerText = stats.expensive
    normal.innerText = stats.normal
    cheap.innerText = stats.cheap
}

function onCloseModal() {
    document.querySelector('.modal').classList.remove('open')
}

function flashMsg(msg) {
    const elMsg = document.querySelector('.user-msg')

    elMsg.innerText = msg
    elMsg.classList.add('open')
    setTimeout(() => elMsg.classList.remove('open'), 3000)
}

function handleSearchKeyPress(event, filterBy) {
    if (event.key === 'Enter') {
        onSetFilterBy(filterBy)
    }
}

function updateRate(value) {
    const elModal = document.querySelector('.modal')
    const rate = elModal.querySelector('h4 span')
    if (value === 'decrease' && +rate.innerText === 0) return
    if (value === 'increase' && +rate.innerText === 10) return
    value === 'increase' ? +rate.innerText++ : +rate.innerText--
}