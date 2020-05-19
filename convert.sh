#!/bin/bash

# tweego can't read from stdin so we need to write stdin to a tmp file
cat /dev/stdin > ./temp.twee
tweego --format=jailbird ./temp.twee | jailbird
rm ./temp.twee