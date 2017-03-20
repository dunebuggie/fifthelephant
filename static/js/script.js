window.Fifthel = {};

Fifthel.sendGA = function(category, action, label) {
  if (typeof ga !== "undefined") {
    ga('send', { hitType: 'event', eventCategory: category, eventAction: action, eventLabel: label});
  }
};

function setupFlipboard () {
    if(!$('.flipboard').length) return;
    active_board = new Flipboard();
    active_board.setup();
    
    $('.flipboard').bind('inview', function (event, visible) {
        if (visible == true) active_board.start();
        else active_board.stop();
    });
    
}

// Sponsor Interaction
function initSponsor () {
    if(!$('#sponsors').length) return;
    var   $logos = $('#sponsors .sponsor-logos')
        , $about = $('#sponsors .about-sponsor')
        , $detail = $('#sponsors .about-sponsor .sponsor-detail')
        , $container = $('#sponsors .eventsponsor-block')
        ;
    $('body').on('click', '#sponsors .sponsor-logos-list a.sponsor-blurb', function(e) {
        var   $target = $(e.target).closest('dd');
        $detail.empty().append($target.children().clone());
        $.smoothScroll({
            scrollTarget: $container,
            offset: -20,
            beforeScroll: hideSticky,
            afterScroll: function() { 
                $container.addClass('squeeze');
                if (window.matchMedia && window.matchMedia('(min-width: 50em)').matches || $(window).width() >= 800) $about.show(400);
                else $about.slideDown(400);
                unhideSticky();
            }
        });
        $('dd.active', $logos).removeClass('active');
        $target.addClass('active');
        e.preventDefault();
        return false;
    });
    $('body').on('click', '#sponsors .about-sponsor a.close', function(e) {
        $.smoothScroll({ scrollTarget: $container, offset: -20, beforeScroll: hideSticky, afterScroll: unhideSticky });
        $('dd.active', $logos).removeClass('active');
        if (window.matchMedia && window.matchMedia('(min-width: 50em)').matches || $(window).width() >= 800) $about.hide(400, function() { $container.removeClass('squeeze'); $detail.empty(); });
        else $about.slideUp(400, function() { $container.removeClass('squeeze'); $detail.empty(); });
        e.preventDefault();
        return false;
    })
}

// In-page Navigation
function initInPageNav () { 
    $('body').on('click', '.page-nav a, .smooth-scroll', function(e) {
        var   target = $(e.target).closest(this)[0]
            , $section = $(target.hash)
            ;
        if(!$section.length) return;
        if($section.offset().top < $(window).scrollTop())
            $.smoothScroll({ scrollTarget: target.hash, beforeScroll: hideSticky, afterScroll: unhideSticky });
        else $.smoothScroll({ scrollTarget: target.hash, beforeScroll: hideSticky, afterScroll: unhideSticky });
        e.preventDefault();
    });
    $('body').on('click', '.sticky-main-bar a.active', function(e) {
        $.smoothScroll({ scrollTarget: '#page', beforeScroll: hideSticky, afterScroll: unhideSticky });
        e.preventDefault();
    });
}

