const bcrypt = require('bcrypt')
const { test, after, describe, beforeEach, beforeAll } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blogList')
const User = require('../models/user')

let token = null
let blogToDelete = null


beforeEach(async () => {
  await User.deleteMany({})
  await helper.createTestUser(api)
  await Blog.deleteMany({})
  console.log('cleared')
  await Blog.insertMany(helper.initialBlogs)
  const blogs = await Blog.find({})
  console.log('added blogs:', blogs.map(blog => blog.title))
    // Log in before each test that requires authentication
    const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'testpassword',
    })

  token = loginResponse.body.token // Store the token globally

  // Create a blog for this user
  const newBlog = {
    title: 'Blog to delete',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 5
  }

  const creationResponse = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)

  blogToDelete = creationResponse.body
})

/* describe('when there are initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(e => e.title)
    assert(titles.includes('First Blog'))
  })
}) */

describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultBlog.body, blogToView)
  })

  test('each blog has a unique identifier named id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body

    blogs.forEach(blog => {
      assert(blog.id)
      assert.strictEqual(typeof blog.id, 'string')
      assert.strictEqual(blog._id, undefined)
    })
  })
})

describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {

      const initialBlogs = await helper.blogsInDb()
      console.log('Initial blogs:', initialBlogs)
      
      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'Author Three',
        url: 'http://example.com/third',
        likes: 2,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`) // Use the token for authentication
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)

      const titles = blogsAtEnd.map(e => e.title)
      assert(titles.includes('async/await simplifies making async calls'))
    })

    test('fails with status code 401 if token is missing', async () => {
      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'Author Three',
        url: 'http://example.com/third',
        likes: 2,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        
    })

    test('defaults likes to 0 if not provided', async () => {

      const newBlog = {
        title: 'likes amount to 0',
        author: 'Author Three',
        url: 'http://example.com/third',
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`) // Use the token for authentication
        .send(newBlog)
        .expect(201)

      const blogsAtEnd = await helper.blogsInDb()
      const savedBlog = blogsAtEnd.find(blog => blog.title === newBlog.title)
      assert.strictEqual(savedBlog.likes, 0)
    })

    describe('fails with status code 400 if', () => {
      test('title is missing', async () => {
        const newBlog = {
          author: 'Author Without Title',
          url: 'http://example.com/no-title',
          likes: 5
        }

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`) // Use the token for authentication
          .send(newBlog)
          .expect(400)
      })

      test('url is missing', async () => {
        const newBlog = {
          title: 'Blog Without URL',
          author: 'Author Without URL',
          likes: 3
        }

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`) // Use the token for authentication
          .send(newBlog)
          .expect(400)
      })

      test('both title and url are missing', async () => {   
        const newBlog = {
          author: 'Author Without Anything',
          likes: 1
        }

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`) // Use the token for authentication
          .send(newBlog)
          .expect(400)
      })
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      
      
      const initialBlogs = await helper.blogsInDb()
      console.log('Initial blogs:', initialBlogs)

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`) // Use the token for authentication
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      console.log('Blogs after deletion:', blogsAtEnd)
      const titles = blogsAtEnd.map(e => e.title)

      assert(!titles.includes(blogToDelete.title))
      assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1)
    })
  })

  describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('sekret', 10)
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
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
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

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails if username is too short', async () => {
      const newUser = {
        username: 'ro',
        name: 'Short User',
        password: 'short',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('Username or password must be at least 3 characters long'))
    })

    test('creation fails if password is too short', async () => {
      const newUser = {
        username: 'shortuser',
        name: 'Short User',
        password: 'sh',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('Username or password must be at least 3 characters long'))
    })

  
  })

  after(async () => {
    await mongoose.connection.close()
  })