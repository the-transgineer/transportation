
//  all config objects must pass through q or data will be assigned to wrong objects

var t_options = {
    ease : d3.easeQuad,
    duration : 500
};

var today = new Date();
var month = today.getMonth();
var year = today.getFullYear();
var fiscal_year = year;

if (month > 10) {  // if month is later than september
    fiscal_year = year + 1;
}

var formats = {
    'round': function(val) { return Math.round(val) },
    'formatDateTime' : d3.timeFormat("%e %b %-I:%M%p"),
    'formatDate' : d3.timeFormat("%x"),
    'formatTime' : d3.timeFormat("%I:%M %p"),
    'thousands' : d3.format(",")
};

var pub_log_id = 'i9se-t8hz';

var q = d3.queue();

var config = [

      {
        'id' : 'traffic_signals',
        'display_name' : 'Traffic Signals',
        'icon' : 'car',
        'init_val' : 0,
        'format' : 'round',
        'infoStat' : true,
        'caption' : 'Turned On',
        'query' : 'SELECT COUNT(signal_type) as count WHERE signal_type IN ("TRAFFIC") AND signal_status IN ("TURNED_ON") limit 9000',
        'resource_id' : 'xwqn-2f78',
        'data_transform' : function(x) { return( [x[0]['count']] )},
        'update_event' : 'signals_update'
    },{
        'id' : 'phbs',
        'display_name' : 'Pedestrian Beacons',
        'icon' : 'male',
        'init_val' : 0,
        'format' : 'round',
        'infoStat' : true,
        'caption' : '',
        'query' : 'SELECT COUNT(signal_type) as count WHERE signal_type IN ("PHB") AND signal_status IN ("TURNED_ON") limit 9000',
        'resource_id' : 'xwqn-2f78',
        'data_transform' : function(x) { return( [x[0]['count']] )},
        'update_event' : 'signals_update'
    },
    {
        'id' : 'cameras',
        'display_name' : 'CCTV',
        'icon' : 'video-camera',
        'init_val' : 0,
        'format' : 'round',
        'infoStat' : true,
        'caption' : '',
        'query' : 'SELECT COUNT(camera_status) as count where upper(camera_mfg) not in ("GRIDSMART") and camera_status in ("TURNED_ON")',
        'resource_id' : 'fs3c-45ge',
        'data_transform' : function(x) { return( [x[0]['count']] )},
        'update_event' : 'cameras_update'
    },
    {
        'id' : 'sensors',
        'display_name' : 'Travel Sensors',
        'icon' : 'rss',
        'init_val' : 0,
        'format' : 'round',
        'data' : [145],
        'infoStat' : true,
        'caption' : '',
        'query' : 'SELECT COUNT(sensor_type) as count WHERE sensor_status in ("TURNED_ON")',
        'resource_id' : 'wakh-bdjq',
        'data_transform' : function(x) { return( [x[0]['count']] )},
        'update_event' : 'travel_sensors_update'
    },
    {
        'id' : 'signals-on-flash',
        'display_name' : 'Signals on Flash',
        'icon' : 'exclamation-triangle',
        'init_val' : 0,
        'format' : 'round',
        'data' : [0],
        'infoStat' : true,
        'caption' : '',
        'query' : 'select COUNT(signal_id) as count',
        'resource_id' : '5zpr-dehc',
        'data_transform' : function(x) { return( [x[0]['count']] )},
        'update_event' : 'signal_status_update'
    },
    {
        'id' : 'signal-timing',
        'display_name' : 'Signals Re-Timed',
        'icon' : 'clock-o',
        'init_val' : 0,
        'format' : 'round',
        'data' : [140],
        'infoStat' : true,
        'caption' : '',
        'query' : 'SELECT SUM(signal_count) as count WHERE retime_status IN ("COMPLETED") and scheduled_fy in ("' + fiscal_year + '")',
        'resource_id' : 'ufnm-yzxy',
        'data_transform' : function(x) { return( [x[0]['count']] )},
        'update_event' : 'signal_retiming_update'
    },
    {
        'id' : 'prev_maint',
        'display_name' : 'Preventative Maintenance',
        'icon' : 'medkit',
        'init_val' : 0,
        'format' : 'round',
        'infoStat' : true,
        'caption' : 'Turned On',
        'query' : 'SELECT COUNT(pm_max_fiscal_year) as count WHERE pm_max_fiscal_year IN ("' + fiscal_year + '")',
        'resource_id' : 'xwqn-2f78',
        'data_transform' : function(x) { return( [x[0]['count']] )},
        'update_event' : 'signals_update'
    },
    {
        'id' : 'school-beacons',
        'display_name' : 'School Beacons',
        'icon' : 'bus',
        'init_val' : 0,
        'format' : 'round',
        'data' : [537],
        'infoStat' : true,
        'caption' : '',
        'update_event' : undefined
    }
    // {
    //     'id' : 'bcycle-trips',
    //     'display_name' : 'B-Cycle Trips',
    //     'icon' : 'bicycle',
    //     'init_val' : 0,
    //     'format' : 'round',
    //     'infoStat' : true,
    //     'resource_id' : 'cwi3-ckqi',
    //     'caption' : '',
    //     'query' : function(){
    //         var d = new Date();
    //         var n = d.getMonth();  //  last month's data
    //         var y = d.getFullYear().toString();
    //         var monthyear = n.toString() + y; 
    //         return 'select count(*), month||year as monthyear where monthyear in ("' + monthyear + '") group by monthyear'
    //     }(),
    //     'data_transform' : function(x) { return x[0]['count'] },
    //     'update_event' : undefined
    // }
];



