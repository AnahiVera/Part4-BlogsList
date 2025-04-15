const blogListsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blogList')
const User = require('../models/user')
const middleware = require('../utils/middleware') // en vez de en APP solo a rutas especificas, si lo agrego en app.js no hace falta agregarlo en cada ruta


//ROUTES


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


blogListsRouter.post('/',middleware.userExtractor,  async (request, response) => {
    const body = request.body
    const user = request.user

    if (!body.title || !body.url) {
        return response.status(400).json({ error: 'title or url missing' })
    }

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user.id
    })


    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})


blogListsRouter.patch('/:id',middleware.userExtractor, async (request, response) => {
    const id = request.params.id
    const body = request.body
    const user = request.user

    const blogToUpdate = await Blog.findById(id)
    if (!blogToUpdate) {
      return response.status(404).json({ error: 'blog not found' })
    }

    if (blogToUpdate.user.toString() !== user._id.toString()) {
        return response.status(403).json({ 
          error: 'only the creator can update this blog' 
        })
      }

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
        response.status(404).json({ error: 'blog not found' })
    }
})

blogListsRouter.delete('/:id',middleware.userExtractor, async (request, response) => {

    const user = request.user
    const blog = await Blog.findById(request.params.id)

    if (!blog) {
        return response.status(404).json({ error: 'blog not found' })
    }
    if (blog.user.toString() !== user.id.toString()) {
        return response.status(403).json({ error: 'only the creator can delete this blog' })
    }

    const id = request.params.id
    await Blog.findByIdAndDelete(id)
    response.status(204).end()
})

module.exports = blogListsRouter