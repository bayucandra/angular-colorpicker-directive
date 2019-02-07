(function( angular ){
  'use strict';

  angular.module('colorpicker')
    .directive('colorPicker', ['$document', '$compile', 'ColorHelper', function ($document, $compile, ColorHelper) {
      return {
        restrict: 'A',
        scope: {colorPickerModel: '=', colorPickerOutputFormat: '=', colorPickerDisabled: '=?'},

        controller: ['$scope', function ($scope) {
          $scope.show = false;
          $scope.sAndLMax = {};
          $scope.hueMax = {};
          $scope.alphaMax = {};
          $scope.type = 0;
          $scope.hsva = {h: 0.5, s: 1, v: 1, a: 1};
          $scope.hueSlider = {left: 0};
          $scope.sAndLSlider = {left: 0, top: 0};
          $scope.alphaSlider = {left: 0};
          $scope.rbgaSteps = {r: 1, g: 1, b: 1, a: 0.1};
          $scope.hslaSteps = {h: 1, s: 1, l: 1, a: 0.1};
          $scope.cancelButtonClass = '';
          $scope.showCancelButton = false;
          $scope.extraLargeClass = '';
          $scope.hexOnly = false;
          $scope.parentSelector = 'body';
          $scope.colorPresets = [];
          $scope.hasColorPresets = false;

          if ($scope.colorPickerOutputFormat === 'rgba') {
            $scope.type = 1;
          } else if ($scope.colorPickerOutputFormat === 'hsla') {
            $scope.type = 2;
          }

          $scope.setSaturation = function (v, rg) {
            var hsla = ColorHelper.hsva2hsla($scope.hsva);
            hsla.s = v / rg;
            $scope.hsva = ColorHelper.hsla2hsva(hsla);
          };

          $scope.setLightness = function (v, rg) {
            var hsla = ColorHelper.hsva2hsla($scope.hsva);
            hsla.l = v / rg;
            $scope.hsva = ColorHelper.hsla2hsva(hsla);
          };

          $scope.setHue = function (v, rg) {
            $scope.hsva.h = v / rg;
          };

          $scope.setAlpha = function (v, rg) {
            $scope.hsva.a = v / rg;
          };

          $scope.setR = function (v, rg) {
            var rgba = ColorHelper.hsvaToRgba($scope.hsva);
            rgba.r = v / rg;
            $scope.hsva = ColorHelper.rgbaToHsva(rgba);
          };

          $scope.setG = function (v, rg) {
            var rgba = ColorHelper.hsvaToRgba($scope.hsva);
            rgba.g = v / rg;
            $scope.hsva = ColorHelper.rgbaToHsva(rgba);
          };

          $scope.setB = function (v, rg) {
            var rgba = ColorHelper.hsvaToRgba($scope.hsva);
            rgba.b = v / rg;
            $scope.hsva = ColorHelper.rgbaToHsva(rgba);
          };

          $scope.setSaturationAndBrightness = function (s, v, rgX, rgY) {
            $scope.hsva.s = s / rgX;
            $scope.hsva.v = v / rgY;
          };

          $scope.update = function () {
            var hsla = ColorHelper.hsva2hsla($scope.hsva);
            $scope.hslaText = {h: Math.round((hsla.h) * 360), s: Math.round(hsla.s * 100), l: Math.round(hsla.l * 100), a: Math.round(hsla.a * 100) / 100};

            var rgba = denormalizeRGBA(ColorHelper.hsvaToRgba($scope.hsva));
            var hueRgba = denormalizeRGBA(ColorHelper.hsvaToRgba({h: $scope.hsva.h, s: 1, v: 1, a: 1}));

            $scope.rgbaText = {r: rgba.r, g: rgba.g, b: rgba.b, a: Math.round(rgba.a * 100) / 100};
            $scope.hexText = '#' + ((1 << 24) | (parseInt(rgba.r, 10) << 16) | (parseInt(rgba.g, 10) << 8) | parseInt(rgba.b, 10)).toString(16).substr(1);

            if ($scope.hexText[1] === $scope.hexText[2] && $scope.hexText[3] === $scope.hexText[4] && $scope.hexText[5] === $scope.hexText[6]) {
              $scope.hexText = '#' + $scope.hexText[1] + $scope.hexText[3] + $scope.hexText[5];
            }

            $scope.alphaSliderColor = 'rgb(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ')';
            $scope.hueSliderColor = 'rgb(' + hueRgba.r + ',' + hueRgba.g + ',' + hueRgba.b + ')';

            if ($scope.type === 0 && $scope.hsva.a < 1) {
              $scope.type++;
            }

            //var outputFormat = 'rgba';
            if ($scope.hsva.a < 1) {
              switch ($scope.colorPickerOutputFormat) {
                case 'hsla':
                  $scope.outputColor = 'hsla(' + $scope.hslaText.h + ',' + $scope.hslaText.s + '%,' + $scope.hslaText.l + '%,' + $scope.hslaText.a + ')';
                  break;
                default:
                  $scope.outputColor = 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + Math.round(rgba.a * 100) / 100 + ')';
                  break;
              }
            } else {
              switch ($scope.colorPickerOutputFormat) {
                case 'hsla':
                  $scope.outputColor = 'hsl(' + $scope.hslaText.h + ',' + $scope.hslaText.s + '%,' + $scope.hslaText.l + '%)';
                  break;
                case 'rgba':
                  $scope.outputColor = $scope.alphaSliderColor;
                  break;
                default:
                  $scope.outputColor = $scope.hexText;
                  break;
              }
            }

            $scope.sAndLSlider = {left: $scope.hsva.s * $scope.sAndLMax.x - 8 + 'px', top: (1 - $scope.hsva.v) * $scope.sAndLMax.y - 8 + 'px'};
            $scope.hueSlider.left = ($scope.hsva.h) * $scope.hueMax.x - 8 + 'px';
            $scope.alphaSlider.left = $scope.hsva.a * $scope.alphaMax.x - 8 + 'px';
            $scope.alphaInvalidClass = '';
          };

          $scope.setColorFromHex = function (string) {
            var hsva = ColorHelper.stringToHsva(string);
            if (hsva !== null) {
              $scope.hsva = hsva;
            }
            return hsva;
          };

          $scope.typePolicy = function () {
            $scope.type = ($scope.type + 1) % 3;
            if ($scope.type === 0 && $scope.hsva.a < 1) {
              $scope.type++;
            }
            return $scope.type;
          };

          function denormalizeRGBA(rgba) {
            return {r: Math.round(rgba.r * 255), g: Math.round(rgba.g * 255), b: Math.round(rgba.b * 255), a: rgba.a};
          }

        }],



        link: function (scope, element, attr) {
          var template, close = false, initialValue = '';

          if (scope.colorPickerModel === undefined) {
            scope.colorPickerModel = '#008fff';
            element.val('');
          }
          if (attr.colorPickerShowValue === undefined) {
            attr.colorPickerShowValue = 'true';
          }
          if (attr.colorPickerPosition === undefined) {
            attr.colorPickerPosition = 'right';
          }
          if (attr.colorPickerShowInputSpinner === undefined) {
            attr.colorPickerShowInputSpinner = 'false';
          }
          if (attr.colorPickerShowCancelButton === undefined) {
            attr.colorPickerShowCancelButton = 'false';
          }
          if (attr.colorPickerShowCancelButton === 'true') {
            scope.showCancelButton = true;
            scope.extraLargeClass = 'color-picker-extra-large';
          }
          if (attr.colorPickerCancelButtonClass !== undefined) {
            scope.cancelButtonClass = attr.colorPickerCancelButtonClass;
          }

          if (attr.colorPickerSpinnerRgbaSteps !== undefined && attr.colorPickerSpinnerRgbaSteps.match(/^\d+;\d+;\d+;[0-9]+([\.][0-9]{1,2})?$/) !== null) {
            var steps = attr.colorPickerSpinnerRgbaSteps.split(';');
            scope.rbgaSteps = {r: steps[0], g: steps[1], b: steps[2], a: steps[3]};

          }
          if (attr.colorPickerSpinnerHslaSteps !== undefined && attr.colorPickerSpinnerHslaSteps.match(/^\d+;\d+;\d+;[0-9]+([\.][0-9]{1,2})?$/) !== null) {
            var steps = attr.colorPickerSpinnerHslaSteps.split(';');
            scope.hslaSteps = {h: steps[0], s: steps[1], l: steps[2], a: steps[3]};
          }

          updateFromString(scope.colorPickerModel);
          if (attr.colorPickerShowValue === 'true') {
            element.val(scope.outputColor);
          }

          if( attr.colorPickerHexOnly === 'true' ) {
            scope.hexOnly = true;
          }

          if( attr.colorPickerParentSelector !== undefined && document.querySelector( attr.colorPickerParentSelector ) !== null ) {
            scope.parentSelector = attr.colorPickerParentSelector;
          }

          if( attr.colorPickerColorPresets !== undefined ) {

            var color_presets = [];

            try {

              color_presets = attr.colorPickerColorPresets.split( ',' );
              for( var i=0; i<color_presets.length; i++ ) {
                var color_preset = ColorHelper.trim( color_presets[i] );

                if( ColorHelper.isHexValid( color_preset ) && scope.colorPresets.indexOf( color_preset ) === -1 ) {
                  scope.colorPresets.push( color_preset );
                }

              }

            } catch( e ) {
              console.error('Error::attr.colorPickerColorPresets: ' + e.message);
            }

          }

          scope.colorPresetSelect = function( str ){
            scope.hexText = str;
            scope.setColorFromHex( str );
            updateFromString( str );

            if (attr.colorPickerShowValue === 'true') {
              element.val(str);
            }
            scope.colorPickerModel = str;
            // if( (scope.$root.$$phase !== '$apply') && (scope.$root.$$phase !== '$digest') ) scope.$digest();
          };

          if( scope.colorPresets.length > 0 ) {scope.hasColorPresets = true;}

          template = angular.element('<div ng-show="show" class="color-picker {{extraLargeClass}}" ng-class="{ \'color-picker--hex-only\' : hexOnly, \'color-picker--has-color-presets\': hasColorPresets }">' +
            '   <div class="arrow arrow-' + attr.colorPickerPosition + '"></div>' +

            '   <div slider rg-x=1 rg-y=1 action="setSaturationAndBrightness(s, v, rgX, rgY)" class="saturation-lightness" ng-style="{\'background-color\':hueSliderColor}">' +
            '       <div class="cursor-sv" ng-style="{\'top\':sAndLSlider.top, \'left\':sAndLSlider.left}"></div>' +
            '   </div>' +

            '   <div slider rg-x=1 action="setHue(v, rg)" class="hue">' +
            '       <div class="cursor" ng-style="{\'left\':hueSlider.left}"></div>' +
            '   </div>' +
            '   <div slider rg-x=1 action="setAlpha(v, rg)" class="alpha" ng-style="{\'background-color\':alphaSliderColor}">' +
            '       <div class="cursor" ng-style="{\'left\':alphaSlider.left}"></div>' +
            '   </div>' +
            '   <div class="selected-color-background"></div>' +
            '   <div class="selected-color" ng-style="{\'background-color\':outputColor}"></div>' +


            '   <div ng-show="type==2" class="hsla-text">' +
            '       <input text type="number" pattern="[0-9]*" min="0" max="360" step="' + scope.hslaSteps.h + '" rg=360 action="setHue(v, rg)" ng-model="hslaText.h" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
            '       <input text type="number" pattern="[0-9]*" min="0" max="100" step="' + scope.hslaSteps.s + '" rg=100 action="setSaturation(v, rg)" ng-model="hslaText.s" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
            '       <input text type="number" pattern="[0-9]*" min="0" max="100" step="' + scope.hslaSteps.l + '" rg=100 action="setLightness(v, rg)" ng-model="hslaText.l" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
            '       <input text type="number" pattern="[0-9]+([\.,][0-9]{1,2})?" min="0" max="1" step="' + scope.hslaSteps.a + '" rg=1 action="setAlpha(v, rg)" ng-model="hslaText.a" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
            '       <div>H</div><div>S</div><div>L</div><div>A</div>' +
            '   </div>' +

            '   <div ng-show="type==1" class="rgba-text">' +
            '       <input text type="number" pattern="[0-9]*" min="0" max="255" step="' + scope.rbgaSteps.r + '" rg=255 action="setR(v, rg)" ng-model="rgbaText.r" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
            '       <input text type="number" pattern="[0-9]*" min="0" max="255" step="' + scope.rbgaSteps.g + '" rg=255 action="setG(v, rg)" ng-model="rgbaText.g" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
            '       <input text type="number" pattern="[0-9]*" min="0" max="255" step="' + scope.rbgaSteps.b + '" rg=255 action="setB(v, rg)" ng-model="rgbaText.b" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
            '       <input text type="number" pattern="[0-9]+([\.,][0-9]{1,2})?" min="0" max="1" step="' + scope.rbgaSteps.a + '" rg=1 action="setAlpha(v, rg)" ng-model="rgbaText.a" spinner="' + attr.colorPickerShowInputSpinner + '" />' +
            '       <div>R</div><div>G</div><div>B</div><div>A</div>' +
            '   </div>' +

            '   <div class="hex-text" ng-show="type==0">' +
            '       <input text type="text" action="setColorFromHex(string)" ng-model="hexText"/>' +
            '       <div>Hex</div>' +
            '   </div>' +

            '   <div ng-click="typePolicy()" class="type-policy"></div>' +

            '   <div class="color-presets" ng-if="hasColorPresets">' +
            '     <div class="color-presets__title">Warna Global</div>' +
            '     <div class="color-presets__picker-wrapper">' +
            '       <div class="preset-picker" ng-repeat="preset in colorPresets" ng-class="{ \'is-last\': $last }" ng-style="{ \'background-color\': preset }" ng-click="colorPresetSelect( preset )"></div>' +
            '     </div>' +
            '   </div>' +

            '   <div class="footer-action">' +
            '       <div class="reset-btn widget-button-ripple" ng-click="resetColor()">Reset</div>' +
            '       <div class="save-btn widget-button-ripple" ng-click="save()">Simpan</div>' +
            '   </div>' +

            '   <button type="button" class="{{cancelButtonClass}}" ng-show="showCancelButton" ng-click="cancelColor()">Cancel</button>' +
            '</div>');

          document.querySelector( scope.parentSelector ).appendChild( template[0] );

          // document.getElementsByTagName("body")[0].appendChild(template[0]);
          $compile(template)(scope);

          function updateFromString(string) {
            var hsva = ColorHelper.stringToHsva(string);
            if (hsva !== null) {
              scope.hsva = hsva;
              scope.update();
            }
          }

          element.on('paste', delayedUpdate);
          function delayedUpdate() {
            setTimeout(function () {
              keyup();
            }, 5);
          }

          element.on('keyup', keyup);
          function keyup() {
            scope.$apply(function () {
              attr.colorPickerShowValue = 'true';
              updateFromString(element.val());
              scope.colorPickerModel = element.val();
            });
          }

          scope.$on('color-changed', function (event) {
            scope.$apply(function () {
              scope.update();
              scope.colorPickerModel = scope.outputColor;
              if (attr.colorPickerShowValue === 'true') {
                element.val(scope.outputColor);
              }
            });
          });

          scope.cancelColor = function () {
            scope.colorPickerModel = initialValue;
            scope.show = false;
            updateFromString(scope.colorPickerModel);
            $document.off('mousedown', mousedown);
            angular.element(window).off('resize', resize);
          };

          scope.resetColor = function () {
            scope.colorPickerModel = initialValue;
            updateFromString(scope.colorPickerModel);
          };

          scope.save = function(){
            scope.show = false;
          };

          element.on('click', open);
          function open(event) {

            if( scope.colorPickerDisabled === true ) {
              return;
            }

            initialValue = scope.colorPickerModel;
            scope.$apply(function () {
              scope.show = true;
            });
            scope.$apply(function () {
              scope.sAndLMax = {x: template[0].getElementsByClassName("saturation-lightness")[0].offsetWidth, y: template[0].getElementsByClassName("saturation-lightness")[0].offsetHeight};
              scope.hueMax = {x: template[0].getElementsByClassName("hue")[0].offsetWidth};
              scope.alphaMax = {x: template[0].getElementsByClassName("alpha")[0].offsetWidth};
              scope.update();
            });
            setDialogPosition();
            $document.on('mousedown', mousedown);
            angular.element(window).on('resize', resize);
          }

          function resize(){
            setDialogPosition();
          }

          function setDialogPosition() {
            var box;
            if (attr.colorPickerFixedPosition === 'true') {
              box = createBox(element[0], false);
              template[0].style.position = "fixed";
            } else {
              box = createBox(element[0], true);
            }
            if (attr.colorPickerPosition === "left") {
              template[0].style.top = box.top + 'px';
              template[0].style.left = (box.left - 252) + 'px';
            } else if (attr.colorPickerPosition === "top") {
              template[0].style.top = (box.top - box.height - 284) + 'px';
              template[0].style.left = (box.left) + 'px';
            } else if (attr.colorPickerPosition === "bottom") {
              template[0].style.top = (box.top + box.height + 10) + 'px';
              template[0].style.left = (box.left) + 'px';
            }
            else {
              template[0].style.top = box.top + 'px';
              template[0].style.left = (box.left + box.width) + 'px';
            }
          }

          element.on('$destroy', function () {
            element.off('click', open);
            element.off('keyup', keyup);
            element.off('paste', delayedUpdate);
          });

          function mousedown(event) {
            if (event.target !== element[0] && template[0] !== event.target && !isDescendant(template[0], event.target)) {
              scope.$apply(function () {
                scope.show = false;
              });
              $document.off('mousedown', mousedown);
              angular.element(window).off('resize', resize);
            }
          }

          function isDescendant(parent, child) {
            var node = child.parentNode;
            while (node !== null) {
              if (node === parent) {
                return true;
              }
              node = node.parentNode;
            }
            return false;
          }

          function createBox(element, offset) {
            return {
              top: element.getBoundingClientRect().top + (offset ? window.pageYOffset : 0),
              left: element.getBoundingClientRect().left + (offset ? window.pageXOffset : 0),
              width: element.offsetWidth,
              height: element.offsetHeight
            };
          }
        }};
    }]);

})(angular);