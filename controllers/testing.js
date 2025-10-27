const router = require('express').Router()
const Blog = require('../models/blogList')
const User = require('../models/user')

router.post('/reset', async (request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})


console.log('Database reset for testing')
  response.status(204).end()
})

module.exports = router