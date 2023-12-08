const express = require('express')
const helmet = require('helmet')
const app = express()
const PORT = 8080

const data = require('./books.json')
const books = data.books

app.use(helmet())

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something went wrong!')
})

app.get('/books', (req, res, next) => {
  try {
    res.json(books)
  } catch (error) {
    next(error)
  }
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/books`)
})
