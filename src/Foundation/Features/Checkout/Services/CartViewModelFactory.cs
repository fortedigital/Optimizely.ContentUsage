﻿using EPiServer;
using EPiServer.Commerce.Order;
using EPiServer.Core;
using EPiServer.Security;
using EPiServer.Web.Routing;
using Foundation.Features.Checkout.ViewModels;
using Foundation.Features.Header;
using Foundation.Features.MyAccount.AddressBook;
using Foundation.Features.NamedCarts.DefaultCart;
using Foundation.Features.NamedCarts.SharedCart;
using Foundation.Features.NamedCarts.Wishlist;
using Foundation.Features.Settings;
using Foundation.Infrastructure.Cms.Extensions;
using Foundation.Infrastructure.Cms.Settings;
using Foundation.Infrastructure.Commerce.Markets;
using Mediachase.Commerce;
using Mediachase.Commerce.Catalog;
using Mediachase.Commerce.Security;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;

namespace Foundation.Features.Checkout.Services
{
    public class CartViewModelFactory
    {
        private readonly IContentLoader _contentLoader;
        private readonly ICurrencyService _currencyService;
        private readonly IOrderGroupCalculator _orderGroupCalculator;
        private readonly ShipmentViewModelFactory _shipmentViewModelFactory;
        private readonly ReferenceConverter _referenceConverter;
        private readonly UrlResolver _urlResolver;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAddressBookService _addressBookService;
        private readonly ISettingsService _settingsService;

        public CartViewModelFactory(
            IContentLoader contentLoader,
            ICurrencyService currencyService,
            IOrderGroupCalculator orderGroupCalculator,
            ShipmentViewModelFactory shipmentViewModelFactory,
            ReferenceConverter referenceConverter,
            UrlResolver urlResolver,
            IHttpContextAccessor httpContextAccessor,
            IAddressBookService addressBookService,
            ISettingsService settingsService)
        {
            _contentLoader = contentLoader;
            _currencyService = currencyService;
            _orderGroupCalculator = orderGroupCalculator;
            _shipmentViewModelFactory = shipmentViewModelFactory;
            _referenceConverter = referenceConverter;
            _urlResolver = urlResolver;
            _httpContextAccessor = httpContextAccessor;
            _addressBookService = addressBookService;
            _settingsService = settingsService;
        }

        public virtual MiniCartViewModel CreateMiniCartViewModel(ICart cart, bool isSharedCart = false)
        {
            var labelSettings = _settingsService.GetSiteSettings<LabelSettings>();
            var pageSettings = _settingsService.GetSiteSettings<ReferencePageSettings>();
            if (cart == null)
            {
                return new MiniCartViewModel
                {
                    ItemCount = 0,
                    CheckoutPage = pageSettings?.CheckoutPage,
                    CartPage = isSharedCart ? pageSettings?.SharedCartPage : pageSettings?.CartPage,
                    Label = isSharedCart ? labelSettings?.SharedCartLabel : labelSettings?.CartLabel,
                    Shipments = Enumerable.Empty<ShipmentViewModel>(),
                    Total = new Money(0, _currencyService.GetCurrentCurrency()),
                    IsSharedCart = isSharedCart
                };
            }

            return new MiniCartViewModel
            {
                ItemCount = GetLineItemsTotalQuantity(cart),
                CheckoutPage = pageSettings?.CheckoutPage,
                CartPage = isSharedCart ? pageSettings?.SharedCartPage : pageSettings?.CartPage,
                Label = isSharedCart ? labelSettings?.SharedCartLabel : labelSettings?.CartLabel,
                Shipments = _shipmentViewModelFactory.CreateShipmentsViewModel(cart),
                Total = _orderGroupCalculator.GetSubTotal(cart),
                IsSharedCart = isSharedCart
            };
        }

        public virtual LargeCartViewModel CreateSimpleLargeCartViewModel(ICart cart)
        {
            if (cart == null)
            {
                var zeroAmount = new Money(0, _currencyService.GetCurrentCurrency());
                return new LargeCartViewModel()
                {
                    TotalDiscount = zeroAmount,
                    Total = zeroAmount,
                    TaxTotal = zeroAmount,
                    ShippingTotal = zeroAmount,
                    Subtotal = zeroAmount,
                };
            }

            var totals = _orderGroupCalculator.GetOrderGroupTotals(cart);
            var orderDiscountTotal = _orderGroupCalculator.GetOrderDiscountTotal(cart);
            var shippingDiscountTotal = cart.GetShippingDiscountTotal();
            var discountTotal = shippingDiscountTotal + orderDiscountTotal;

            var model = new LargeCartViewModel()
            {
                TotalDiscount = discountTotal,
                Total = totals.Total,
                ShippingTotal = totals.ShippingTotal,
                Subtotal = totals.SubTotal,
                TaxTotal = totals.TaxTotal,
                ReferrerUrl = GetReferrerUrl(),
            };

            return model;
        }

