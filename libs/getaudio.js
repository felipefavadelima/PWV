
//Classes
//####################################################################################
class cGetAudioBuffer
{
    constructor(Size)
    {
        this.Size = Size;
        this.Idx = 0;
        this.Data = new Float32Array(Size);
        this.resetBuffer(); 
        this.isBufferFull = false;
    }

    addData(Data2Add)
    {
        for (var i=0;i<Data2Add.length;i++)
        {
            if(this.Idx < this.Size)
            {
            this.Data[this.Idx] = Data2Add[i];
            this.Idx = this.Idx +1;
            }
            else
            {
                this.isBufferFull = true;
            }
        }
    }

    resetBuffer()
    {
        for (var i=0;i<this.Size;i++)
        {
            this.Data[i] = 0;
        } 
        this.isBufferFull = false;
        this.Idx = 0;
    }
}

//Variables
//####################################################################################
var getAudioBuffer; 
var isGetAudioReady = false;
var getAudioNode;

//Functions
//####################################################################################
function getAudioNewAudioDataCallBack(audioData)
{
    if(isGetAudioReady)
    {
        getAudioBuffer.addData(audioData);
        if (getAudioBuffer.isBufferFull == true)
        {
            getAudioNode.parameters.get('isRecording').value = 0;
        }
    }
}

//####################################################################################
function getAudioStart()
{
    if(isGetAudioReady)
    {
        getAudioBuffer.resetBuffer();
        console.log("GET DATA Started");
        getAudioNode.parameters.get('isRecording').value = 1;
    }
}

//####################################################################################
function getAudioReturnBuffer()
{
    return getAudioBuffer;
}


//####################################################################################
function getAudioInit(BufferSizer_s)
{
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) 
    {
        navigator.mediaDevices = {};
    }
  
    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) 
    {
        navigator.mediaDevices.getUserMedia = function(constraints) 
        {
            // First get ahold of the legacy getUserMedia, if present
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  
            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) 
            {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }
  
            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function(resolve, reject) 
            {
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
    .then(function(stream) 
    {
        var context = new (window.AudioContext || window.webkitAudioContext)();
        source = context .createMediaStreamSource(stream);
        context.audioWorklet.addModule('libs/getaudio-worklet.js').then(() => 
        {
            isGetAudioReady = true;
            getAudioBuffer = new cGetAudioBuffer(context.sampleRate*BufferSizer_s);
            console.log("Input audio Ready!");
            getAudioNode = new AudioWorkletNode(context, 'getaudio-worklet');
            source.connect(getAudioNode);

            getAudioNode.port.onmessage = (e) => 
            {
                if (e.data.eventType === 'data') 
                {
                  const audioData = e.data.audioBuffer;
                  getAudioNewAudioDataCallBack(audioData);
                }
                if (e.data.eventType === 'stop') 
                {
                    console.log("GET DATA Finished");
                }
            };
        })
    })
    .catch(function(err) 
    {
        console.log(err.name + ": " +
         err.message);
    });
}
  
  
  