#!/bin/bash

if [ $# -gt 0 ]; then
  case $1 in
    -gui )
      MODE="GUI"
      ;;
    -no_gui )
      MODE="NO_GUI"
      ;;
  esac
  echo "Mode: " $MODE " selected."
else
  MODE="GUI"
  echo "Default mode GUI selected."
fi

SOURCES=('libs/polyfills.js'
'defaults.js'
'libs/fabric.min.js'
'draw.js'
'libs/flocking-all.min.js'
'libs/jqconsole.min.js'
'console.js'
'utilities.js'
'schillinger_functions.js'
'chaos.js'
'synthDefinitions.js'
'lpSeq.js'
'composition.js'
'scheduler.js'
'editor-browser.js'
'help.js' )

SOURCES_NOGUI=('defaults.js'
'utilities.js'
'schillinger_functions.js'
'chaos.js'
'synthDefinitions.js'
'lpSeq.js'
'composition.js'
'scheduler.js')

if [[ $MODE -eq "GUI" ]]; then
  > oregla.js # clear dest file
  for i in ${SOURCES[@]}; do
    file='source/'${i}
    uglifyjs $file >> oregla.js || cat $file >> oregla.js #minify file, if fail, just append it
  done
elif [[ $MODE -eq "NO_GUI" ]]; then
  > oregla_nogui.js # clear dest file
  for i in ${SOURCES_NOGUI[@]}; do
    file='source/'${i}
    cat $file >> oregla_nogui.js
  done
fi

echo 'done'
