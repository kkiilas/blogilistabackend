const bcryptjs = require('bcryptjs')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = async () => {
  await User.deleteMany({})
  const passwordHash = await bcryptjs.hash('thesquad', 10)
  const user = new User({ username: 'rtlaib', passwordHash })
  await user.save()
  const userid = user._id

  return [
    {
      url: 'https://reactpatterns.com/',
      title: 'React patterns',
      author: 'Michael Chan',
      user: userid,
      likes: 7,
    },
    {
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      user: userid,
      likes: 5,
    }
  ]
}

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'willremovethissoon',
    author: 'nobody',
    url: 'https://www.helsinki.fi/sv',
    likes: 2
  })
  await blog.save()
  await blog.remove()
  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
}