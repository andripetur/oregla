setInterval(function () {
  canvas.renderAll();
}, 40);

function drawChaos(points){

  var offset = 10, expand = 50;
  var color, clrVal;
  for (var i = 0; i < points.length; i++) {
    clrVal = Math.floor(points[i].length * 32);
    color = 'rgb('+clrVal+',100,100)';
    canvas.add( new fabric.Circle({
        left: Math.floor( (points[i].x + offset) * expand ),
        top:  Math.floor( (points[i].y + offset) * expand ),
        fill: color,
        radius: 5,
      }));
  }
}

var lastPoint = 0;
function animatePoint(n){
  lastPoint = n;
  canvas.item(n).animate('radius', '10', {
    duration: 200,
    easing: fabric.util.ease.easeOutBounce,
    onComplete: animatePointGoBack
  })

}

function animatePointGoBack(){
  var n = lastPoint;
  canvas.item(n).animate('radius', '5', {
    duration: 100,
  })
}
