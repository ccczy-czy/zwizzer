$(document).ready(() => {
    if (tab === 'replies') {
        loadReplies();
    }
    else {
        loadPosts();
    }
});

function loadPosts() {
    $.get('/api/posts', {postedBy: profileUserId, pinned: true}, (data) => {
        getPinnedPost(data, $('.pinnedPostContainer'));
    });

    $.get('/api/posts', {postedBy: profileUserId, isReply: false}, (data) => {
        getPosts(data, $('.postsContainer'));
    });
}

function loadReplies() {
    $.get('/api/posts', {postedBy: profileUserId, isReply: true}, (data) => {
        getPosts(data, $('.postsContainer'));
    });
}

function getPinnedPost(data, parent) {
    if (data.length === 0) {
        return parent.hide();
    }
    parent.html('');

    data.forEach((d) => {
        const post = createPost(d);
        parent.append(post);
    });
}