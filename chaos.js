// chaos sequencer note generator
Chaos = function(_x, _y, _a, _t, _b, _o){
  this.x=_x; this.y=_y; this.a=_a; this.t=_t; this.b=_b; this.o=_o;
  this.lowest = 0; this.highest= 0;
  this.phrase = [];
  this.rest = [];
  this.restCounter = 0;
  this.pos = 0;
  this.points = [];
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
  if(this.restCounter === this.rest[this.pos % this.rest.length]){
    var n = this.phrase[this.pos%this.phrase.length]
    this.pos++;
    // if(this.pos > this.phrase.length-1) this.pos = 0;
    this.restCounter=0;
    return n + 36;
  }
    this.restCounter++;
    return -1;
}

Chaos.prototype.calculateBufferedPhrase = function( coords , phraseLength ) {
  this.x=coords.x; this.y=coords.y; this.a=coords.a; this.t=coords.t; this.b=coords.b; this.o=coords.o;
  this.phrase = [];
  this.rest = [];
  this.pos = 0;
  this.restCounter = 0;

  var phrase = [];
  for(var i=0; i<phraseLength; i++){
    phrase.push( { x: this.x, y: this.y, length: utilities.pythagoras(this.x, this.y) });
    this.chaosFunc();
  }

  // reorder by distance from point 0, 0
  phrase.sort(function(a,b){
    return a.length - b.length;
  })

  this.phrase = phrase.map(function(el){ return Math.abs(Math.floor(el.x)); } );
  this.points = phrase;
  // this.rest =   phrase.map(function(el){ return 2; })
  this.rest =   Schillinger.seriesToNumerators( Schillinger.generalInterferenceOfMonomials(2,3,5));

  console.log('Buffered phrase generated')
}

Chaos.prototype.calculateSequencedPhrase = function( coords, phraseLength ) {
  this.x=coords.x; this.y=coords.y; this.a=coords.a; this.t=coords.t; this.b=coords.b; this.o=coords.o;
  this.phrase = [];
  this.rest = [];
  this.pos = 0;
  this.restCounter = 0;

  var phrase = [];
  for(var i=0; i<phraseLength ; i++){
    phrase.push( { x: this.x, y: this.y, length: utilities.pythagoras(this.x, this.y)  });
    this.chaosFunc();
  }

  var distances = [];
  for(var i=0; i<phrase.length; i++){
    for (var y=i+1; y<phrase.length; y++) {
      distances.push( { i1: i, i2: y,
        length: utilities.pythagoras(
          phrase[i].x - phrase[y].x,
          phrase[i].y - phrase[y].y)
        }
      );
    }
  }

  distances.sort(function(a,b){
    return a.length - b.length;
  })

  var reorder = [];
  var foundIndxs = []
  reorder.push( phrase[distances[0].i1] );
  reorder.push( phrase[distances[0].i2] );

  foundIndxs.push( distances[0].i1 );
  var lookingFor = distances[0].i2;

  var i = 0;
  while ( reorder.length < phrase.length ) {
    if ( foundIndxs.indexOf( distances[i].i1 ) > -1 || foundIndxs.indexOf( distances[i].i2 ) > -1 ) {
      distances.splice(i,1);
    } else if(distances[i].i1 === lookingFor) {
      reorder.push( phrase[distances[i].i1] ); //i2
      foundIndxs.push( distances[i].i1 ); //i1
      lookingFor = distances[i].i2; //i2
      i = 0;
    } else if (distances[i].i2 === lookingFor) {
      reorder.push( phrase[distances[i].i2] );
      foundIndxs.push( distances[i].i2 );
      lookingFor = distances[i].i1;
      i = 0;
    } else {
      i++;
    }
  }

  this.phrase = reorder.map(function(el){ return Math.abs(Math.floor(el.x)); } );
  this.points = reorder;
  // this.rest =   phrase.map(function(el){ return 2; })
  this.rest =   Schillinger.seriesToNumerators( Schillinger.generalInterferenceOfMonomials(2,3,5));

  console.log('Buffered phrase generated')
}

Chaos.prototype.calculatePhrase = function( coords, phraseLength ) {
  this.x=coords.x; this.y=coords.y; this.a=coords.a; this.t=coords.t; this.b=coords.b; this.o=coords.o;
  this.phrase = [];
  this.rest = [];
  this.pos = 0;
  this.restCounter = 0;

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
