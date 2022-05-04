const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const favouriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const maxLikes = blogs
    .map((blog) => blog.likes)
    .reduce((max, e) => Math.max(max, e))

  const favourites = blogs.filter((blog) => blog.likes === maxLikes)

  const favourite = {
    title: favourites[0].title,
    author: favourites[0].author,
    likes: favourites[0].likes
  }
  return favourite
}

const mostBlogs = (blogs) => {
  const authors = _.countBy(blogs, 'author')

  const rearrange = (value, key) => {
    return { author: key, blogs: value }
  }

  const objects = _.flatMap(authors, rearrange)
  const ordered = _.orderBy(objects, 'blogs', 'desc')

  return ordered.length === 0 ? null : ordered[0]
}

const mostLikes = (blogs) => {
  const groups = _.groupBy(blogs, 'author')

  const calculateLikes = (value, key) => {
    const total = value
      .map((blog) => blog.likes)
      .reduce((sum, likes) => sum + likes, 0)
    return { author: key, likes: total }
  }

  const objects = _.flatMap(groups, calculateLikes)
  const ordered = _.orderBy(objects, 'likes', 'desc')
  return ordered.length === 0 ? null : ordered[0]
}

const totalLikes = (blogs) => {
  return blogs.length === 0
    ? 0
    : blogs.map((blog) => blog.likes).reduce((sum, value) => value + sum)
}

module.exports = {
  dummy,
  favouriteBlog,
  mostBlogs,
  mostLikes,
  totalLikes
}
