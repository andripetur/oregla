var canvas = null;
var instrumentValues = {};
var patterns = {
  addGroup: function(inst, circles){
    patterns[inst] = new fabric.Group(circles, instrumentValues[inst]);
    canvas.add(patterns[inst]);
}};

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
  var colors = makeColors(),
      offsets = [],
      w = canvas.width / colls,
      h = canvas.height/ rows,
      xPad = w * padAmt,
      yPad = h * padAmt;

  for (var x = 0; x < colls; x++) {
    for (var y = 0; y < rows; y++) {
      offsets.push({
        l: (x * w) + xPad,
        t: (y * h) + yPad,
        c: colors[(colls*y) + x]
      });
    }
  }

  makeGrid.colls = colls;
  makeGrid.rows = rows;
  return offsets;
}

function initDrawing(){
  canvas = new fabric.StaticCanvas('cvs', {
    backgroundColor: 'black',
    renderOnAddRemove: false,
    width: window.innerWidth*0.75,
    height: window.innerHeight*0.70,
  });

  var offsets = makeGrid(2, 2);

  for (var i = 0; i < sound.instruments.length; i++) {
    // make group settings
    instrumentValues[sound.instruments[i]] = {
      left: offsets[i].l,
      top: offsets[i].t,
      fill: 'rgba('+offsets[i].c.toString()+',0.5)',
      stroke: 'rgba('+offsets[i].c.toString()+',1)',
    };
  }

  for (var i = 0; i < sound.instruments.length; i++) {
    // init the pattern groups
    if( sound.instruments[i] !== "drums" ){
      var circles = pointsToCircles(sound[sound.instruments[i]].buffer);
      patterns.addGroup(sound.instruments[i], circles);

      (function(){ // register buffer listener
        var instrument = sound.instruments[i];
        sound[instrument].watch("buffer", function(prop,oldval,newval){
          var circles = pointsToCircles(newval);
          canvas.remove(patterns[instrument]);
          patterns.addGroup(instrument, circles);
          // var name = new fabric.Text(instrument, { originX: 'left', originY: 'bottom', left: 0, top: 0 , fill: 'white'});
          // patterns[instrument].add(name);
          return newval;
        });
      })();
    }
  }

  drawDrums();
  for (var i = 0; i < sound.drumList.length; i++) {
    sound.drums[sound.drumList[i]].watch("rhythm", function(prop,oldval,newval){
      setTimeout(function() { // dirty trick, execute after we return val from function
        canvas.remove(patterns["drums"]);
        drawDrums();
      }, 10);
      return newval;
    });
  }

  setInterval(function () {
    canvas.renderAll();
  }, 40);
}

function drawDrums(){
  var squares = [];
  for (var i = 0; i < sound.drumList.length; i++) {
    var r = sound.drums[sound.drumList[i]].rhythm,
        rLength = r.reduce(function(a,b){ return a+b; }),
        w = (canvas.width/makeGrid.colls),
        h = canvas.height/makeGrid.rows/sound.drumList.length
        pos = 0;

    w -= (w * padAmt * 2);
    w = w/rLength;

    squares.push(...r.map(function(el,indx,arr){
      if(indx != 0) pos += (w*arr[indx-1]);
      return new fabric.Rect({
        left: pos,
        top:  i*h,
        width: w,
        height: el*3,
      });
    }));
  }

  patterns["drums"] = new fabric.Group(squares, instrumentValues["drums"]);
  canvas.add(patterns["drums"]);
}

function scalePoints(points){
  var xrange = utilities.range(points.map(function(p){ return p.x; })),
      yrange = utilities.range(points.map(function(p){ return p.y; })),
      p = padAmt * 1.5 //, 0.075
      w = canvas.width/makeGrid.colls,
      h = canvas.height/makeGrid.rows,
      xPad = w * p,
      yPad = h * p;

  return points.map(function(el,i,arr){
    return {
      x : utilities.scale(el.x, xrange.low, xrange.high, 0+xPad, w-xPad),
      y : utilities.scale(el.y, yrange.low, yrange.high, 0+yPad, h-yPad)
    };
  });
}

function pointsToCircles(points){
  return scalePoints(points).map(function(el){
    return new fabric.Circle({
        originX: "center",
        originY: "center",
        left: el.x,
        top:  el.y,
        radius: 5,
      });
  });
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
    width: sliderWidth, height: box.height*0.75,
    originY: "bottom",
    left: i * sliderWidth, top: box.height,
    fill: 'maroon',
    lockRotation: true,
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingFlip: true,
    hasControls: true,
    transparentCorners: false,
    cornerColor: 'white',
    cornerSize: sliderWidth * 0.5,
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
var box = {
  height: window.innerHeight*0.25,
  width: (window.innerWidth*0.25) - 20,
}
var sliderWidth = box.width / nrOfFaders;

function initFaderbox(){
  faderboxCanvas = new fabric.Canvas('faderbox', {
    backgroundColor: 'black',
    width: box.width,
    height: box.height,
    selection: false,
  });

  for (var i = 0; i < nrOfFaders; i++) {
    faderboxCanvas.add( createFader(i) );
  }

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
