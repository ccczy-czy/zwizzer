$(document).ready(() => {
    $.get(`/api/posts/${postId}`, (data) => {
        getPostsWithReplies(data, $('.postsContainer'));
    });
});
