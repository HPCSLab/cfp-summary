/*
 *  Copyright 2016 Yuta Hirokawa
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
var appConfig  = require('./config/app')
var express    = require('express');
var path       = require('path');
var moment     = require('moment');
var bodyParser = require('body-parser');
var fs         = require('fs');

/* configurations */
var app = express();
app.set('views',       path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/css',           express.static('views/css'));
app.use('/js',            express.static('views/js'));
app.use('/jquerysrc',     express.static('node_modules/jquery/dist'));
app.use('/underscoresrc', express.static('node_modules/underscore'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.locals.baseUrl = appConfig.baseUrl;

app.get('/', function (req, res) {
  res.render('index', { pageTitle: appConfig.title });
});

/* DB */
var connection = require('./db/mysql_connection');


/* GET API */
require('./api/cfp/list.js')(app,connection);
require('./api/cfp/detail.js')(app,connection);
require('./api/cfp/last_updated.js')(app,connection);


/* POST API */
require('./api/cfp/add_or_update.js')(app,connection);
require('./api/cfp/delete.js')(app,connection);


/* START */
app.listen(appConfig.port, appConfig.host, () => {
  console.log(`listen on ${appConfig.host}:${appConfig.port}`);
});

