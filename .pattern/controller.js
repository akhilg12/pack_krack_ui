(function () {
  'use strict';

  /**
   * @ngdoc controller
   * @name limestoneApp.controller:SomeCtrl
   *
   * @description
   * Define controller name, inject dependencies, point to def function.
   *
   * @requires common
   * @requires datacontext
   */
  var controllerId = 'SomeCtrl';
  angular.module('limestoneApp').controller(controllerId,
    ['common', 'datacontext', SomeCtrl]);

  function SomeCtrl(common, datacontext) {
    // Logger
    var log = common.logger.getLogFn(controllerId);

    // 'Controller As' syntax
    var vm = this;
    // View related Vars
    vm.title = 'Admin';     // regular string
    vm.someVarInView = [];  // json data

    // Self Init
    activate();

    /**
     * @ngdoc method
     * @name limestoneApp.controller:SomeCtrl#activate
     * @methodOf limestoneApp.controller:SomeCtrl
     *
     * @description
     * Page controller is activated after promise.
     */
    function activate() {
      var promises = [getSomeData()];
      common.activateController(promises, controllerId)
        .then(function () {
          // Toastr Popup
          log('Activated Some View');
        });
    }

    /**
     * @ngdoc method
     * @name limestoneApp.controller:SomeCtrl#getSomeData
     * @methodOf limestoneApp.controller:SomeCtrl
     *
     * @description
     * Get Data via datacontext factory.
     *
     * @param {object} oldVar Old value
     *
     * @returns {var} vm.someVarInView
     */
    function getSomeData(oldVar) {
      var newVar = oldVar;
      return datacontext.getSomeDataCount(newVar).then(function (data) {
        return vm.someVarInView = data;
      });
    }
  }
})();
