let type = false;
let lastTypingTime;

$(document).ready(() => {
    socket.emit('joinRoom', chatId);
    socket.on('typing', () => $('.typingDots').show());
    socket.on('stopTyping', () => $('.typingDots').hide());

    $.get(`/api/chats/${chatId}`, (data) => {
        $('#chatName').text(getChatName(data));
    });

    $.get(`/api/chats/${chatId}/messages`, (data) => {
        const messages = [];
        let lastSender = '';

        data.forEach((d, i) => {
            const message = createMessage(d, data[i+1], lastSender);
            lastSender = d.sender._id;
            messages.push(message);
        });

        const html = messages.join('');
        addMessagesHtml(html);
        scrollToBottom(false);
    })
});

$('#changeChatButton').click(() => {
    const chatName = $('#changeChatNameBox').val().trim();
    
    $.ajax({
        url: '/api/chats/' + chatId,
        type: 'PUT',
        data: { chatName: chatName },
        success: (data, status, xhr) => {
            if(xhr.status != 204) {
                alert('Fail to update');
            }
            else {
                location.reload();
            }
        }
    });
});

$('.sendMessage').click(() => {
    submitMessage();
});

$('.inputTextBox').keydown((evt) => {
    typing();

    if(evt.which === 13) {
        submitMessage();
        return false;
    }
});

function typing() {
    if(!connected) {
        return;
    }

    if(!type) {
        type = true;
        socket.emit('typing', chatId);
    }

    lastTypingTime = new Date().getTime();

    setTimeout(() => {
        const timeNow = new Date().getTime();
        const timeDiff = timeNow - lastTypingTime;

        if(timeDiff >= 3000 && typing) {
            socket.emit('stopTyping', chatId);
            type = false;
        }
    }, 3000);
}

function addMessagesHtml(html) {
    $('.chatMessages').append(html);
}

function submitMessage() {
    const content = $('.inputTextBox').val().trim();

    if(content != '') {
        send(content);
        $('.inputTextBox').val('');
        socket.emit('stopTyping', chatId);
        type = false;
    }
}

function send(content) {
    $.post('/api/messages', { content: content, chatId: chatId }, (data, status, xhr) => {
        if(xhr.status != 201) {
            alert('Fail to send message');
            $('.inputTextBox').val(content);
            return;
        }
        
        addMessage(data);

        if(connected) {
            socket.emit('newMessage', data);
        }
    });
}

function addMessage(message) {
    if(!message || !message._id) {
        return alert('Message is not valid');
    }

    const messages = createMessage(message, null, '');

    addMessagesHtml(messages);
    scrollToBottom(true);
}

function createMessage(message, nextMessage, lastSender) {
    const nextSenderId = nextMessage != null ? nextMessage.sender._id : '';

    const isFirst = lastSender != message.sender._id;
    const isLast = nextSenderId != message.sender._id;

    const isUser = message.sender._id == userLoggedIn._id;
    let isUserClass = isUser ? 'isUser' : 'isOther';

    const senderName = message.sender.firstName + ' ' + message.sender.lastName;
    let displayName = '';

    if(isFirst) {
        isUserClass += ' first';

        if(!isUser) {
            displayName = `<span class='senderName'>${senderName}</span>`;
        }
    }

    let profileImage = '';

    if(isLast) {
        isUserClass += ' last';
        profileImage = `<img src='${message.sender.profilePic}'>`;
    }

    let imageContainer = '';
    if(!isUser) {
        imageContainer = `<div class='imageContainer'>
                                ${profileImage}
                            </div>`;
    }

    return `<li class='message ${isUserClass}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${displayName}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function scrollToBottom(animation) {
    const container = $('.chatMessages');
    const scrollHeight = container[0].scrollHeight;

    if(animation) {
        container.animate({scrollTop: scrollHeight}, 'slow');
    }
    else {
        container.scrollTop(scrollHeight);
    }
}