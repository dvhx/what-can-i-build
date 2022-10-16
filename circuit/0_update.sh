#!/bin/bash
echo '// All circuits in one js file, run update.sh to generate it' > circuits.js
echo 'window.SC = window.SC || {};' >> circuits.js
echo 'window.SC.circuit = {};' >> circuits.js
for i in *.json; do
    KEY=`echo "$i" | sed 's/.json//'`
    echo "window.SC.circuit['$KEY'] = `cat $i`;" >> circuits.js
done
