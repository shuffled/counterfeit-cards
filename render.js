"use strict";

let fs = require('fs');
let yaml = require('js-yaml');
let pug = require('pug');
let chokidar = require('chokidar');

let argv = require('minimist')(process.argv.slice(2),{
  boolean: 'w'
});

let renderer = pug.compile(fs.readFileSync('index.pug'));

let inputFilename = argv._[0] || 'locals.yaml';

function setDefaultLocals(locals) {
  if (!locals.brand) {
    locals.brand = {};
  }
  if (!locals.brand.name) {
    locals.brand.name = 'Counterfeit Cards';
  }
  if (!locals.brand.logo) switch (locals.brand.name) {
    case 'Cards Against Humanity':
      locals.brand.logo = 'cahlogo.svg';
      break;
    default:
      locals.brand.logo = 'counterfeitlogo.svg';
      break;
  }
}

let superscript = ['&reg;','®'];
let supRegExp = new RegExp('('+superscript.join('|')+')','g');
function processedText(str) {
  return str.replace(/-/g,'\u2011')
    .replace(/'/g,'&rsquo;')
    .replace(/"([^"]*)"/g,'&ldquo;$1&rdquo;')
    .replace(/\.\.\./g,'&hellip;')
    .replace(supRegExp,'<sup>$1</sup>');
}

function adjustCards(cards) {
  for (let card of cards) {
    card.text = processedText(card.text);
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

function renderFile(localFilename) {
  let locals = yaml.load(fs.readFileSync(localFilename));

  setDefaultLocals(locals);

  for (let cardSet of locals.sets) {
    adjustCards(cardSet.cards.white);
    adjustCards(cardSet.cards.black);

    cardSet.cards = interleavedList(cardSet.cards);
  }

  fs.writeFileSync('index.html',renderer(locals),'utf8');
}

renderFile(inputFilename);
if (argv.w) {
  chokidar.watch(inputFilename).on('change', path => {
    renderFile(inputFilename);
    console.log(new Date().toISOString()+' render '+inputFilename+' => index.html');
  });
}