const tableElement = document.getElementById('table');
const boardElement = document.getElementById('board');

Notification.requestPermission();

let map = L.map('map').setView([53.430127, 14.564802], 18);
// L.tileLayer.provider('OpenStreetMap.DE').addTo(map);
L.tileLayer.provider('Esri.WorldImagery').addTo(map);
let marker = L.marker([53.430127, 14.564802]).addTo(map);
marker.bindPopup("<strong>Hello!</strong><br>This is a popup.");

document.getElementById("saveButton").addEventListener("click", function() {
  leafletImage(map, function (err, canvas) {
    // here we have the canvas
    let rasterMap = document.getElementById("rasterMap");
    let rasterContext = rasterMap.getContext("2d");

    rasterContext.drawImage(canvas, 0, 0, 600, 300);
    createPuzzle();

    let items = document.querySelectorAll('.item');
    for (let item of items) {
      item.addEventListener("dragstart", function(event) {
        this.style.border = "5px dashed #D8D8FF";
        event.dataTransfer.setData("text", this.id);
      });

      item.addEventListener("dragend", function(event) {
        this.style.borderWidth = "0";
      });
    }
  });
});

document.getElementById("getLocation").addEventListener("click", function(event) {
  if (! navigator.geolocation) {
    console.log("No geolocation.");
  }

  navigator.geolocation.getCurrentPosition(position => {
    console.log(position);
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    map.setView([lat, lon]);
    marker.setLatLng([lat, lon]);
  }, positionError => {
    console.error(positionError);
  });
});

// AI (model Claude Opus 5.5) pomogło zrobić pola planszy na puzzle
for (let i = 0; i < 4; i++) {
  const slotElement = document.createElement('div');
  slotElement.id = 'slot-' + i;
  slotElement.className = 'drag-target';
  boardElement.append(slotElement);
}

// AI (model Claude Opus 5.5) pomogło zrobić podział mapy na 4 elementy i ich wymieszanie
function createPuzzle() {
  tableElement.innerHTML = '';
  for (const slotElement of boardElement.children) {
    slotElement.innerHTML = '';
  }

  const rasterMap = document.getElementById('rasterMap');
  const pieces = [];
  for (let i = 0; i < 4; i++) {
    const pieceElement = document.createElement('canvas');
    pieceElement.id = 'piece-' + i;
    pieceElement.className = 'item';
    pieceElement.width = 300;
    pieceElement.height = 150;
    pieceElement.draggable = true;
    pieceElement.getContext('2d').drawImage(rasterMap, (i % 2) * 300, Math.floor(i / 2) * 150, 300, 150, 0, 0, 300, 150);
    pieces.push(pieceElement);
  }

  pieces.sort(() => Math.random() - 0.5);
  tableElement.append(...pieces);
}

// AI (model Claude Opus 5.5) pomogło zrobić sprawdzanie, czy puzzle są ułożone poprawnie
function checkPuzzle() {
  for (let i = 0; i < 4; i++) {
    const piece = document.getElementById('slot-' + i).firstElementChild;
    if (!piece || piece.id !== 'piece-' + i) {
      return;
    }
  }

  console.debug('Puzzle ułożone poprawnie!');
  new Notification('Gratulacje!', { body: 'Puzzle ułożone poprawnie!' });
}

let targets = document.querySelectorAll(".drag-target");
for (let target of targets) {
  target.addEventListener("dragenter", function (event) {
    this.style.border = "2px solid #7FE9D9";
  });
  target.addEventListener("dragleave", function (event) {
    this.style.border = "2px dashed #7f7fe9";
  });
  target.addEventListener("dragover", function (event) {
    event.preventDefault();
  });
  target.addEventListener("drop", function (event) {
    let myElement = document.querySelector("#" + event.dataTransfer.getData('text'));

    // AI (model Claude Opus 5.5) pomogło zrobić zamianę puzzli miejscami
    const existingElement = this.firstElementChild;
    if (this !== tableElement && existingElement) {
      myElement.parentElement.append(existingElement);
    }

    this.appendChild(myElement)
    this.style.border = "2px dashed #7f7fe9";
    checkPuzzle();
  }, false);
}
