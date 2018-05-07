(function() {
    'use strict';
    angular.module('app.dashboard')
        .directive('meterStatus', meterStatus);

        meterStatus.$inject = [];
    function meterStatus() {
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
                        obj.online = data.online;
                        obj.offline = data.offline;
                        obj.predictedOnline = data.predictedOnline;
                        obj.predictedOffline = data.predictedOffline;
                        result.push(obj);
                    });
                    return result;
                }

                var generateAxisValuesFormat = function (axisList) {
                    var result = [];
                    _.mapObject(axisList, function (data, key) {                    
                        var obj = {};
                        obj.date = d3.timeParse('%m/%d/%Y')(data.date);
                        obj.online = data.online;
                        obj.offline = data.offline;                        
                        result.push(obj);
                    });
                    return result;
                }
                var render = function() {
                    var statusTile = d3.select('#' + attributes.id);
                    var width = parseInt(statusTile.style('width'));
                    // var offlineFocus = statusTile.select('.consume-focus-offline');
                    var x0 = d3.scaleBand().range([30, width-30]).padding(0.1);
                    var x = d3.scaleBand().padding(0.05);
                    var y= d3.scaleLinear().rangeRound([260, 60]);  

                    var col = d3.scaleOrdinal().range(['#1bce28', '#f96464','#fff', '#fff']);
                    var stroke = d3.scaleOrdinal().range(['#1bce28', '#f96464','#1bce28', '#f96464']);
                    var meterProps = ['online', 'offline', 'predictedOnline', 'predictedOffline'];
                    var statusMetrics = scope.consumtionList;             
                    var commonDateAndValue = _.map(statusMetrics.online, function(data){
                        return {
                            date: data.date,
                            online: data.value,
                            offline: (_.findWhere(statusMetrics.offline, {date: data.date}) || {value: 0}).value,
                            predictedOnline: 0,
                            predictedOffline: 0
                        };
                    });

                    _.map(statusMetrics.predictedOnline, function(data){
                        commonDateAndValue.push({
                            date: data.date,
                            online: 0,
                            offline: 0,
                            predictedOnline: data.value,
                            predictedOffline: (_.findWhere(statusMetrics.predictedOffline, {date: data.date}) || {value: 0}).value
                        });
                    });
    
                    //Draw axis
                    var axisData = [];
                    var onlineAxisData = [];
                    var predictedOnline = [];
                    var offline = [];
                    var predictedOffline = [];
                    axisData = generateAxisFormat(commonDateAndValue);
                    onlineAxisData = generateAxisValuesFormat(statusMetrics.online);
                    statusMetrics.predictedOnline.unshift(_.last(statusMetrics.online))
                    predictedOnline = generateAxisValuesFormat(statusMetrics.predictedOnline);
                    offline = generateAxisValuesFormat(statusMetrics.offline);   
                    statusMetrics.predictedOffline.unshift(_.last(statusMetrics.offline));
                    predictedOffline = generateAxisValuesFormat(statusMetrics.predictedOffline);

                    x0.domain(axisData.map(function (d) { return d.date;}));
                    x.domain(meterProps).rangeRound([0, x0.bandwidth()]);
                    y.domain([0, d3.max(axisData, function(d) {
                        return d3.max(meterProps, function(key) { return d[key]; });
                    })]).nice();
                    // y.domain([0, d3.max(axisData, function(d) { return d.online; })]);
                    var xAxis = d3.axisBottom().scale(x0).tickFormat(function (d) {
                        return d3.timeFormat("%b '%y")(d);
                    });
                    var yAxis = d3.axisLeft(y).tickFormat(function (d) {
                        return d3.format('.2s')(d);
                    });

                    statusTile.select('.axis').selectAll('g').remove();
                    statusTile.select('.axis').append('g').attr('class', 'x-axis')
                        .attr('transform', 'translate(15, 260)').call(xAxis);
                    statusTile.select('.axis').append('g').attr('class', 'y-axis')
                        .attr('transform', 'translate(45, -6)').call(yAxis);
                    
                    statusTile.select('g.status-bar-chart')
                        .selectAll('g').data(axisData).enter()
                        .append('g')
                        .attr('transform', function(d) { return 'translate(' + x0(d.date) + ',0)'; })
                        .selectAll('rect')
                        .data(function(d) { return meterProps.map(function(key) { return {key: key, value: d[key]}; }); })
                        .enter().append('rect')
                        .attr('x', function(d) { return x(d.key); })
                        .attr('y', function(d) { return y(d.value); })
                        .attr('width', x.bandwidth())
                        .attr('height', function(d) { return 260 - y(d.value); })
                        .attr('fill', function(d) { return col(d.key); })
                        .attr('style', function(d) { return ('stroke:' + stroke(d.key) + '; stroke-width: 1'); });
                        // .attr('fill', function(d) { return col(d.key); });
                    // var line1 = d3.line().x(function(data) { return x(data.date); })
                    //                 .y(function(data){ return y1(data.value); });
                    // var line2 = d3.line().x(function(data) { return x(data.date); })
                    //                 .y(function(data){ return y2(data.value); });

                    // statusTile.select('.on-status')
                    //     .attr('d', line1(onlineAxisData))
                    //     .on('mousemove', hoverOnline);
                    // statusTile.select('.predicted-on-status')
                    //     .attr('d', line1(predictedOnline))
                    //     .on('mousemove', hoverPredictedOnline);
                    // statusTile.select('.off-status')
                    //     .attr('d', line2(offline))
                    //     .on('mousemove', hoverOffline);
                    // statusTile.select('.predicted-off-status')
                    //     .attr('d', line2(predictedOffline))
                    //     .on('mousemove', hoverPredictedOffline);

                    // function hoverOnline() {
                    //     var onlineFocus = statusTile.select('.consume-focus-online')
                    //     onlineFocus.style('display', null);
                    //     var bisectDate = d3.bisector(function(d) { return d.date; }).left;
                    //     var x0 = x.invert(d3.mouse(this)[0]),
                    //         i = bisectDate(onlineAxisData, x0, 1),
                    //         d0 = onlineAxisData[i - 1],
                    //         d1 = onlineAxisData[i],
                    //         data = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    //     onlineFocus.select('.focus-point').attr('cx', x(data.date))
                    //         .attr('cy', y1(data.value));
                    //     onlineFocus.select('.focus-container').attr('x', x(data.date) - 10)
                    //         .attr('y', y1(data.value) - 45);
                    //     onlineFocus.select('.focus-date').attr('x', x(data.date) - -25)
                    //         .attr('y', y1(data.value) - 30)
                    //         .text(d3.timeFormat('%b,%Y')(data.date));
                    //     onlineFocus.select('.focus-text').attr('x', x(data.date) - -25)
                    //         .attr('y', y1(data.value) - 20)
                    //         .text(data.value);
                    // }

                    // function hoverPredictedOnline() {
                    //     var onlineFocus = statusTile.select('.consume-focus-online');
                    //     onlineFocus.style('display', null);
                    //     var bisectDate = d3.bisector(function(d) { return d.date; }).left;
                    //     var x0 = x.invert(d3.mouse(this)[0]),
                    //         i = bisectDate(predictedOnline, x0, 1),
                    //         d0 = predictedOnline[i - 1],
                    //         d1 = predictedOnline[i],
                    //         data = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    //     onlineFocus.select('.focus-point').attr('cx', x(data.date))
                    //         .attr('cy', y1(data.value));
                    //     onlineFocus.select('.focus-container').attr('x', x(data.date) - 10)
                    //         .attr('y', y1(data.value) - 45);
                    //     onlineFocus.select('.focus-date').attr('x', x(data.date) - -25)
                    //         .attr('y', y1(data.value) - 30)
                    //         .text(d3.timeFormat('%b,%Y')(data.date));
                    //     onlineFocus.select('.focus-text').attr('x', x(data.date) - -25)
                    //         .attr('y', y1(data.value) - 20)
                    //         .text(data.value);
                    // }

                    // function hoverOffline() {
                    //     var offlineFocus = statusTile.select('.consume-focus-offline');
                    //     offlineFocus.style('display', null);
                    //     var bisectDate = d3.bisector(function(d) { return d.date; }).left;
                    //     var x0 = x.invert(d3.mouse(this)[0]),
                    //         i = bisectDate(offline, x0, 1),
                    //         d0 = offline[i - 1],
                    //         d1 = offline[i],
                    //         data = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    //     offlineFocus.select('.focus-point').attr('cx', x(data.date))
                    //         .attr('cy', y2(data.value));
                    //     offlineFocus.select('.focus-container').attr('x', x(data.date) - 10)
                    //         .attr('y', y2(data.value) - 45);
                    //     offlineFocus.select('.focus-date').attr('x', x(data.date) - -25)
                    //         .attr('y', y2(data.value) - 30)
                    //         .text(d3.timeFormat('%b,%Y')(data.date));
                    //     offlineFocus.select('.focus-text').attr('x', x(data.date) - -25)
                    //         .attr('y', y2(data.value) - 20)
                    //         .text(data.value);
                    // }

                    // function hoverPredictedOffline() {
                    //     var offlineFocus = statusTile.select('.consume-focus-offline');
                    //     offlineFocus.style('display', null);
                    //     var bisectDate = d3.bisector(function(d) { return d.date; }).left;
                    //     var x0 = x.invert(d3.mouse(this)[0]),
                    //         i = bisectDate(predictedOffline, x0, 1),
                    //         d0 = predictedOffline[i - 1],
                    //         d1 = predictedOffline[i],
                    //         data = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    //     offlineFocus.select('.focus-point').attr('cx', x(data.date))
                    //         .attr('cy', y2(data.value));
                    //     offlineFocus.select('.focus-container').attr('x', x(data.date) - 10)
                    //         .attr('y', y2(data.value) - 45);
                    //     offlineFocus.select('.focus-date').attr('x', x(data.date) - -25)
                    //         .attr('y', y2(data.value) - 30)
                    //         .text(d3.timeFormat('%b,%Y')(data.date));
                    //     offlineFocus.select('.focus-text').attr('x', x(data.date) - -25)
                    //         .attr('y', y2(data.value) - 20)
                    //         .text(data.value);
                    // }
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