'use strict'

const STORAGE_KEY = 'bookDB'
const PAGE_SIZE = 5

var gBooks
var gNextId = 1
var gCurrBookId
var gFilterBy = { name: '', minRate: 0 }
var gSortDirection = { id: -1, name: -1, price: -1, rate: -1 }
var gPageIdx = 0

_createBooks()

function getBooks() {                            //List
    var books = gBooks.filter(book =>
        book.name.toLowerCase().includes(gFilterBy.name) &&
        book.rate >= gFilterBy.minRate)

    const startIdx = gPageIdx * PAGE_SIZE
    books = books.slice(startIdx, startIdx + PAGE_SIZE)
    return books
}

function getBookCountByPriceMap() {
    const bookCountByPrice = gBooks.reduce((map, book) => {
        if (book.price <= 10) map.cheap++
        else if (book.price <= 20) map.normal++
        else map.expensive++
        return map
    }, { cheap: 0, normal: 0, expensive: 0 })
    return bookCountByPrice
}

function pageNavigation(value) {
    if (value === 'prev' && gPageIdx === 0) return
    if (value === 'next' && gPageIdx * PAGE_SIZE >= gBooks.length - 1) return
    value === 'next' ? gPageIdx++ : gPageIdx--
}

function addBook(name, price, rate = 0) {       //Create
    const book = _createBook(name, price, rate = 0)
    gBooks.unshift(book)
    _saveBooksToStorage()
    return book
}

function getBookById(bookId) {                  //Read
    gCurrBookId = bookId
    const book = gBooks.find(book => bookId === book.id)
    return book
}


function updateBook(bookId, newPrice) {        //Update
    const book = gBooks.find(book => book.id === bookId)
    book.price = newPrice
    _saveBooksToStorage()
    return book
}

function rateBook(value) {
    const book = gBooks.find(book => book.id === gCurrBookId)
    if (value === 'decrease' && book.rate === 0) return
    if (value === 'increase' && book.rate === 10) return
    value === 'increase' ? book.rate++ : book.rate--
    _saveBooksToStorage()
    return book
}

function removeBook(bookId) {                  //Delete
    const bookIdx = gBooks.findIndex(book => bookId === book.id)
    gBooks.splice(bookIdx, 1)
    _saveBooksToStorage()
}

function setBookFilter(filterBy = {}) {
    if (filterBy.name !== undefined) gFilterBy.name = filterBy.name
    if (filterBy.minRate !== undefined) gFilterBy.minRate = filterBy.minRate
    return gFilterBy
}

function setBookSort(sortBy = {}) {
    if (sortBy.id !== undefined) {
        gSortDirection.id *= -1
        gBooks.sort((b1, b2) => (b1.id - b2.id) * gSortDirection.id)
    }
    if (sortBy.title !== undefined) {
        gSortDirection.name *= -1
        gBooks.sort((b1, b2) => b1.name.localeCompare(b2.name) * gSortDirection.name)
    }
    if (sortBy.price !== undefined) {
        gSortDirection.price *= -1
        gBooks.sort((b1, b2) => (b1.price - b2.price) * gSortDirection.price)
    }
    if (sortBy.rate !== undefined) {
        gSortDirection.rate *= -1
        gBooks.sort((b1, b2) => (b1.rate - b2.rate) * gSortDirection.rate)
    }
}

function _createBook(name, price, rate) {
    return {
        id: gNextId++,
        name,
        price,
        rate,
        desc: makeLorem()
    }
}

function _createBooks() {
    const names = ['Clean Code', 'JavaScript: The Good Parts', 'Python Crash Course']
    var books = loadFromStorage(STORAGE_KEY)

    if (!books || !books.length) {
        books = []
        for (let i = 0; i < 16; i++) {
            var name = names[getRandomIntInclusive(0, names.length - 1)]
            var price = getRandomIntInclusive(0, 40)
            var rate = getRandomIntInclusive(0, 10)
            books.push(_createBook(name, price, rate))
        }
    }
    gBooks = books
    _saveBooksToStorage()
}

function _saveBooksToStorage() {
    saveToStorage(STORAGE_KEY, gBooks)
}