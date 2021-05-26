const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcryptjs = require('bcryptjs')
const User = require('../models/user')

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcryptjs.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  describe('creation fails with proper statuscode and message if', () => {
    describe('username', () => {
      test('already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'root',
          name: 'Superuser',
          password: 'salainen',
        }

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
      })

      test('is missing', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          name: 'Alexandria Ocasio-Cortez',
          password: 'GreenNewDeal',
        }

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` is required')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
      })

      test('is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'KP',
          name: 'Katie Porter',
          password: 'WhiteBoard',
        }

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` (`' + newUser.username + '`) is shorter than the minimum allowed length')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
      })
    })
    describe('password', () => {
      test('is missing', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'iomar',
          name: 'Ilhan Omar'
        }

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('password is required')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
      })

      test('is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
          username: 'apressle',
          name: 'Ayanna Pressley',
          password: 'cw',
        }

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('password is shorter than the minimum allowed length')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
      })
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})