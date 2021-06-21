// client side javscript file

const socket = io(); //allow us to send events from both server and client

const messageForm = document.querySelector(".messageForm");
const messageButton = messageForm.querySelector("button");
const messageInput = messageForm.querySelector("input");
const locationbtn = document.querySelector(".sendLocation");
const messages = document.querySelector('#messages');



//Templates
const messageTemplate = document.getElementById("message-template").innerHTML;// inner html to access inner element of the selected elements;
const locationTemplate = document.getElementById("location-message-template").innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

//Options
const {username,room}=Qs.parse(location.search, {
  ignoreQueryPrefix:true
});

const autoscroll = () => {
  //New message element
  const newMessage = messages.lastElementChild;

  //Height of new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  //Visible Height
  const visibleHeight = messages.offsetHeight;

  // Height of messages container
  const containerHeight = messages.scrollHeight


  //How for Have I scrolled

  const srollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= srollOffset)
  {
    messages.scrollTop = messages.scrollHeight;
    }
  
}

socket.on("message", (message) => {
  // console.log(message);
  const html = Mustache.render(messageTemplate, {
    username:message.username,
    message: message.text,
    createdAt:moment(message.createdAt).format('h:mm:a')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});


socket.on('locationMessage', (message) => {
  // console.log(message);
  const html = Mustache.render(locationTemplate, {
    username:message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm:a')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,users
  })
  document.querySelector('#sidebar').innerHTML = html;
})



document.querySelector(".messageForm").addEventListener("submit", (e) => {
  e.preventDefault();

  // disbling the button;
  messageButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  socket.emit("recievedMessage", message, (error) => {
    messageButton.removeAttribute("disabled");
    messageInput.value = "";
    messageInput.focus();
    if (error) return console.log(error);

    // console.log("Message was delivered!!!");
  });
});

document.querySelector(".sendLocation").addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geolocation is not supported by your browser");

  locationbtn.setAttribute("disabled", "disabled");
  //this is asynchronous function but didn't support the promises so we use a callback function
  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position);

    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (acknowlegment) => {
        locationbtn.removeAttribute("disabled");
        // console.log(acknowlegment);
      }
    );
  });
});


socket.emit('join', { username, room }, (error) => {
  if (error)
  {
    alert(error);
    location.href = '/';
    }
});