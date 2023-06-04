const profile = document.querySelector("#myProfile");

sharePage = () => {
  const shareObject = {
    title: "채팅방 초대",
    text: `${window.location.href}`,
    url: window.location.href,
  };

  if (navigator.share) {
    navigator
      .share(shareObject)
      .then(() => {
        alert("공유하기 성공");
      })
      .catch((error) => {
        alert("에러가 발생했습니다.");
      });
  } else {
    alert("페이지 공유를 지원하지 않습니다.");
  }
};

window.onload = function () {
  function getToday() {
    var date = new Date();
    var year = date.getFullYear();
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);

    return ` ${year}/${month}/${day}, ${hours}:${minutes}`;
  }

  var roomForm = document.querySelector("#roomInsertForm");
  var roomOptions = document.querySelector("#roomOptions");
  const roomArray = [];
  if (localStorage.getItem("roomId")) {
    JSON.parse(localStorage.getItem("roomId")).forEach((item) => {
      var myButton = document.createElement("div");
      var myLink = document.createElement("a");

      myLink.href = `http://127.0.0.1:3000/?room_name=${item}`;
      myLink.innerText = item;
      myLink.style.textDecoration = "none";
      myLink.style.color = "white";
      myLink.style.fontWeight = "bold";
      myButton.style.width = "70%";
      myButton.style.height = "10%";
      myButton.style.margin = "15px";
      myButton.style.borderRadius = "10%";
      myButton.style.display = "flex";
      myButton.style.justifyContent = "center";
      myButton.style.alignItems = "center";
      myButton.appendChild(myLink);
      myButton.style.background = "black";
      roomOptions.appendChild(myButton);
      roomArray.push(item);
      localStorage.setItem("roomId", JSON.stringify(roomArray));
    });
  }

  roomForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var roomName = document.querySelector("#roomInput").value;
    if (roomName.length > 5) {
      alert("5글자 이하 작성");
      roomInput.value = "";
      return false;
    }
    if (localStorage.getItem("roomId")) {
      if (
        JSON.parse(localStorage.getItem("roomId")).find(
          (room) => room === roomName
        )
      ) {
        alert("이미 존재하는 방 이름입니다.");
        roomInput.value = "";
        return false;
      }
    }

    var roomButton = document.createElement("div");
    var roomLink = document.createElement("a");
    roomArray.push(roomName);
    localStorage.setItem("roomId", JSON.stringify(roomArray));

    roomLink.href = `http://127.0.0.1:3000/?room_name=${roomName}`;
    roomLink.innerText = roomName;
    roomLink.style.textDecoration = "none";
    roomLink.style.color = "white";
    roomLink.style.fontWeight = "bold";
    roomButton.style.width = "70%";
    roomButton.style.height = "10%";
    roomButton.style.margin = "15px";
    roomButton.style.borderRadius = "10%";
    roomButton.style.display = "flex";
    roomButton.style.justifyContent = "center";
    roomButton.style.alignItems = "center";
    roomButton.appendChild(roomLink);
    roomButton.style.background = "black";
    roomOptions.appendChild(roomButton);
    roomInput.value = "";

    toggleModal('modalCreateRoom');
  });

  var roomTitle = document.querySelector("#groupName");
  if (window.location.href != "http://127.0.0.1:3000/") {
    roomTitle.innerText = `${decodeURI(window.location.href.split("=")[1])}`;
  } else {
    roomTitle.innerText = "Home";
  }

  //클라이언트 소켓 생성
  var socket = io.connect("ws://127.0.0.1:3000");
  //DOM 참조
  var div = document.getElementById("message");
  var txt = document.getElementById("txtChat");
  //텍스트 박스에 포커스 주기
  txt.focus();

  //텍스트 박스에 이벤트 바인딩
  txt.onkeydown = sendMessage.bind(this);
  function sendMessage(event) {
    if (event.keyCode == 13) {
      //메세지 입력 여부 체크
      var message = event.target.value;
      if (message) {
        //소켓서버 함수 호출
        socket.emit("serverReceiver", message);
        //텍스트박스 초기화
        txt.value = "";
      }
    }
  }

  var leftOptions = document.querySelectorAll("#leftOptions");
  const roomInsert = document.querySelector("#roomInsert");
  roomInsert.style.display = "none";

  function onDisplay() {
    if (roomInsert.style.display == "none") {
      roomInsert.style.display = "block";
    } else {
      roomInsert.style.display = "none";
    }
  }

  leftOptions.forEach(function (option) {
    option.addEventListener("click", function () {
      onDisplay();
      // Get the group name
      var groupName = option.textContent;
      // Send createRoom event to the server
      socket.emit("createRoom", groupName);
    });
  });

  //클라이언트 receive 이벤트 함수(서버에서 호출할 이벤트)
  socket.on("clientReceiver", function (data) {
    //console.log('서버에서 전송:', data);
    //채팅창에 메세지 출력하기
    var message =
      "[" + data.clientID + "님의 말," + getToday() + "] " + data.message;
    div.innerText += message + "\r\n";
    //채팅창 스크롤바 내리기
    div.scrollTop = div.scrollHeight;
  });
};


