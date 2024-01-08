window.utils = {};

utils.alert = function(content){
    jqueryAlert({ content : content });
}

utils.parseUrlParams = function(url) {
    if(!url) url = location.search;
    var query = url.substr(1);
    var result = {};
    query.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}

utils.renderHtml = function(selector, data){
  return ejs.render($(selector).html().replace(/&lt;/g, '<').replace(/&gt;/g, '>'), data);
}

utils.formatDate = function (num) {
  return num > 9 ? num : '0' + num;
}

utils.formatFloat = function (src, pos) {
  pos = pos || 2;
  return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
}

utils.formatDateToNormalStr = function (time, simple, diss) {
  diss = diss || '-';
  let d = (time && new Date(time)) || new Date();
  return [d.getFullYear(), utils.formatDate(d.getMonth() + 1), utils.formatDate(d.getDate())].join(diss) + (simple ? '' : (' ' + [utils.formatDate(d.getHours()), utils.formatDate(d.getMinutes()), utils.formatDate(d.getSeconds())].join(':')));
}