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
  app.post('/api/cfp/delete', function(req, res) {
    var q = req.body.cfp_id;
    connection.beginTransaction(function(err) {
      if(err) {
        res.writeHead(500);
        res.write("" + err.errno);
        res.end();
        return;
      }
      connection.query("delete from deadlines where cfp_id = ?", q, function(err, results, fields) {
        if(err) {
          connection.rollback(function(){ throw err; });
          res.writeHead(500);
          res.write("" + err.errno);
          res.end();
          return;
        }

        connection.query("delete from cfps where cfp_id = ?", q, function(err, results, fields) {
          if(err) {
            connection.rollback(function(){ throw err; });
            res.writeHead(500);
            res.write("" + err.errno);
            res.end();
            return;
          }

          connection.commit(function(err) {
            if(err) {
              connection.rollback(function(){ throw err; });
              res.writeHead(500);
              res.write("" + err.errno);
              res.end();
              return;
            }
            res.writeHead(200);
            res.write("削除完了: ブラウザを更新してください");
            res.end();
          });
        });
      });
    });
  });
};
