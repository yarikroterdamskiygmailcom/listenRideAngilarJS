import './app.constants.js';
import './app.module.js';
import './app.routes.js';
import './app.theme.js';
import './i18n/angular-locale_de.js';
// core modules
import './modules/invite/invite.component.js';
import './modules/referral-link/referral-link.component.js';
import './modules/invite-landing/invite-landing.component.js';
import './modules/bike/bike.component.js';
import './modules/bike/calendar/calendar.component.js';
import './modules/booking/booking.component.js';
import './modules/home/home.component.js';
import './modules/bike/list/list.component.js';
import './modules/listing-a-bike/listing-a-bike.component.js';
import './modules/listings/listings.component.js';
import './modules/renting-a-bike/renting-a-bike.component.js';
import './modules/requests/requests.component.js';
import './modules/requests/requests.service.js';
import './modules/search/search.component.js';
import './modules/settings/settings.component.js';
import './modules/listings/views/list-view.component.js';
import './modules/static/static.component.js';
import './modules/user/user.component.js';
import './modules/invoices/invoices.component.js';
import './modules/meta-tags/meta-tags.component.js';
import './modules/seo-landing/seo-landing.component.js';
import './modules/shared/autocomplete/autocomplete.component.js';
import './modules/shared/bike-card/bike-card.component.js';
import './modules/seo/shared/bike-cards-list.component.js';
import './modules/shared/listing-card/listing-card.component.js';
import './modules/shared/message/message.component.js';
import './modules/shared/rating/rating.component.js';
import './modules/shared/confirmation/confirmation.component.js';
import './modules/shared/receipt/receipt.component.js';
import './modules/shared/lnr-support/lnr-support.component.js';
import './modules/shared/input-range/input-range.component.js';
import './modules/shared/credit-cards/angular-credit-cards.js';
import './modules/shared/address-input/address-input.component.js';
import './modules/multi-booking/multi-booking.component.js';
import './modules/shared/filter/bike-count-filter.component.js';
import './modules/shared/filter/category-filter.component.js';
import './modules/shared/filter/accessories-filter.component.js';
import './modules/shared/credit-card-input/credit-card-input.component.js';
import './modules/shared/status-labels/status-labels.component.js';
import './modules/booking-calendar/booking-calendar.service.js';
import './modules/booking-calendar/booking-calendar.component.js';
import './modules/shared/paypal-checkout-button/paypal-checkout-button.component.js';
import './modules/shared/breadcrumbs/breadcrumbs.component.js';

// core services
import './services/base64/base64.service.js';
import './services/authentication/authentication.service.js';
import './services/sha256/sha256.service.js';
import './services/api/api.service.js';
import './services/verification/verification.service.js';
import './services/bike-options/bike-options.service.js';
import './services/bike-cluster/bike-cluster.service.js';
import './services/map-configs/map-configs.service.js';
import './services/access-control/access-control.service.js';
import './services/loading-dialog/loading-dialog.service.js';
import './services/user-api/user-api.service.js';
import './services/price/price.service.js';
import './services/voucher/voucher.service.js';
import './services/country-code-translator/country-code-translator.service.js';
import './services/notification/notification.service.js';

// helpers
import './services/date-helper/date-helper.service.js';
import './services/application-helper/application-helper.service.js';
import './services/calendar-helper/calendar-helper.service.js';
import './services/payment-helper/payment-helper.service.js';
import './services/payout-helper/payout-helper.service.js';
import './services/user-helper/user-helper.service.js';
import './services/bike-helper/bike-helper.service.js';
import './services/bike-event-helper/bike-event-helper.service.js';
// import './services/bikes-map/bikes-map.service.js';
// core filters
import './filters/category.filter.js';
import './filters/category-seo.filter.js';
import './filters/map-category.filter.js';
import './filters/title-case.filter.js';
import './filters/add-text.filter.js';
// core directives
import './directives/showAsInteger.js';
import './directives/lnrFocus.js';
import './directives/lnrMaxLength.js';
import './directives/lnrMdFocusTabs.js';
import './directives/lnrMdMenuFullscreen.js';
import './directives/lnrDatePicker.js';
import './directives/ng-infinite-scroll.js';
import './directives/lnrMetaRobots.js';
// header and footer
import './modules/footer/footer.component.js';
import './modules/footer/seo-grid/seo-grid.component.js';
import './modules/header/header.component.js';
import './modules/sidebar/sidebar.component.js';
import './modules/privacy-bar/privacy-bar.component.js';
import './modules/brands/brands.component.js';
// extra modules
import './modules/invest/invest.component.js';
import './modules/business-community/business-community.component.js';
import './modules/jobs/jobs.component.js';
import './modules/seo/city-landing.component.js';
import './modules/seo/category-landing.component.js';
import './modules/seo/country-landing.compoment.js';
import './modules/shared/filter/filter.component.js';
import './modules/shared/bike-sorter/bike-sorter.component.js';
import './modules/shared/cardgrid/cardgrid.component.js';

// brand integration
import './modules/brand-integration/ampler.component.js';
import './modules/brand-integration/vello.component.js';
import './modules/brand-integration/veletage.component.js';
import './modules/brand-integration/brompton.component.js';
import './modules/brand-integration/bonvelo.component.js';
import './modules/brand-integration/motoparilla.component.js';
import './modules/brand-integration/vanmoof.component.js';
import './modules/brand-integration/moeve.component.js';
import './modules/brand-integration/rethink.component.js';
import './modules/brand-integration/ampler.component.js';
import './modules/brand-integration/muli.component.js';
import './modules/brand-integration/votec.component.js';
import './modules/brand-integration/cocomat.component.js';
import './modules/brand-integration/leaos.component.js';
import './modules/brand-integration/veloheld.component.js';
import './modules/brand-integration/swytch.component.js';
import './modules/brand-integration/whyte.component.js';
import './modules/brand-integration/felt.component.js';
import './modules/brand-integration/unimoke.component.js';
import './modules/brand-integration/bzen.component.js';
import './modules/brand-integration/urwahn.component.js';
import './modules/brand-integration/cowboybikes.component.js';
import './modules/brand-integration/argon18.component.js';
import './modules/brand-integration/rossignol.component.js';
import './modules/brand-integration/yuba.component.js';
import './modules/brand-integration/matebikes.component.js';
// events
import './modules/events/event.component.js';
import './modules/events/crossride/crossride.component.js';
import './modules/events/in-velo-veritas/in-velo-veritas.component.js';
import './modules/events/velothon-bikerental/coffeespin.component.js';
import './modules/events/depart/depart.component.js';
import './modules/events/mcbw/mcbw.component.js';
import './modules/events/rapha-super-cross/rapha-super-cross.component.js';
import './modules/events/constance-spin/constance-spin.component.js';
import './modules/events/velosoph/velosoph.component.js';
import './modules/events/cwd/pushnpost.component.js';
import './modules/events/cwd/kuchenundraketen.component.js';
import './modules/events/supercross-munich/supercross-munich.component.js';
import './modules/events/cape-argus/cape-argus.component.js';
import './modules/events/eroica-gaiole/eroica-gaiole.component.js';
import './modules/faq/faq.component.js';
