const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
    .populate('user', { username: 1, name: 1 })
  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  const blog = new Blog({
    url: body.url,
    title: body.title,
    author: body.author,
    user: user._id,
    likes: body.likes === undefined ? 0 : body.likes
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user
  const userid = user._id

  const blog = await Blog.findById(request.params.id)
  if (blog.user.toString() === userid.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  }
  response.status(401).json({ error: 'token missing or invalid' })
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    url: body.url,
    title: body.title,
    author: body.author,
    likes: body.likes + 1,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog.toJSON())
})

module.exports = blogsRouter