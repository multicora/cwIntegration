(function () {

  var app = angular.module('app'),
    injectArray = ['$scope', '$state', '$ionicModal', '$ionicPopover', 'dataProvider'];

  function controller ($scope, $state, $ionicModal, $ionicPopover, dataProvider) {
    var vm = this;

    vm.contacts = null;
    vm.contactTypes = null;
    vm.companies = null;
    vm.contact = null;

    updateContactList();

    dataProvider.getContactTypes().then(function (response) {
      vm.contactTypes = response.data;
    });

    dataProvider.getCompanies().then(function (response) {
      vm.companies = response.data;
    });

    vm.settingsClickHandler = function () {
      $state.go('appSettings');
    }

    vm.saveContact = function (form, contact) {
      console.log(contact);
      if (form.$valid) {
        dataProvider.saveContact(contact).then(
          function (response) {
            vm.closeEditContact();
            updateContactList();
          },
          function (response) {
            vm.err = response;
          }
        );
      }
    }

    // New/edit contact
    $ionicModal.fromTemplateUrl('editContact', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      vm.modal = modal;
    });
    vm.openEditContact = function() {
      vm.modal.show();
    };
    vm.closeEditContact = function() {
      vm.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      vm.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function(event) {
      event.currentScope.vm.editForm.$setPristine();
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });

    function updateContactList() {
      dataProvider.getContacts().then(
        function (response) {
          vm.contacts = response.data;
        },
        function (response) {
          vm.err = response;
        }
      );
    }
  }
  controller.$inject = injectArray;
  app.controller('contactsListCtrl', controller);

})();