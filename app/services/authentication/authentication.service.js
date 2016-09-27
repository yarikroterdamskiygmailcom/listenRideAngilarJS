'use strict';

angular.
  module('listnride').
  factory('authentication', [
    'Base64', '$http', '$localStorage', '$mdDialog', '$mdToast', '$q', 'ezfb', 'api', 'verification',
    function(Base64, $http, $localStorage, $mdDialog, $mdToast, $q, ezfb, api, verification){

      // After successful login/loginFb, authorization header gets created and saved in localstorage
      var setCredentials = function (email, password, id) {
        var encoded = Base64.encode(email + ":" + password);
        $localStorage.auth = encoded;
        $localStorage.userId = id;
      };

      // The Signup Dialog Controller
      var SignupDialogController = function($mdDialog) {
        var signupDialog = this;

        var signupFb = function(email, fbId, fbAccessToken, profilePicture, firstName, lastName) {
          var user = {
            "user": {
              "email": email,
              "facebook_id": fbId,
              "facebook_access_token": fbAccessToken,
              "profile_picture_url": profilePicture,
              "first_name": firstName,
              "last_name": lastName
            }
          };
          api.post("/users", user).then(function(success) {
            setCredentials(success.data.email, success.data.password_hashed, success.data.id);
            $mdDialog.hide();
            $timeout(function() {
              verification.openDialog();
            }, 500);
          }, function(error) {
            console.log("Could not Sign Up with Facebook");
          });
        };

        signupDialog.hide = function() {
          $mdDialog.hide();
        };

        signupDialog.signup = function() {
          var user = {
            'user': {
              'email': signupDialog.email,
              'password_hashed': sha256.encrypt(signupDialog.password),
              'first_name': signupDialog.firstName,
              'last_name': signupDialog.lastName
            }
          };
          api.post('/users', user).then(function(success) {
            setCredentials(success.data.email, success.data.password_hashed, success.data.id);
            $mdDialog.hide();
            $timeout(function() {
              verification.openDialog();
            }, 500);
          }, function(error) {
            console.log("Could not Sign Up");
          });
        };

        signupDialog.connectFb = function() {
          ezfb.getLoginStatus(function(response) {
            if (response.status === 'connected') {
              var accessToken = response.authResponse.accessToken;
              ezfb.api('/me?fields=id,email,first_name,last_name,picture.width(600).height(600)', function(response) {
                signupFb(response.email, response.id, accessToken, response.picture.data.url, response.first_name, response.last_name);
              });
            } else {
              ezfb.login(function(response) {
                ezfb.api('/me?fields=id,email,first_name,last_name,picture.width(600).height(600)', function(response) {
                  signupFb(response.email, response.id, accessToken, response.picture.data.url, response.first_name, response.last_name);
                });
              });
            }
          });
        };

      };

      // The Login Dialog Controller
      var LoginDialogController = function($mdDialog, $mdToast, sha256, ezfb) {
        var loginDialog = this;

        var showLoginSuccess = function() {
          $mdDialog.hide();
          $mdToast.show(
            $mdToast.simple()
            .textContent('Successfully logged in.')
            .hideDelay(3000)
            .position('top center')
          );
        }

        var showLoginError = function() {
          $mdDialog.hide();
          $mdToast.show(
            $mdToast.simple()
            .textContent('Error: Could not log in')
            .hideDelay(3000)
            .position('top center')
          );
        }

        var loginFb = function(email, facebookId) {
          var user = {
            'user': {
              'email': email,
              'facebook_id': facebookId
            }
          };
          api.post('/users/login', user).then(function(response) {
            setCredentials(response.data.email, response.data.password_hashed, response.data.id);
            showLoginSuccess();
          }, function(response) {
            showLoginError();
          });
        };

        loginDialog.hide = function() {
          $mdDialog.hide();
        }

        loginDialog.login = function() {
          var user = {
            'user': {
              'email': loginDialog.email,
              'password_hashed': sha256.encrypt(loginDialog.password)
            }
          };
          api.post('/users/login', user).then(function(success) {
            setCredentials(success.data.email, success.data.password_hashed, success.data.id);
            showLoginSuccess();
          }, function(error) {
            console.log(error);
            showLoginError();
          });
        }

        loginDialog.connectFb = function() {
          ezfb.getLoginStatus(function(response) {
            if (response.status === 'connected') {
              ezfb.api('/me?fields=id,email,first_name,last_name,picture.width(600).height(600)', function(response) {
                loginFb(response.email, response.id);
              });
            } else {
              ezfb.login(function(response) {
                ezfb.api('/me?fields=id,email,first_name,last_name,picture.width(600).height(600)', function(response) {
                  loginFb(response.email, response.id);
                });
              }, {scope: 'email'});
            }
          });
        }

        loginDialog.resetPassword = function() {
          var user = {
            "user": {
              "email": loginDialog.email
            }
          };
          api.post('/users/reset_password', user).then(function(success) {
            $mdToast.show(
              $mdToast.simple()
              .textContent('Please check your emails, we\'ve just sent you a new password.')
              .hideDelay(5000)
              .position('top center')
            );
          }, function(error) {
            console.log(response);
          });
        }

      };

      var showSignupDialog = function() {
        $mdDialog.show({
          controller: SignupDialogController,
          controllerAs: 'signupDialog',
          templateUrl: 'app/services/authentication/signupDialog.template.html',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: true // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {
          //
        }, function() {
          //
        });
      };

      var showLoginDialog = function(event) {
        $mdDialog.show({
          controller: LoginDialogController,
          controllerAs: 'loginDialog',
          templateUrl: 'app/services/authentication/loginDialog.template.html',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: true // Changed in CSS to only be for XS sizes
        })
        .then(function(answer) {
          //
        }, function() {
          //
        });
      };

      var loggedIn = function() {
        if ($localStorage.auth != null) {
          return true;
        } else {
          return false;
        }
      };

      // Logs out the user by deleting the auth header from localStorage
      var logout = function() {
        document.execCommand("ClearAuthenticationCache");
        delete $localStorage.auth;
        delete $localStorage.userId;
        $http.defaults.headers.common.Authorization = '';
        $mdToast.show(
          $mdToast.simple()
          .textContent('You are logged out.')
          .hideDelay(3000)
          .position('top center')
        );
      };

      // Further all functions to be exposed in the service
      return {
        showSignupDialog: showSignupDialog,
        showLoginDialog: showLoginDialog,
        loggedIn: loggedIn,
        logout: logout
      };
    }
  ]);