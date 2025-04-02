const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blogList')


beforeEach(async () => {
  await Blog.deleteMany({}) // Limpia la colección antes de cada prueba
  console.log('cleared')

  // Agrega los blogs iniciales a la base de datos
  await Blog.insertMany(helper.initialBlogs)
  const blogs = await Blog.find({})
  console.log('added blogs:', blogs.map(blog => blog.title))
})





test('blogs are returned as json', async () => {
  console.log('testing')
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('the first one', async () => {
  const response = await api.get('/api/blogs')

  const titles = response.body.map(e => e.title) // Cambia 'content' a 'title'
  assert(titles.includes('First Blog')) // Verifica si el título 'First Blog' está presente
})

test('a valid Blog can be added', async () => {
  const newBlog = {
    title: 'async/await simplifies making async calls',
    author: 'Author Three',
    url: 'http://example.com/third',
    likes: 2,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(e => e.title)
  assert(titles.includes('async/await simplifies making async calls'))
  console.log('added' + titles)

})

test('a blog without title is not added', async () => {
  const newBlog = {
    author: 'Author Three',
    url: 'http://example.com/third',
    likes: 2,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('a specific blog can be viewed', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToView = blogsAtStart[0]

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.deepStrictEqual(resultBlog.body, blogToView)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  const titles = blogsAtEnd.map(e => e.title)
  assert(!titles.includes(blogToDelete.title))

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

test('id is defined', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body

  blogs.forEach(blog => {
    assert(blog.id)
    assert.strictEqual(typeof blog.id, 'string')
    assert.strictEqual(blog._id, undefined)
  })
})

after(async () => {
  await mongoose.connection.close()
})