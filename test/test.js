/*global require, describe, it */
// designed for node

"use strict";

var pitches = require('../pitches.js').pitches;

var assert = require("assert");

var margin = function (a, b) {
    return Math.abs(a - b);
};

describe('pitches', function () {
    describe('#half_steps', function () {
        it('creates the correct ratio', function () {
            assert.ok(0.02 > margin(7.0, pitches.half_steps(1.5)));
        });
    });
    describe('#hz_to_pitch', function () {
        it('should recognize concert A', function () {
            assert.equal("A4 + 00", pitches.hz_to_pitch(440));
        });
    });
});
