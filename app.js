require('dotenv').config()

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const app = express()
const PORT = 8080

const { MongoClient } = require('mongodb')

const uri = 'mongodb://127.0.0.1:27017/library'
const client = new MongoClient(uri)

async function connectToDatabase() {
  try {
    await client.connect()
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

connectToDatabase()

let booksCollection
let filtersCollection
let bingoCollection

async function connectToDatabaseAndCollections() {
  const database = client.db('library')
  booksCollection = database.collection('books')
  filtersCollection = database.collection('filters')
  bingoCollection = database.collection('bingo')
}

connectToDatabaseAndCollections()

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
  const cleanToken = req.headers['authorization'].split(' ')
  const token = cleanToken[1]
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

app.get('/books', async (req, res, next) => {
  try {
    console.log('Handling /books request')
    const books = await booksCollection.find({}).toArray()
    res.json(books)
    console.log(res)
  } catch (error) {
    console.error('Error handling /books request:', error)
    next(error)
  }
})

app.get('/filters', async (req, res, next) => {
  try {
    const filters = await filtersCollection.find({}).toArray()
    res.json(filters)
  } catch (error) {
    next(error)
  }
})

app.get('/bingo', async (req, res, next) => {
  try {
    const bingo = await bingoCollection.find({}).toArray()
    res.json(bingo)
  } catch (error) {
    next(error)
  }
})

app.get('/favicon.ico', (req, res) => res.status(204).end())

app.put('/bingo/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const updatedBingoItem = req.body

    const filter = { _id: ObjectId(id) } // Фильтр для поиска элемента по его идентификатору

    const result = await bingoCollection.updateOne(filter, { $set: updatedBingoItem }) // Обновление элемента

    if (result.modifiedCount === 1) {
      res.json(updatedBingoItem) // Если элемент обновлен успешно, отправляем его в качестве ответа
    } else {
      res.status(404).json({ message: 'Bingo item not found' }) // Если элемент не найден, отправляем ошибку 404
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

    const result = await booksCollection.insertOne(newBook)

    res.json(result.ops[0])
  } catch (error) {
    next(error)
  }
})

app.put('/books/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const updatedBook = req.body

    const filter = { _id: ObjectId(id) }

    const result = await booksCollection.updateOne(filter, { $set: updatedBook })

    if (result.modifiedCount === 1) {
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

    const filter = { _id: ObjectId(id) }

    const result = await booksCollection.deleteOne(filter)

    if (result.deletedCount === 1) {
      res.json({ message: 'Book deleted successfully' })
    } else {
      res.status(404).json({ message: 'Book not found' })
    }
  } catch (error) {
    next(error)
  }
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`)
})
