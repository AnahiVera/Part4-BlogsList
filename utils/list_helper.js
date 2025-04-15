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

const mostBlogs = (blogs) => {
    const authorCount = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + 1;
        return acc;
    }, {});

    const mostBlogsAuthor = Object.keys(authorCount).reduce((a, b) => authorCount[a] > authorCount[b] ? a : b);
    return { author: mostBlogsAuthor, blogs: authorCount[mostBlogsAuthor] };
}

const mostLikes = (blogs) => {
    const authorLikes = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + blog.likes;
        return acc;
    }, {});

    const mostLikesAuthor = Object.keys(authorLikes).reduce((a, b) => authorLikes[a] > authorLikes[b] ? a : b);
    return { author: mostLikesAuthor, likes: authorLikes[mostLikesAuthor] };
}


module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}