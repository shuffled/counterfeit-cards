"use strict";

let fs = require('fs');
let yaml = require('js-yaml');
let pug = require('pug');

let renderer = pug.compile(fs.readFileSync('index.pug'));
let locals = yaml.load(fs.readFileSync('locals.yaml'));

if (!locals.brand) {
  locals.brand = {};
}
if (!locals.brand.name) {
  locals.brand.name = 'Counterfeit Cards';
}

switch (locals.brand.name) {
  case 'Cards Against Humanity':
    locals.brand.logo = 'cahlogo.svg';
    break;
  default:
    locals.brand.logo = 'counterfeitlogo.svg';
    break;
}

fs.writeFileSync('index.html',renderer(locals),'utf8');
