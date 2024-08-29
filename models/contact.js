const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connectig to', url)
mongoose
  .connect(url)
  .then(() => {
    console.log('connectedto MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB', error.message)
  })

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'It must be at least 3 characters'],
  },
  number: {
    type: String,
    validate: {
      validator: function (value) {
        return /^(\d{2,3})-\d{5,}$/.test(value)
      },
      message:
        'It must be atleast 8 character and in format xx-xxxxx or xxx-xxxxx',
    },
  },
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Contact', contactSchema)
