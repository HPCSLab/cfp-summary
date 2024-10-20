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
var mysql = require("mysql2");
var config = require("../config/db");

var client = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
});

client.query("use " + config.database);

old_name = "cite";
new_name = "site varchar(2048) default NULL";

client.query("alter table cfps change column " + old_name + " " + new_name);

client.end();