// Sticky Navigation
window.ios = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
function hideSticky() {
    window.HIDE_STICKY = true;
    if(window.ios) $('#sticky-nav').css('top', -$(window).height());
}
function unhideSticky() { setTimeout(function(){ window.HIDE_STICKY = false; }, 0); }
function initStickyNav () {
    window.HIDE_STICKY = false;
    var   $sticky_offset = $('#sticky-offset')
        , $sticky_nav = $('#sticky-nav')
        , transition = {}
        , last_scroll = 0
        , curr_scroll
        , diff
        , page_offset
        , height
        , top
        ;
    $('#sticky-nav .sticky-main-bar .on-sticky-content').empty();
    $('#sticky-nav .sticky-page-bar .on-sticky-content').empty();
    $('.home-link').clone().appendTo('#sticky-nav .sticky-main-bar .on-sticky-content');
    $('.main-nav nav').clone().appendTo('#sticky-nav .sticky-main-bar .on-sticky-content');
    $('.ticket-link').clone().appendTo('#sticky-nav .sticky-main-bar .on-sticky-content');
    $('.page-nav').clone().appendTo('#sticky-nav .sticky-page-bar .on-sticky-content');
    $('body').addClass('sticky');
    top = -$sticky_nav.height()-3;
    $sticky_nav.css('top', top);
    function revealSticky(e) {
        curr_scroll = $(window).scrollTop();
        if(window.HIDE_STICKY) top = -$sticky_nav.height()-3;
        else {
            diff = last_scroll-curr_scroll;
            page_offset = curr_scroll - $sticky_offset.offset().top;
            if (diff < 0) top = Math.max(top+diff, -$sticky_nav.height()-3);
            else if(page_offset > 2*$sticky_nav.height()) top = Math.min(top+diff, 0);
            else top = Math.min(top-diff, 0);
        }
        $sticky_nav.css('top', top);
        last_scroll = curr_scroll;
    }
    function iOSRevealSticky(e) {
        curr_scroll = e.originalEvent.touches[0].clientY;
        if(window.HIDE_STICKY) top = -$sticky_nav.height()-3;
        else {
            diff = last_scroll-curr_scroll;
            if (diff > -70 && diff < 10) return;
            page_offset = $(window).scrollTop() - $sticky_offset.offset().top;
            if (diff > 0) top = -$(window).height();
            else if(page_offset > 2*$sticky_nav.height()) top = 0;
            else top = -$(window).height();
        }
        $sticky_nav.css('top', top);
        last_scroll = curr_scroll;
    }
    if (window.ios) {
        // IOS freezes the DOM while scrolling. Hence…
        $(window).on('touchstart', function(e) { last_scroll = e.originalEvent.touches[0].clientY; });
        $(window).on('touchmove', iOSRevealSticky);
        transition[Modernizr.prefixed('transition')] = 'top .6s linear';
        $sticky_nav.css(transition);
        // Hide fixed nav when page is zoomed-in
        $(window).on('gesturechange', function(e) {
            if (e.originalEvent.scale > 1.02) $sticky_nav.hide();
            else $sticky_nav.show();
        });
    }
    else {
        transition[Modernizr.prefixed('transition')] = 'top .2s linear';
        $sticky_nav.css(transition);
        $(window).on('scroll', revealSticky);
        // Hide fixed nav when page is zoomed-in
        $(window).on('touchmove', function(e) {
            if($(document).width() / window.innerWidth > 1.02) $sticky_nav.hide();
            else $sticky_nav.show();
        });
    }
}


// Replace Venue Images
function replaceVenueImages () {
    var $images = $('img.venuephoto');
    if(!$images.length) return;
    
    function runTests() {
        $images.each(function() {
            var   $img = $(this)
                , tests = $img.data('src')
                , current = $img.data('src-index') >= 0 ? $img.data('src-index') : -1
                , index
                ;
            if(!tests) return;
            $.each(tests, function(i) { if (window.matchMedia(this.test).matches) index = i });
            if (index > current) {
                $img.attr('src', tests[index].src);
                $img.data('src-index', index);
            }
        })
    }
    if (window.matchMedia) {
        runTests();
        $(window).on('resize', runTests);
        $('.venue-showcase').addClass('stretch').show();
    } 
}

function main () {
    initStickyNav();
    initInPageNav();
    setupFlipboard();
    initSponsor();
    replaceVenueImages();
}

function initLeaflets() {

  if(typeof window.L === "undefined") {
    window.setTimeout(initLeaflets, 5000);
    return;
  }

  $('.leaflet-map').each(function initLeafletMap () {
      var   $container = $(this)
          , defaults = {
                zoom: 5
              , marker: [12.9833, 77.5833] // bangalore
              , label: null
              , maxZoom: 18
              , attribution: '<a href="http://open.mapquest.co.uk" target="_blank">MapQuest</a>, <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> and contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>'
              , subdomains: ['a','b','c']
              , scrollWheelZoom: false
          }
          , args
          , options
          , map
          , marker
          ;
      
      // remove any child elements from the container
      $container.empty();
      
      args = $container.data();
      if (args.marker) { args.marker = args.marker.split(','); }
      options = $.extend({}, defaults, args);
      
      map = new L.Map($container[0], {
            center: options.center || options.marker
          , zoom: options.zoom
          , scrollWheelZoom: options.scrollWheelZoom
      });
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: options.maxZoom
          , attribution: options.attribution
          , subdomains: options.subdomains
      }).addTo(map);
      
      
      marker = new L.marker(options.marker).addTo(map);
      if (options.label) marker.bindPopup(options.label).openPopup();
  })
}


// For conference and workshop schedule
//dateStr is expected in the format 2015-07-16", then returns "Thu Jul 16 2015"
var getDateString = function(dateStr) {
  var year = parseInt(dateStr.substr(0, 4), 10);
  var month = parseInt(dateStr.substr(5, 2), 10) - 1;
  var day = parseInt(dateStr.substr(8, 2), 10);
  var d = new Date();
  d.setFullYear(year,month,day);
  return d.toDateString();
}

