$(document).ready(function() {
    // "map" is the file name of the original shp file
    var features = topojson.feature(mapdata, mapdata.objects["map"]).features;

    var color = d3.scaleLinear().domain([0, 3000]).range(["#090", "#f00"]);

    // variables to display Taiwan map
    var width = 300,
        height = 450;
    var svg = d3.select("body").selectAll("div[name='info_div']").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0, 0, 350, 450");
    var path = d3.geoPath().projection( // path generator
        d3.geoMercator().center([124, 24]).scale(4500) // coordinate translate function
    );

    d3.selectAll("svg").selectAll("path").data(features)
        .enter().append("path")
        .attr("d", path);

    // parse data
    d3.text("data.csv", function(data) {
        var new_data = data.slice(data.indexOf("\n") + 1);
        var parse_data = d3.csvParse(new_data);
        // set the map color
        for (var i = features.length - 1; i >= 0; i--) {
            var index = "老年人口依賴比 / " + features[i].properties.COUNTYNAME + " ";
            features[i].properties.old_people = parse_data[parse_data.length - 1][index].replace(" ","");
        }

        display_aged_map();
        display_aged_pie();
    });

    //parse nuring house data
    d3.text("nursing_house.csv", function(data){
        var parse_data = d3.csvParse(data);
        var total_staff_data = new Object();
        parse_data.forEach(function(row){
            var split_str = row["年　及　地　區　別"].split("　");
            if(split_str.length < 4)
                return; // replace continue
            total_staff_data[split_str[2].replace(" ", "")] = row["總計"];
        });

        for (var i = features.length - 1; i >= 0; i--) {
            features[i].properties.nursing_house = total_staff_data[features[i].properties.COUNTYNAME];
        }

        display_nursing_house();
    });

    function display_aged_map() {
        d3.select("svg").selectAll("path").data(features)
            .attr("d", path)
            .attr("fill", function(d) {
                return color(d.properties.old_people * 100);
            })
            .on("mouseover", function(d) {
                display_county_cond(d);
            });
    }

    function display_nursing_house(){
        d3.select($("div[name='info_div']")[1]).select("svg").selectAll("path").data(features)
            .attr("d", path)
            .attr("fill", function(d) {
                return color(d.properties.nursing_house);
            })
            .on("mouseover", function(d) {
                display_county_cond(d);
            });
    }

    function display_county_cond(d) {
        $("#county_name").text(d.properties.COUNTYNAME);
        $("#old_people").text(d.properties.old_people);
        $("#nursing_house").text(d.properties.nursing_house);
    }

    // pie chart setup
    function display_aged_pie(){
        var pie_color = d3.scaleOrdinal()
            .domain(features.map(function(d) {return d.properties.COUNTYNAME}))
            .range(["#0a72ff", "#1eff06", "#ff1902", "#2dfefe",
                    "#827c01", "#fe07a6", "#a8879f", "#fcff04",
                    "#c602fe", "#16be61", "#ff9569", "#05b3ff",
                    "#ecffa7", "#3f8670", "#e992ff", "#ffb209",
                    "#e72955", "#83bf02", "#bba67b", "#fe7eb1",
                    "#7570c1", "#85bfd1"]);
        var pie_width = 200, pie_height = 200;
        var outer_radius = pie_width/2, inner_radius = 0;

        var arc = d3.arc().innerRadius(inner_radius).outerRadius(outer_radius);
        var label_arc = d3.arc().innerRadius(outer_radius - 5).outerRadius(outer_radius + 50);

        var pie = d3.pie()
            .sort(null)
            .value(function(d) {console.log(d.properties.old_people);return d.properties.old_people * 100});

        var pie_svg = d3.select("div[name='pie_div']").select("div.row").append("svg")
            .attr("width", pie_width + 100)
            .attr("height", pie_height + 100)
            .attr("transform", "translate(" + (pie_width + 100)/2 + ", " + (pie_height + 100)/2 + ")");

        var g = pie_svg.selectAll(".arc")
            .data(pie(features))
            .enter().append("g")
            .attr("class", "arc");
        g.append("path")
            .attr("d", arc)
            .attr("fill", function(d) {return pie_color(d.data.properties.COUNTYNAME)});
        g.append("text")
            .attr("transform", function(d) {
                var mid_angle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI;
                return "translate(" + label_arc.centroid(d) + ") rotate(-90) rotate(" + (mid_angle * 180/Math.PI) + ")";
            })
            .attr("dy", ".35em")
	        .attr('text-anchor','middle')
            .text(function(d) {return d.data.properties.COUNTYNAME})
    }
});
