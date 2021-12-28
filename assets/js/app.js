
// svg container
var svgWidth = 960;
var svgHeight = 500;

// margins
var margin = {
    top: 20,
    right : 40,
    bottom : 80,
    left : 80
};

// chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// create an SVG container
var svg = d3.select("#scatter").append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// append an SVG group that will hold the chart, and shift the latter by left and top margins.
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// initial params- default axes
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";



// function used for updating x-scale upon click on axis label
function xScale(stateData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenXAxis]*0.9),
        d3.max(stateData, d => d[chosenXAxis]*1.1)])
        .range([0, chartWidth]);

    return xLinearScale;
}    
 
function yScale(stateData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d =>d[chosenYAxis]*0.8),
        d3.max(stateData, d => d[chosenYAxis]*1.2)])
        .range([chartHeight, 0]);

    return yLinearScale;
}

// function used for updating xAxis upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
       .duration(1000)
       .call(bottomAxis);

    return xAxis;
}

// function used for updating xAxis upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
       .duration(1000)
       .call(leftAxis);

    return yAxis;
}


//  function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;    
}

function renderTexts( textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;    
}


//  function used for updating tooltip for circles group
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xLabel = "";
    var yLabel = "";

    if (chosenXAxis === "poverty") {
        xLabel = "Poverty: ";
    }
    else if (chosenXAxis === "age") {
        xLabel = "Age: ";
    }
    else {
        xLabel = "Income: $"
    }
    
    if (chosenYAxis === "healthcare") {
        yLabel = "Healthcare: ";
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smokes: ";
    }
    else {
        yLabel = "Obesity: "
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            if (chosenYAxis === "smokes" || chosenYAxis === "obesity") {
                if (chosenXAxis === "poverty"){
                  return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXAxis]}%<br>${yLabel}${d[chosenYAxis]}%`)
                }
                else {
                  return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXAxis]}<br>${yLabel}${d[chosenYAxis]}%`)
                }
                
              }
              else if (chosenXAxis === "age"){
                return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXAxis]}%<br>${yLabel}${d[chosenYAxis]}`)
              }
              else{
                return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXAxis]}<br>${yLabel}${d[chosenYAxis]}`)
              }  
            })

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
        d3.select(this).style("stroke", "black");
    })
    
    circlesGroup.on("mouseout", function(data, index) {
        toolTip.hide(data, this);
        d3.select(this).style("stroke", "white");
    });
    return circlesGroup;

}

// import data
d3.csv("assets/data/data.csv").then(function(stateData) {

    // Parse Data to integer from string
    stateData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    // xLinear scale function after csv import
    var xLinearScale = xScale(stateData, chosenXAxis);

    // yLinearScale after importing csv 
    var yLinearScale = yScale(stateData, chosenYAxis);
        
    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //  Append X-axis to the chart
    var xAxis = chartGroup.append("g")
                   .classed("x-axis", true)
                   .attr("transform", `translate(0, ${chartHeight})`)
                   .call(bottomAxis);
       
    var yAxis = chartGroup.append("g")
                   .classed("y-axis", true)
                   .call(leftAxis);

    var crlTxtGroup = chartGroup.selectAll("txtcircles")
                   .data(stateData)
                   .enter()
                   .append("g");
 
    var circlesGroup = crlTxtGroup.append("circle")
                         .attr("cx", d=>xLinearScale(d[chosenXAxis]))
                         .attr("cy", d=>yLinearScale(d[chosenYAxis]))
                         .classed("stateCircle", true)
                         .attr("r", "15")
                         .attr("opacity", "2");
 
    var textGroup = crlTxtGroup.append("text")
                           .text(d=>d.abbr)
                           .attr("x", d=>xLinearScale(d[chosenXAxis]))
                           .attr("y", d=>yLinearScale(d[chosenYAxis])+5)
                           .classed("stateText", true)
                           .style("font-size", "9px")
                           .style("font-weight", "600");


     // Create group for  3 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
                                .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20 + margin.top})`);
    
    // Create group for  3 y- axis labels
    var ylabelsGroup = chartGroup.append("g")
                                .attr("transform", `translate(${0-margin.left/4}, ${chartHeight/2})`);

    var povertyLabel = xlabelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 0)
                                .attr("value", "poverty") // value to grab for event listener
                                .classed("active", true)
                                .classed("aText", true)
                                .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 20)
                                .attr("value", "age") // value to grab for event listener
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 40)
                                .attr("value", "income") // value to grab for event listener
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Household Income (Median)");
    
    var healthCareLabel = ylabelsGroup.append("text")
                                .attr("y", 0 - 20)
                                .attr("x", 0)
                                .attr("transform", "rotate(-90)")
                                .attr("dy", "1em")
                                .attr("value", "healthcare")
                                .classed("active", true)
                                .classed("aText", true)
                                .text("Lacks Healthcare (%)");
    
    var smokeLabel = ylabelsGroup.append("text")
                                .attr("y", 0 - 40)
                                .attr("x", 0)
                                .attr("transform", "rotate(-90)")
                                .attr("dy", "1em")
                                .attr("value", "smokes")
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Smokes (%)");
                                
    var obesityLabel = ylabelsGroup.append("text")
                                .attr("y", 0 - 60)
                                .attr("x", 0)
                                .attr("transform", "rotate(-90)")
                                .attr("dy", "1em")
                                .attr("value", "obesity")
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Obese (%)");

    // updateToolTip function after csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        console.log(`${value} click`)
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;
            console.log(chosenXAxis);

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(stateData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

             // updates texts with new x values
            textGroup = renderTexts(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "age"){
              povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
              ageLabel
                  .classed("active", true)
                  .classed("inactive", false);
              incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
            }
            else{
              povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);  
            }
          // update tooltip with new info after changing x-axis 
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup); 
      }})
// y axis labels event listener
ylabelsGroup.selectAll("text")
.on("click", function() {
// get value of selection
var value = d3.select(this).attr("value");
console.log(`${value} click`);
if (value !== chosenYAxis) {

    // replaces chosenXAxis with value
    chosenYAxis = value;
    console.log(chosenYAxis);

    // functions here found above csv import
    // updates x scale for new data
    yLinearScale = yScale(stateData, chosenYAxis);

    // updates x axis with transition
    yAxis = renderYAxes(yLinearScale, yAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

     // updates texts with new x values
    textGroup = renderTexts(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

    // changes classes to change bold text
    if (chosenYAxis === "healthcare") {
      healthCareLabel
            .classed("active", true)
            .classed("inactive", false);
      smokeLabel
            .classed("active", false)
            .classed("inactive", true);
      obesityLabel
            .classed("active", false)
            .classed("inactive", true);
    }
    else if (chosenYAxis === "smokes") {
      healthCareLabel
          .classed("active", false)
          .classed("inactive", true);
      smokeLabel
          .classed("active", true)
          .classed("inactive", false);
      obesityLabel
          .classed("active", false)
          .classed("inactive", true);
    }
    else {
      healthCareLabel
            .classed("active", false)
            .classed("inactive", true);
      smokeLabel
            .classed("active", false)
            .classed("inactive", true);
      obesityLabel
            .classed("active", true)
            .classed("inactive", false);  
    }
     // update tooltip with new info after changing y-axis 
     circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup); 
  }})

});                  
                       
                           

                           
       

    
   





            
