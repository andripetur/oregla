// chaos generator
var Chaos = null;

(function(){
  Chaos = function( _coords ){
    var coords = _coords || { x: 0.1, y: 0.1, a: 0, t: -4.1, b: 15, o: 1 };
    this.buffer = [];
    this.getCoords = function(){
      return coords;
    };
    this.get = function(w){
      return coords[w];
    };

    this.calculate = function(){
      var xx, yy;
      xx = coords.y - (coords.x / Math.abs(coords.x)) * Math.sqrt( Math.abs( (coords.b * coords.x) - coords.o ) );
      yy = coords.t - coords.x;
      coords.x = xx;
      coords.y = yy;
    }
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

  Chaos.prototype.fillChaosBuffer = function( options ) {
    if( typeof options.coords !== "undefined"){
      Chaos.call(this, options.coords);
    }

    if( typeof options.offset !== "undefined"){
      for(var i=0; i<options.offset; i++) this.calculate();
    }

    var b = [];
    for(var i=0; i<options.length; i++){
      b.push( { x: this.get('x'), y: this.get('y'),
        length: utilities.pythagoras(this.get('x'), this.get('y'))
      });
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

    this.buffer = b;
  }
})();

var Sequencer = null;

(function(){
  Sequencer = function(t){
    this.type = t || "melodic";
    this.notes = [];
    this.rhythm = [];
    this.beatCounter = 0;
    this.pos = 0;
    if (this.type !== "rhythm") {
      var c = new Chaos({});
      for (var foo in c) this[foo] = c[foo];
    }
  }

  Sequencer.prototype = new Schillinger();

  Sequencer.prototype.getNote = function(){
    if(this.beatCounter === this.rhythm[this.pos % this.rhythm.length]){
      var n = this.notes[this.pos%this.notes.length];
      this.pos++;
      this.beatCounter=0;
      return n + 36;
    }
      this.beatCounter++;
      return -1;
  }

  Sequencer.prototype.trigger = function(){
    if(this.beatCounter === this.rhythm[this.pos % this.rhythm.length]){
      this.pos++;
      this.beatCounter=0;
      return true;
    }
      this.beatCounter++;
      return false;
  }

  Sequencer.prototype.mapBufferToNotes = function(o) {
    var valueToMap = "length"
    var mapTo = {low: 0, high: 24};
    var buffRange = utilities.range(this.buffer.map(function(n){ return n[valueToMap]; }));
    this.notes = this.buffer.map(function(el){
      return Math.floor(utilities.scale(
        el[valueToMap], buffRange.low, buffRange.high, mapTo.low, mapTo.high));
      } );
    // this.notes = this.buffer.map(function(el){ return Math.abs(Math.floor(el.x)); } );
  };


})();

var seq = new Sequencer();
