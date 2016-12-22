$(document).ready(function() {
    // "map" is the file name of the original shp file
    var features = topojson.feature(mapdata, mapdata.objects["map"]).features;

    var color = d3.scaleLinear().domain([0, 3000]).range(["#090", "#f00"]);

    // variables to display Taiwan map
    var width = 600,
        height = 450;
    var svg = d3.select("body").selectAll("div[name='info_div']").append("svg")
        .attr("width", width)
        .attr("height", height);
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
            features[i].properties.old_people = parse_data[parse_data.length - 1][index];
        }

        display_aged_map();
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
                $("#old_name").text(d.properties.COUNTYNAME);
                $("#old_people").text(d.properties.old_people);
            });
    }

    function display_nursing_house(){
        d3.select($("svg")[1]).selectAll("path").data(features)
            .attr("d", path)
            .attr("fill", function(d) {
                console.log(d);
                return color(d.properties.nursing_house);
            })
            .on("mouseover", function(d) {
                $("#house_name").text(d.properties.COUNTYNAME);
                $("#nursing_house").text(d.properties.nursing_house);
            });
    }
});
