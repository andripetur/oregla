var canvas = null;
var instrumentValues = {};
var patterns = {
  rm: function(name){
    if(typeof patterns[name] !== "undefined") canvas.remove(patterns[name]);
  },
  add: function(name,objs,settings){
    patterns[name] = new fabric.Group(objs, settings);
    canvas.add(patterns[name]);
  }
};

function makeColors() {
  var val1 = 100,
      val2 = 255,
      str = "",
      combinations = [];

  for (var i = 0; i < 4; i++) {
    combinations.push(...utilities.getAnagrams(utilities.rightPad(str,3,'0')));
    str += '1';
  }

  return combinations.map(function(el){ // binary to color values
    var chars = el.split('')
    return chars.map(function(el){
      return el === '0' ? val1 : val2;
    });
  });
}

var padAmt = 0.05;
function makeGrid( colls, rows ) {
  makeGrid.w = canvas.width / colls;
  makeGrid.h = canvas.height / rows;
  makeGrid.colls = colls;
  makeGrid.rows = rows;
  var colors = makeColors(),
      offsets = [],
      xPad = makeGrid.w * padAmt,
      yPad = makeGrid.h * padAmt;

  for (var x = 0; x < colls; x++) {
    for (var y = 0; y < rows; y++) {
      offsets.push({
        l: (x * makeGrid.w) + xPad,
        t: (y * makeGrid.h) + yPad,
        c: colors[(colls*y) + x]
      });
    }
  }
  return offsets;
}

function initDrawing(){

  calcAndDrawAllInstruments();

  for (var i = 0; i < sound.instruments.length; i++) {
    if( sound.instruments[i] !== "drums" ){
      (function(){ // register buffer listener
        var instrument = sound.instruments[i];
        sound[instrument].watch("buffer", function(prop,oldval,newval){
          drawInstrument(instrument, newval);
          return newval;
        });
      })();
    }
  }

  for (var i=0; i<sound.drums.list.length; i++){
     drawDrum(sound.drums.list[i]);
     (function(){ // register buffer listener
       var drum = sound.drums.list[i];
       sound.drums[drum].watch("rhythm", function(prop,oldval,newval){
         drawDrum(drum, newval);
         return newval;
       });
     })();
   }

  setInterval(function () {
    canvas.renderAll();
  }, 40);
}

function calcAndDrawAllInstruments(){
  if(canvas === null) {
    canvas = new fabric.StaticCanvas('cvs', {
      backgroundColor: 'black',
      renderOnAddRemove: false,
    });
  } else {
    canvas.clear();
  }

  canvas.setWidth( window.innerWidth*0.75 );
  canvas.setHeight( window.innerHeight*0.70 );
  var offsets = makeGrid(2, 2);

  for (var i = 0; i < sound.instruments.length; i++) {
    instrumentValues[sound.instruments[i]] = { // make group settings
      left: offsets[i].l,
      top: offsets[i].t,
      fill: 'rgba('+offsets[i].c.toString()+',0.5)',
      stroke: 'rgba('+offsets[i].c.toString()+',1)'
    };

    if( sound.instruments[i] !== "drums"){ // draw instruments
       drawInstrument(sound.instruments[i]);
     }
  }

  for (d of sound.drums.list) drawDrum(d);
}

function drawInstrument(instrument, _buffer){
  var buffer = _buffer || sound[instrument].buffer,
      xrange = utilities.range(buffer.map(function(p){ return p.x; })),
      yrange = utilities.range(buffer.map(function(p){ return p.y; })),
      p = padAmt * 1.5 //, 0.075
      xPad = makeGrid.w * p,
      yPad = makeGrid.h * p;

  var circles = buffer.map(function(el){
    return new fabric.Circle({
        left: utilities.scale(el.x, xrange.low, xrange.high, 0+xPad, makeGrid.w-xPad),
        top:  utilities.scale(el.y, yrange.low, yrange.high, 0+yPad, makeGrid.h-yPad),
        radius: 5,
      });
  });

  patterns.rm(instrument);
  patterns.add(instrument, circles, instrumentValues[instrument]);
}

