$(document).ready(() => {
    $.get('/api/notifications', (data) => {
        outputNotification(data, $('.resultContainer'));
    });
});

$('.markAsRead').click(() => {
    markAsRead();
});

function outputNotification(notifications, parent) {
    notifications.forEach(notification => {
        const html = createNotification(notification);
        parent.append(html);
    });

    if(notifications.length == 0) {
        parent.append("<span class='noResults'>You've reached the bottom.</span>");
    }
}

function createNotification(notification) {
    const userFrom = notification.userFrom;
    const text = getText(notification);
    const url = getUrl(notification);
    const isActive = notification.opened ? '' : 'active';

    return `<a href='${url}' class='chatItem notification ${isActive}' data-id='${notification._id}'>
                <div class='chatImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='chatDetailsContainer ellipsis'>
                    <span class='ellipsis'>${text}</span>
                </div>
            </a>`;
}

function getText(notification) {

    const userFrom = notification.userFrom;

    if(!userFrom.firstName || !userFrom.lastName) {
        return alert('user not populated');
    }

    const userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
    
    let text;

    if(notification.notificationType == 'retweet') {
        text = `${userFromName} retweeted one of your posts`;
    }
    else if(notification.notificationType == 'like') {
        text = `${userFromName} liked one of your posts`;
    }
    else if(notification.notificationType == 'reply') {
        text = `${userFromName} replied to one of your posts`;
    }
    else if(notification.notificationType == 'follow') {
        text = `${userFromName} followed you`;
    }

    return `<span class='ellipsis'>${text}</span>`;
}

function getUrl(notification) { 
    let url = '#';

    if(notification.notificationType == 'retweet' || 
        notification.notificationType == 'like' || 
        notification.notificationType == 'reply') {
            
        url = `/post/${notification.entityId}`;
    }
    else if(notification.notificationType == 'follow') {
        url = `/profile/${notification.entityId}`;
    }

    return url;
}