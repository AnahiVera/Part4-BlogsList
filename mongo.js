const mongoose = require('mongoose')

const { MONGODB_URI } = require('./utils/config')
const url = MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url).then(() => {
    console.log('Connected to TestMongoDB')
})
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message)
    })
const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
})

const Blog = mongoose.model('Blog', blogSchema)

const blogs = [
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
/*
const note = new Note({
  content: 'HTML is x',
  important: true,
})

note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})
*/
/* Blog.find({}).then(result => {
    result.forEach(blog => {
        console.log(blog)
    })
    mongoose.connection.close()
}) */

const addBlogs = async () => {
    await Blog.deleteMany({}) // Limpia la colección antes de agregar nuevos blogs

    const blogObjects = blogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)

    console.log('Blogs added to the database')
    mongoose.connection.close()
}

addBlogs()
