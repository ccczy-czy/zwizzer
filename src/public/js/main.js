//Global
var cropper;
var timer;
var selected = [];

$('#postText, #replyText').keyup((evt) => {
    const textarea = $(evt.target);
    const value = textarea.val().trim();

    const submitButton = textarea.parents('.modal').length === 1 ? $('#submitReplyButton') : $('#submitPostButton');
    
    if (value === '') {
        submitButton.prop('disabled', true);
    }
    else {
        submitButton.prop('disabled', false);
    }
});

$('#submitPostButton, #submitReplyButton').click((evt) => {
    const button = $(evt.target);

    const textbox = button.parents('.modal').length === 1 ? $('#replyText') : $('#postText');

    const data = {
        content: textbox.val()
    };

    if (button.parents('.modal').length === 1) {
        data.replyTo = button.data().id;
    }

    $.post('/api/posts', data, (postData) => {
        if (postData.replyId) {
            location.reload();
        }
        else {
            $('.postsContainer').prepend(createPost(postData));
            $('#noData').hide();
            textbox.val('');
            button.prop('disabled', true);
        }
    });
});

$('#replyModal').on('show.bs.modal', (evt) => {
    const postId = getPostId($(evt.relatedTarget));
    $('#submitReplyButton').data('id', postId);

    $.get(`/api/posts/${postId}`, (data) => {
        getPosts(data.postData, $('.replyToContainer'));
    });
});

$('#replyModal').on('hidden.bs.modal', () => {
    $('.replyToContainer').html(''); //optimize
});

$('#deleteModal').on('show.bs.modal', (evt) => {
    const postId = getPostId($(evt.relatedTarget));
    $('#deleteButton').data('id', postId);
});

$('#deleteButton').click((evt) => {
    const postId = $(evt.target).data('id');
    $.ajax({
        url: `api/posts/${postId}`,
        type: 'DELETE',
        success: () => {
            location.reload();
        }
    });
});

$('#pinModal').on('show.bs.modal', (evt) => {
    const postId = getPostId($(evt.relatedTarget));
    $('#pinButton').data('id', postId);
});

$('#pinButton').click((evt) => {
    const postId = $(evt.target).data('id');
    $.ajax({
        url: `api/posts/${postId}`,
        type: 'PUT',
        data: {pinned: true},
        success: () => {
            location.reload();
        }
    });
});

$('#unpinModal').on('show.bs.modal', (evt) => {
    const postId = getPostId($(evt.relatedTarget));
    $('#unpinButton').data('id', postId);
});

$('#unpinButton').click((evt) => {
    const postId = $(evt.target).data('id');
    $.ajax({
        url: `api/posts/${postId}`,
        type: 'PUT',
        data: {pinned: false},
        success: () => {
            location.reload();
        }
    });
});

$('#profilePic').change(function() {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const image = document.getElementById('previewImage');
            image.src = evt.target.result;

            if (cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false
            });
        };
        reader.readAsDataURL(this.files[0]);
    }
});

$('#uploadButton').click((evt) => {
    const canvas = cropper.getCroppedCanvas();

    if (canvas == null) {
        return alert("Couldn't upload image. Make sure you upload an image file");
    }

    canvas.toBlob((b) => {
        const formData = new FormData();
        formData.append('croppedImage', b);

        $.ajax({
            url: '/api/users/profilePic',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                location.reload();
            }
        });
    });
});

$('#coverPhoto').change(function() {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const image = document.getElementById('previewCover');
            image.src = evt.target.result;

            if (cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                background: false
            });
        };
        reader.readAsDataURL(this.files[0]);
    }
});

$('#uploadCoverButton').click((evt) => {
    const canvas = cropper.getCroppedCanvas();

    if (canvas == null) {
        return alert("Couldn't upload image. Make sure you upload an image file");
    }

    canvas.toBlob((b) => {
        const formData = new FormData();
        formData.append('croppedImage', b);

        $.ajax({
            url: '/api/users/coverPhoto',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                location.reload();
            }
        });
    });
});

$('#searchUserBox').keydown((evt) => {
    clearTimeout(timer);
    const textbox = $(evt.target);
    let value = textbox.val();

    if (value =='' && evt.key === "Backspace") {
        //remove previous user selected
        selected.pop();
        updateSelected();
        $('#searchUserBox').val('').focus();
        $('.resultContainer').html('');
        if(selected.length == 0) {
            $('#createChat').prop('disabled', true);
        }
        return;
    }

    timer = setTimeout(() => {
        value = textbox.val().trim();

        if (value == '') {
            $('.resultContainer').html('');
        }
        else {
            searchUsers(value);
        }
    }, 1000);
});

