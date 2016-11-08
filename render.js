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

function interleavedList(cards) {
  let cardList = [];
  let blackInterval = 5;
  let intervalOneLess = blackInterval - 1;
  let cardCount = cards.white.length + cards.black.length;
  for (let iTotal = 0, iBlack = 0, iWhite = 0; iTotal < cardCount; iTotal++) {
    let printBlack = iBlack < cards.black.length &&
      (iTotal % blackInterval == intervalOneLess ||
        iWhite >= cards.white.length);

    let insertCard = printBlack ? cards.black[iBlack] : cards.white[iWhite];
    insertCard.type = printBlack ? 'black' : 'white';
    cardList[iTotal] = insertCard;

    if (printBlack) ++iBlack;
    else ++iWhite;
  }

  return cardList;
}

for (let cardSet of locals.sets) {
  adjustCards(cardSet.cards.white);
  adjustCards(cardSet.cards.black);

  cardSet.cards = interleavedList(cardSet.cards);
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
