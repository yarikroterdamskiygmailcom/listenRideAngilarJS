'use strict';

angular
  .module('listnride')
  .factory('paymentHelper', [
    'ENV',
    'api',
    'authentication',
    'notification',
    PaymentHelperController
  ]);


function PaymentHelperController(ENV, api, authentication, notification) {
  return {
    btClient: '',
    btPpInstance: '',
    btThreeDSecure: null,
    fetchClientToken: function() {
      return api.get('/users/' + authentication.userId() + '/payment_methods/new').then(function(response) {
        return response.data.token;
      });
    },
    fetchPaymentMethodNonce: function() {
      return api.get('/users/' + authentication.userId() + '/payment_methods/nonce').then(function(response) {
        return response.data.nonce;
      });
    },
    createBrainTreeClient: function(clientToken) {
      return braintree.client.create({
        authorization: clientToken
      });
    },
    createThreeDSecure: function(btClient) {
      return braintree.threeDSecure.create({
        version: 2,
        client: btClient
      });
    },
    createPaypalClient: function(btClient, onPaypalSuccessPayment) {
      var paypalClient;

      return braintree.paypalCheckout.create({
        client: btClient
      }).then(function (clientInstance) {
        paypalClient = clientInstance;
        return clientInstance;
      }).then(function (paypalCheckoutInstance) {


        paypal.Button.render({
          env: 'sandbox', // 'production' or 'sandbox'

          payment: function () {
            return paypalCheckoutInstance.createPayment({
              flow: 'vault'
            });
          },

          onAuthorize: function (data, actions) {
            return paypalCheckoutInstance.tokenizePayment(data)
              .then(function (payload) {
                var data = {
                  "payment_method": {
                    "payment_method_nonce": payload.nonce,
                    "email": payload.details.email,
                    "payment_type": "paypal-account"
                  }
                };

                api.post('/users/' + authentication.userId() + '/payment_methods', data).then(
                  function () {
                    onPaypalSuccessPayment(data.payment_method);
                  },
                  function (error) {
                    notification.show(error, 'error');
                  }
                );
              });
          },

          onCancel: function (data) {
            console.log('checkout.js payment cancelled', JSON.stringify(data, 0, 2));
          },

          onError: function (err) {
            console.error('checkout.js error', err);
          }
        }, '#paypal-checkout');
      }).then(function () {
        return paypalClient;
      });
    },
    setupBraintreeClient: function(onPaypalSuccessPayment) {
      var self = this;

      return self.fetchClientToken()
        .then(self.createBrainTreeClient)
        .then(function(btClient) {
          self.btClient = btClient;
          return self.btClient;
        })
        .then(self.createThreeDSecure)
        .then(function(threeDSecure) {
          self.btThreeDSecure = threeDSecure;

          return self.createPaypalClient(self.btClient, onPaypalSuccessPayment);
        })
        .then(
          function(ppClient) {
            self.btPpInstance = ppClient;
            return self;
          },
          function() {
            return self;
          }
        );
    },
    authenticateThreeDSecure: function(amount, user, addFrameCb, removeFrameCb) {
      var self = this;

      return self.setupBraintreeClient()
        .then(self.fetchPaymentMethodNonce)
        .then(function(nonce) {
          var location = user.locations.billing_address || user.locations.primary;

          return self.btThreeDSecure.verifyCard(
            {
              amount: amount,
              nonce: nonce,
              additionalInformation: {
                billingGivenName: user.firstName,
                billingSurname: user.lastName,
                billingPhoneNumber: user.pretty_phone_number,
                billingAddress: {
                  streetAddress: location.street,
                  locality: location.city,
                  countryCodeAlpha2: location.alpha2_country_code
                },
                email: user.email
              },
              addFrame: addFrameCb,
              removeFrame: removeFrameCb,
              onLookupComplete: function(data, next) {
                next();
              }
           }
          );
        });
    },
    btPostCreditCard: function(creditCardData, cb, cbError) {
      notification.show(null, null, 'booking.payment.getting-saved');
      var self = this;
      self.btClient.request({
        endpoint: 'payment_methods/credit_cards',
        method: 'post',
        data: {
          creditCard: {
            number: creditCardData.creditCardNumber,
            expirationDate: creditCardData.expiryDate,
            cvv: creditCardData.securityNumber
          }
        }
      }, function (err, response) {
        if (!err) {
          var data = {
            "payment_method": {
              "payment_method_nonce": response.creditCards[0].nonce,
              "last_four": response.creditCards[0].details.lastFour,
              "card_type": response.creditCards[0].details.cardType,
              "payment_type": "credit-card"
            }
          };
          api.post('/users/' + authentication.userId() + '/payment_methods', data).then(
            function () {
              if (typeof cb == 'function') cb(data.payment_method);
            },
            function (error) {
              if (typeof cbError == 'function') cbError();
              notification.show(error, 'error');
            }
          );
        }
      });
    },
    updatePaymentUserData: function(currentPaymentData, newData) {
      return Object.assign({}, newData);
    },
    getPaymentShortDescription: function(paymentData) {
      switch (paymentData.payment_type) {
        case 'credit-card':
          return '**** **** **** ' + paymentData.last_four;
        case 'paypal-account':
          return paymentData.email;
        default:
          notification.show(null, null, 'shared.errors.unexpected-payment-type');
          return false;
      }
    }
  }
}