        public virtual LargeCartViewModel CreateLargeCartViewModel(ICart cart, CartPage cartPage)
        {
            var pageSettings = _settingsService.GetSiteSettings<ReferencePageSettings>();
            var contact = PrincipalInfo.CurrentPrincipal.GetCustomerContact();
            AddressModel addressModel;
            if (cart == null)
            {
                var zeroAmount = new Money(0, _currencyService.GetCurrentCurrency());
                addressModel = new AddressModel();
                _addressBookService.LoadCountriesAndRegionsForAddress(addressModel);
                return new LargeCartViewModel(cartPage)
                {
                    Shipments = Enumerable.Empty<ShipmentViewModel>(),
                    TotalDiscount = zeroAmount,
                    Total = zeroAmount,
                    TaxTotal = zeroAmount,
                    ShippingTotal = zeroAmount,
                    Subtotal = zeroAmount,
                    ReferrerUrl = GetReferrerUrl(),
                    CheckoutPage = pageSettings?.CheckoutPage,
                    //MultiShipmentPage = checkoutPage.MultiShipmentPage,
                    AppliedCouponCodes = Enumerable.Empty<string>(),
                    AddressModel = addressModel,
                    ShowRecommendations = true
                };
            }

            var totals = _orderGroupCalculator.GetOrderGroupTotals(cart);
            var orderDiscountTotal = _orderGroupCalculator.GetOrderDiscountTotal(cart);
            var shippingDiscountTotal = cart.GetShippingDiscountTotal();
            var discountTotal = shippingDiscountTotal + orderDiscountTotal;

            var model = new LargeCartViewModel(cartPage)
            {
                Shipments = _shipmentViewModelFactory.CreateShipmentsViewModel(cart),
                TotalDiscount = discountTotal,
                Total = totals.Total,
                ShippingTotal = totals.ShippingTotal,
                Subtotal = totals.SubTotal,
                TaxTotal = totals.TaxTotal,
                ReferrerUrl = GetReferrerUrl(),
                CheckoutPage = pageSettings?.CheckoutPage,
                //MultiShipmentPage = checkoutPage.MultiShipmentPage,
                AppliedCouponCodes = cart.GetFirstForm().CouponCodes.Distinct(),
                HasOrganization = contact?.OwnerId != null,
                ShowRecommendations = cartPage != null ? cartPage.ShowRecommendations : true
            };

            var shipment = model.Shipments.FirstOrDefault();
            addressModel = shipment?.Address ?? new AddressModel();
            _addressBookService.LoadCountriesAndRegionsForAddress(addressModel);
            model.AddressModel = addressModel;

            return model;
        }

        public virtual WishListViewModel CreateWishListViewModel(ICart cart, WishListPage wishListPage)
        {
            if (cart == null)
            {
                return new WishListViewModel(wishListPage)
                {
                    ItemCount = 0,
                    CartItems = Array.Empty<CartItemViewModel>(),
                    Total = new Money(0, _currencyService.GetCurrentCurrency())
                };
            }

            var contact = PrincipalInfo.CurrentPrincipal.GetCustomerContact();
            return new WishListViewModel(wishListPage)
            {
                ItemCount = GetLineItemsTotalQuantity(cart),
                CartItems = _shipmentViewModelFactory.CreateShipmentsViewModel(cart).SelectMany(x => x.CartItems),
                Total = _orderGroupCalculator.GetSubTotal(cart),
                HasOrganization = contact?.OwnerId != null
            };
        }

        public virtual MiniWishlistViewModel CreateMiniWishListViewModel(ICart cart)
        {
            var pageSettings = _settingsService.GetSiteSettings<ReferencePageSettings>();
            var labelSettings = _settingsService.GetSiteSettings<LabelSettings>();
            var contact = PrincipalInfo.CurrentPrincipal.GetCustomerContact();
            if (cart == null)
            {
                return new MiniWishlistViewModel
                {
                    ItemCount = 0,
                    Items = Array.Empty<CartItemViewModel>(),
                    WishlistPage = pageSettings?.WishlistPage,
                    HasOrganization = contact?.OwnerId != null,
                    Label = labelSettings?.WishlistLabel,
                };
            }

            return new MiniWishlistViewModel
            {
                ItemCount = GetLineItemsTotalQuantity(cart),
                Items = _shipmentViewModelFactory.CreateShipmentsViewModel(cart).SelectMany(x => x.CartItems),
                WishlistPage = pageSettings?.WishlistPage,
                Total = _orderGroupCalculator.GetSubTotal(cart),
                Label = labelSettings?.WishlistLabel,
                HasOrganization = contact?.OwnerId != null
            };
        }

