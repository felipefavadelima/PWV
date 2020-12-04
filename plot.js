//Variables
//####################################################################################
var plot;

//Functions
//####################################################################################
function plotInit(PlotSize,PlotObject)
{
    var NullData=[];
    for (var i=0;i<PlotSize;i++)
    {
        NullData.push([0,0]);
    }
    plot = new Dygraph(PlotObject,
        NullData,
       { labels: [ "Time", "Data" ] ,height:720 ,width:1080,valueRange:[-1,1]});
}

//####################################################################################
function plotData(Data)
{
    var Data2Plot=[];
    for (var i=0;i<Data.length;i++)
    {
        Data2Plot.push([i,Data[i]]);
    }
    plot.updateOptions({ 'file': Data2Plot });
}