//dateString is expected in the format "2014-07-24T11:30:00Z" returns time "11:30"
var getTimeString = function(dateString) {
  return dateString.substr(dateString.indexOf('T')+1,5);
}

var getHrMin = function(dateString) {
  var hr = dateString.substring(0, dateString.indexOf(":"));
  var min = dateString.substring(dateString.indexOf(":")+1);
  return [hr, min];
}

var getdateObject = function(hr, min) {
  var time = new Date();
  time.setHours(hr);
  time.setMinutes(min);
  return time;
}

var toTimeString = function(time) {
  return ((time.getHours() < 10 ? '0':'') + time.getHours()) + ':' + ((time.getMinutes() < 10 ? '0':'') + time.getMinutes());
}

//Input UTC, returns IST
var getIST = function(utcTime) {
  var hr = parseInt(getHrMin(utcTime)[0], 10) + 5;
  var min = parseInt(getHrMin(utcTime)[1], 10) + 30;
  var time = getdateObject(hr, min);
  ist = toTimeString(time);
  return ist;
}

var createTable = function(schedule) {
  var hr;
  var min;
  var startTime;
  var endTime;
  var slots;
  var slotTime;
  hr = getHrMin(schedule.start)[0];
  min = getHrMin(schedule.start)[1];
  startTime = getdateObject(hr, min);
  hr = getHrMin(schedule.end)[0];
  min = getHrMin(schedule.end)[1];
  endTime = getdateObject(hr, min);
  schedule.slots = [];
  do {
    slotTime = toTimeString(startTime);
    schedule.slots.push({slot: slotTime, issession: false, sessions: [], occupied: "empty"});
    startTime.setMinutes(startTime.getMinutes() + 5);
  }while(startTime <= endTime);
}

var getTotalMins = function(time) {
  var hr = parseInt(getHrMin(time)[0], 10);
  var min = parseInt(getHrMin(time)[1], 10);
  return (hr * 60) + min;
}

var getAudiTitle = function(roomName) {
  return roomName.substring(roomName.indexOf('/')+1).replace(/-/g, ' ')  + ", " + roomName.substring(0, roomName.indexOf('/')).replace(/-/g, ' ');
}

//roomName is "nimhans-convention-center/audi-1" return "AUDI-1"
var getShortAudiTitle = function(roomName) {
  return roomName.substring(roomName.indexOf('/')+1).replace(/-/g, ' ');
}

//audiName is AUDI-2 returns track 1.
var getTrack = function(audiName, rooms) {
  var index;
  for (index=0; index<rooms.length; index++) {
    if (rooms[index].name === audiName) {
      return rooms[index].track;
    }
  }
}

var pushSessions = function(emptyschedule, datapoints) {
  //Check if each session ends within slot if not add rowspan
  datapoints.forEach(function(slot, slotindex, slots) {
  var sessions = slot.sessions;
  sessions.forEach(function(session, sessionindex, sessions) {
    var sessionTime = getTotalMins(session.start);
    var sessionEndTime = getTotalMins(session.end);
    emptyschedule.slots.forEach(function(emptyscheduleSlot, emptyscheduleSlotIndex, emptyscheduleSlots) {
      //Check if the session start time is equal to time interval
      if (getTotalMins(emptyscheduleSlot.slot) === sessionTime) {
        emptyscheduleSlots[emptyscheduleSlotIndex].sessions.push(session);
        emptyscheduleSlots[emptyscheduleSlotIndex].issession = true;
      }
    });//eof schedule.slots
  }); //eof sessions loop
});//eof slots loop
}

var addRowSpan = function(schedule) {
  schedule.slots.forEach(function(slot, slotindex, slots) {
    if (slot.issession) {
      if (slot.sessions[0].track === 0 || slot.sessions[0].is_break) {
        slot.occupied = 0;
      }
      var sessions = slot.sessions;
      for(sessionindex = 0; sessionindex < sessions.length; sessionindex++) {
        var sessionEndTime = getTotalMins(sessions[sessionindex].end);
        var index = slotindex + 1;
        var rowspan = 1;
        var rows = false;
        for (index = slotindex + 1; index < slots.length; index++) {
          if (slots[index].issession === true && sessionEndTime <= getTotalMins(slots[index].sessions[0].start)) {
            break;
          }
          else if(slots[index].issession === true && sessionEndTime > getTotalMins(slots[index].sessions[0].start)) {
            rows = true;
            rowspan = rowspan + 1;
          }
        }
        if (rows) {
          schedule.slots[slotindex].sessions[sessionindex].rowspan = rowspan;
        }
      }
    }
  });//eof slots loop 
}

