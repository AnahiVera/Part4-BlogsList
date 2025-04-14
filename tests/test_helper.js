const Blog = require('../models/blogList')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'First Blog',
        author: 'Author One',
        url: 'http://example.com/first',
        likes: 10,
    },
    {
        title: 'Second Blog',
        author: 'Author Two',
        url: 'http://example.com/second',
        likes: 20,
    },
]

const nonExistingId = async () => {
    const blog = new Blog({ title: 'willremovethissoon' })
    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

const createTestUser = async (api) => {
    await User.deleteMany({}) // Clear the users collection before creating a test user
  
    const testUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'testpassword',
    }
  
    await api
      .post('/api/users')
      .send(testUser)
      .expect(201) // Ensure the user is created successfully
  
    return testUser
  }

module.exports = {
    initialBlogs, nonExistingId, blogsInDb, usersInDb, createTestUser
}