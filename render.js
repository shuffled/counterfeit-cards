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

let superscript = ['&reg;','®'];
let supRegExp = new RegExp('('+superscript.join('|')+')','g');

function adjustCards(cards) {
  for (let card of cards) {
    card.text = card.text.replace(supRegExp,'<sup>$1</sup>');
  }
}

for (let cardSet of locals.sets) {
  adjustCards(cardSet.cards.white);
  adjustCards(cardSet.cards.black);
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
