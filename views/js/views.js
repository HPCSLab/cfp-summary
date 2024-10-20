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

var TIMEZONE = 9.0; /* JST (GMT+9) */

// ----------------------------------------------------

var formatDate = function (date, format) {
  if (date == null || date === "0000-00-00") return "";
  if (typeof date != "date") date = new Date(date);

  var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  date = new Date(utc + (3600000 * TIMEZONE));

  if (!format) format = 'YYYY/MM/DD';
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

var formatPeriod = function(beg, end) {
  var ret;
  if(end == null || end === "0000-00-00") {
    ret = formatDate(beg);
  } else {
    if (typeof beg != "date") beg = new Date(beg);
    if (typeof end != "date") end = new Date(end);
    if(beg.getTime() === end.getTime())
      ret = formatDate(beg);
    else if(beg.getMonth() === end.getMonth())
      ret = formatDate(beg) + ' - ' + formatDate(end, 'DD');
    else
      ret = formatDate(beg) + ' - ' + formatDate(end, 'MM/DD');
  }
  return ret;
};

// ----------------------------------------------------

var validatePeriod = function(beg, end) {
  if(end === "") {
    return true;
  } else {
    var b = new Date(beg);
    var e = new Date(end);
    return b < e;
  }
};

var validateInput = function() {
  if($("#conf_name").val() === "") {
    window.alert("会議名を入力してください");
    return false;
  }
  if($("#conf_date_beg").val() === "") {
    window.alert("会議の開催日を入力してください");
    return false;
  }
  return true;
};

// ----------------------------------------------------

var getLastUpdatedDate = function () {
  $.ajax({
    type: 'GET',
    url:  'api/db/last_updated',
    cache: false
  }).done(function(res, textStatus, xhr) {
    var lastUpdatedDate = formatDate(res, "YYYY/MM/DD hh:mm");
    $("#last_updated").text("Last updated: " + lastUpdatedDate);
  }).fail(function(res, textStatus, xhr) {
    if(res.status == 403)
      $("#last_updated").text("Last updated: " + "not found");
    else
      $("#last_updated").text("Last updated: " + "DB error");
  });;
};

var deadlineExtended = function(name, deadlines) {
  var dates = _.uniq(_.without(_.map(deadlines, function(v) { return formatDate(v[name]); }), ""));
  var dom   = "";
  for(var d in dates) {
    if(d == dates.length - 1) {
      if(dates.length === 1)
        dom = dom + formatDate(dates[d]);
      else
        dom = dom + '<span class="is_extended">' + formatDate(dates[d]) + '</span>';
    }
    else {
      var date = formatDate(dates[d]);
      if(date !== "")
        dom = dom + '<del>' + date + '</del> &#8658;';
    }
  }
  return '<td>' + dom + '</td>';
};

var getNowOpenedCFPs = function() {
  $.ajax({
    type: 'GET',
    url:  'api/cfp/list',
    cache: false,
    data: {
      'status': 'nowOpened'
    }
  }).done(function(result, textStatus, xhr) {
    var tbl = $("#now_opened").children("table");
    var res = result.cfps;
    tbl.append('<tbody></tbody>');
    tbl = tbl.children("tbody");
    for(var i in res) {
      var elem      = res[i];
      var deadlines = _.where(result.deadlines, {cfp_id: elem.cfp_id});

      var str  = '<tr>'              +
                 '<th><div class="detail dummy-link" cfp-id="' + elem.cfp_id + '" title="詳細">' + elem.name + '</div></th>' +
                 '<td>'              + elem.venue                                + '</td>' +
                 '<td class="date">' + formatPeriod(elem.date_beg,elem.date_end) + '</td>' +
                 deadlineExtended('abst_deadline',       deadlines) +
                 deadlineExtended('submission_deadline', deadlines) +
                 deadlineExtended('notification_date',   deadlines) +
                 '<td><a href="'     + elem.site                                 + '" class="open_window">site</a></td>' +
                 '<td>'              + elem.remarks                              + '</td>' +
                 '<td class="input_box">' +
                   '<input class="update" type="button" name="update" value="編集" cfp-id="' + elem.cfp_id + '" />' +
                   '<input class="delete" type="button" name="delete" value="削除" cfp-id="' + elem.cfp_id + '" />' +
                 '</td>' +
                 '</tr>';

      tbl.append(str);
    }
    $("#now_opened").slideDown();
  }).fail(function(res, textStatus, xhr) {
    console.log(res.responseText);
  });
};

var getWaitOpenCFPs = function() {
  $.ajax({
    type: 'GET',
    url:  'api/cfp/list',
    cache: false,
    data: {
      'status': 'waitOpen'
    }
  }).done(function(result, textStatus, xhr) {
    var tbl = $("#wait_open").children("table");
    var res = result.cfps;
    tbl.append('<tbody></tbody>');
    tbl = tbl.children("tbody");
    for(var i in res) {
      var elem      = res[i];
      var deadlines = _.where(result.deadlines, {cfp_id: elem.cfp_id});

      var str  = '<tr>'              +
                 '<th><div class="detail dummy-link" cfp-id="' + elem.cfp_id + '" title="詳細">' + elem.name + '</div></th>' +
                 '<td>'              + elem.venue                                + '</td>' +
                 '<td class="date">' + formatPeriod(elem.date_beg,elem.date_end) + '</td>' +
                 deadlineExtended('submission_deadline', deadlines) +
                 deadlineExtended('notification_date', deadlines) +
                 deadlineExtended('camera_deadline',   deadlines) +
                 '<td><a href="'     + elem.site                                 + '" class="open_window">site</a></td>' +
                 '<td>'              + elem.remarks                              + '</td>' +
                 '<td class="input_box">' +
                   '<input class="update" type="button" name="update" value="編集" cfp-id="' + elem.cfp_id + '" />' +
                   '<input class="delete" type="button" name="delete" value="削除" cfp-id="' + elem.cfp_id + '" />' +
                 '</td>' +
                 '</tr>';

      tbl.append(str);
    }
    $("#wait_open").slideDown();
  }).fail(function(res, textStatus, xhr) {
    console.log(res.responseText);
  });
};

var getClosedCFPs = function() {
  $.ajax({
    type: 'GET',
    url:  'api/cfp/list',
    cache: false,
    data: {
      'status': 'nowClosed'
    }
  }).done(function(result, textStatus, xhr) {
    var tbl = $("#closed_conference").children("table");
    var res = result.cfps;
    tbl.append('<tbody></tbody>');
    tbl = tbl.children("tbody");
    for(var i in res) {
      var elem = res[i];
      var deadlines = _.where(result.deadlines, {cfp_id: elem.cfp_id});

      var str  = '<tr>'              +
                 '<th><div class="detail dummy-link" cfp-id="' + elem.cfp_id + '" title="詳細">' + elem.name + '</div></th>' +
                 '<td>'              + elem.venue                                + '</td>' +
                 '<td class="date">' + formatPeriod(elem.date_beg,elem.date_end) + '</td>' +
                 deadlineExtended('submission_deadline', deadlines) +
                 '<td><a href="'     + elem.site                                 + '" class="open_window">site</a></td>' +
                 '<td>'              + elem.remarks                              + '</td>' +
                 '<td class="input_box">' +
                   '<input class="update" type="button" name="update" value="編集" cfp-id="' + elem.cfp_id + '" />' +
                   '<input class="delete" type="button" name="delete" value="削除" cfp-id="' + elem.cfp_id + '" />' +
                 '</td>' +
                 '</tr>';
      tbl.append(str);
    }
    $("#closed_conference").slideDown();
  }).fail(function(res, textStatus, xhr) {
    console.log(res.responseText);
  });
};

var getCFPs = function() {
  getNowOpenedCFPs();
  getWaitOpenCFPs();
  getClosedCFPs();
};

// ----------------------------------------------------

var showPage = function () {
  $(this).parent(".page").children(".section").slideToggle();
};

var checkExtended = function() {
  return $("#deadline_extended").prop("checked");
};

var addOrUpdateCFP = function() {
  if(validateInput()) {
    $.ajax({
      type: 'POST',
      url:  'api/cfp/add_or_update',
      cache: false,
      data: {
        'cfp_id':       $("#register").attr("cfp-id"),
        'name':         $("#conf_name").val(),
        'fullname':     $("#conf_fullname").val(),
        'venue':        $("#conf_venue").val(),
        'date_beg':     $("#conf_date_beg").val(),
        'date_end':     $("#conf_date_end").val(),
        'abst':         $("#abst_deadline").val(),
        'submission':   $("#submission_deadline").val(),
        'notification': $("#notification_date").val(),
        'camera':       $("#camera_deadline").val(),
        'site':         $("#site_url").val(),
        'remarks':      $("#conf_remarks").val(),
        'extended':     checkExtended()
      }
    }).done(function(response, textStatus, jqXHR) {
      window.alert(response);
      $("#registration_page").text("CFP情報登録");
      $("#register").removeAttr("cfp-id").val("登録");
      $(".extended_form").each(function() {
        $(this).hide();
      });
    }).fail(function(response, textStatus, jqXHR) {
      console.log(response);
      if(response.responseText == 1062)
        window.alert("会議" + $("#conf_name").val() + "は既に登録されています");
      else
        window.alert("Error: " + response.responseText);
    });
  }
};

var clearAllInput = function() {
  $("#registration").find("textarea").each(function() {
    $(this).val('');
  });
  $("#registration").find("input[type='date']").each(function() {
    $(this).val('');
  });
  $("#registration_page").text("CFP情報登録");
  $("#register").removeAttr("cfp-id").val("登録");
  $("#deadline_extended").prop("checked", false);
  $(".extended_form").each(function() {
    $(this).hide();
  });
};

var detailCFP = function() {
  $(this).blur();
  if($("#detail-overlay")[0]) {
    return false;
  }

  var cfpId = $(this).attr('cfp-id');

  $.ajax({
    type: 'GET',
    url:  'api/cfp/detail',
    cache: true,
    data: {
      'cfp_id': cfpId
    }
  }).done(function(elem, status, xhr) {
    var content = $("#detail-content");
    content.empty();

    var checkAppend = function(h, s) {
      if(s !== "")
        return '<tr><th>' + h + '</th><td>' + s + '</td></tr>';
      else
        return '';
    };

    var dateFmt = "YYYY/MM/DD";
    var str = checkAppend('会議名 (略称)',      elem.name)
            + checkAppend('会議名',             elem.fullname)
            + checkAppend('開催地',             elem.venue)
            + checkAppend('日程',               formatPeriod(elem.date_beg, elem.date_end))
            + checkAppend('アブストラクト締切', formatDate(elem.abst_deadline,dateFmt))
            + checkAppend('投稿締切',           formatDate(elem.submission_deadline,dateFmt))
            + checkAppend('採録通知',           formatDate(elem.notification_date,dateFmt))
            + checkAppend('カメラレディ締切',   formatDate(elem.camera_deadline,dateFmt))
            + checkAppend('備考',               elem.remarks)
            + checkAppend('リンク',             '<a href="' + elem.site + '" class="open_window">site</a>')
            ;
    content.append('<table id="detail-table">' + str + '</table>');
    $("#detail-update").attr({"cfp-id": cfpId});

    var w = $(window).width();
    var h = $(window).height();
    var dw = $("#detail-window").outerWidth(true);
    var dh = $("#detail-window").outerHeight(true);
    var pxleft = ((w - dw)/2);
    var pxtop = ((h - dh)/2);
    $("#detail-window").css({ "left": pxleft + "px", "top": pxtop + "px" });

    $("body").append('<div id="detail-overlay"></div>');
    $("#detail-overlay, #detail-window").fadeIn();
  }).fail(function(res, status, xhr) {
    window.alert("internal error:" + res.responseText);
  });
}

var closeDetailCFP = function() {
  $(this).blur();
  $("#detail-overlay, #detail-window").fadeOut(function() {
    $("#detail-overlay").remove();
  });
};

var editCFP = function() {
  var section = $("#registration_page").text("CFP情報更新").parent().children(".section");
  var cfpId   = $(this).attr('cfp-id');

  section.slideUp(function() {
    $.ajax({
      type: 'GET',
      url:  'api/cfp/detail',
      cache: true,
      data: {
        'cfp_id': cfpId
      }
    }).done(function(elem, status, xhr) {
      var dateFmt = "YYYY-MM-DD";
      $("#conf_name").val(elem.name);
      $("#conf_fullname").val(elem.fullname);
      $("#conf_venue").val(elem.venue);
      $("#conf_date_beg").val(formatDate(elem.date_beg,dateFmt));
      $("#conf_date_end").val(formatDate(elem.date_end,dateFmt));
      $("#abst_deadline").val(formatDate(elem.abst_deadline,dateFmt));
      $("#submission_deadline").val(formatDate(elem.submission_deadline,dateFmt));
      $("#notification_date").val(formatDate(elem.notification_date,dateFmt));
      $("#camera_deadline").val(formatDate(elem.camera_deadline,dateFmt));
      $("#conf_remarks").val(elem.remarks);
      $("#site_url").val(elem.site);
      $("#register").attr("cfp-id", elem.cfp_id).val("更新");
      $(".extended_form").each(function() {
        $(this).show();
      });

      $("html,body").animate({ scrollTop: $("#registration_page").offset().top }, function() { section.slideDown(); });
    }).fail(function(res, status, xhr) {
      window.alert("internal error:" + res.responseText);
    });
  });
};

var deleteCFP = function() {
  var cfpId   = $(this).attr('cfp-id');

  $.ajax({
    type: 'POST',
    url:  'api/cfp/delete',
    cache: false,
    data: {
      'cfp_id': cfpId
    }
  }).done(function(res, status, xhr) {
    window.alert(res);
  }).fail(function(res, status, xhr) {
    window.alert("internal error:" + res.responseText);
  });
};

var newTab = function() {
  var href = $(this).attr("href");
  if(!(href == null || href === ""))
    window.open(href);
  return false;
};

var onChecked = function() {
  $("#deadline_extended").prop("checked", true);
};

// ----------------------------------------------------


$(function() {
  $("#registration_page").click(showPage);
  $("#register").click(addOrUpdateCFP);
  $("#clear").click(clearAllInput);

  $("#abst_deadline").change(onChecked);
  $("#submission_deadline").change(onChecked);
  $("#notification_date").change(onChecked);
  $("#camera_deadline").change(onChecked);

  $(this).on('click', '#detail-overlay', closeDetailCFP);
  $(this).on('click', '#detail-close', closeDetailCFP);

  $(this).on('click', '#detail-update', closeDetailCFP);
  $(this).on('click', '#detail-update', editCFP);

  $(this).on('click', '.detail', detailCFP);
  $(this).on('click', '.update', editCFP);
  $(this).on('click', '.delete', deleteCFP);
  $(this).on('click', '.open_window', newTab);

  getLastUpdatedDate();
  getCFPs();
});
