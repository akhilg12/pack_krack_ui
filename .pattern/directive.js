(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name limestoneApp.directive:yourDirName
   * @restrict AE
   * @scope  // add this attribute if you create a scope in your directive.
   *
   * @description
   * User-List Form. Users can interact with available and selected items list.
   *
   * @example
     <example module="limestoneApp">
       <file name="index.html">
         <your-directive
           type="vm.userType">
           <button>click</button>
         </your-directive>
       </file>
      </example>
   *
   * @requires common
   */
  angular
    .module('limestoneApp')
    .directive('yourDirName', yourDirName);

  function yourDirName () {
    var directive = {
      /**
       * Define how the directive will look like inside HTML
       * 'A' - only matches attribute name
       * 'E' - only matches element name
       * 'C' - only matches class name (Not Recommended)
       */
      restrict: 'AE',

      /**
       * Choose b/w template & templateUrl. Use 'templateUrl' whenever it's more than 5 lines.
       * i.e. template: '<button class="btn">Send</button>',
       */
      templateUrl: 'components/template/yourDirName.template.html',

      /**
       * Do you have any html you wanna pass inisde inside this directives?
       * If it's set to true, don't forget to put ng-transclude inside template or templateUrl.
       * For advanced use case like Compile-Directives, visit:
       * http://www.bennadel.com/blog/2794-when-do-you-need-to-compile-a-directive-in-angularjs.htm
       */
      // transclude: true,

      /**
       * Require anything inside this directive? i.e. Other directives or ng-model.
       * you can also add '^' before for advanced setting
       * i.e. require: somethingIsNeeded,
       */
      // require: 'ngModel',

      /**
       * Implementation which takes 4 parameters
       * i.e. scope, element, attrs, ctrl
       */
      link: link,

      /**
       * Not a must. Set scope here if you need to.
       * Isolated? inheritance? no-scope? share-scope?
       *
       * '{}' : Totally Isolated, even disconnect w/ its parents controller.
       * i.e. Same directive can be reuse on same page multi time & have its own scope.
       *
       * '@' : Shortcut of reading directive's attr as string(only) & assign it to the scope.
       * i.e. Page controller can pass a string & display it on the directive
       *
       * '&' : directive will have power to commute back to its partents controller.
       * i.e. directive can directly calls parents controller function.
       *
       * '=' : Setup blinding both ways as an object.
       * i.e. Data can be updated Ctrl -> Dir and Dir -> Ctrl both ways
       *
       * Why '&' is better than '='? If the directive is a widget, & shows up on page multi times, you don't want the page to create directive's controller multi times. All same page directives call single function from page's controller is better.
       */
      scope: {}
    };
    return directive;

    function link(scope, element, attrs, ctrl) {
      /* implementation details */
    }
  }
})();