var checkColumns = function(schedule) {
  //Check if session have track 0 to maintain table
  for(var counter = 0; counter < schedule.slots.length; counter++) {
    if (schedule.slots[counter].issession && schedule.slots[counter].occupied !== 0) {
      //Check previous session extends till this one
      var found = false;
      for(j=counter-1; j>0; j--) {
        if(schedule.slots[j].issession && getTotalMins(schedule.slots[j].sessions[0].end) > getTotalMins(schedule.slots[counter].sessions[0].start)) {
          found = true;
        }
      }
      if (found === false) {
        //Add a empty track session
        var hr = parseInt(getHrMin(schedule.slots[counter].sessions[0].start)[0], 10);
        var min = parseInt(getHrMin(schedule.slots[counter].sessions[0].start)[1], 10) + 5;
        var time = getdateObject(hr, min);
        var endTime = toTimeString(time);
        schedule.slots[counter].sessions[1] = schedule.slots[counter].sessions[0];
        schedule.slots[counter].sessions[0] = {track: 'empty', start: schedule.slots[counter].sessions[1].start, end: endTime};
      }
    }
  }
}

var renderResponsiveTable = function() {
  $('td.tab-active').attr('colspan', 3);
}

var disableResponsiveTable = function() {
  $('td').not('.centered').attr('colspan', "");
}

var renderScheduleTable = function(schedules, eventType, divContainer) {
  schedules.forEach(function(schedule) {
    var tableTemplate = $('#scheduletemplate').html();

    if (eventType === 'conference') {
      $(divContainer).append(Mustache.render(tableTemplate, schedule));
      $(".schedule-table-container p.loadingtxt").hide();
    }
    else {
      $(divContainer).append(Mustache.render(tableTemplate, schedule));
      $(".schedule-table-container p.loadingtxt").hide();
    }
  });
  if ($(window).width() < 768){
    renderResponsiveTable();
  }
}

function parseJson(data, eventType, divContainer) {
  var schedules = data.schedule;
  var workshopSchedule = [];
  var conferenceSchedule = [];
  var conferenceScheduleCounter = 0;
  var workshopScheduleCounter = 0;
  //Create rows at 5min intervals
  schedules.forEach(function(eachSchedule, scheduleindex, schedules) {        
    var rooms = [];
    schedules[scheduleindex].date = getDateString(eachSchedule.date);
    schedules[scheduleindex].tableid = 'table-' + scheduleindex;

    //Type of schedule Conference/Workshop
    eachSchedule.slots.forEach(function(slot, slotindex, slots) {
      var sessions = slot.sessions;
      var startTime;
      var EndTime;
      //Start and end time in a schedule
      if (slotindex === 0) {
        schedules[scheduleindex].start = getIST(getTimeString(slot.sessions[0].start));
      }
      if (slotindex === slots.length-1) {
        schedules[scheduleindex].end = getIST(getTimeString(slot.sessions[sessions.length-1].end));
      }
      sessions.forEach(function(session, sessionindex, sessions) {
        //Type of schedule
        if (session.section_name && session.section_name.toLowerCase().indexOf('workshop') !== -1) {
          schedules[scheduleindex].type = 'workshop';
        }

        //Tracks or No:of auditorium
        if (session.room && (rooms.indexOf(session.room) === -1)) {
            rooms.push(session.room);
        }
        //set IST time
        schedules[scheduleindex].slots[slotindex].sessions[sessionindex].start = getIST(getTimeString(session.start));
        schedules[scheduleindex].slots[slotindex].sessions[sessionindex].end = getIST(getTimeString(session.end));
      }); //eof sessions loop

      if (schedules[scheduleindex].type !== 'workshop') {
        schedules[scheduleindex].type = 'conference';
      }
    }); //eof schedule.slots loop

    //Sort rooms
    rooms.sort();

    //Add title and track to each room. Eg: room: "nimhans-convention-center/audi-1", title: "Audi 1", track: 0
    rooms.forEach(function(room, index, rooms) {
      rooms[index] = { name: room, title: getAudiTitle(room), shorttitle: getShortAudiTitle(room), track: index};
    });
    schedules[scheduleindex].rooms = rooms;

    //Add track based on room of the session eg: Audi 1 track 0, Audi 2 track 1
    eachSchedule.slots.forEach(function(slot, slotindex) {
      var sessions = slot.sessions;
      sessions.forEach(function(session, sessionindex) {
        if(session.room) {
          schedules[scheduleindex].slots[slotindex].sessions[sessionindex].track = getTrack(session.room, rooms);
          schedules[scheduleindex].slots[slotindex].sessions[sessionindex].roomTitle = getAudiTitle(session.room)
        }
      });
    });

    if (schedules[scheduleindex].type === 'conference') {
      conferenceSchedule.push({date: schedules[scheduleindex].date, tableid: schedules[scheduleindex].tableid, rooms: schedules[scheduleindex].rooms, start: schedules[scheduleindex].start, end: schedules[scheduleindex].end});
      createTable(conferenceSchedule[conferenceScheduleCounter]);
      conferenceScheduleCounter += 1;
    }
    else {
      workshopSchedule.push({date:schedules[scheduleindex].date, rooms: schedules[scheduleindex].rooms, start: schedules[scheduleindex].start, end: schedules[scheduleindex].end});
      createTable(workshopSchedule[workshopScheduleCounter]);
      workshopScheduleCounter += 1;
    }
  });//eof schedules loop

  //Reset counters
  conferenceScheduleCounter = 0;
  workshopScheduleCounter = 0;

  schedules.forEach(function(schedule) {
    //Sort sessions based on track
    schedule.slots.forEach(function(slot, slotindex) {
      if (slot.sessions.length > 1) {
        slot.sessions.sort(function(session1, session2) {
            return session1.track - session2.track;
        });
      }
    });

    if (schedule.type === 'conference') {
      pushSessions(conferenceSchedule[conferenceScheduleCounter], schedule.slots);
      addRowSpan(conferenceSchedule[conferenceScheduleCounter]);
      checkColumns(conferenceSchedule[conferenceScheduleCounter]);
      conferenceScheduleCounter += 1;
    }
    else {
      pushSessions(workshopSchedule[workshopScheduleCounter], schedule.slots);
      addRowSpan(workshopSchedule[workshopScheduleCounter]);
      checkColumns(workshopSchedule[workshopScheduleCounter]);
      workshopScheduleCounter += 1;
    }
  }); //eof schedules loop

  if (eventType === 'conference') {
    renderScheduleTable(conferenceSchedule, 'conference', divContainer);
  } else {
    renderScheduleTable(workshopSchedule, 'workshop', divContainer);
  }
}