$('#createChat').click(() => {
    const users = JSON.stringify(selected);

    $.post('/api/chats', {users: users}, (chat) => {

        if(!chat || !chat._id) {
            return alert('Invalid response');
        }

        window.location.href = `/messages/${chat._id}`;
    });
});

$(document).on('click', '.like', (evt) =>{
    const postId = getPostId($(evt.target));
    if (!postId) {
        return;
    }

    $.ajax({
        url: `api/posts/${postId}/like`,
        type: 'PUT',
        success: (postData) => {
            $(evt.target).find('span').text(postData.likes.length || '');

            if (postData.likes.includes(userLoggedIn._id)) {
                $(evt.target).addClass('active');
            }
            else {
                $(evt.target).removeClass('active');
            }
        }
    });
});

$(document).on('click', '.retweet', (evt) =>{
    const postId = getPostId($(evt.target));
    if (!postId) {
        return;
    }

    $.post(`api/posts/${postId}/retweet`, (postData) => {
            $(evt.target).find('span').text(postData.retweetUsers.length || '');

            if (postData.retweetUsers.includes(userLoggedIn._id)) {
                $(evt.target).addClass('active');
            }
            else {
                $(evt.target).removeClass('active');
            }
            
        }
    );
});

$(document).on('click', '.post', (evt) =>{
    const postId = getPostId($(evt.target));

    if (!$(evt.target).is('button')) {
        window.location.href = `/post/${postId}`;
    }
});

$(document).on('click', '.followButton', (evt) =>{
    const followButton = $(evt.target);
    const userId = followButton.data().user;

    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: 'PUT',
        success: (data, status, xhr) => {
            if (xhr.status == 404) {
                return alert('User not found');
            }

            let count = 1;
            if(data.following && data.following.includes(userId)) {
                followButton.addClass('following');
                followButton.text('Following');
            }
            else {
                followButton.removeClass('following');
                followButton.text('Follow');
                count = -1;
            }

            const followersNumber = $('#followersNumber');
            if (followersNumber.length != 0) {
                followersNumber.text(parseInt(followersNumber.text())+count);
            }
        }
    });
});

$(document).on('click', '.notification.active', (evt) =>{
    const container = $(evt.target);
    const id = container.data().id;

    evt.preventDefault();

    const cb = () => window.location = container.attr('href');
    markAsRead(id, cb);
});