$(document).ready(function(){

    $('[data-toggle="popover"]').popover();

    for (var i = 0; i < config.length; ++i) {

        config[i].panel = createPanel('panel-row', config[i].id, config[i].icon, config[i].display_name)

    }

    for (var i = 0; i < config.length; ++i) {

        if ( 'resource_id' in config[i] ) {

            var url = buildSocrataUrl(config[i]);

            var id = config[i].id;

            console.log(url);

            q.defer(d3.json, url)

        }

    $(function() {
        $('.dash-panel-header-container').matchHeight();
        $('.dash-panel').matchHeight();
    });

    }


    q.awaitAll(function(error) {

        if (error) throw error;

        for ( var i = 0; i < arguments[1].length; i++ ) {
            
            if ('data_transform' in config[i]) {
                config[i].data = config[i].data_transform( arguments[1][i] );    
            } else {
                config[i].data = arguments[1][i];
            }
        }

        main(config);

    });
});



function buildSocrataUrl(data) {

    var resource_id = data.resource_id;
    
    var url = 'https://data.austintexas.gov/resource/' + resource_id + '.json';

    if (data.query) {

        url = url + '?$query=' + data.query;

    }
    
    return url;
}



function main(data) {
    console.log(data);

    var infos = appendInfoText(data);

    var infos = transitionInfoStat(infos, t_options, 'TURNED_ON' );

    for (var i = 0; i  < config.length; i++ ) {

        var divId = config[i].id;
        
        var selection = d3.select("#" + divId);

        var event = config[i].update_event;

        postUpdateDate(selection, pub_log_id, event);

    }

     d3.csv('https://raw.githubusercontent.com/cityofaustin/transportation/gh-pages/components/data/quote_of_the_week.csv', function(error, data) {

        //  http://stackoverflow.com/questions/11488194/how-to-use-d3-min-and-d3-max-within-a-d3-json-command
        var most_recent = d3.entries(data).sort(function(a, b) { return d3.descending(a.quote_date, b.quote_date); })[0]

        var most_recent = most_recent.value;
        
        var quote = d3.select("#quote").text(most_recent.quote);

        var attribution = d3.select("#attribution").text(most_recent.attribution);
    })

 
}




function appendInfoText(data) {

    d3.selectAll('.loading').remove();

    var selection = d3.selectAll('.info')
        .data(data)
        .append('text')
        .text(function(d) {
            return d.init_val;
        });

    return selection;

}


function transitionInfoStat(selection, options) {

    var t = d3.transition()
        .ease(options.ease)
        .duration(options.duration);

    selection.transition(t)  //  do this for each selection in sequence
        .tween('text', function () {
            
            var that = d3.select(this);

            var new_data = that.data()[0].data;
            
            var format = that.data()[0].format;

            var i = d3.interpolate(0, new_data[0]);
            
            return function (t) {
            
                that.text( formats[format](i(t)) );  // how to access the format type from the 'this' data?
            
            }

        });

    return selection;

}



function postUpdateDate(selection, resource_id, event) {
    
    var url = 'https://data.austintexas.gov/resource/' + resource_id + '.json?$select=timestamp&$where=event=%27' + event + '%27&$order=timestamp+DESC&$limit=1';

    if (event) {
        
        $.ajax({
            'async' : false,
            'global' : false,
            'cache' : false,
            'url' : url,
            'dataType' : "json",
            'success' : function (data) {
                var update_date_time = new Date(data[0].timestamp * 1000);

                update_date = readableDate( update_date_time );

                selection.append('h5')
                    .attr("class", "dash-panel-footer-text")
                    .html("Updated " + update_date +
                        " | <a href=" + 'empty' + " target='_blank'> Data <i  class='fa fa-download'></i> </a>"
                );
            }
        });

    } else {

        selection.append('h5')
            .attr("class", "dash-panel-footer-text")
            .html("<a href=" + 'empty' + " target='_blank'> Data <i  class='fa fa-download'></i> </a>");
    }



    return;
}  



function readableDate(date) {

    var update_date = formats.formatDate(date);
    
    var today = formats.formatDate( new Date() );

    if (update_date == today) {
    
        return "today";
    
    } else {
    
        return update_date;
    
    }
}



function createPanel(container_id, panel_id, panel_icon, panel_name) {

    var panel = d3.select("#" + container_id)
        .append("div")
        .attr("class", "col-sm-2 dash-panel-container")
        .append("div")
        .attr("class", "info info-small dash-panel")
        .attr("id", panel_id);


    panel.append('div')
        .attr('class', 'dash-panel-header-container')
            .append("h4")
            .attr("class", "dash-panel-header")
            .html("<i class='fa fa-" + panel_icon + "' ></i> " + panel_name)

    panel.append("p").attr("class", "loading").text("Loading...");

    return panel;
              
}


//  https://data.austintexas.gov/resource/cwi3-ckqi.json?$query=select count(*), month||year as monthyear where monthyear in ("52017") group by monthyear

