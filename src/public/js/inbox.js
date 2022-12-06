$(document).ready(() => {
    $.get('/api/chats', (chat) => {
        getChats(chat, $('.resultContainer'));
    });
});

function getChats(chatList, parent) {
    chatList.forEach(chat => {
        const chatHtml = createChat(chat);
        parent.append(chatHtml);
    });

    if(chatList.length == 0) {
        parent.append("<span class='noResults'>You've reached the bottom.</span>");
    }
}

function createChat(chat) {
    const chatName = getChatName(chat);
    const image = getChatImages(chat);
    const latestMessage = getLatestMessage(chat.latestMessage);
    
    return `<a href='/messages/${chat._id}' class='chatItem'>
                ${image}
                <div class='ellipsis chatDetailsContainer'>
                    <span class='ellipsis chatHeader'>${chatName}</span>
                    <span class='ellipsis subText'>${latestMessage}</span>
                </div>
            </a>`;
}

function getLatestMessage(latestMessage) {
    if(latestMessage != null) {
        const sender = latestMessage.sender;
        return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
    }

    return 'New chat';
}

function getChatImages(chat) {
    const chatMembers = getMember(chat.users);
    let isGroup = '';

    let chatImage = getUserAvatar(chatMembers[0]);

    if (chatMembers.length > 1) {
        isGroup = 'groupChatImg';
        chatImage += getUserAvatar(chatMembers[1]);
    }

    return `<div class='chatImageContainer ${isGroup}'>${chatImage}</div>`;
}

function getUserAvatar(member) {
    if (!member || !member.profilePic) {
        return alert('Invalid');
    }

    return `<img src='${member.profilePic}' alt='user's profile pic'>`;
}