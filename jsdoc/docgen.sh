#!/bin/bash
./node_modules/.bin/jsdoc -c ./jsdoc/conf.json &&
rm -rf ./docs/* &&
shopt -s dotglob &&
mv ./jsdoc/src/secretstore/*/* ./docs/ &&
rm -rf ./jsdoc/src