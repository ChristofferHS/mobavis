var overlayPlot = overlayPlot || {};


overlayPlot.Component = function (element, number) {   
    const style = {
        width : '35vw',
        height: '83vh'
    };
    
    plotlyPlot.call(this, element, number, 'overlay', style);
    
    var percentiles = [];
    var percentileIndices = [];
    var percentileData = [];
    var annotations = [];
    var showAnnotationIndices = [0, 9, 18];
    var phenotype = '';
    var userData = [];
    var dataAges = {values: this.ages, descriptions : this.ageLabels};
    //var userAges = {};
    var allAges;
    var colours = [];
    var baseColour = [107, 215, 288];
    
    var data = [];
    var layout = {};
    
    
    this.setup = function(metaData) {
        percentiles = metaData['percentiles'];
        
        const colourNumber = (percentiles.length - 1)/2;
        const redFactor = (baseColour[0] - 17)/3; //30
        const greenFactor = (baseColour[1] - 125)/3; //30;
        const blueFactor = (baseColour[2] - 228)/3; //20;
        var red, blue, green;
        for (var i = 0; i < colourNumber; i++) {
            red = baseColour[0] - i*redFactor;
            green = baseColour[1] - i*greenFactor;
            blue = baseColour[2] - i*blueFactor;
            if (red < 0) {
                red = 0;
            }
            if (green < 0) {
                green = 0;
            }
            if (blue < 0) {
                blue = 0;
            }
            colours.push([red, green, blue]);
        };
        
        const colourMap = {};
        
        var colourIndex = -1;
        for (var i = 0; i < percentiles.length; i++) {
            percentileIndices.push(i);
        }
        for (var i = 1; i < percentiles.length; i++) {
            var percentile = parseInt(percentiles[i]);
            if (parseInt(percentiles[i-1]) == '50') {} // keep the same colour on both sides of the 50th percentile
            else if (percentile <= 50) {
                colourIndex++;
            }
            else if (percentile > 50) {
                colourIndex--;
            }
            colourMap[i] = colours[colourIndex];
            //console.log('i: ' + i + ', percentile: ' + percentile + ', colour index: ' + colourIndex);
        }
        console.log('number of percentiles: ' + percentiles.length);
        console.log("colour map: " + JSON.stringify(colourMap));
        console.log('colours: ' + JSON.stringify(colours));
        var fill, fillColour, percentile, line, mode, name;

        for (var i = 0; i < percentileIndices.length; i++) {
            if (i != 0) {
                    fill = 'tonexty';
            }
            else {
                    fill = 'none';
            };
            //console.log(i + ' ' + fill);
            percentile = percentiles[i];
            fillColour = 'rgba(' + colourMap[i] + ', 0.5)' 

            if (percentile == 50) {
                mode = 'lines';
                line = {
                        color : 'rgb(22, 61, 157)',
                        dash: '5px',
                        width: 1
                };	
            }
            else if (i == 0) {
                fillColour = 'rgb(0,0,0)',
                mode = 'lines',
                line = {
                    color : fillColour,
                    width: 0
                };	
            }
            else {
                mode = 'none';	
                line = {};
            };

            if (percentile != 1) {
                    name = percentile + 'th percentile';
            }
            else {
                    name = percentile + 'st percentile';
            };

            var trace = {
                    x: this.ages,
                    y: [],
                    type: 'scatter',
                    showlegend: false,
                    line: line,
                    mode : mode,
                    name : name,
                    fill : fill,
                    fillcolor : fillColour
            };
            data.push(trace);

            var annotation = {
                    //xref: 'paper',
                    xref: 'x',
                    yref : 'y',
                    x : this.ages[this.ages.length-1],
                    //x: 0.95,
                    y: [],
                    xanchor: 'left',
                    yanchor: 'middle',
                    text: percentile + '%',
                    font: {
                            //family : 'Times New Roman',
                            family: 'Arial',
                            //family: 'Verdana',
                            size: 14,
                            color: 'rgb(20, 20, 137)'
                    },
                    showarrow: false
            };

            annotations.push(annotation);	
        };

        var traceUser = {
            x: this.ages,
            y: userData,
            type: 'scatter',
            showlegend: true,
            connectgaps: true,
            mode: 'markers+lines',
            name : '<b>user data</b>',
            line: {
                  color : 'black',
              width: 2
            }
        };

        data.push(traceUser);

        layout = {
            title: '',
            showlegend: true,
            traceorder: 'normal',
            //annotations : annotations,
            legend: {
                x: '0.025',
                y: '1.08',
                font: {
                    //family: 'Arial',
                    size: 16
                }
                //'orientation'   : 'v',
                //'xanchor'       : 'center',
                //'yanchor'       : 'top'
            },
            hovermode: 'closest',
            xaxis: {
                title: 'age',
                tickvals: dataAges['values'],
                ticktext: dataAges['descriptions']
              //tickfont: { size: 16 }
            },
            yaxis : {
                title: ''
            },
            margin: {
                l: 45,
                r: 20,
                t: 60
            }
        };
        // create the plot
        //console.log('data object: ' + JSON.stringify(data));
        var configuration = {scrollZoom: true, modeBarButtonsToRemove: ['sendDataToCloud', 'select2d', 'lasso2d']};
        Plotly.newPlot(this.gd, data, layout, configuration);
        console.log("set up");
    }
    
    this.setAges = function (newAgeData) {
        var userAges = newAgeData['data'];

        Plotly.restyle(this.divID, 'x', [userAges['values']], data.length-1);
        var i = 0; var j = 0;
        allAges = {descriptions : [], values : []};
        while (i < dataAges['values'].length && j < userAges['values'].length) { // merge the two age arrays
            var value, description;
            //console.log("i: " + i + ", j: " + j);
            var dataAge = dataAges['values'][i];
            var userAge = userAges['values'][j];
            //console.log('dataAge: ' + dataAge + ', userAge: ' + userAge);
            if (dataAges['descriptions'][i] == userAges['descriptions'][j]) {
                value = dataAges['values'][i];
                description = dataAges['descriptions'][i];
                i++; j++;
            }
            else if (dataAge < userAge) {
                value = dataAges['values'][i];
                description = dataAges['descriptions'][i];
                i++;
            }
            else {
                value = userAges['values'][j];
                description = userAges['descriptions'][j];
                j++;
            }
            allAges['descriptions'].push(description);
            allAges['values'].push(value);
        }

        var restDataValues = dataAges['values'].slice(i, dataAges['values'].length);
        var restUserValues = userAges['values'].slice(j, userAges['values'].length);

        var restObject, restIndex;
        if (restDataValues.length > 0) {
            restObject = dataAges;
            restIndex = i;
        }
        else if (restUserValues.length > 0) {
            restObject = userAges;
            restIndex = j;
        }
        if (restObject != null) {
            for (var k = restIndex; k < restObject['values'].length; k++) {
                allAges['descriptions'].push(restObject['descriptions'][k]);
                allAges['values'].push(restObject['values'][k]);
            }
        }
        console.log(JSON.stringify(allAges));
        var newLayout = {
            xaxis: {
                tickvals: allAges['values'],
                ticktext: allAges['descriptions']
            }
        };
        Plotly.relayout(this.divID, newLayout);    
    };
    
    this.updateUserData = function (newUserData) {
        //console.log(newUserData);
        //console.log('index: ' + (data.length - 1));
        if (newUserData != null){
            userData = newUserData['data'];
            
            Plotly.restyle(this.divID, 'y', [userData], data.length-1);
            console.log('Set user data.');
        };
    };       
    
    this.setPercentileData = function (newPercentileData) {
        if (newPercentileData != null){
            percentileData = [];
            for (var i = 0; i < percentiles.length; i++) {
                percentileData.push(newPercentileData['data'][percentiles[i] + '%']);
            }
            
            phenotype = newPercentileData['phenotype'];
            console.log("phenotype: " + phenotype);
            //console.log("percentile data list: " + JSON.stringify(percentileData));
            //console.log("data list: " + dataList);
//            console.log('Percentiles: ' + percentiles);
//            console.log("length: " + percentiles.length + " " + percentileData.length + " " + percentileIndices.length + " " + data.length)
//            console.log("percentileIndices: " + percentileIndices);
            Plotly.restyle(this.divID, 'y', percentileData, percentileIndices);
            console.log("Set percentile data.");
            this.setLayout();
        };
    };
    
    this.setLayout = function () {
        var visibleAnnotations = [];
        for (var i = 0; i < showAnnotationIndices.length; i++) {
            var index = showAnnotationIndices[i];
            annotations[index]['y'] = percentileData[index][percentileData[index].length - 1];
            visibleAnnotations.push(annotations[index]);
        };
        Plotly.relayout(this.divID, {title : phenotype, yaxis : {title : phenotype}, annotations : visibleAnnotations});    
    };
    
    this.showPercentiles = function(showPercentiles) {
        console.log("Show percentiles: " + showPercentiles);
        for (var i = 0; i < annotations.length; i++) { // hide/show the annotation too
            annotations[i].visible = showPercentiles;
        }
        Plotly.restyle(this.divID, {'visible' : showPercentiles, annotation : annotations}, percentileIndices);
    };
    console.log('overlayPlot object constructed');       
};