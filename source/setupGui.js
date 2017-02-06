$( document ).ready(function(){
  initConsole();
  initDrawingAndUI();
  drawFaderbox();
  drawButtonbox();
  initResize();
  lpseq.init();
  setupEditorBrowser();
  drawBrowser();
  for (var i = 0; i < sound.instruments.length; i++) {
    var synth = sound.instruments[i];
    setupFader(i, {
      "name": synth,
      "instrument": sound[synth].synth,
    });
  }

  // drumbus
  setupFader(i++, {
    "name": "drums",
    "instrument": synthDef.drumBus,
  });

  var o = i; // offset
  for (var i = 0; i < sound.drums.list.length; i++) {
    var drum = sound.drums.list[i];
    setupFader(i+o, {
      "name": drum,
      "instrument": sound.drums[drum].synth,
    });
  }

  for (var i = 0; i < sound.instruments.length; i++) {
    setupButton(i, {
      instrument: sound[sound.instruments[i]],
      onOn: sound[sound.instruments[i]].start,
      onOff: sound[sound.instruments[i]].stop,
    });
  }

  setupButton(i++, { // drumbus
    instrument: sound.drums,
    onOn: sound.drums.start,
    onOff: sound.drums.stop,
  });

  var o = i; // offset
  for (var i = 0; i < sound.drums.list.length; i++) {
    var drum = sound.drums.list[i];
    setupButton(i+o, {
      "instrument": sound.drums[drum],
      onOn: sound.drums[drum].start,
      onOff: sound.drums[drum].stop,
    });
  }

  initSuggestions();
});
