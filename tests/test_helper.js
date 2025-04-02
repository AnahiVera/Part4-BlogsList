const Blog = require('../models/blogList')

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

module.exports = {
    initialBlogs, nonExistingId, blogsInDb
}