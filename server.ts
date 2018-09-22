import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import {enableProdMode} from '@angular/core';
// Express Engine
import {ngExpressEngine} from '@nguniversal/express-engine';
// Import module map for lazy loading
import {provideModuleMap} from '@nguniversal/module-map-ngfactory-loader';

import * as express from 'express';
import {join} from 'path';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();
var bodyParser = require('body-parser');

// MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModuleNgFactory, LAZY_MODULE_MAP} = require('./server/main');

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});



// Mongo connection, model
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var noteSchema = new mongoose.Schema({
  text: String,
  date: { type: Date, default: Date.now }
});
var Note = mongoose.model('Note', noteSchema);



// Rest API endpoints
app.post('/api/v1/add', (req, res) => {
	var note = new Note();
	note.text = req.body.noteText;
  note.date = req.body.noteDate;
	note.save(function(err) {
		if (err) {
			res.send(err);
		}
		res.json({ message: 'Item added' });
	});
});

app.delete('/api/v1/delete/:note_id', (req, res) => {
	Note.remove({_id: req.params.note_id}, function(err, note) {
		if (err) {
			res.send(err);
		}
		res.json({ message: 'Item deleted' });
	});
});

app.get('/api/v1/get', (req, res) => {
	Note.find(function(err, notes) {
		if (err) {
			res.send(err);
		}
		res.json(notes);
	});
});

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser'), {
  maxAge: '1y'
}));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
