$(document).ready(() => {
    $.get('/api/posts', {followingOnly: true}, (data) => {
        getPosts(data, $('.postsContainer'));
    });
});

function getPosts(data, parent) {
    parent.html('');

    data.forEach((d) => {
        const post = createPost(d);
        parent.append(post);
    });

    if (data.length === 0) {
        parent.append("<span id='noData'>You've reached the bottom.</span>");
    }

}