"use strict";

var pitches = (function () {
    var half_step = Math.pow(2, 1 / 12),
        whole_step = Math.pow(2, 1 / 6),
        half_step_log = Math.log(half_step),
        half_steps = function (n) {
            // this computes log 2^(1/12) of n
            return Math.log(n) / half_step_log;
        },
        // because 0 pitch class is not mapped to a power of 2 hz
        adjustment = 36.37631656229583,
        pitches = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'],
        /* - is printed already for negative */
        signum = function (n) { return (n < 0) ? '' : '+'; },
        steps_data = function (hz) {
            var steps = half_steps(hz) - adjustment,
                pch = steps / 12,
                octave = Math.floor(pch),
                pch_class_raw = 12 * (pch - octave),
                pitch_class = Math.floor(pch_class_raw),
                cents = (pch_class_raw - pitch_class) * 100;
            if (cents > 50) {
                cents = cents - 100;
                pitch_class = pitch_class + 1;
            }
            return { hz : hz,
                     pitch_class : pitches[pitch_class],
                     octave : octave,
                     cents : cents
                   };
        },
        hz_to_pitch = function (hz) {
            var result = steps_data(hz);
            return result.pitch_class + result.octave + signum(result.cents) + result.cents;
        },
        pitch_indexes = (function () {
            var i, result = {};
            for (i = 0; i < 12; i = i + 1) {
                result[pitches[i]] = i;
            }
            return result;
        }()),
        pitchdata_to_hz = function (pitch_data) {
            var pitch_class = pitch_data.pitch_class,
                octave = pitch_data.octave,
                cents = pitch_data.cents,
                steps,
                hz;
            steps = octave * 12 + pitch_indexes[pitch_class] + cents / 100;
            hz = Math.pow(half_step, steps + adjustment);
            return {
                pitch_data : pitch_data,
                hz : hz
            };
        },
        hz_scale = function (steps, base) {
            steps = steps || [half_step];
            base = base || 130.813; // C3
            var len = steps.length,
                idx = 0,
                take = function (count) {
                    var i,
                        hz = base,
                        result = [];
                    for (i = 0; i < count; i = i + 1) {
                        result[i] = hz;
                        hz = steps[idx] * hz;
                        idx = (idx + 1) % len;
                    }
                    return result;
                };
            return {
                take : take,
                steps : steps,
                base : base
            };
        },
        scale = function (steps, base, count) {
            steps = steps || [half_step];
            base = base || 130.813; // C3
            count = count || 12;
            var frequencies = hz_scale(steps, base).take(count),
                result = [],
                i;
            for (i = 0; i < count; i = i + 1) {
                result[i] = hz_to_pitch(frequencies[i]);
            }
            return result;
        },
        major_steps = [
            whole_step,
            whole_step,
            half_step,
            whole_step,
            whole_step,
            whole_step,
            half_step
        ],
        minor_steps = [
            whole_step,
            half_step,
            whole_step,
            whole_step,
            half_step,
            whole_step,
            whole_step
        ];
    return {
        half_step : half_step,
        half_steps : half_steps,
        pitches : pitches,
        signum : signum,
        steps_data : steps_data,
        hz_to_pitch : hz_to_pitch,
        hz_scale : hz_scale,
        scale : scale,
        major_steps : major_steps,
        minor_steps : minor_steps,
        pitchdata_to_hz : pitchdata_to_hz
    };
}());

// phantom.page.injectJs('./pitches.js');

/*

phantomjs> var h = pitches.half_step;
undefined
phantomjs> var w = h * h;
undefined
phantomjs> var c_major = pitches.scale([w, w, h, w, w, w, h]);
undefined
phantomjs> c_major
[
   "C4+0.0028764993960095353",
   "D4+0.0028764993942331785",
   "E4+0.00287649939458845",
   "F4+0.0028764993942331785",
   "G4+0.00287649939458845",
   "A4+0.002876499393877907",
   "B4+0.0028764993942331785",
   "C5+0.002876499393877907",
   "D5+0.0028764993942331785",
   "E5+0.0028764993924568216",
   "F5+0.0028764993942331785",
   "G5+0.00287649939458845"
]

phantomjs> var fifths = pitches.scale([1.5]);
undefined
phantomjs> fifths
[
   "C4+0.0028764993960095353",
   "G4+1.9578773647811687",
   "D5+3.9128782301673937",
   "A5+5.86787909555575",
   "E6+7.822879960941975",
   "B6+9.7778808263282",
   "F#7+11.732881691715491",
   "C#8+13.687882557103848",
   "G#8+15.642883422489007",
   "D#9+17.597884287876298",
   "A#9+19.55288515326359",
   "F10+21.507886018648747"
]

phantomjs> var base_e = pitches.scale([Math.pow(2, 1 / Math.E)]);
undefined
phantomjs> base_e
[
   "C4+0.0028764993960095353",
   "E4+41.458205905124146",
   "A4-17.08646468914452",
   "C#5+24.368864716586813",
   "F#5-34.17580587768505",
   "A#5+7.279523528046283",
   "D6+48.73485293377655",
   "G6-9.80981766049318",
   "B6+31.645511745238153",
   "E7-26.899158849032645",
   "G#7+14.556170556697623",
   "C#8-43.98850003756891"
]


phantomjs> var concert_a = {'pitch_class' : 'A', 'octave' : 5, 'cents' : 0}
undefined
phantomjs> pitches.pitchdata_to_hz(concert_a);
{
   "pitch_data": {
      "pitch_class": "A",
      "octave": 5,
      "cents": 0
   },
   "hz": 439.9999999999997
}
*/