socket.on('createRoom', function (roomName) {
  console.log("create");
  var roomID = uniqueID();
  var room = {
    id: roomID,
    name: roomName,
    participants: [clientID],
  };
  rooms[roomID] = room; // 방 객체 저장
  socket.emit('roomCreated', room); // 클라이언트에게 방 생성 완료 메시지 전송
  socket.join(roomID); // 클라이언트를 방에 추가
});

// 초대 요청 받기
socket.on('inviteToRoom', function (roomId) {
  var room = rooms[roomId];
  if (room) {
    room.participants.push(clientID); // 클라이언트를 방에 추가
    socket.emit('roomJoined', room); // 클라이언트에게 방 참여 완료 메시지 전송
    socket.join(roomId);
  } else {
    socket.emit('roomJoinError', '방이 존재하지 않습니다.'); // 에러 메시지 전송
  }
});

// 클라이언트 로그인 이벤트 처리
socket.on('login', function (userData) {
  //var userID = db.getUserId(userData.username); // 유저를 식별하기 위한 고유한 식별자 생성
  var username = userData.username;

  // TODO: ID와 패스워드 검증 로직 구현

  console.log('User logged in:', clientID, username);

  var users = {};

  // 유저 정보 저장
  users[clientID] = {
    userID: clientID,
    username: username,
  };

  // 클라이언트에게 유저 식별자 전송
  socket.emit('userID', clientID);
});

function leaveRoom(roomId) {
  socket.emit('leaveRoom', roomId);
}

document.getElementById('quitButton').addEventListener('click', function() {
  var roomId = "방의 고유 ID"; // 탈퇴할 방의 고유 ID를 여기에 입력
  leaveRoom(roomId);
});

function deleteRoom(roomId) {
  // 서버로 deleteroom 이벤트 전송
  socket.emit('deleteroom', roomId);
}


// inviteToNewRoom 이벤트 핸들러 (방합치기)
socket.on('inviteToNewRoom', function (data) {
var { invitedUsers } = data;

// 새로운 방 생성
var newRoomId = uniqueID();
var newRoom = {
  id: newRoomId,
  name: 'New Room',
  participants: [clientID, ...invitedUsers],
};
rooms[newRoomId] = newRoom;

// 클라이언트에게 방 생성 완료 메시지 전송
socket.emit('newRoomCreated', newRoom);

// 초대한 사용자들을 새로운 방에 추가
invitedUsers.forEach(function (userId) {
  socket.sockets.to(userId).emit('joinNewRoom', newRoomId);
  socket.to(userId).join(newRoomId);
});
});

// inviteAllInRoom 이벤트 핸들러
socket.on('inviteAllInRoom', function (data) {
var { roomId, invitedBy } = data;

// 초대하려는 방의 참가자들 가져오기
var room = rooms[roomId];
if (!room) {
  // 방이 존재하지 않을 경우 처리
  socket.emit('inviteAllInRoomError', '초대하려는 방이 존재하지 않습니다.');
  return;
}

var participants = room.participants;

// 참가자들을 순회하면서 초대 메시지 전송
participants.forEach(function (participantId) {
  // 자기 자신에게는 초대 메시지를 보내지 않도록 함
  if (participantId !== clientID) {
    socket.sockets.to(participantId).emit('invitation', {
      invitedBy: invitedBy,
      roomId: roomId,
    });
  }
});

// 성공적으로 초대 메시지를 전송한 경우 응답 전송
socket.emit('inviteAllInRoomSuccess', '방의 모든 참가자에게 초대 메시지를 전송했습니다.');
});

// kickUserFromRoom 이벤트 핸들러
socket.on('kickUserFromRoom', function (data) {
var { roomId, targetUserId } = data;

// 방이 존재하는지 확인
var room = rooms[roomId];
if (!room) {
  // 방이 존재하지 않을 경우 처리
  socket.emit('kickUserFromRoomError', '강퇴하려는 방이 존재하지 않습니다.');
  return;
}

// 강퇴 대상 사용자가 방에 있는지 확인
var index = room.participants.indexOf(targetUserId);
if (index === -1) {
  // 강퇴 대상 사용자가 방에 없을 경우 처리
  socket.emit('kickUserFromRoomError', '강퇴하려는 사용자가 방에 존재하지 않습니다.');
  return;
}

// 강퇴 대상 사용자를 방에서 제거
room.participants.splice(index, 1);

// 방에서 강퇴 대상 사용자에게 강퇴 메시지 전송
socket.sockets.to(targetUserId).emit('kickedFromRoom', {
  roomId: roomId,
});

// 강퇴 성공 메시지 전송
socket.emit('kickUserFromRoomSuccess', '사용자를 성공적으로 강퇴했습니다.');
});


//ROOM 버튼--------------------------------

// function toggleRoomInsert() {
//   var roomInsert = document.getElementById("roomInsert");
//   if (roomInsert.style.display === "none") {
//     roomInsert.style.display = "block";
//   } else {
//     roomInsert.style.display = "none";
//   }
// }

// document.getElementById("roomButton").addEventListener("click", toggleRoomInsert);
// document.getElementById("roomCancel").addEventListener("click", toggleRoomInsert);