        public virtual WishListMiniCartViewModel CreateWishListMiniCartViewModel(ICart cart)
        {
            var wishListLink = _settingsService.GetSiteSettings<ReferencePageSettings>()?.WishlistPage;
            var wishListPage = !wishListLink.IsNullOrEmpty() ? _contentLoader.Get<WishListPage>(wishListLink) : null;
            var contact = PrincipalInfo.CurrentPrincipal.GetCustomerContact();
            if (cart == null && wishListPage != null)
            {
                return new WishListMiniCartViewModel(wishListPage)
                {
                    ItemCount = 0,
                    WishListPage = wishListLink,
                    CartItems = Array.Empty<CartItemViewModel>(),
                    Total = new Money(0, _currencyService.GetCurrentCurrency()),
                    HasOrganization = contact?.OwnerId != null
                };
            }

            if (wishListPage != null)
            {
                return new WishListMiniCartViewModel(wishListPage)
                {
                    ItemCount = GetLineItemsTotalQuantity(cart),
                    WishListPage = wishListLink,
                    CartItems = _shipmentViewModelFactory.CreateShipmentsViewModel(cart).SelectMany(x => x.CartItems),
                    Total = _orderGroupCalculator.GetSubTotal(cart),
                    HasOrganization = contact?.OwnerId != null
                };
            }
            else
            {
                return null;
            }
        }

        public virtual SharedCartViewModel CreateSharedCartViewModel(ICart cart, SharedCartPage sharedCartPage)
        {
            if (cart == null)
            {
                return new SharedCartViewModel(sharedCartPage)
                {
                    ItemCount = 0,
                    CartItems = Array.Empty<CartItemViewModel>(),
                    Total = new Money(0, _currencyService.GetCurrentCurrency())
                };
            }

            var contact = PrincipalInfo.CurrentPrincipal.GetCustomerContact();
            return new SharedCartViewModel(sharedCartPage)
            {
                ItemCount = GetLineItemsTotalQuantity(cart),
                CartItems = _shipmentViewModelFactory.CreateShipmentsViewModel(cart).SelectMany(x => x.CartItems),
                Total = _orderGroupCalculator.GetSubTotal(cart),
                HasOrganization = contact?.OwnerId != null
            };
        }

        public virtual SharedMiniCartViewModel CreateSharedMiniCartViewModel(ICart cart)
        {
            var sharedCartLink = _settingsService.GetSiteSettings<ReferencePageSettings>()?.SharedCartPage;
            var sharedCartPage = !sharedCartLink.IsNullOrEmpty() ? _contentLoader.Get<SharedCartPage>(sharedCartLink) : null;
            if (cart == null && sharedCartPage != null)
            {
                return new SharedMiniCartViewModel(sharedCartPage)
                {
                    ItemCount = 0,
                    SharedCartPage = sharedCartLink,
                    CartItems = Array.Empty<CartItemViewModel>(),
                    Total = new Money(0, _currencyService.GetCurrentCurrency())
                };
            }

            if (sharedCartPage != null)
            {
                return new SharedMiniCartViewModel(sharedCartPage)
                {
                    ItemCount = GetLineItemsTotalQuantity(cart),
                    SharedCartPage = sharedCartLink,
                    CartItems = _shipmentViewModelFactory.CreateShipmentsViewModel(cart).SelectMany(x => x.CartItems),
                    Total = _orderGroupCalculator.GetSubTotal(cart)
                };
            }
            else
            {
                return null;
            }
        }

        private decimal GetLineItemsTotalQuantity(ICart cart)
        {
            if (cart != null)
            {
                var cartItems = cart
                .GetAllLineItems()
                .Where(c => !ContentReference.IsNullOrEmpty(_referenceConverter.GetContentLink(c.Code)));
                return cartItems.Sum(x => x.Quantity);
            }
            else
            {
                return 0;
            }
        }

        private string GetReferrerUrl()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var urlReferer = httpContext.Request.Headers["UrlReferrer"].ToString();
            var hostUrlReferer = string.IsNullOrEmpty(urlReferer) ? "" : new Uri(urlReferer).Host;
            if (urlReferer != null && hostUrlReferer.Equals(httpContext.Request.Host.Host.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                return urlReferer;
            }

            return _urlResolver.GetUrl(ContentReference.StartPage);
        }
    }
}