const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const app = express()
const PORT = 8080

const data = require('./books.json')
const books = data.books
const filters = data.filters
const bingo = data.bingo

app.use(express.json())

app.use(helmet())

app.use(cors())

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.get('/books', (req, res, next) => {
  try {
    res.json(books)
  } catch (error) {
    next(error)
  }
})

app.get('/filters', (req, res, next) => {
  try {
    res.json(filters)
  } catch (error) {
    next(error)
  }
})

app.get('/bingo', (req, res, next) => {
  try {
    res.json(bingo)
  } catch (error) {
    next(error)
  }
})

app.post('/bingo', async (req, res, next) => {
  try {
    const newBingoItem = req.body
    bingo.push(newBingoItem)
    await saveDataToJSON()
    res.json(newBingoItem)
  } catch (error) {
    next(error)
  }
})

app.put('/bingo/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const updatedBingoItem = req.body
    const index = bingo.findIndex((item) => item.id === id)

    if (index !== -1) {
      bingo[index] = updatedBingoItem
      await saveDataToJSON()
      res.json(updatedBingoItem)
    } else {
      res.status(404).json({ message: 'Bingo item not found' })
    }
  } catch (error) {
    next(error)
  }
})

app.delete('/bingo/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const index = bingo.findIndex((item) => item.id === id)

    if (index !== -1) {
      bingo.splice(index, 1)
      await saveDataToJSON()
      res.json({ message: 'Bingo item deleted successfully' })
    } else {
      res.status(404).json({ message: 'Bingo item not found' })
    }
  } catch (error) {
    next(error)
  }
})

app.post('/books', async (req, res, next) => {
  try {
    const newBook = req.body
    books.push(newBook)
    await saveDataToJSON()
    res.json(newBook)
  } catch (error) {
    next(error)
  }
})

app.put('/books/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const updatedBook = req.body
    const index = books.findIndex((book) => book.id === id)
    if (index !== -1) {
      books[index] = updatedBook
      await saveDataToJSON()
      res.json(updatedBook)
    } else {
      res.status(404).json({ message: 'Book not found' })
    }
  } catch (error) {
    next(error)
  }
})

app.delete('/books/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const index = books.findIndex((book) => book.id === id)
    if (index !== -1) {
      books.splice(index, 1)
      await saveDataToJSON() // Зберегти зміни в файл
      res.json({ message: 'Book deleted successfully' })
    } else {
      res.status(404).json({ message: 'Book not found' })
    }
  } catch (error) {
    next(error)
  }
})

async function saveDataToJSON() {
  const updatedData = { books, filters, bingo }
  await fs.writeFile('./books.json', JSON.stringify(updatedData, null, 2))
}

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/books`)
})
