// chaos sequencer note generator
Chaos = function(_x, _y, _a, _t, _b, _o){
  this.x=_x; this.y=_y; this.a=_a; this.t=_t; this.b=_b; this.o=_o;
  this.lowest = 0; this.highest= 0;
  this.phrase = [];
  this.rest = [];
  this.restCounter = 0;
  this.pos = 0;
}

Chaos.prototype.higherOrLower = function(val){
  val > this.highest ? this.highest = val : 0
  val < this.lowest ? this.lowest = val : 0
}

Chaos.prototype.chaosFunc = function() {
  var xx, yy;
  xx = this.y - (this.x / Math.abs(this.x)) * Math.sqrt( Math.abs( (this.b * this.x) - this.o ) );
  yy = this.t - this.x;

  this.x = xx;
  this.y = yy;
}

Chaos.prototype.calculate = function(){
  this.chaosFunc();
  this.higherOrLower(this.x);
  this.higherOrLower(this.y);
}

Chaos.prototype.getNormalized= function(which, nLow, nHigh){
  return utilities.scale(this[which], this.lowest, this.highest, nLow, nHigh);
}

Chaos.prototype.getNote = function(){
  if(this.restCounter == 0){
    var n = this.phrase[this.pos];
    this.pos++;
    if(this.pos > this.phrase.length-1) this.pos = 0;
    this.restCounter++;
    return n + 36;
  } else {
    this.restCounter++;
    if(this.restCounter > this.rest[this.pos] ) this.restCounter = 0;
    return -1;
  }
}

Chaos.prototype.calculatePhrase = function( coords ) {
  this.x=coords.x; this.y=coords.y; this.a=coords.a; this.t=coords.t; this.b=coords.b; this.o=coords.o;
  this.phrase = [];
  this.rest = [];
  this.pos = 0;
  this.restCounter = 0;

  var phraseX = [];
  var phraseY = [];
  for(var i=0; i<100; i++){
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
    for(var i=0; i<100-tempNiNm; i++){
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

  for(var i=0; i<100-nInM; i++){
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
      this.phrase = temp;

      var high = utilities.max( tempY );
      var low = utilities.min( tempY );
      var rests = [ 1, 2, 4, 6];
      for (var idx = 0; idx < tempY.length; idx++) {
        // tempY[idx] = utilities.round( utilities.scale(tempY[idx], low, high, 2, 8), 2);// tempo is rounded to nearest multiple of 2
        tempY[idx] = rests[ Math.floor( utilities.scale(tempY[idx], low, high, 0, 3) )];
      }

      this.rest = tempY;
    }
  }
  console.log('phrases generated')
}