function createPost(postData, large=false) {
    const isRetweet = postData.retweetId !== undefined;
    postData = isRetweet ? postData.retweetId : postData;

    let retweetHeader = '';
    if (isRetweet) {
        retweetHeader = `<span><i class='fas fa-retweet'></i> Retweeted by <a href='/profile/${postData.postedBy.username}'>@${postData.postedBy.username}</a></span>`
    }

    const name = postData.postedBy.firstName + ' ' + postData.postedBy.lastName;
    const time = timeDifference(new Date(), new Date(postData.createdAt));

    const likeActive= postData.likes.includes(userLoggedIn._id) ? 'active' : '';
    const retweetActive = postData.retweetUsers.includes(userLoggedIn._id) ? 'active' : '';

    const largeFont = large ? 'largeFont' : '';

    let replyHeader = '';

    if (postData.replyId && postData.replyId._id) {
        const replyToUsername = postData.replyId.postedBy.username;
        replyHeader = `<div class='replyHeader'>Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a></div>`;
    }

    let deleteButton = '';
    let pinText = '';

    if (postData.postedBy._id === userLoggedIn._id) {
        let isPinned = '';
        const target = postData.pinned === true ? '#unpinModal' : '#pinModal';
        if (postData.pinned === true) {
            isPinned = 'active';
            pinText = '<i class="fa-solid fa-thumbtack"></i> <span>Pinned post</span>';
        }
        deleteButton = `<button class='${isPinned} pinButton' data-id='${postData._id}' data-toggle='modal' data-target='${target}'><i class="fa-solid fa-thumbtack"></i></button>
                        <button data-id='${postData._id}' data-toggle='modal' data-target='#deleteModal'><i class="fa-regular fa-trash-can"></i></button>`;
    }

    return `<div class='post ${largeFont}' data-id='${postData._id}'>
                <div class='retweetHeader'>
                    ${retweetHeader}
                </div>

                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postData.postedBy.profilePic}'>
                    </div>
                    
                    <div class='postContentContainer'>
                        <div class='pinText'>${pinText}</div>
                        
                        <div class='postHeader'>
                            <a href='/profile/${postData.postedBy.username}' class='name'>${name}</a>
                            <span class='username'>@${postData.postedBy.username}</span>
                            <span class='time'>${time}</span>
                            ${deleteButton}
                        </div>

                        ${replyHeader}

                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>

                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>

                            <div class='postButtonContainer green'>
                                <button class='retweet ${retweetActive}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || ''}</span>
                                </button>
                            </div>

                            <div class='postButtonContainer red'>
                                <button class='like ${likeActive}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ''}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) { //source: https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if ((elapsed/1000) < 30) {
            return 'Just now'
        }
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
        return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function getPostId(element) {
    const root = element.hasClass('post') ? element : element.closest('.post');
    const postId = root.data().id;
    return postId;
}

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

function getPostsWithReplies(data, parent) {
    parent.html('');

    if (data.replyId && data.replyId._id) {
        const post = createPost(data.replyId);
        parent.append(post);
    }

    const mainPost = createPost(data.postData[0], true);
    parent.append(mainPost);

    data.replies.forEach((d) => {
        const post = createPost(d);
        parent.append(post);
    });
}

function getUsers(data, parent) {
    parent.html('');

    data.forEach((d) => {
        const user = createUser(d, true);
        parent.append(user);
    });

    if(data.length == 0) {
        parent.append("<span class='noResults'>No results found</span>");
    }
}

function createUser(data, showButton) {
    const name = data.firstName + ' ' + data.lastName;
    const isFollowing = userLoggedIn.following && userLoggedIn.following.includes(data._id);
    const textContent = isFollowing ? 'Following' : 'Follow';
    const buttonClass = isFollowing ? 'followButton following' : 'followButton';

    let button = '';

    if (showButton && userLoggedIn._id != data._id) {
        button = `<div class='followButtonContainer'>
                    <button class='${buttonClass}' data-user='${data._id}'>${textContent}</button>
                </div>`;
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${data.profilePic}'>
                </div>

                <div class='userDetailsContainer'>
                    <div class='postHeader'>
                        <a href='/profile/${data.username}'>${name}</a>
                        <span class='username'>@${data.username}</span>
                    </div>
                </div>

                ${button}
            </div>`;
}

function searchUsers(userSearch) {
    $.get('/api/users', {search: userSearch}, (data) => {
        getSelectUsers(data, $('.resultContainer'));
    });
}

function getSelectUsers(data, parent) {
    parent.html('');

    data.forEach((d) => {
        if (d._id == userLoggedIn._id || selected.some(u => u._id == d._id)) {
            return;
        }
        const user = createUser(d, false);
        const element = $(user);
        element.click(() => {
            selectUser(d);
        });
        parent.append(element);
    });

    if(data.length == 0) {
        parent.append("<span class='noResults'>No results found</span>");
    }
}

function selectUser(user) {
    selected.push(user);
    updateSelected();
    $('#searchUserBox').val('').focus();
    $('.resultContainer').html('');
    $('#createChat').prop('disabled', false);
}

function updateSelected() {
    const users = [];

    selected.forEach((user) => {
        const element = $(`<span class='selectedUser'>${user.firstName} ${user.lastName}</span>`);
        users.push(element);
    });

    $('.selectedUser').remove();
    $('#selectedUsers').prepend(users);
}

function getChatName(chat) {
    let chatName = chat.chatName;

    if(!chatName) {
        const chatMembers = getMember(chat.users);
        const memberNames = chatMembers.map(user => user.firstName + " " + user.lastName);
        chatName = memberNames.join(', ');
    }

    return chatName;
}

function getMember(users) {
    if(users.length == 1) {
        return users;
    }

    return users.filter(user => user._id != userLoggedIn._id);
}

function messageReceived(newMessage) {
    if($(`[data-room="${newMessage.chat._id}"]`).length == 0) {
        // Show popup notification
    }
    else {
        addMessage(newMessage);
    }
}

function markAsRead(id=null, cb=null) {
    if(cb == null) {
        cb = () => location.reload();
    }

    const url = id != null ? `/api/notifications/${id}/markasread` : `/api/notifications/markasread`;
    $.ajax({
        url: url,
        type: 'PUT',
        success: () => {
            cb();
        }
    });
}