var updateFontSize = function(elem) {
  var fontStep = 1;
  var parentWidth = $(elem).width();
  var parentHeight = parseInt($(elem).css('max-height'), 10);
  var childElem = $(elem).find('span');
  while ((childElem.width() > parentWidth) || (childElem.height() > parentHeight)) {
    childElem.css('font-size', parseInt(childElem.css('font-size'), 10) - fontStep + 'px');
  }
};

var getElemWidth = function(elem) {
  var card_width = $(elem).css('width');
  var card_margin = $(elem).css('margin-left');
  var card_total_width = parseInt(card_width, 10) + 2.5 * parseInt(card_margin, 10);
  return card_total_width;
};

var enableScroll = function(items_length) {
  $(".mCustomScrollbar").css('width', items_length * getElemWidth(".proposal-card") + 'px');
  $('.mCustomScrollbar').mCustomScrollbar({ axis:"x", theme: "dark-3", scrollInertia: 10, alwaysShowScrollbar: 0});
};

function parseProposalJson(json) {
  var proposal_ractive = new Ractive({
    el: '#funnel-proposals',
    template: '#proposals-wrapper',
    data: {
      proposals: json.proposals
    },
    complete: function() {
      $.each($('.proposal-card .title'), function(index, title) {
        updateFontSize(title);
      });

      //Set width of content div to enable horizontal scrolling
      enableScroll(json.proposals.length);

      $(window).resize(function() {
        enableScroll(json.proposals.length);
      });

      $('#funnel-proposals .click, #funnel-proposals .btn').click(function(event) {
        var action = $(this).data('label');
        var target = $(this).data('target');
        Fifthel.sendGA('click', action, target);
      });
    }
  });
};


