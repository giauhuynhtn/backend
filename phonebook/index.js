const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
require('dotenv').config()
const Person = require('./models/person')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
morgan.token('data', (req) => {return JSON.stringify(req.body)})


app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(express.static('build'))
app.use(requestLogger)
app.use(cors())

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>')
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then( persons => {
        res.json(persons)
    })
})

app.get('/info', (req, res) => {
    Person.find({}).then( persons => {
        const total = persons.reduce((total) => {return total + 1}, 0)
        const today = new Date()
        res.send(`<p>Phonebook has info for ${total} people</p>
                <p>${today}</p>`)
    })
})

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body

    Person.findByIdAndUpdate(
        req.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(error => next(error))
})


app.post('/api/persons', (req, res, next) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'name/number missing' })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })
    // check name existing
    Person.find({ name: body.name })
        .then(result => {
            if (result.length >= 1){
                Person.findByIdAndUpdate(result[0]._id.valueOf(),{ number: body.number }, { new: true }, (err, docs) => {
                    if (err) {
                        console.log('err')
                    } else {
                        console.log(`updated ${body.name} with new number ${body.number}`)
                        res.json(docs)
                    }
                })} else if (result.length === 0) {
                person
                    .save()
                    .then( savedPerson => {
                        console.log('phone number saved!')
                        res.json(savedPerson)
                    })
                    .catch(error => next(error))
            }
        })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})