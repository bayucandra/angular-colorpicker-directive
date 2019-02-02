(function( angular ){
  'use strict';

  angular.module('colorpicker')

    .directive( 'text', [function () {
      return {
        restrict: 'A',
        scope: {
          action: '&'
        },
        link: function (scope, element, attr) {
          element.on('paste', delayedUpdate);
          element.on('keyup', update);
          element.on('change', update);
          element.on('focus', showSpinner);
          element.on('blur', hideSpinner);
          element.on('mouseover', showSpinner);
          element.on('mouseout', hideSpinner);
          element.addClass('color-picker-input-spinner');

          function showSpinner(event) {
            if (attr.spinner === "true") {
              element.removeClass('color-picker-input-spinner');
            }
          }

          function hideSpinner(event) {
            element.addClass('color-picker-input-spinner');
          }

          function delayedUpdate(event) {
            setTimeout(function () {
              update(event);
            }, 5);
          }

          function update(event) {
            if (attr.rg === undefined) {
              if (scope.action({string: element.val()})) {
                scope.$emit('color-changed');
              }
            } else {
              var value = parseFloat(element.val());
              if (!isNaN(value)) {
                value = Math.abs(Math.min(parseFloat(element.val()), attr.rg));
                scope.action({v: value, rg: attr.rg});
                scope.$emit('color-changed');
                scope.$emit('alpha-valid');
              } else {
                scope.$emit('alpha-invalid');
              }
            }
          }
          element.on('$destroy', function () {
            element.off('paste', delayedUpdate);
            element.off('keyup', update);
            element.off('change', update);
            element.off('focus', showSpinner);
            element.off('blur', hideSpinner);
            element.off('mouseover', showSpinner);
            element.off('mouseout', hideSpinner);
          });
        }
      }
    }]);

})( angular );