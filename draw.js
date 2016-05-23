var canvas = null;
var patterns = {};

function initDrawing(){
  canvas = new fabric.StaticCanvas('cvs', {
    backgroundColor: 'black',
    renderOnAddRemove: false,
    width: window.innerWidth*0.75,
    height: window.innerHeight*0.70,
  });

  var offsets = [ { l:0,               t:0,   c: [255,100,100]},
                  { l:canvas.width/2 , t: 0,  c: [100,255,100]},
                  { l:0 , t: canvas.height/2, c: [100,100,255]}  ];

  for (var i = 0; i < sound.instruments.length; i++) {
    patterns[sound.instruments[i]] = makeGroup(sound[sound.instruments[i]].buffer, offsets[i]);
    canvas.add(patterns[sound.instruments[i]]);
  }

  // fabric.util.loadImage('./imgs/paper.jpg', function(img) {
  //   canvas.item(0).fill = new fabric.Pattern({
  //     source: img,
  //     repeat: 'repeat'
  //   });
  // });

  setInterval(function () {
    canvas.renderAll();
  }, 40);
}

function makeGroup(points, offset){
  var bigRadious = utilities.max(points.map(function(p){ return p.length; }));
  var xrange = utilities.range(points.map(function(p){ return p.x; }));
  var yrange = utilities.range(points.map(function(p){ return p.y; }));
  var padAmt = 0.025;
  var xPad = canvas.width * padAmt;
  var yPad = canvas.height * padAmt;

  var circleGroup = points.map(function(el,i,arr){
    x = utilities.scale(points[i].x, xrange.low, xrange.high, 0+xPad, canvas.width/2-xPad);
    y = utilities.scale(points[i].y, yrange.low, yrange.high, 0+yPad, canvas.height/2-yPad);
    var clrVal = Math.floor(points[i].length * Math.floor(255/bigRadious));
    var color = 'rgba('+offset.c.toString()+',0.5)';
    var stroke = 'rgba('+offset.c.toString()+',1)';

    return new fabric.Circle({
        originX: "center",
        originY: "center",
        left: x,
        top:  y,
        fill: color,
        stroke: stroke,
        radius: 5,
      });
  });

  return new fabric.Group(circleGroup, {
    left: offset.l,
    top: offset.t,
  });
}

function moveChaos(points){
  var bigRadious = utilities.max(points.map(function(p){ return p.length; }));
  var xrange = utilities.range(points.map(function(p){ return p.x; }));
  var yrange = utilities.range(points.map(function(p){ return p.y; }));

  var padAmt = 0.25;
  var xPad = canvas.width * padAmt;
  var yPad = canvas.height * padAmt;

  var x, y, xavg=0, yavg=0;

  for (var i = 0; i < points.length; i++) {
    x = utilities.scale(points[i].x, xrange.low, xrange.high, 0+xPad, canvas.width-xPad);
    y = utilities.scale(points[i].y, yrange.low, yrange.high, 0+yPad, canvas.height-yPad);
    xavg += x;
    yavg += y;

    canvas.item(i+1).animate('top', ""+y, {
      duration: aniDur+utilities.randInt(0,100),
      easing: fabric.util.ease.easeOutBounce,
    });
    canvas.item(i+1).animate('left', ""+x, {
      duration: aniDur+utilities.randInt(0,100),
      easing: fabric.util.ease.easeOutBounce,
    });
  }

  xavg /= points.length;
  yavg /= points.length;

  canvas.item(0).animate('top', ""+yavg, {
    duration: aniDur,
    easing: fabric.util.ease.easeOutBounce,
  });
  canvas.item(0).animate('left', ""+xavg, {
    duration: aniDur,
    easing: fabric.util.ease.easeOutBounce,
  });
  canvas.item(0).animate('radius', ""+(Math.floor( bigRadious * 10 * 0.75 )), {
    duration: aniDur,
    easing: fabric.util.ease.easeOutBounce,
  });
}

var lastPoint = 0;
var aniDur = 300;

function animatePoint(n){
  lastPoint = n+1;
  canvas.item(n).animate('opacity', '0.1', {
    duration: aniDur,
    easing: fabric.util.ease.easeOutBounce,
    onComplete: function(){
      canvas.item(n).animate('opacity', '1', {
        easing: fabric.util.ease.easeOutBounce,
        duration: aniDur/2,
      })
    }
  })

  canvas.item(n).animate('radius', ""+(smallRadius*2), {
    duration: aniDur,
    easing: fabric.util.ease.easeOutBounce,
    onComplete: function(){
      canvas.item(n).animate('radius', ""+smallRadius, {
        easing: fabric.util.ease.easeOutBounce,
        duration: aniDur/2,
      });
    }
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
     var fdr = options.target;
     if( fdr.scaleY > 1.3 ) fdr.scaleY = 1.3;
     if ( fdr.controls !== 'none' ){
       if( fdr.isExponential ) {
         var faderval = utilities.scaleExp(fdr.scaleY, 0.03, 1.3, fdr.range.low, fdr.range.high);
       } else {
         var faderval = utilities.scale(fdr.scaleY, 0.03, 1.3, fdr.range.low, fdr.range.high);
       }
       window[fdr.callbackFunction](faderval, fdr.onInstrument, fdr.controls);
     }
   },
  });
}
