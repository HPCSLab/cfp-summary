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
var formatDate = function (date, format) {
  if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  if (format.match(/S/g)) {
    var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
    var length = format.match(/S/g).length;
    for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
  }
  return format;
};

module.exports = function(app,connection) {
  app.get('/api/cfp/list', function (req, res) {
    var now_date = formatDate(new Date(), 'YYYY-MM-DD');

    var q;
    if(req.query.status === "nowOpened") {
      q = "select DISTINCT cfps.cfp_id,name,fullname,venue,date_beg,date_end,site,remarks"
        + " from cfps inner join deadlines on cfps.cfp_id = deadlines.cfp_id"
        + " where submission_deadline >= '" + now_date + "' order by submission_deadline asc";
    }
    else if(req.query.status === "waitOpen") {
      //q = "select cfps.cfp_id,name,fullname,venue,date_beg,date_end,site,remarks"
      //  + " from cfps where date_end >= '" + now_date + "' and cfp_id not in (select distinct cfp_id from deadlines where submission_deadline >= '" + now_date + "' order by notification_date asc)";
      q = "select DISTINCT cfps.cfp_id,name,fullname,venue,date_beg,date_end,site,remarks"
        //+ " from cfps inner join (select distinct * from deadlines where submission_deadline < '" + now_date + "' order by notification_date asc) on cfps.cfp_id = deadlines.cfp_id" 
        + " from cfps inner join deadlines on cfps.cfp_id = deadlines.cfp_id"
        + " where date_end >= '" + now_date + "' and not submission_deadline >= '" + now_date + "' order by notification_date asc";
    }
    else if(req.query.status === "nowClosed") {
      var three_years_ago = new Date();
      three_years_ago.setYear(three_years_ago.getFullYear() - 3);
      three_years_ago = formatDate(three_years_ago, 'YYYY-MM-DD');
      q = "select DISTINCT cfps.cfp_id,name,fullname,venue,date_beg,date_end,site,remarks"
        + " from cfps inner join deadlines on cfps.cfp_id = deadlines.cfp_id where date_end < '" + now_date + "' and date_beg >= '" + three_years_ago + "' order by date_beg desc";
    }
    else {
      res.writeHead(500);
      res.write("conference status `" + req.query.status + "` is not found");
      res.end();
      return;
    }

    connection.query(q, function (err, result) {
      if(err) {
        console.log(err);
        res.statusCode = 500;
        res.write(err.errno);
        res.end();
      }
      else {
        var cfps_result = result;
        connection.query("select * from deadlines", function(err, results) {
          if(err) {
            console.log(err);
            res.statusCode = 500;
            res.write(err.errno);
            res.end();
          }
          else {
            var ret = {};
            ret.cfps      = cfps_result;
            ret.deadlines = results;
  
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(ret));
            res.end();
          }
        });
      }
    });
  });
};