$(function() {

  $(window).resize(function() {
    if($(window).width() < 768) {
      renderResponsiveTable();
    }
    else{
      disableResponsiveTable();
    }
  });

  $('#fifconferenceschedule').on('click', 'table td .js-expand', function() {
    if($(this).hasClass('fa-caret-right')) {
      $(this).removeClass('fa-caret-right').addClass('fa-caret-down');
      $(this).parents('td').find('.description-text').slideDown();
    }
    else {
      $(this).removeClass('fa-caret-down').addClass('fa-caret-right');
      $(this).parents('td').find('.description-text').slideUp();
    }
  });

  $('#fifconferenceschedule').on('click', 'table th.track0, table th.track1, table th.track2', function() {
    if($(window).width() < 768){
      var parentTable = $(this).parents('table');
      var activeColumn = $(this).attr('data-td');
      parentTable.find('.tab-active').removeClass('tab-active');
      $(this).addClass('tab-active');
      parentTable.find('.' + activeColumn).addClass('tab-active');
      renderResponsiveTable();
    }
  });

    // Function that tracks a click button in Google Analytics.
  $('.button').click(function(event) {
    var button = $(this).html();
    var section = $(this).attr('href');
    Fifthel.sendGA('click', button, section);
  });

  $('.click').click(function(event) {
    var target = $(this).data('target');
    var action = $(this).data('label');
    Fifthel.sendGA('click', action, target);
  });

});

