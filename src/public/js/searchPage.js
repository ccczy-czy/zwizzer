$('#searchBar').keydown((evt) => {
    clearTimeout(timer);
    const textbox = $(evt.target);
    let value = textbox.val();
    const tab = textbox.data().search;

    timer = setTimeout(() => {
        value = textbox.val().trim();

        if (value == '') {
            $('.resultContainer').html('');
        }
        else {
            search(value, tab);
        }
    }, 1000);
});

function search(text, tab) {
    const url = tab === 'users' ? '/api/users' : '/api/posts';
    $.get(url, {search: text}, (data) => {
        if (tab === 'users') {
            getUsers(data, $('.resultContainer'));
        }
        else {
            getPosts(data, $('.resultContainer'));
        }
    });
}