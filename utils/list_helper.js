const dummy = (blogs) => {

    if (blogs.length >= 0) {
        return 1
    }
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blogs) => sum + blogs.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((prev, current) => (prev.likes > current.likes) ? prev : current)   

}


module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}