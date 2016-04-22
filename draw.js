var canvas = null;

function initDrawing(){
  canvas = new fabric.StaticCanvas('cvs', {
    backgroundColor: 'black',
    renderOnAddRemove: false,
    width: window.innerWidth,
    height: window.innerHeight*0.75,
  });

  drawChaos(sound.chaos[0].points);

  fabric.util.loadImage('./imgs/paper.jpg', function(img) {
    canvas.item(0).fill = new fabric.Pattern({
      source: img,
      repeat: 'repeat'
    });
  });

  setInterval(function () {
    canvas.renderAll();
  }, 40);
}

function textureColor(){
  fabric.Image.fromURL('./imgs/paper.jpg', function(img) {
    img.scaleToWidth(100);

    var patternSourceCanvas = new fabric.StaticCanvas();
    patternSourceCanvas.add(img);

    img.filters.push(new fabric.Image.filters.Tint({
      color: "rgba(0,0,0,0.5)",
    }));

    img.applyFilters(patternSourceCanvas.renderAll.bind(patternSourceCanvas));

    canvas.backgroundColor = new fabric.Pattern({
      source: function() {
        patternSourceCanvas.setDimensions({
          width: img.getWidth(),
          height: img.getHeight()
        });
        return patternSourceCanvas.getElement();
      },
      repeat: 'repeat'
    });
  });
}

var smallRadius = 10;
function drawChaos(points){

  var bigRadious = utilities.max(points.map(function(p){ return p.length; }));
  var xrange = utilities.range(points.map(function(p){ return p.x; }));
  var yrange = utilities.range(points.map(function(p){ return p.y; }));

  var padAmt = 0.25;
  var xPad = canvas.width * padAmt;
  var yPad = canvas.height * padAmt;

  var color, clrVal, x, y, xavg=0, yavg=0;

  for (var i = 0; i < points.length; i++) {
    x = utilities.scale(points[i].x, xrange.low, xrange.high, 0+xPad, canvas.width-xPad);
    y = utilities.scale(points[i].y, yrange.low, yrange.high, 0+yPad, canvas.height-yPad);
    xavg += x;
    yavg += y;

    clrVal = Math.floor(points[i].length * Math.floor(255/bigRadious));
    color = 'rgba('+clrVal+',100,100,0.5)';

    canvas.add( new fabric.Circle({
        originX: "center",
        originY: "center",
        left: x,
        top:  y,
        fill: color,
        stroke: 'rgba('+clrVal+',100,100,1)',
        radius: smallRadius,
      }));
    }

    xavg /= points.length;
    yavg /= points.length;

    // big circle gets it middle point from avg x&y from small circles
    var big = new fabric.Circle({
      originX: "center",
      originY: "center",
      left: xavg ,
      top:  yavg ,
      fill: 'white',
      radius: Math.floor( bigRadious * 10 * 0.75 ),
    });

    canvas.add(big);
    big.sendToBack();
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

// make html element blink
function blink(){
  var splash = document.getElementById('splash');
  splash.style.background = 'black';
  splash.style.color = 'white';
  setTimeout(function(){
    splash.style.background = 'white';
    splash.style.color = 'black';
  }, 200);
}
