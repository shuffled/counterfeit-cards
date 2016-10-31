"use strict";

let fs = require('fs');
let yaml = require('js-yaml');
let pug = require('pug');

let renderer = pug.compile(fs.readFileSync('index.pug'));
let locals = yaml.load(fs.readFileSync('locals.yaml'));
fs.writeFileSync('index.html',renderer(locals),'utf8');