PHOTOS_LOCAL = [];
PHOTOS_FLICKR = [
'http://farm9.staticflickr.com/8446/7850944854_55de1df435_m.jpg',
'http://farm9.staticflickr.com/8299/7850948926_d7acc1cc44_m.jpg',
'http://farm9.staticflickr.com/8297/7850952986_9460410c49_m.jpg',
'http://farm9.staticflickr.com/8296/7850957196_6359109cb1_m.jpg',
'http://farm9.staticflickr.com/8290/7850961630_82131c7c1d_m.jpg',
'http://farm8.staticflickr.com/7130/7850966122_1a58f16e00_m.jpg',
'http://farm9.staticflickr.com/8430/7850970240_d59f63a401_m.jpg',
'http://farm9.staticflickr.com/8307/7850974470_8e4c571777_m.jpg',
'http://farm8.staticflickr.com/7135/7850978872_7b7d549bfa_m.jpg',
'http://farm8.staticflickr.com/7134/7850990320_a061bd8d1b_m.jpg',
'http://farm8.staticflickr.com/7117/7850983176_ec01276169_m.jpg',
'http://farm9.staticflickr.com/8304/7850997500_16b11e0ed7_m.jpg',
'http://farm9.staticflickr.com/8283/7851004294_0ed9c3f295_m.jpg',
'http://farm9.staticflickr.com/8441/7851008982_3c3bcb6ac7_m.jpg',
'http://farm9.staticflickr.com/8448/7851015118_83b03c0722_m.jpg',
'http://farm9.staticflickr.com/8446/7851017866_51ebe8597e_m.jpg',
'http://farm9.staticflickr.com/8286/7851020128_81a4c57cb8_m.jpg',
'http://farm9.staticflickr.com/8298/7851031584_62a464ac1f_m.jpg',
'http://farm9.staticflickr.com/8433/7851028042_f903d033d7_m.jpg',
'http://farm9.staticflickr.com/8430/7851037832_0de2a725c1_m.jpg',
'http://farm9.staticflickr.com/8426/7851048688_4a7cbc3ab9_m.jpg',
'http://farm9.staticflickr.com/8422/7851055024_a0fa0d7c3a_m.jpg',
'http://farm9.staticflickr.com/8443/7851064444_0517159140_m.jpg',
'http://farm9.staticflickr.com/8295/7851070394_48b6b75362_m.jpg',
'http://farm9.staticflickr.com/8284/7851077458_6b099c5351_m.jpg',
'http://farm9.staticflickr.com/8298/7851080332_15d14f9ae4_m.jpg',
'http://farm9.staticflickr.com/8285/7851083106_4d8f6d38e0_m.jpg',
'http://farm9.staticflickr.com/8281/7851085850_4e57b5b606_m.jpg',
'http://farm8.staticflickr.com/7251/7851088804_9784b1acc2_m.jpg',
'http://farm8.staticflickr.com/7253/7851091970_901e3da3eb_m.jpg',
'http://farm9.staticflickr.com/8291/7851095152_d4c600c916_m.jpg',
'http://farm9.staticflickr.com/8448/7851097762_8a05756c81_m.jpg',
'http://farm9.staticflickr.com/8296/7851100286_0d9eb81e6e_m.jpg',
'http://farm9.staticflickr.com/8283/7851103658_3c15a7ace2_m.jpg',
'http://farm8.staticflickr.com/7132/7851365784_7fce58e930_m.jpg',
'http://farm9.staticflickr.com/8424/7851106508_5ec378b7f8_m.jpg',
'http://farm8.staticflickr.com/7120/7851143550_5388c88518_m.jpg',
'http://farm8.staticflickr.com/7268/7851138166_7ed47020b1_m.jpg',
'http://farm8.staticflickr.com/7255/7851377938_3b5b355f9d_m.jpg',
'http://farm9.staticflickr.com/8437/7851383770_58892db617_m.jpg',
'http://farm9.staticflickr.com/8286/7851157746_49a815332b_m.jpg',
'http://farm8.staticflickr.com/7262/7851111486_586226009e_m.jpg',
'http://farm8.staticflickr.com/7273/7851114028_6970c3fbd3_m.jpg',
'http://farm9.staticflickr.com/8283/7851116856_573501b163_m.jpg',
'http://farm9.staticflickr.com/8289/7851349304_9fc35f6481_m.jpg',
'http://farm8.staticflickr.com/7257/7851343906_b2ddf03a93_m.jpg',
'http://farm9.staticflickr.com/8428/7851119170_40739859ee_m.jpg',
'http://farm8.staticflickr.com/7116/7851124528_614df420a4_m.jpg',
'http://farm9.staticflickr.com/8283/7851482530_e02af61012_m.jpg',
'http://farm9.staticflickr.com/8443/7851371182_75f00fc81a_m.jpg',
'http://farm9.staticflickr.com/8300/7851488760_401b108b2a_m.jpg',
'http://farm9.staticflickr.com/8287/7851375164_49d4dd57b0_m.jpg',
'http://farm9.staticflickr.com/8287/7851381156_55f5b6ce27_m.jpg',
'http://farm8.staticflickr.com/7253/7851386926_dcd0759ac8_m.jpg',
'http://farm9.staticflickr.com/8448/7851392298_ed46af6a98_m.jpg',
'http://farm9.staticflickr.com/8434/7850938012_0d289d078f_m.jpg',
'http://farm9.staticflickr.com/8306/7851396874_aa55eb8b9d_m.jpg',
'http://farm9.staticflickr.com/8290/7851389512_3327bb22fc_m.jpg',
'http://farm8.staticflickr.com/7272/7851128124_b2740e05d1_m.jpg',
'http://farm8.staticflickr.com/7121/7851474338_f73c5581ca_m.jpg',
'http://farm8.staticflickr.com/7275/7851494054_abcf890c70_m.jpg',
'http://farm9.staticflickr.com/8288/7851496382_b74db00be3_m.jpg',
'http://farm8.staticflickr.com/7124/7851333824_4e33b4d33b_m.jpg',
'http://farm9.staticflickr.com/8297/7851498518_0be425240c_m.jpg',
'http://farm9.staticflickr.com/8441/7851468786_425ebcca3f_m.jpg',
'http://farm9.staticflickr.com/8435/7851360194_1fab697a2b_m.jpg',
'http://farm9.staticflickr.com/8294/7851414282_07a48e4597_m.jpg',
'http://farm9.staticflickr.com/8304/7851426468_648fb31beb_m.jpg',
'http://farm9.staticflickr.com/8288/7851684168_5fd0f33f11_m.jpg',
'http://farm9.staticflickr.com/8441/7851687406_08ae114682_m.jpg',
'http://farm9.staticflickr.com/8442/7851693838_47de7213de_m.jpg',
'http://farm9.staticflickr.com/8285/7851433858_7ab28c39aa_m.jpg',
'http://farm9.staticflickr.com/8429/7851691658_1226a0b362_m.jpg',
'http://farm8.staticflickr.com/7255/7851700520_c3bd1ea413_m.jpg',
'http://farm8.staticflickr.com/7113/7851428468_a7eccb3d63_m.jpg',
'http://farm9.staticflickr.com/8436/7851442772_57dabd49b0_m.jpg',
'http://farm8.staticflickr.com/7274/7851449210_92ce4542e3_m.jpg',
'http://farm9.staticflickr.com/8429/7851454698_5d6feb4e37_m.jpg',
'http://farm9.staticflickr.com/8286/7851463298_97400448be_m.jpg',
'http://farm8.staticflickr.com/7122/7851715658_cd16369dda_m.jpg',
'http://farm9.staticflickr.com/8442/7851436022_a569c44c27_m.jpg',
'http://farm9.staticflickr.com/8432/7851479820_545e91971c_m.jpg',
'http://farm9.staticflickr.com/8295/7851407670_0f91a0e5bc_m.jpg',
'http://farm8.staticflickr.com/7106/7851132290_21fe64127f_m.jpg',
'http://farm8.staticflickr.com/7251/7851698638_bc758dffd0_m.jpg',
'http://farm8.staticflickr.com/7250/7851696316_d9041797c1_m.jpg',
'http://farm9.staticflickr.com/8298/7851704540_7567e01782_m.jpg',
'http://farm8.staticflickr.com/7262/7851707246_df4bff9fdc_m.jpg',
'http://farm9.staticflickr.com/8429/7851711522_b11bc627aa_m.jpg',
'http://farm9.staticflickr.com/8287/7851709410_2bdf057904_m.jpg',
'http://farm8.staticflickr.com/7254/7851702312_bea081c026_m.jpg',
'http://farm9.staticflickr.com/8298/7851689694_99ab316729_m.jpg',
'http://farm9.staticflickr.com/8006/7851146308_8f37bb46b2_m.jpg',
'http://farm9.staticflickr.com/8295/7851148898_6238c9a093_m.jpg',
'http://farm9.staticflickr.com/8444/7851739960_ed1da08456_m.jpg',
'http://farm8.staticflickr.com/7272/7851152752_186cf5fa2a_m.jpg',
'http://farm8.staticflickr.com/7122/7851338450_4361422784_m.jpg',
'http://farm9.staticflickr.com/8302/7851162496_2b6fc9c0b8_m.jpg',
'http://farm8.staticflickr.com/7133/7851341292_38411a90ca_m.jpg',
'http://farm9.staticflickr.com/8305/7851354468_a9ae462eb1_m.jpg',
'http://farm9.staticflickr.com/8426/7851401978_a18a524f1c_m.jpg',
'http://farm9.staticflickr.com/8287/7851681894_e68d068621_m.jpg',
'http://farm9.staticflickr.com/8306/7851679712_bd63a3409d_m.jpg',
'http://farm9.staticflickr.com/8290/7851507174_8d552f4a75_m.jpg',
'http://farm9.staticflickr.com/8296/7851722220_e7aeba2540_m.jpg',
'http://farm9.staticflickr.com/8428/7851726492_038ec81ac9_m.jpg',
'http://farm9.staticflickr.com/8442/7851759994_641c0a84c3_m.jpg',
'http://farm9.staticflickr.com/8439/7851747140_f384d2219d_m.jpg',
'http://farm8.staticflickr.com/7109/7851753196_e889d670a8_m.jpg',
'http://farm8.staticflickr.com/7107/7851501142_878c1a04c5_m.jpg',
'http://farm9.staticflickr.com/8424/7688132050_2c6cfc18dc_m.jpg',
'http://farm9.staticflickr.com/8011/7688086620_7aae28683e_m.jpg',
'http://farm9.staticflickr.com/8431/7688036160_139cda9fc2_m.jpg',
'http://farm9.staticflickr.com/8433/7688003786_0657522ec6_m.jpg',
'http://farm9.staticflickr.com/8154/7687958018_a5a47c9953_m.jpg',
'http://farm8.staticflickr.com/7129/7687905504_6b0af61fb7_m.jpg',
'http://farm8.staticflickr.com/7135/7687863004_cf137820ab_m.jpg',
'http://farm8.staticflickr.com/7117/7687822430_3eaf373d29_m.jpg',
'http://farm9.staticflickr.com/8285/7687765084_b8e0dcee3a_m.jpg',
'http://farm9.staticflickr.com/8287/7687730192_924531f160_m.jpg',
'http://farm8.staticflickr.com/7107/7687685402_a8840654de_m.jpg',
'http://farm8.staticflickr.com/7273/7687638954_036a32806f_m.jpg',
'http://farm8.staticflickr.com/7251/7687594136_4d1af10c5f_m.jpg',
'http://farm8.staticflickr.com/7132/7687475424_28779f562b_m.jpg',
'https://c1.staticflickr.com/1/458/19252146334_3109b295d7_k.jpg',
'https://c1.staticflickr.com/4/3757/19879803601_aed9914844_k.jpg',
'https://c1.staticflickr.com/9/8421/28383240770_e839263faf_k.jpg',
'https://c1.staticflickr.com/8/7730/29092804650_2eb2ac7a4f_k.jpg',
'https://c1.staticflickr.com/9/8620/28382586260_201c5ca21a_k.jpg',
'https://c1.staticflickr.com/9/8628/28667014855_3417c3d430_k.jpg',
'https://c1.staticflickr.com/9/8322/28756564384_a99d5b1822_k.jpg'
];

PHOTOS = PHOTOS_FLICKR;

$(main)
