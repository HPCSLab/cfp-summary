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
var mysql  = require('mysql');
var config = require('../config/db');

var client = mysql.createConnection({
  host:     config.host,
  user:     config.user,
  password: config.password
});

client.query('create database ' + config.database
  , function(err) {
    if(err) {
      throw err;
    }
  });

client.query('use ' + config.database);

client.query(
  'create table cfps' +
  '(' +
  '  cfp_id              INT             NOT NULL  AUTO_INCREMENT,' +
  '  name                varchar(16)     NOT NULL  UNIQUE,' +
  '  fullname            varchar(128)    default   NULL,' +
  '  venue               varchar(64)     default   NULL,' +
  '  date_beg            date            default   NULL,' +
  '  date_end            date            default   NULL,' +
  '  site                varchar(2048)   default   NULL,' +
  '  remarks             varchar(1024)   default   NULL,' +
  '  updated_at          TIMESTAMP       DEFAULT   CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,' +
  '  PRIMARY KEY(cfp_id)' +
  ')'
);

client.query(
  'create table deadlines' +
  '(' +
    'deadlines_id        INT             NOT NULL  AUTO_INCREMENT,' +
    'cfp_id              INT             NOT NULL,' +
    'abst_deadline       date            default   NULL,' +
    'submission_deadline date            default   NULL,' +
    'notification_date   date            default   NULL,' +
    'camera_deadline     date            default   NULL,' +
    'PRIMARY KEY(deadlines_id),' +
    'FOREIGN KEY(cfp_id) references cfps(cfp_id)' +
  ')'
);

client.end();
