$(document).ready(() => {
    if (tab === 'followers') {
        loadFollowers();
    }
    else {
        loadFollowing();
    }
});

function loadFollowers() {
    $.get(`/api/users/${profileUserId}/followers`, (data) => {
        getUsers(data.followers, $('.resultContainer'));
    });
}

function loadFollowing() {
    $.get(`/api/users/${profileUserId}/following`, (data) => {
        getUsers(data.following, $('.resultContainer'));
    });
}