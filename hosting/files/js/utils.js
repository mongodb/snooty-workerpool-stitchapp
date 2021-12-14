var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };

options.timeZone = 'UTC';
options.timeZoneName = 'short';

function formatDate(date) {
  if (date) {
   let dateStr = date.toLocaleDateString('en-US', options);
    //let h = dateStr.getHours;
    //console.log(dateStr);
    //console.log("hours:" + h);
   //function z(n){return (n<10?'0':'')+n}
   //dateStr += " - " + (h%12 || 12) + ':' + z(date.getMinutes()) + ' ' //+ (h<12? 'AM' :'PM');
   
   return dateStr; 
  }
  return "N/A"
}

(function setup() {
  // determine what stitch app to use based on url
  const isProd = window.location.hostname.indexOf('workerpoolstaging') === -1;
  window.STITCH_APP_ID = isProd ? 'workerpool-boxgs' : 'workerpoolstaging-qgeyp';
})();