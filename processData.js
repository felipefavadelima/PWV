//Functions
//####################################################################################
function processDataFilter(Data,Fs,F1,F2)
{
    var iirCalculator = new Fili.CalcCascades();
    var iirFilterCoeffs = iirCalculator.lowpass({
        order: 3, // cascade 3 biquad filters (max: 12)
        characteristic: 'butterworth',
        Fs: Fs, // sampling frequency
        Fc: 1000, // cutoff frequency / center frequency for bandpass, bandstop, peak
        BW: 1, // bandwidth only for bandstop and bandpass filters - optional
        gain: 0, // gain for peak, lowshelf and highshelf
        preGain: false // adds one constant multiplication for highpass and lowpass
        // k = (1 + cos(omega)) * 0.5 / k = 1 with preGain == false
      });
    var iirFilter = new Fili.IirFilter(iirFilterCoeffs);
    var DataOut = [];
    for (var i=1;i<Data.length;i++)
    {
        DataOut[i] = iirFilter.singleStep(Data[i]);
    }
    return DataOut;
}