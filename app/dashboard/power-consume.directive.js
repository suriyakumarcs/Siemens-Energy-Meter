(function() {
    'use strict';
    angular.module('app.dashboard')
        .directive('powerConsume', powerConsume);

        powerConsume.$inject = [];
    function powerConsume() {
        return { 
            restrict: 'A',
            scope: {
                consumtionList: '='
            },
            link: function(scope, element, attributes) {
                var generateAxisFormat = function (axisList) {
                    var result = [];
                    _.mapObject(axisList, function (data, key) {                    
                        var obj = {};
                        obj.date = d3.timeParse('%m/%d/%Y')(data.date);
                        obj.value = data.value;
                        result.push(obj);
                    });
                    return result;
                }

                var render = function() {
                    var consumeTile = d3.select('#consumtion-element');
                    var width = parseInt(consumeTile.style('width'));
    
                    var x = d3.scaleBand().range([30, width-30]).padding(0.2);
                    var y = d3.scaleLinear().range([260, 60]);
    
                    //Draw axis
                    var consumtionMetrics = scope.consumtionList;
                    var totalAxisValues = [];
                    _.each(consumtionMetrics.currentConsumtion, function(data) {
                        totalAxisValues.push(data);
                    });
                    _.each(consumtionMetrics.predicitiveConsumtion, function(data) {
                        totalAxisValues.push(data);
                    });
                    var axisData = [];
                    var currentAxisData = [];
                    var predictiveAxisData = [];
                    axisData = generateAxisFormat(totalAxisValues);
                    currentAxisData = generateAxisFormat(consumtionMetrics.currentConsumtion);
                    predictiveAxisData = generateAxisFormat(consumtionMetrics.predicitiveConsumtion);
                    
                    x.domain(axisData.map(function(d) { return d.date; }));
                    y.domain([3, d3.max(axisData, function(d) { return d.value; })]);
                    var xAxis = d3.axisBottom(x).tickFormat(function (d) {
                        return d3.timeFormat(("%b '%y"))(d);
                    });
                    var yAxis = d3.axisLeft(y).tickFormat(function (d) {
                        return d3.format('.2s')(d) + 'Wh';
                    });
                    consumeTile.select('.axis').selectAll('g').remove();
                    consumeTile.select('.axis').append('g').attr('class', 'x-axis')
                        .attr('transform', 'translate(15, 260)').call(xAxis);
                    consumeTile.select('.axis').append('g').attr('class', 'x-axis')
                        .attr('transform', 'translate(45, -6)').call(yAxis);
                    
                    // var line = d3.line().x(function(data) { return x(data.date); })
                    //                 .y(function(data){ return y(data.value); });
                    // consumeTile.select('.solid-line').attr('d', line(currentAxisData));
                    // consumeTile.select('.dotted-line').attr('d', line(predictiveAxisData));

                    var barchart = consumeTile.select('.consumption-bar-chart');

                    //Current axis bar charts
                    barchart.selectAll('.bar').data(currentAxisData)
                        .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", function(d) { return x(d.date); })
                        .attr("y", function(d) { return y(d.value); })
                        .attr("width", x.bandwidth())
                        .attr("height", function(d) { return 260 - y(d.value); })
                        .attr("fill", "#2dabff");
                    
                    

                    //Predicted bar charts

                    barchart.selectAll('.predicted-bar').data(predictiveAxisData)
                        .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", function(d) { return x(d.date); })
                        .attr("y", function(d) { return y(d.value); })
                        .attr("width", x.bandwidth())
                        .attr("height", function(d) { return 260 - y(d.value); })
                        .attr("fill", "#fff")
                        .attr("style", "stroke: #2dabff;stroke-width: 1");
                    // function mousemove() {
                    //     var consumeFocus = consumeTile.select('.consume-focus')
                    //     consumeFocus.style("display", null);
                    //     var bisectDate = d3.bisector(function(d) { return d.date; }).left;
                    //     var x0 = x.invert(d3.mouse(this)[0]),
                    //         i = bisectDate(axisData, x0, 1),
                    //         d0 = axisData[i - 1],
                    //         d1 = axisData[i],
                    //         d = x0 - d0.date > d1.date - x0 ? d1 : d0;                        
                    //     consumeFocus.select('.consume-focus-point').attr('cx', x(d.date))
                    //                 .attr('cy', y(d.value));
                    //     consumeFocus.select('.consume-focus-container').attr('x', x(d.date) - 10)
                    //         .attr('y', y(d.value) - 45);
                    //     consumeFocus.select('.consume-focus-date').attr('x', x(d.date) - -25)
                    //         .attr('y', y(d.value) - 30)
                    //         .text(d3.timeFormat('%b,%Y')(d.date));
                    //     consumeFocus.select('.consume-focus-text').attr('x', x(d.date) - -25)
                    //         .attr('y', y(d.value) - 20)
                    //         .text(d3.format('.2s')(d.value) + 'Wh');

                    // }

                    // consumeTile.select('.consume-pointer').attr('width',width-60)
                    //             .on('mousemove',mousemove);
                }
                
                

                scope.$watch("consumtionList", function(consumtionList) {
                    if(consumtionList) {
                        render();
                    }
                });
            }
        }
    }
})();