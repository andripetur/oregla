var midi = null,
    output,
    input,
    padStates = [];

// request MIDI access
if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
  alert("No MIDI support in your browser.");
}
for (var i = 0; i < 64; i++) padStates.push(false); // start everything from zero

// create sequencer grid
var noteToGrid = {},
    gridToNote = {},
    padCntr = 0,
    note = 0;

for (var y = 0; y < 8; y++) {
  for (var x = 0; x < 8; x++) {
    noteToGrid[note] = padCntr;
    gridToNote[padCntr] = note;
    note++;
    padCntr++;
  }
  note+=8;
}

// playRow
var playRow = [],
    noteToPlayRow = {},
    playRowToNote = {};
for(var i = 0; i<16; i++) {
  if(i % 2 === 1){
    var note = i * 8;
    playRow.push(playRow.length>3); // 4false, 4 true
    noteToPlayRow[note] = playRow.length-1;
    playRowToNote[playRow.length-1] = note;
   }
}

// topRow
var topRow = [],
    noteToTopRow = {},
    topRowToNote = {};
for (var i = 0, note = 104; i < 8; i++, note++) {
  topRow.push(i===4);
  noteToTopRow[note] = i;
  topRowToNote[i] = note;
}

var color = {
  red: 15,
  green: 60,
  yellow: 62,
  amber: 63,
}

// draw the thing
var pPos, gridContainer, needToDrawSequencer = true;

function drawSequencer() {
  var formattedGrid = "", icon, color, pIndx, pBtn;

  pPos = playheads.map(function(x){ return x.posInGrid });

  for (var i = 0; i < topRow.length; i++) {
    formattedGrid += "<span onclick=topRowFunctionality("+i+")>" + (topRow[i] ? '●': '○') + ' </span>';
  }

  formattedGrid += ' <br>'
  for (var i = 0; i < padStates.length; i++) {
    color = colorOneIndexes.includes(i) ? 'rgb(30,30,30)' : 'rgb(60,60,60)';
    formattedGrid += "<span onclick=toggleGridState("+i+") style=\"background: "+color+";\">";

    if( (pIndx = pPos.indexOf(i)) > -1){ // it's a playhead
      icon = padStates[i] ? '◆': '◇';
      icon = "<font color=" + playheads[pIndx].color + ">" + icon + "</font>";
    } else {
      icon = padStates[i] ? '■' : '□';
    }

    formattedGrid += icon + " </span>";

    if(i % 8 === 7) {
      pBtn = noteToPlayRow[gridToNote[i]+1];
      color = playRow[pBtn] ? 'green' : 'red';
      formattedGrid += "<span onclick=togglePlayRowState("+pBtn+") style=\"color:"+ color +";\">▶</span><br>"; //pButton & linebreak
    }
  }
  gridContainer.innerHTML = formattedGrid;
}

function initLpSeq(){
  gridContainer = document.getElementById('lpseq');
  drawSequencer(); // make it appear
}

// midi functions
var rerouteMidiOutToConsole = false;
function onMIDISuccess(midiAccess) {
  midi = midiAccess;

  if (selectDevice('Launchpad', 'input')) {
    selectDevice('Launchpad', 'output');
    input.onmidimessage = handleButtonPresses;
    initLights();
  } else {
    // midi.onstatechange = function() {
    //   onMIDISuccess(midi);
    // }
    onMIDIFailure();
  }

}

function onMIDIFailure(e) {
  console.log('Not connected to a launcphad, no midi being output.');
  output = { send: function(e){ if(rerouteMidiOutToConsole) console.log(e); }};
}

