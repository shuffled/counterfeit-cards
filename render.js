"use strict";

let fs = require('fs');
let yaml = require('js-yaml');
let pug = require('pug');
let chokidar = require('chokidar');
let interleaving = require('interleaving');

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
  return str
    .replace(/'/g,'&rsquo;')
    .replace(/"([^"]*)"/g,'&ldquo;$1&rdquo;')
    .replace(/\.\.\./g,'&hellip;')
    .replace(supRegExp,'<sup>$1</sup>');
}

function adjustCards(cards, type) {
  for (let card of cards[type]) {
    card.text = processedText(card.text);
    card.type = type;
  }
}

function renderFile(localFilename) {
  let locals = yaml.load(fs.readFileSync(localFilename));

  setDefaultLocals(locals);

  adjustCards(locals,'white');
  adjustCards(locals,'black');

  locals.cards = interleaving.justify(locals.white, locals.black);

  fs.writeFileSync('index.html',renderer(locals),'utf8');
}

renderFile(inputFilename);
if (argv.w) {
  chokidar.watch(inputFilename).on('change', path => {
    renderFile(inputFilename);
    console.log(new Date().toISOString() +
      ` render ${inputFilename} => index.html`);
  });
}
