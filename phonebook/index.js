const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();



let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    },
    {
        "id": 5,
        "name": "Hanna",
        "number": "98-12921-11"
    }
]

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
morgan.token('data', (req) => {return JSON.stringify(req.body)})


app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(express.static('build'))
app.use(requestLogger)

app.get('/', (req, res)=>{
    res.send('<h1>Hello world</h1>')
})

app.get('/api/persons', (req, res)=>{
    res.json(persons)
})

app.get('/info', (req, res)=>{
    const total = persons.reduce((total, acc)=>{return total + 1},0)
    const today = new Date()
    res.send(`<p>Phonebook has info for ${total} people</p>
    <p>${today}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person=>person.id===id)
    if (person) {res.send(`<p>${person.name} ${person.number}</p>`)} 
    else {res.status(404).end()}
})

app.delete('/api/persons/:id', (req, res)=>{
    const id = Number(req.params.id)
    const person = persons.find(person=>person.id===id)
    if (person) {
        persons = persons.filter(person=>person.id !== id)
        res.status(204).end()
    } else {res.status(404).end()}
})

const generateId = ()=>{
    return Math.floor(Math.random()*999+1)
}

app.post('/api/persons', (req, res) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({ 
        error: 'name/number missing' 
        })
    }
    
    if (persons.find(person=> person.name === body.name)) {
        return res.status(400).json({ 
            error: "name must be unique"
        })
    }
    
    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }
    persons = persons.concat(person)
    res.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})