var paths = [
  [ // rings inside rings
    [0, 1, 2, 3, 4, 5, 6, 7, 15, 23, 31, 39, 47, 55, 63, 62, 61, 60, 59, 58, 57, 56, 48, 40, 32, 24, 16, 8],
    [9, 10, 11, 12, 13, 14, 22, 30, 38, 46, 54, 53, 52, 51, 50, 49, 41, 33, 25, 17],
    [18, 19, 20, 21, 29, 37, 45, 44, 43, 42, 34, 26],
    [27, 28, 36, 35]
  ],
  [ // two set of rings inside rings
    [0, 1, 2, 3, 4, 5, 6, 7, 15, 23, 31, 30, 29, 28, 27, 26, 25, 24, 16, 8],
    [41, 42, 43, 44, 45, 46, 54, 53, 52, 51, 50, 49],
    [32, 33, 34, 35, 36, 37, 38, 39, 47, 55, 63, 62, 61, 60, 59, 58, 57, 56, 48, 40],
    [9, 10, 11, 12, 13, 14, 22, 21, 20, 19, 18, 17],
  ],
  [ // oposing U with inside block
    [24, 16, 8, 0, 1, 2, 3, 4, 5, 6, 7, 15, 23, 31, 30, 22, 14, 13, 12, 11, 10, 9, 17, 25],
    [32, 40, 48, 56, 57, 58, 59, 60, 61, 62, 63, 55, 47, 39, 38, 46, 54, 53, 52, 51, 50, 49, 41, 33],
    [34, 35, 36, 37, 45, 44, 43, 42],
    [18, 19, 20, 21, 29, 28, 27, 26]
  ],
  [ // double line at top, rest in circles
    [0, 1, 2, 3, 4, 5, 6, 7, 15, 14, 13, 12, 11, 10, 9, 8],
    [16, 17, 18, 19, 20, 21, 22, 23, 31, 39, 47, 55, 63, 62, 61, 60, 59, 58, 57, 56, 48, 40, 32, 24],
    [25, 26, 27, 28, 29, 30, 38, 46, 54, 53, 52, 51, 50, 49, 41, 33],
    [34, 35, 36, 37, 45, 44, 43, 42]
  ]
];
paths.selected = 0;
var colorOneIndexes = [ ...paths[paths.selected][0], ...paths[paths.selected][2] ];

function Stylus(p){
  this.cntr = 0;
  this.path = p;
  this.color = p % 2 === 0 ? 'green' : 'red';
  this.direction = 'forward';
  this.on = playRow[p];
  this.do = function(){};

  this.tick = function(){
    if(this.direction === 'forward'){
      this.cntr++;
    } else {
      this.cntr--;
      if(this.cntr < 0) this.cntr = paths[paths.selected][this.path].length - 1;
    }
    this.calcPos();
  }

  this.calcPos = function(){
    this.posInPath = this.cntr % paths[paths.selected][this.path].length;
    this.posInGrid = paths[paths.selected][this.path][this.posInPath];
  }

  this.calcPos(); // init pos
}

var playheads = [ new Stylus(0), new Stylus(1), new Stylus(2), new Stylus(3) ];

function launchpadDo() {
  // if all playheads are paused don't draw
  if(playRow[0] || playRow[1] || playRow[2] || playRow[3]) drawSequencer();
  for (var i = 0; i < playheads.length; i++) {
    if(playheads[i].on){
      var velocityOff = 0;

      if(padStates[playheads[i].posInGrid]){ // check if step is on
        velocityOff = color.yellow;
        playheads[i].do();
      }

      blinkLight(gridToNote[playheads[i].posInGrid], color[playheads[i].color], velocityOff);
      playheads[i].tick();
    }
  }
}

function toggleGridState(g){
  padStates[g] = !padStates[g];
  output.send( [0x90, gridToNote[g], (padStates[g] ? color.yellow : 0) ] ); // set light according to change
  drawSequencer();
}

function togglePlayRowState(pad){
  playRow[pad] = !playRow[pad];
  if(pad < 4){
    playheads[pad].on = playRow[pad];
  } else {
    playheads[pad-4].direction = playRow[pad] ? 'forward' : 'backward';
  }
  output.send( [0x90, playRowToNote[pad], (playRow[pad] ? color.green : color.red) ] ); // set light according to change
  drawSequencer();
}

