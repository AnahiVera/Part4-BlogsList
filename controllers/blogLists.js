const blogListsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blogList')
const User = require('../models/user')

//ROUTES

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    }
    return null
}

blogListsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogListsRouter.get('/:id', async (request, response, next) => {
    const id = request.params.id

    const blog = await Blog.findById(id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})


blogListsRouter.post('/', async (request, response) => {
    const body = request.body

    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user.id
    })
    if (!body.title || !body.url) {
        return response.status(400).json({ error: 'title or url missing' })
    } else {
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        response.status(201).json(savedBlog)
    }
})


blogListsRouter.patch('/:id', async (request, response) => {
    const id = request.params.id
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })
    if (updatedBlog) {
        response.json(updatedBlog)
    } else {
        response.status(404).end()
    }
})

blogListsRouter.delete('/:id', async (request, response) => {
    const id = request.params.id
    await Blog.findByIdAndDelete(id)
    response.status(204).end()
})

module.exports = blogListsRouter