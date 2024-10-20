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
var addRecord = function(connection,req,res,q1,q2) {
  connection.beginTransaction(function(err) {
    if(err) {
      res.writeHead(500);
      res.write("" + err.errno);
      res.end();
      return;
    }
    // add into cfps
    connection.query("insert into cfps set ?", q1, function(err, results, fields) {
      if(err) {
        connection.rollback(function(){ throw err; });
        res.writeHead(500);
        res.write("" + err.errno);
        res.end();
        return;
      }

      q2.cfp_id = results.insertId;

      // add into deadlines
      connection.query("insert into deadlines set ?", q2, function(err, results, fields) {
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
          res.write("登録完了: ブラウザを更新してください");
          res.end();
        });
      });
    });
  });
};

var updateRecord = function(connection,req,res,q1,q2) {
  connection.beginTransaction(function(err) {
    if(err) {
      res.writeHead(500);
      res.write("" + err.errno);
      res.end();
      return;
    }
    // update cfps
    connection.query("update cfps set ? where cfp_id =" + req.body.cfp_id, q1, function(err, results, fields) {
      if(err) {
        connection.rollback(function(){ throw err; });
        res.writeHead(500);
        res.write("" + err.errno);
        res.end();
        return;
      }

      q2.cfp_id = req.body.cfp_id;
      var can_commit = true;

      if(req.body.extended !== 'false') {
        // deadline extended
        connection.query("insert into deadlines set ?", q2, function(err, results, fields) {
          if(err) {
            connection.rollback(function(){ throw err; });
            res.writeHead(500);
            res.write("" + err.errno);
            res.end();
            can_commit = false;
            return;
          }
        });
      }
      else {
        // deadline is not extended, but fix the error of deadlines.
        connection.query("update deadlines set ? where cfp_id =" + req.body.cfp_id, q2, function(err, results, fields) {
          if(err) {
            connection.rollback(function(){ throw err; });
            res.writeHead(500);
            res.write("" + err.errno);
            res.end();
            can_commit = false;
            return;
          }
        });
      }

      if(can_commit) {
        connection.commit(function(err) {
          if(err) {
            connection.rollback(function(){ throw err; });
            res.writeHead(500);
            res.write("" + err.errno);
            res.end();
            return;
          }
          res.writeHead(200);
          res.write("更新完了: ブラウザを更新してください");
          res.end();
        });
      }
    });
  });
};

module.exports = function(app,connection) {
  app.post('/api/cfp/add_or_update', function (req, res) {
    // insert/update cfps
    var q1 = {};
    q1.name                  = req.body.name;
    q1.fullname              = req.body.fullname;
    q1.venue                 = req.body.venue;
    q1.date_beg              = req.body.date_beg;
    q1.date_end              = req.body.date_end;
    q1.site                  = req.body.site;
    q1.remarks               = req.body.remarks;

    if(req.body.date_end === "") {
      q1.date_end = req.body.date_beg;
    }

    // insert/update deadlines
    var q2 = {};
    q2.abst_deadline         = req.body.abst;
    q2.submission_deadline   = req.body.submission;
    q2.notification_date     = req.body.notification;
    q2.camera_deadline       = req.body.camera;

    if(req.body.cfp_id == null) {
      addRecord(connection,req,res,q1,q2);
    }
    else {
      updateRecord(connection,req,res,q1,q2);
    }
  });
};
