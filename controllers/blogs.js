const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs.map((blog) => blog.toJSON()))
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', {
    username: 1,
    name: 1
  })
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
  await User.findByIdAndUpdate(user._id, user)
  response.json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user
  const userid = user._id

  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() === userid.toString()) {
    await Blog.findByIdAndRemove(request.params.id)

    user.blogs = user.blogs.filter(
      (blogid) => blogid.toString() !== request.params.id.toString()
    )
    await User.findByIdAndUpdate(user._id, user)

    response.status(204).end()
  } else {
    response.status(401).json({ error: 'token missing or invalid' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const body = request.body
  const currentBlog = await Blog.findById(id)
  const updatedLikes =
    body.likes === currentBlog.likes ? body.likes + 1 : body.likes

  const blog = {
    ...body.blog,
    likes: updatedLikes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, {
    new: true
  }).populate('user', { username: 1, name: 1 })
  response.json(updatedBlog.toJSON())
})

module.exports = blogsRouter
