require('dotenv').config()

const PORT = process.env.PORT

const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

console.log('process.env.NODE_ENV === test', process.env.NODE_ENV === 'test')
console.log('process.env.mongodb_uri', process.env.MONGODB_URI)
console.log('process.env.test_mongodb_uri', process.env.TEST_MONGODB_URI)
console.log('mongodb_uri', MONGODB_URI)

module.exports = {
  MONGODB_URI,
  PORT
}