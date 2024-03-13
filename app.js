require('dotenv').config()

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const app = express()
const PORT = 8080

const data = require('./books.json')
const books = data.books
const filters = data.filters
const bingo = data.bingo

app.use(express.json())
app.use(helmet())
app.use(cors())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  next()
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

function verifyToken(req, res, next) {
  const token = req.headers['authorization']
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  jwt.verify(token, process.env.NEXTAUTH_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    req.decodedToken = decodedToken
    next()
  })
}

app.use(['/books', '/filters', '/bingo', '/books/:id', '/bingo/:id'], verifyToken)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/books', (req, res, next) => {
  try {
    console.log('Handling /books request')
    res.json(books)
  } catch (error) {
    console.error('Error handling /books request:', error)
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

app.get('/favicon.ico', (req, res) => res.status(204).end())

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
      await saveDataToJSON()
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
  await fs.writeFile('./books.json', JSON.stringify(updatedData, null, 2), () => {})
}

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`)
})
