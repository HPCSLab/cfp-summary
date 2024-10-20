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
module.exports = function(app,connection) {
  app.get('/api/cfp/detail', function (req, res) {
    var q = 'select * from cfps inner join deadlines on cfps.cfp_id = deadlines.cfp_id'
          + ' where cfps.cfp_id = ' + req.query.cfp_id + ' order by deadlines_id desc'
    connection.query(q, function(err, result) {
      if(err) {
        console.log(err);
        res.statusCode = 500;
        res.write(err.errno);
        res.end();
      }
      else {
        var jsonObj = JSON.stringify(result[0]);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(jsonObj);
        res.end();
      }
    });
  });
};
