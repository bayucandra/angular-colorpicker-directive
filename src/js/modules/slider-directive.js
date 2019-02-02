(function( angular ){

  'use strict';

  angular.module( 'colorpicker' )

    .directive('slider', ['$document', '$window', function ($document, $window) {

      return {
        restrict: 'A',
        scope: {
          action: '&'
        },

        link: function (scope, element, attr) {
          element.on('mousedown touchstart', mousedown);
          function mousedown(event) {
            setCursor(event);
            $document.on('mousemove touchmove', mousemove);
          }
          $document.on('mouseup touchend', function () {
            $document.off('mousemove touchmove', mousemove);
          });
          function mousemove(event) {
            event.preventDefault();
            setCursor(event);
          }

          function setCursor(event) {
            var maxTop = element[0].offsetHeight;
            var maxLeft = element[0].offsetWidth;
            var x = Math.max(0, Math.min(getX(event, element[0]), maxLeft));
            var y = Math.max(0, Math.min(getY(event, element[0]), maxTop));
            if (attr.rgX !== undefined && attr.rgY !== undefined) {
              scope.action({s: x / maxLeft, v: (1 - y / maxTop), rgX: attr.rgX, rgY: attr.rgY});
            } /*else if (attr.rgX === undefined && attr.rgY !== undefined) {
                     scope.action({v: y / maxTop, rg: attr.rgY});
                     }*/ else {
              scope.action({v: x / maxLeft, rg: attr.rgX});
            }
            scope.$emit('color-changed');
          }

          function getX(event, element) {
            return (event.pageX !== undefined ? event.pageX : event.touches[0].pageX) - element.getBoundingClientRect().left - $window.pageXOffset;
          }
          function getY(event, element) {
            return (event.pageY !== undefined ? event.pageY : event.touches[0].pageY) - element.getBoundingClientRect().top - $window.pageYOffset;
          }
          element.on('$destroy', function () {
            element.off('mousedown touchend', mousedown);
          });
        }};

    }]);

})( angular );