function drawDrum(drum, _r){ // optional to pass the rhythm values
  var squares = [],
      r = _r || sound.drums[drum].rhythm,
      rLength = r.reduce(function(a,b){ return a+b; }),
      w = makeGrid.w/rLength,
      h = makeGrid.h/sound.drums.list.length,
      pos = 0,
      groupValues = Object.assign({}, instrumentValues["drums"]);
    groupValues.top += sound.drums.list.indexOf(drum)*h;

    squares.push(...r.map(function(el,indx,arr){
      if(indx !== 0) pos += (w*arr[indx-1]);
      return new fabric.Rect({
        left: pos,
        top:  0,
        width: w,
        height: el*3,
      });
    }));
  patterns.rm(drum);
  patterns.add(drum, squares, groupValues);
}

// faderbox
function createFader(i){
  var f = new fabric.Rect({
    // functionality
    name: 'slider'+(i+1),
    controls: 'none',
    onInstrument: 'none',
    isExponential: false,
    range: { low: 0, high: 1 },
    callbackFunction: "setSoundValue",
    // look
    width: box.sliderWidth, height: box.height*0.75,
    originY: "bottom",
    left: i * box.sliderWidth, top: box.height,
    fill: 'maroon',
    lockRotation: true,
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingFlip: true,
    hasControls: true,
    transparentCorners: false,
    cornerColor: 'white',
    cornerSize: box.sliderWidth * 0.5,
    hoverCursor: 'default',
    borderScaleFactor: 2,
    stroke: 'black',
    borderColor: 'orange',
  });

  f.setControlsVisibility({
    mt: true,
    bl:false,br:false,mb:false,ml:false,
    mr:false,tl:false,tr:false,mtr:false,
  });

  return f;
}

var nrOfFaders = 8;
var faderboxCanvas = null;
var box = {}
var faderSetups = [];
for (var i = 0; i < nrOfFaders; i++) nrOfFaders[i] = { scaleY: 1 };
function setupFader(which, settings) {
  faderboxCanvas.item(which).set(settings);
  faderSetups[which] = settings;
}

function initFaderbox(){
  for (var i = 0; i < faderSetups.length; i++) {
    faderSetups[i].scaleY = faderboxCanvas.item(i).scaleY;
  }

  box.height = window.innerHeight*0.25;
  box.width = (window.innerWidth*0.25) - 20;
  box.sliderWidth = box.width / nrOfFaders;

  if( faderboxCanvas === null ) {
    faderboxCanvas = new fabric.Canvas('faderbox', {
      backgroundColor: 'black',
      selection: false,
    });
  } else {
    faderboxCanvas.clear();
  }

  faderboxCanvas.setWidth( box.width );
  faderboxCanvas.setHeight( box.height );

  for (var i = 0; i < nrOfFaders; i++) faderboxCanvas.add( createFader(i) );

  for (var i = 0; i < nrOfFaders; i++) {
    faderboxCanvas.add( new fabric.Text(faderboxCanvas.item(i).name,
    { left: (i+1) * box.sliderWidth, top: box.height-5 , angle: -90,
      fill: 'white', originY: 'bottom', fontSize: 20, selectable: false
    }));
  }

  for (var i = 0; i < faderSetups.length; i++) {
    faderboxCanvas.item(i).set(faderSetups[i]);
  }
  faderboxCanvas.renderAll();

  if(typeof faderboxCanvas.__eventListeners === "undefined"){//make functional
    faderboxCanvas.on({
     'object:scaling': function(options) {
        var fdr = options.target,
            faderval;
        if( fdr.scaleY > 1.3 ) fdr.scaleY = 1.3;
        if ( fdr.controls !== 'none' ){
         if( fdr.isExponential ) {
           faderval = utilities.scaleExp(fdr.scaleY, 0.03, 1.3, fdr.range.low, fdr.range.high);
         } else {
           faderval = utilities.scale(fdr.scaleY, 0.03, 1.3, fdr.range.low, fdr.range.high);
         }
         window[fdr.callbackFunction](faderval, fdr.onInstrument, fdr.controls);
        }
     },
    });
  }
}

var resizeTimer;
function initResize(){
  $( window ).resize(function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() { // do when resize is finished
      calcAndDrawAllInstruments();
      initFaderbox();
    }, 250);
  });
}
