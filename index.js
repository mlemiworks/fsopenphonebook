require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (request) => {
  return JSON.stringify(request.body)
})

// loggausta
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

// Hae kaikki
app.get('/api/persons', (request, response) => {
  Contact.find({}).then((contacts) => {
    response.json(contacts)
  })
})

// Info sivu
app.get('/info', (request, response) => {
  Contact.find({}).then((contacts) => {
    const infoText = `<p>Phonebook has info for ${contacts.length} people</p>`
    const dateTime = Date()
    response.send(infoText + dateTime)
  })
})

// Yhteystieto haku id:llä
app.get('/api/persons/:id', (request, response, next) => {
  Contact.findById(request.params.id)
    .then((contact) => {
      response.json(contact)
    })
    .catch((error) => next(error))
})

// Yhteystiedon lisäys
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.name.length === 0 || body.number.length === 0) {
    return response.status(400).json({
      error: 'number or name missing',
    })
  }

  const contact = new Contact({
    name: body.name,
    number: body.number,
  })

  contact
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

// Yhteystiedon muokkaus
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const contact = {
    name: body.name,
    number: body.number,
  }

  Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
    .then((updatedContact) => {
      response.json(updatedContact)
    })
    .catch((error) => next(error))
})

// Yhteystiedon poisto
app.delete('/api/persons/:id', (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

// Yhteystiedon muokkaus

//portin kuuntelu
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

//eli olematon route
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Väärämuotoinen id
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    const customMessage = Object.values(error.errors)
      .map(
        (error) => `Invalid ${error.path}: "${error.value}" - ${error.message}`
      )
      .join(', ')
    return response.status(400).json({ error: customMessage })
  }

  next(error)
}

// Joku muu
const generalErrorHandler = (error, request, response) => {
  console.error(error.message)

  return response.status(500).json({ error: 'internal server error' })
}

// Routejen ja middlewarejen perään aina
app.use(unknownEndpoint)
app.use(errorHandler)
app.use(generalErrorHandler)
