var websocket;
var inputMessage = document.getElementById('messageInput');
var sessionNickname = '<%=session.getAttribute("sessionNickname")%>';
var enterChatObj = null;
var recentRoom;
var chat_id = document.getElementById('chat_id').value;

var messagesContainer = document.getElementById("messages");
var li = document.createElement('li');
var entete = document.createElement('div');
entete.className = "entete";
var msg = document.createElement('div');
msg.className = "message";
const chatRoomList = document.getElementById("chatRoomList");
var chatUl = document.createElement('ul');
chatRoomList.appendChild(chatUl);

var chatRoomListObj;
var chatRoomListObj_tmp;

document.addEventListener("DOMContentLoaded", function () {
    ChatRoomList("showL").then();
    console.log("chat_id :", chat_id);
    enterChat(recentRoom).then();
    if (sessionNickname && sessionNickname.trim() !== "") {
        // function openSocket() {
        // writeResponse("WebSocket is open!!!!");
        // Ensure only one connection is open at a time
        // if (websocket !== undefined && websocket.readyState !== WebSocket.CLOSED) {
        //     writeResponse("WebSocket is already opened.");
        //     return;
        // }
        // Create a new instance of the websocket
        websocket = new WebSocket("ws://192.168.0.97:8080/chat");
        // websocket.onopen = function (event) {
        //     if (event.data === undefined) return;
        //     writeResponse(event.data);
        //
        //     console.log("recent", recentRoom);
        //     enterChat(recentRoom).then();
        // };
        websocket.onmessage = function (event) {
            // ws객체에 전달받은 메세지가 있으면 실행되는 함수
            var message = event.data.split("|");
            console.log(message);
            showText(message);
        };
        websocket.onclose = function (event) {
            writeResponse("Connection closed");
        };
        websocket.onerror = function (event) {
            console.log(event);
        }
    } else {
        console.log("user is not login...");
    }
    if (chat_id !== undefined) {
        enterChat(chat_id).then();
    }
});

function showText(text) {
    var sender = text[0];
    var content = text[1];
    var timestamp = text[2];

    var li = document.createElement('li');
    var entete = document.createElement('div');
    entete.className = "entete";
    var msg = document.createElement('div');
    msg.className = "message";

    if (sender === "나") {
        li.className = "me";
        entete.innerHTML = `<span class="status blue"></span>
            <h3>${timestamp}</h3>`;
    } else {
        li.className = "you";
        entete.innerHTML = `<span class="status green"></span>
            <h2>${sender}</h2>
            <h3>${timestamp}</h3>
            `;
    }

    msg.innerHTML = content;


    li.appendChild(entete);
    li.appendChild(msg);
    messagesContainer.appendChild(li);
    li.scrollIntoView(false);
}

function sendMessage() {
    var text = document.getElementById("messageInput").value;
    //ws 객체에 session id랑 msg보냄

    var message = {
        match_id: enterChatObj.match_id,
        chat_id: enterChatObj.chat_id,
        user_id: enterChatObj.user_id,
        content: text,
        timestamp: new Date().toISOString()
    };

    websocket.send(JSON.stringify(message));
    inputMessage.value = "";
}

function closeSocket() {
    websocket.close();
}

function writeResponse(text) {
    var messages = document.getElementById("messages");
    messages.innerHTML += "<br/>" + text;
}

function matchBtn(user) {
    if (enterChatObj && enterChatObj.match_email) {
        var match_email = enterChatObj.match_email;
        document.getElementById("matchBtn").hidden = user !== match_email;
    } else {
        console.error("obj/obj.match_email가 정의되지 않았습니다.");
    }
}

function matching() {
    $.ajax({
        method: 'post',
        url: '/match',
        data: {
            match_id: enterChatObj.match_id
        },
        success: function (data) {
            console.log(enterChatObj)
            console.log(enterChatObj.match_id)
            alert(JSON.stringify(data));
            if (data.isMatch > 0) {
                alert("매칭 확정 되었습니다.");
            } else {
                alert("err");
            }
        },
        error: function (e) {
            console.log(e);
        }
    })
}


async function enterChat(long) {
    console.log(long);
    try {
        const resp = await fetch("/chat/enterChat?chat_id=" + long);
        console.log(resp);

        const data = await resp.json();
        console.log(data);

        enterChatObj = data;
    } catch (error) {
        console.error("errrrr", error);
    }
    showMsgList();
}

function showMsgList() {
    messagesContainer.innerHTML = '';

    Object.entries(enterChatObj.msgMap).forEach(([groupKey, group]) => {
        var li = document.createElement('li');
        var entete = document.createElement('div');
        entete.className = "entete";
        var msg = document.createElement('div');
        msg.className = "message";

        console.log(group);
        if (enterChatObj.user_id === group.sender) {
            li.className = "me";
            entete.innerHTML = `<span class="status blue"></span>
            <h3>${groupKey}</h3>`;
        } else {
            li.className = "you";
            entete.innerHTML = `<span class="status green"></span>
            <h2>${group.sender}</h2>
            <h3>${groupKey}</h3>
            `;
        }

        msg.innerHTML = group.content;

        li.appendChild(entete);
        li.appendChild(msg);
        messagesContainer.appendChild(li);
        li.scrollIntoView(false);
    });
}

async function ChatRoomList(text) {
    try {
        const resp = await fetch("/chat/chatList", {
            method: "POST", // POST 메서드로 변경
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await resp.json();
        console.log(data);
        // recentRoom = Object.key(data[0]);

        chatRoomListObj = data;

        if (text === "showL") {
            console.log("showL");

            chatRoomListObj.forEach(item => {
                recentRoom = item.key[0];
                var li = document.createElement('li');
                var a = document.createElement('a');
                var div = document.createElement('div');
                var img = document.createElement("img");
                chatUl.appendChild(li);
                a.onclick = function () {
                    enterChat(item.key);
                };
                console.log("item", item);
                console.log("item", item.value.subject);

                if (item.value.profile === undefined) {
                    img.setAttribute("src", "../image/user.png");
                    img.setAttribute("alt", "");
                } else {
                    img.setAttribute("src", item.value.profile);
                }
                a.appendChild(img);

                div.innerHTML = `  <h2>${item.value.subject}</h2>
                            <p>${item.value.recentContent}</p>`;
                li.appendChild(a);
                a.appendChild(div);
            })
        }
    } catch (error) {
        console.error("errrrr", error);
    }
}

fetchingChatRoomList();

function fetchingChatRoomList() {
    setInterval(async () => {
        try {
            await ChatRoomList();
            if (!deepEqual(chatRoomListObj, chatRoomListObj_tmp)) {
                chatRoomListObj_tmp = JSON.parse(JSON.stringify(chatRoomListObj));

                while (chatUl.firstChild) {
                    chatUl.removeChild(chatUl.firstChild);
                }

                await ChatRoomList("showL");

                console.log("채팅방 목록 : ", chatRoomListObj_tmp);
            }
        } catch (error) {
            console.error("fetchingChatRoomList : ", error);
        }
    }, 1000);
}

function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
}
