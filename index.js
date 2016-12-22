$(document).ready(function(){
    // "map" is the file name of the original shp file
    var features = topojson.feature(mapdata, mapdata.objects["map"]).features;

    // variables to display Taiwan map
    var width = 600, height = 450;
    var svg = d3.select("body").select("div[id='old_people_div']").append("svg")
        .attr("width", width)
        .attr("height", height);
    var path = d3.geoPath().projection( // path generator
        d3.geoMercator().center([124,24]).scale(4500) // coordinate translate function
    );

    // parse data
    d3.text("data.csv", function(data){
        var new_data = data.slice(data.indexOf("\n") + 1);
        var parse_data = d3.csvParse(new_data);
        // set the map color
        for(var i = features.length - 1; i >= 0; i--){
            var index = "老年人口依賴比 / " + features[i].properties.COUNTYNAME + " ";
            features[i].properties.old_people = parse_data[parse_data.length - 1][index];
        }

        var color = d3.scaleLinear().domain([0,3000]).range(["#090","#f00"]);
        d3.select("svg").selectAll("path").data(features).enter().append("path")
            .attr("d",path)
            .attr("fill", function(d){
                return color(d.properties.old_people * 100);
            })
            .on("mouseover", function(d){
                $("#name").text(d.properties.COUNTYNAME);
                $("#old_people").text(d.properties.old_people);
            });
    });
});
