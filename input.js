//Classes
//####################################################################################
class cInputBuffer
{

    constructor(Size,dt,Destination)
    {
        this.Size = Size;
        this.dt = dt;
        this.Idx = 0;
        this.Data = [];
        for (var i=0;i<Size;i++)
        {
            this.Data.push([i*dt,0])  
        }
        this.Plot = new Dygraph(Destination,
          this.Data,
         { labels: [ "Time", "Data" ] ,width:1080,valueRange:[-1,1]});
    }

    AddData(Data2Add)
    {
        for (var i=0;i<Data2Add.length;i++)
        {
            this.Data[this.Idx][1] = Data2Add[i];
            this.Idx = this.Idx +1;
            if(this.Idx >= this.Size)
            {
                this.Idx = 0;
            }
        }
    }

    PlotData(Destination)
    {
        this.Plot.updateOptions( { 'file': this.Data } );
    }

}

//Variables
//####################################################################################
var InputBuffer = new cInputBuffer(10*44100,1/44100,document.getElementById("MainPlot"));
var MicOk = false;
var RrecorderNode;


//Functions
//####################################################################################

//####################################################################################
function StartBut()
{
    if(MicOk)
    {
        recorderNode.parameters.get('isRecording').value = 1;
        //recorderNode.parameters.get('isRecording').setValueAtTime(1, 0);
        //recorderNode.parameters.get('isRecording').setValueAtTime(0, 10);
    }
}

//####################################################################################
function StopBut()
{
    if(MicOk)
    {
        recorderNode.parameters.get('isRecording').value = 0;
    }
}
//####################################################################################
function CallPlotData()
{
    InputBuffer.PlotData(document.getElementById("MainPlot"));
}

//Run at startup
//####################################################################################

// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }
  
  // Some browsers partially implement mediaDevices. We can't just assign an object
  // with getUserMedia as it would overwrite existing properties.
  // Here, we will just add the getUserMedia property if it's missing.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
  
      // First get ahold of the legacy getUserMedia, if present
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  
      // Some browsers just don't implement it - return a rejected promise with an error
      // to keep a consistent interface
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }
  
      // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  navigator.mediaDevices.getUserMedia(
      {
        "audio": 
        {
            "mandatory": 
            {
                "googEchoCancellation": "false",
                "googAutoGainControl": "false",
                "googNoiseSuppression": "false",
                "googHighpassFilter": "false"
            },
        "optional": []
    },
    })
  .then(function(stream) {
    var context = new (window.AudioContext || window.webkitAudioContext)();
    source = context .createMediaStreamSource(stream);
    context.audioWorklet.addModule('recorder-worklet.js').then(() => 
        {
            MicOk = true;
            console.log("Mic Ok!");
            recorderNode = new AudioWorkletNode(context, 'recorder-worklet');
            source.connect(recorderNode);

            recorderNode.port.onmessage = (e) => {
                if (e.data.eventType === 'data') {
                  const audioData = e.data.audioBuffer;
                  // process pcm data
                  InputBuffer.AddData(audioData);
                }
                if (e.data.eventType === 'stop') {
                    console.log("Record Finish");
                }
              };

              console.log("Start REC!") 

            
        })
  })
  .catch(function(err) {
    console.log(err.name + ": " + err.message);
  });


setInterval(CallPlotData,2000);
  
  
  
