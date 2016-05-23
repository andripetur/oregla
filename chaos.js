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
    this.set = function(w){
      for (var v in w) coords[v] = w[v];
    };

    this.calculate = function(){ // hopalong
      var xx, yy;
      xx = coords.y - (coords.x / Math.abs(coords.x)) * Math.sqrt( Math.abs( (coords.b * coords.x) - coords.o ) );
      yy = coords.t - coords.x;
      coords.x = xx;
      coords.y = yy;
    };

    var strangeAttractor = function(){
      var a = 5, //sigma
          b = 15, //rho
          c = 1, // beta
          interval = 0.05,
          x = coords.x,
          y = coords.y,
          z = coords.z || 0.1,
          xx, yy;

      xx = x - (a * x) * interval + (a * y) * interval;
      yy = y + (b * x) * interval - y * interval - (z * x) * interval;
      zz = z - (c * z) * interval + (x * y) * interval;
      coords.x = xx;
      coords.y = yy;
      coords.z = zz;
    };

  }

  Chaos.prototype.getAllFromBuffer = function (w) {
    return this.buffer.map(function(el){ return el[w]; });
  };

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

  Chaos.prototype.fillChaosBuffer = function( o ) {
    var options = o || {
      coords: { x: 0.1, y: 0.1,
        a: utilities.randFloat(-100,100),
        t: utilities.randFloat(-100,100),
        b: utilities.randFloat(-100,100),
        o: utilities.randInt(-1,1),
        // a: 2,
        // t: -100,
        // b: 3,
        // o: -1,
      },
      length: 100,
      // reorder: "distanceFromEachother"
    };

    if( typeof options.coords !== "undefined"){
      // Chaos.call(this, options.coords);
      this.set(options.coords);
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
    return "Chaos buffer filled!"
  }
})();

var Sequencer = null;

(function(){
  Sequencer = function(t){
    this.seqType = t || "melodic";
    this.rhythm = [];
    this.beatCounter = 0;
    this.pos = 0;
    this.stepSize = 1;
    if (this.seqType !== "rhythm") {
      this.notes = [];
      var c = new Chaos({});
      for (var foo in c) this[foo] = c[foo];
    }
  }

  Sequencer.prototype = new Schillinger();

  Sequencer.prototype.getNote = function(){
    if(this.beatCounter === this.rhythm[this.pos % this.rhythm.length]){
      var n = this.notes[this.pos%this.notes.length];
      this.pos += this.stepSize;
      this.beatCounter=0;
      return n + 36;
    }
      this.beatCounter++;
      return -1;
  }

  Sequencer.prototype.do = function () {
    if(this.synth.isPlaying()){
      var n = this.getNote()
      if(n > 0){
        n = sound.scales.get().lockTo( n );
        this.noteOn( n );
      }
    }
  };

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
    var buffRange = utilities.range( this.getAllFromBuffer(valueToMap));
    this.notes = this.buffer.map(function(el){
      return Math.floor(utilities.scale(
        el[valueToMap], buffRange.low, buffRange.high, mapTo.low, mapTo.high));
      } );
    // this.notes = this.buffer.map(function(el){ return Math.abs(Math.floor(el.x)); } );
  };


})();
