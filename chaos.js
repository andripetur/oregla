// chaos sequencer note generator
var Chaos = null;

(function(){
  Chaos = function( coords ){
    this.x=coords.x; this.y=coords.y; this.a=coords.a;
    this.t=coords.t; this.b=coords.b; this.o=coords.o;
    this.notes = [];
    this.rhythm = [];
    this.beatCounter = 0;
    this.pos = 0;
    this.buffer = [];
  }

  Chaos.prototype = new Schillinger(); // get modifier functions from schillinger

  Chaos.prototype.calculate = function(){
    var xx, yy;
    xx = this.y - (this.x / Math.abs(this.x)) * Math.sqrt( Math.abs( (this.b * this.x) - this.o ) );
    yy = this.t - this.x;
    this.x = xx;
    this.y = yy;
  }

  Chaos.prototype.getNote = function(){
    if(this.beatCounter === this.rhythm[this.pos % this.rhythm.length]){
      var n = this.notes[this.pos%this.notes.length]
      this.pos++;
      this.beatCounter=0;
      return n + 36;
    }
      this.beatCounter++;
      return -1;
  }

  var reorderByDistanceFromEachother = function(buffer){
    var distances = [];
    for(var i=0; i<buffer.length; i++){
      for (var y=i+1; y<buffer.length; y++) {
        distances.push( {
          i1: i, i2: y,
          length: utilities.pythagoras(
            buffer[i].x - buffer[y].x,
            buffer[i].y - buffer[y].y)
          }
        );
      }
    }

    distances.sort(function(a,b){
      return a.length - b.length;
    })

    var reorder = [];
    var foundIndxs = [];

    reorder.push( buffer[distances[0].i1] );
    reorder.push( buffer[distances[0].i2] );

    foundIndxs.push( distances[0].i1 );
    var lookingFor = distances[0].i2;

    var i = 0;
    while ( reorder.length < buffer.length ) {
      if ( foundIndxs.indexOf( distances[i].i1 ) > -1 || foundIndxs.indexOf( distances[i].i2 ) > -1 ) {
        distances.splice(i,1);
      } else if(distances[i].i1 === lookingFor) {
        reorder.push( buffer[distances[i].i2] );
        foundIndxs.push( distances[i].i1 );
        lookingFor = distances[i].i2;
        i = 0;
      } else if (distances[i].i2 === lookingFor) {
        reorder.push( buffer[distances[i].i1] );
        foundIndxs.push( distances[i].i2 );
        lookingFor = distances[i].i1;
        i = 0;
      } else {
        i++;
      }
    }
    return reorder;
  }

  var reorderByDistanceFromCenter = function(buffer){
    return buffer.sort(function(a,b){
      return a.length - b.length;
    });
  }

  Chaos.prototype.fillBuffer = function( options ) {
    Chaos.call(this, options.coords); // reinitalize object

    if( typeof options.offset !== "undefined"){
      for(var i=0; i<options.offset; i++) this.calculate();
    }

    var b = [];
    for(var i=0; i<options.length; i++){
      b.push( { x: this.x, y: this.y, length: utilities.pythagoras(this.x, this.y) });
      this.calculate();
    }

    if( typeof options.reorder !== "undefined"){
      switch (options.reorder) {
        case "distanceFromCenter":
          b = reorderByDistanceFromCenter(b);
          break;
        case "distanceFromEachother":
          b = reorderByDistanceFromEachother(b);
          break;
      }
    }

    this.notes = b.map(function(el){ return Math.abs(Math.floor(el.x)); } );
    this.buffer = b;
    this.rhythm = schil.newRythm("fast",[3,7,11]);
  }
})();


/* outcommented until/if i bother to modernize it
Chaos.prototype.calculatePhrase = function( coords, phraseLength ) {
  Chaos.call(this, coords); // reinitalize object

  var phraseX = [];
  var phraseY = [];
  for(var i=0; i<phraseLength; i++){
    phraseX.push( Math.abs(Math.floor(this.x)) );
    phraseY.push( Math.abs(Math.floor(this.y)) );
    this.chaosFunc();
  }

  // find longest phrase
  var nrOfMatches = 4;
  var tempNiNm = 3; // notes in note Match
  while(nrOfMatches > 0) {
    nrOfMatches = 0;
    tempNiNm++;
    for(var i=0; i<phraseLength-tempNiNm; i++){
      var temp = [];
      for(var ii=0;ii<tempNiNm;ii++) temp[ii] = phraseX[i+ii];
      if( phraseX.slice(i+tempNiNm-1).toString().indexOf( temp ) > -1 ){
        nrOfMatches++;
      }
    }
  }
  // console.log('longest phrase: ' + tempNiNm)
  var nInM = tempNiNm-1;
  nInM % 2 == 1 ? tempNiNm-- : 0 // if its not a equal number make it one
  nInM > 16 ? tempNiNm/=2 : 0 // if its longer than 16, half it

  // var nInM = 8; // 11

  for(var i=0; i<phraseLength-nInM; i++){
    var temp = [];
    var tempY = [];

    for(var ii=0; ii<nInM; ii++ ) {
      temp [ii] = phraseX[i+ii];
      tempY[ii] = phraseY[i+ii];
    }

    var rest = phraseX.slice(i+nInM-1).toString();
    var indx = rest.indexOf( temp );

    if( indx > -1 ) {
      // calc how many elements are in front of pattern
      var front = rest.slice(0, indx).split(',');
      front[front.length-1] == "" ? front.pop() : 0;

      var realIndx = front.length + i+nInM-1; // realINdx == startPosOfPattern
      this.notes = temp;

      var high = utilities.max( tempY );
      var low = utilities.min( tempY );
      var rests = [ 1, 2, 4, 6];
      for (var idx = 0; idx < tempY.length; idx++) {
        // tempY[idx] = utilities.round( utilities.scale(tempY[idx], low, high, 2, 8), 2);// tempo is rounded to nearest multiple of 2
        tempY[idx] = rests[ Math.floor( utilities.scale(tempY[idx], low, high, 0, 3) )];
      }

      this.rhythm = tempY;
    }
  }
  console.log('phrases generated')
}
*/
