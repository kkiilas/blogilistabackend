const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')

describe('when there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(await helper.initialBlogs())
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    const initialBlogs = await helper.initialBlogs()
    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain(
      'Go To Statement Considered Harmful'
    )
  })

  describe('viewing a specific blog', () => {
    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToView = blogsAtStart[0]

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

      expect(resultBlog.body).toEqual(processedBlogToView)
    })

    test('fails with status code 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()
      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400)
    })
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
      const usersAtStart = await helper.usersInDb()
      const userToPostFrom = usersAtStart[0]

      const userForToken = {
        username: userToPostFrom.username,
        id: userToPostFrom.id,
      }

      const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        { expiresIn: 60 * 60 }
      )

      const newBlog = {
        url: 'https://www.nytimes.com/2021/03/10/world/europe/harry-meghan-media-race.html',
        title: 'Under Fire Over Race, British Media Admit There Might be a Problem',
        author: 'Isabella Kwai',
        likes: 400
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${token}`)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const initialBlogs = await helper.initialBlogs()
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)

      const titles = blogsAtEnd.map(n => n.title)
      expect(titles).toContain(
        'Under Fire Over Race, British Media Admit There Might be a Problem'
      )
    })

    test('fails with status code 401 if token is missing', async () => {
      const newBlog = {
        url: 'https://www.nytimes.com/2021/03/10/world/europe/harry-meghan-media-race.html',
        title: 'What the 1921 Tulsa Race Massacre Destroyed',
        author: 'Yuliya Parshina-Kottas, Anjali Singhvi, Audra D.S. Burch, Troy Griggs, Mika Gröndahl, Lingdong Huang, Tim Wallace, Jeremy White and Josh Williams',
        likes: 1921
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      const initialBlogs = await helper.initialBlogs()
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(initialBlogs.length)
    })

    test('fails with status code 400 if title is missing', async () => {
      const usersAtStart = await helper.usersInDb()
      const userToPostFrom = usersAtStart[0]

      const userForToken = {
        username: userToPostFrom.username,
        id: userToPostFrom.id,
      }

      const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        { expiresIn: 60 * 60 }
      )

      const newBlog = {
        author: 'Jason Del Rey',
        url: 'https://www.vox.com/recode/2021/2/26/22297554/amazon-race-black-diversity-inclusion',
        likes: 14
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${token}`)
        .send(newBlog)
        .expect(400)

      const initialBlogs = await helper.initialBlogs()
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(initialBlogs.length)
    })

    test('fails with status code 400 if url is missing', async () => {
      const usersAtStart = await helper.usersInDb()
      const userToPostFrom = usersAtStart[0]

      const userForToken = {
        username: userToPostFrom.username,
        id: userToPostFrom.id,
      }

      const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        { expiresIn: 60 * 60 }
      )

      const newBlog = {
        title: 'Bias, disrespect, and demotions: Black employees say Amazon has a race problem',
        author: 'Jason Del Rey',
        likes: 15
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${token}`)
        .send(newBlog)
        .expect(400)

      const initialBlogs = await helper.initialBlogs()
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(initialBlogs.length)
    })
  })

  describe('\'id\'', () => {
    test('is the name of the unique identifier property of the blog posts', async () => {
      const response = await api.get('/api/blogs')
      response.body.forEach(blog => expect(blog.id).toBeDefined())
    })
  })

  describe('likes', () => {
    test('are 0 by default', async () => {
      const usersAtStart = await helper.usersInDb()
      const userToPostFrom = usersAtStart[0]

      const userForToken = {
        username: userToPostFrom.username,
        id: userToPostFrom.id,
      }

      const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        { expiresIn: 60 * 60 }
      )

      const newBlog = {
        title: 'Black Lawyers Speak: Stories of the Past, Hopes for the Future',
        author: 'Adam Allington',
        url: 'https://news.bloomberglaw.com/us-law-week/black-lawyers-speak-stories-of-the-past-hopes-for-the-future-ep-5-podcast'
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${token}`)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const initialBlogs = await helper.initialBlogs()
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)

      const foundBlog = blogsAtEnd.find(blog => blog.author === 'Adam Allington')
      expect(foundBlog.likes).toBe(0)
    })

    test('can be updated', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const resultBlog = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogToUpdate)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(resultBlog.body.likes).toBe(blogToUpdate.likes + 1)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
      const userToDeleteFrom = blogToDelete.user

      const userForToken = {
        username: userToDeleteFrom.username,
        id: userToDeleteFrom.id,
      }

      const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        { expiresIn: 60 * 60 }
      )

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd).toHaveLength(
        blogsAtStart.length - 1
      )

      const titles = blogsAtEnd.map(r => r.title)
      expect(titles).not.toContain(blogToDelete.title)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})