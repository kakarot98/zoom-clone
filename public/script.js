const socket = io("/");
const videogrid = document.getElementById("vid-grid");
const peer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const vid = document.createElement("video");
vid.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(vid, stream);

    peer.on('call', call=> {
        call.answer(stream)
    })

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-connected", (userId) => {
  console.log("user connected - " + userId);
});

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const otherUserVideo = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(otherUserVideo, userVideoStream);
  });
  call.on("close", () => {
    otherUserVideo.remove();
  });
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videogrid.append(video);
}
