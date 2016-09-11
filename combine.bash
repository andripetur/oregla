#!/bin/bash

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

# clear destination file
> oregla.js

for i in ${SOURCES[@]}; do
  file='source/'${i}
  uglifyjs $file >> oregla.js || cat $file >> oregla.js #minify file, if fail, just append it
done


echo 'done'
