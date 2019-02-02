(function( angular ){
  'use strict';

  angular.module('colorpicker')
    .factory('ColorHelper', function () {

      return{
        hsla2hsva: function (hsla) {
          var h = Math.min(hsla.h, 1), s = Math.min(hsla.s, 1), l = Math.min(hsla.l, 1), a = Math.min(hsla.a, 1);
          if (l === 0) {
            return {h: h, s: 0, v: 0, a: a};
          } else {
            var v = l + s * (1 - Math.abs(2 * l - 1)) / 2;
            return {h: h, s: 2 * (v - l) / v, v: v, a: a};
          }
        },
        hsva2hsla: function (hsva) {
          var h = hsva.h, s = hsva.s, v = hsva.v, a = hsva.a;
          if (v === 0) {
            return {h: h, s: 0, l: 0, a: a};
          } else if (s === 0 && v === 1) {
            return {h: h, s: 1, l: 1, a: a};
          } else {
            var l = v * (2 - s) / 2;
            return {h: h, s: v * s / (1 - Math.abs(2 * l - 1)), l: l, a: a};
          }
        },
        rgbaToHsva: function (rgba) {
          var r = Math.min(rgba.r, 1), g = Math.min(rgba.g, 1), b = Math.min(rgba.b, 1), a = Math.min(rgba.a, 1);
          var max = Math.max(r, g, b), min = Math.min(r, g, b);
          var h, s, v = max;
          var d = max - min;

          s = max === 0 ? 0 : d / max;
          if (max === min) {
            h = 0; // achromatic
          } else {
            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
              case g:
                h = (b - r) / d + 2;
                break;
              case b:
                h = (r - g) / d + 4;
                break;
            }
            h /= 6;
          }
          return {h: h, s: s, v: v, a: a};
        },
        hsvaToRgba: function (hsva) {
          var h = hsva.h, s = hsva.s, v = hsva.v, a = hsva.a;
          var r, g, b;
          var i = Math.floor(h * 6);
          var f = h * 6 - i;
          var p = v * (1 - s);
          var q = v * (1 - f * s);
          var t = v * (1 - (1 - f) * s);

          switch (i % 6) {
            case 0:
              r = v, g = t, b = p;
              break;
            case 1:
              r = q, g = v, b = p;
              break;
            case 2:
              r = p, g = v, b = t;
              break;
            case 3:
              r = p, g = q, b = v;
              break;
            case 4:
              r = t, g = p, b = v;
              break;
            case 5:
              r = v, g = p, b = q;
              break;
          }
          return {r: r, g: g, b: b, a: a};
        },
        stringToHsva: function (string) {
          //reg expressions https://github.com/jquery/jquery-color/
          var stringParsers = [
            {
              re: /(rgb)a?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*%?,\s*(\d{1,3})\s*%?(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
              parse: function (execResult) {
                return [
                  'rgb',
                  parseInt(execResult[2]),
                  parseInt(execResult[3]),
                  parseInt(execResult[4]),
                  isNaN(parseFloat(execResult[5])) ? 1 : parseFloat(execResult[5])
                ];
              }
            },
            {
              re: /(hsl)a?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
              parse: function (execResult) {
                return [
                  'hsl',
                  parseInt(execResult[2]),
                  parseInt(execResult[3]),
                  parseInt(execResult[4]),
                  isNaN(parseFloat(execResult[5])) ? 1 : parseFloat(execResult[5])
                ];
              }
            },
            {
              re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/,
              parse: function (execResult) {
                return [
                  'hex',
                  parseInt(execResult[1], 16),
                  parseInt(execResult[2], 16),
                  parseInt(execResult[3], 16),
                  1
                ];
              }
            }
            , {
              re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/,
              parse: function (execResult) {
                return [
                  'hex',
                  parseInt(execResult[1] + execResult[1], 16),
                  parseInt(execResult[2] + execResult[2], 16),
                  parseInt(execResult[3] + execResult[3], 16),
                  1
                ];
              }
            }
          ];
          string = string.toLowerCase();
          var hsva = null;
          for (var key in stringParsers) {
            if (stringParsers.hasOwnProperty(key)) {
              var parser = stringParsers[key];
              var match = parser.re.exec(string), values = match && parser.parse(match);
              if (values) {
                if (values[0] === 'hex' || values[0] === 'rgb') {
                  hsva = this.rgbaToHsva({r: values[1] / 255, g: values[2] / 255, b: values[3] / 255, a: values[4]});
                } else {
                  hsva = this.hsla2hsva({h: values[1] / 360, s: values[2] / 100, l: values[3] / 100, a: values[4]});
                }
                return hsva;
              }
            }
          }
          return hsva;
        }
      };
    });

})(angular);