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