function topRowFunctionality(button){
  if(button === 0){ // clear ALl
    for (var i = 0; i < pPos.length; i++){
      output.send( [0x90, gridToNote[pPos[i]], 0 ] , window.performance.now() + (i+5)*100); // turnLightOn
    }

    for (var i = 0; i < padStates.length; i++) {
      padStates[i] = false;
      output.send( [0x90, gridToNote[i], 0 ] , window.performance.now() + i*10); // turnLightOn
    }

  } else if(button === 1){ // fillALL
    for (var i = 0; i < pPos.length; i++){
      output.send( [0x90, gridToNote[pPos[i]], color.yellow ] , window.performance.now() + (i+5)*100); // turnLightOn
    }
    for (var i = 0; i < padStates.length; i++) {
      padStates[i] = true;
      output.send( [0x90, gridToNote[i], color.yellow ] , window.performance.now() + i*10); // turnLightOn
    }
  } else if(button === 2){
    initLights();
    for (var i = 0; i < padStates.length; i++) {
      if( Math.random() > 0.5) {
        padStates[i] = true;
        output.send( [0x90, gridToNote[i], color.yellow ] ); // turnLightOn
      } else {
        padStates[i] = false;
      }
    }
  } else if(button === 3){
    for (var i = 0; i < padStates.length; i++) {
      if(padStates[i] && Math.random() > 0.5){
        padStates[i] = false;
        output.send( [0x90, gridToNote[i], 0 ] ); // turnLightoff
      }
    }
  } else if (button > 3){ // select path
    var oldButton = noteToTopRow[paths.selected + 108];
    paths.selected = button-4;

    for (var i = 0; i < playheads.length; i++) playheads[i].calcPos();
    topRow[oldButton] = false;
    topRow[button] = true;
    setButtonInTopRow(topRowToNote[oldButton], 0);
    setButtonInTopRow(topRowToNote[button], color.green);
    colorOneIndexes = [ ...paths[paths.selected][0], ...paths[paths.selected][2] ];
  }
  drawSequencer();
}

function handleButtonPresses( event ){
  if(event.data[2] > 0) { // its a note on
    var note = event.data[1];
    if(event.data[0] === 176){ // topRowButton press
      topRowFunctionality(note - 104);
    } else if(noteToPlayRow.hasOwnProperty(note)){ // playRowButton press
      togglePlayRowState(noteToPlayRow[note])
    } else {
      toggleGridState(noteToGrid[note]);
    }
  }
}

function selectDevice( deviceName, io ){
  var ioObj = io === "input" ? midi.inputs : midi.outputs;
  for (var entry of ioObj) {
    var ioput = entry[1];
    if (ioput.name === deviceName) {
      window[io] = ioObj.get(ioput.id);
      console.log(io + ' device: ' + deviceName + ' succesfully selected')
      return true;
    }
  }

  console.log(io+ ' device not found');
  return false;
}

function clearLaunchpad() {
  output.send( [ 176, 0, 0 ]);
}

function lightUpPlayRow(){
  for (var i = 0; i < playRow.length; i++) {
    output.send( [0x90, playRowToNote[i], (playRow[i] ? color.green : color.red) ] );
  }
}

function lightTopRow(clearFirst){
  if(clearFirst) for (var i = 0; i < topRow.length; i++) setButtonInTopRow(i+104, 0);
  setButtonInTopRow(paths.selected+108, color.green); // light up selected sequence
}

function initLights(){ // make it look right
  clearLaunchpad();
  lightUpPlayRow();
  lightTopRow(false);
}

function setButtonInTopRow(note, data){
  output.send( [ 176, note, data ]);
}

function blinkLight( note , velocityOn, velocityOff ) {
  output.send( [0x90, note, velocityOn] );
  output.send( [0x90, note, velocityOff], window.performance.now() + (timeUnitToSeconds('8n')*1000) );
}
