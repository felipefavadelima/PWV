//Definitions
//####################################################################################
const IndexPlotLength_s = 3;
const IndexPlotRefresh_ms = 1000;

//Variables
//####################################################################################
const IndexPlot = document.getElementById("indexPlot");
const IndexGetDataBut = document.getElementById("indexGetDataBut");
const IndexProcessProbe1But = document.getElementById("indexProcessProbe1But");

//Functions
//####################################################################################
function indexProcessProbe1But()
{
  IndexGetDataBut.disabled = true;
  IndexProcessProbe1But.disabled = true;
  DataOut = processDataFilter(getAudioReturnBuffer().Data,getAudioReturnBuffer().Fsample_Hz, 5000,6000);
  plotData(DataOut);
  IndexGetDataBut.disabled = false;
  IndexProcessProbe1But.disabled = false;
  getAudioReturnBuffer().Data = DataOut;
}


//####################################################################################
function indexGetDataBut()
{
  IndexGetDataBut.disabled = true;
  IndexProcessProbe1But.disabled = true;
  getAudioStart();
  setTimeout(indexRefreshPlot,IndexPlotRefresh_ms);
}

//####################################################################################
function indexRefreshPlot()
{
  DataBuffer = getAudioReturnBuffer();
  plotData(DataBuffer.Data);
  if(DataBuffer.isBufferFull == false)
  {
    setTimeout(indexRefreshPlot,IndexPlotRefresh_ms);
  }
  else
  {
    IndexGetDataBut.disabled = false;
    IndexProcessProbe1But.disabled = false;
  }
}

//Main code
//####################################################################################
getAudioInit(IndexPlotLength_s);
setTimeout(indexWaitAudioOk,100);
function indexWaitAudioOk()
{
  if(getAudioReturnIsReady() == false)
  {
    setTimeout(indexWaitAudioOk,100);
  }
  else
  {
    plotInit(getAudioReturnBuffer().Size,IndexPlot)
    IndexGetDataBut.disabled = false;
    IndexProcessProbe1But.disabled = false;
  }
}




  
  
  
