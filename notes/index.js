const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Note = require('./models/note')
const { default: mongoose } = require('mongoose')


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)
app.use(express.json());
app.use(cors());
app.use(express.static('build'))


app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes=> {
    res.json(notes)
  })
})

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (body.content===undefined) {
    return response.status(400).json({error: 'content missing'})
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })
  note.save().then(savedNote=> {
    console.log('note saved!');
    response.json(savedNote)
  })
  
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

app.get('/api/notes/:id', (req, res) => {
  Note.findById(req.param.id).then(note => {
    res.json(note)
  })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3006
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})