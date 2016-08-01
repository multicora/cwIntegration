(function () {

  var app = angular.module('app'),
    injectArray = ['$scope', '$state', '$ionicModal', '$ionicPopover', 'contactsProvider'];

  function controller ($scope, $state, $ionicModal, $ionicPopover, contactsProvider) {
    var vm = this;
    console.log('-| Contacts list');
    vm.contacts = null;
    vm.contactTypes = null;
    vm.companies = null;
    vm.contact = null;

    // contactsProvider.getContactTypes().then(function (response) {
    //   vm.contactTypes = response.data;
    // });

    // contactsProvider.getCompanies().then(function (response) {
    //   vm.companies = response.data;
    // });

    vm.updateContactList = function() {
      contactsProvider.getContacts().then(
        function (response) {
          vm.contacts = response.data;
        },
        function (response) {
          vm.err = response;
        }
      );
    };

    vm.settingsClickHandler = function () {
      $state.go('appSettings');
    }

    vm.saveContact = function (form, contact) {
      if (form.$valid) {
        contactsProvider.saveContact(contact).then(
          function (response) {
            vm.closeEditContact();
            vm.updateContactList();
          },
          function (response) {
            vm.err = response;
          }
        );
      }
    }

    vm.updateContactList();

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
  }
  controller.$inject = injectArray;
  app.controller('contactsListCtrl', controller);

})();