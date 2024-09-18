import { Routes } from "@angular/router";
import { dictionary } from "@dictionary/dictionary";
import { DesktopGuard, MobileGuard } from "../guards";

export const CONTENT_ROUTES: Routes = [
  // {
  //   path: ":branchId/products",
  //   loadChildren: () => import("@modules/index").then((m) => m.ProductModule),
  //   data: {
  //     breadcrumb: dictionary.Products,
  //   },
  //   canActivate: [DesktopGuard],
  // },
  {
    path: "branches/:branchId/return-orders",
    loadChildren: () =>
      import("@modules/index").then((m) => m.ReturnOrdersModule),
    data: {
      breadcrumb: dictionary.ReturnOrders,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/sale-managers",
    loadChildren: () =>
      import("@modules/index").then((m) => m.SalesManagerModule),
    data: {
      breadcrumb: dictionary.SaleManagers,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/categories",
    loadChildren: () => import("@modules/index").then((m) => m.CategoryModule),
    data: {
      breadcrumb: dictionary.Categories,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/price-lists",
    loadChildren: () => import("@modules/index").then((m) => m.PriceListModule),
    data: {
      breadcrumb: dictionary.PriceLists,
      deActive: true,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/customers",
    loadChildren: () => import("@modules/index").then((m) => m.CustomerModule),
    data: {
      breadcrumb: dictionary.Customers,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/reports",
    loadChildren: () => import("@modules/index").then((m) => m.ReportsModule),
    data: {
      breadcrumb: dictionary.Reports,
      deActive: true,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/offices",
    loadChildren: () => import("@modules/index").then((m) => m.BranchModule),
    data: {
      breadcrumb: dictionary.Offices,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/settings",
    loadChildren: () => import("@modules/index").then((m) => m.SettingsModule),
    data: {
      breadcrumb: dictionary.Settings,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/shop",
    loadChildren: () => import("@modules/index").then((m) => m.ShopModule),
    data: {
      breadcrumb: dictionary.Shop,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/base-information",
    loadChildren: () =>
      import("@modules/index").then((m) => m.BaseInformationModule),
    data: {
      breadcrumb: dictionary.BaseInfo,
      deActive: true,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/mobile-shop",
    loadChildren: () =>
      import("@modules/index").then((m) => m.MobileShopModule),
    data: {
      breadcrumb: dictionary.Shop,
    },
    canActivate: [MobileGuard],
  },
  {
    path: "branches/:branchId/eGift",
    loadChildren: () => import("@modules/index").then((m) => m.EGiftModule),
    data: {
      breadcrumb: dictionary.EGift,
    },
    canActivate: [MobileGuard],
  },
  {
    path: "branches/:branchId/card",
    loadChildren: () => import("@modules/index").then((m) => m.CardModule),
    data: {
      breadcrumb: dictionary.Card,
    },
    canActivate: [MobileGuard],
  },
  {
    path: "branches/:branchId/activate",
    loadChildren: () => import("@modules/index").then((m) => m.ActivateModule),
    data: {
      breadcrumb: dictionary.Activate,
    },
    canActivate: [MobileGuard],
  },
  {
    path: "branches/:branchId/qr-code",
    loadChildren: () => import("@modules/index").then((m) => m.QrCodeModule),
    data: {
      breadcrumb: dictionary.Activate,
    },
    canActivate: [MobileGuard],
  },
  {
    path: "branches/:branchId/mobile-app-settings",
    loadChildren: () =>
      import("@modules/index").then((m) => m.MobileAppSettingsModule),
    data: {
      breadcrumb: dictionary.Activate,
    },
    canActivate: [MobileGuard],
  },
  {
    path: "branches/:branchId/orders",
    loadChildren: () => import("@modules/index").then((m) => m.OrdersModule),
    data: {
      breadcrumb: dictionary.Orders,
    },
    canActivate: [MobileGuard],
  },
  {
    path: "branches/:branchId/wishlist",
    loadChildren: () => import("@modules/index").then((m) => m.WishlistModule),
    data: {
      breadcrumb: dictionary.Wishlist,
    },
    canActivate: [MobileGuard],
  },
  {
    path: "branches/:branchId/stock",
    loadChildren: () =>
      import("@modules/index").then((m) => m.InventoriesModule),
    data: {
      breadcrumb: dictionary.Stock,
      deActive: true,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/my-wallet",
    loadChildren: () => import("@modules/index").then((m) => m.MyWalletModule),
    data: {
      breadcrumb: dictionary.MyWallet,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/wallet",
    loadChildren: () => import("@modules/index").then((m) => m.PosWalletModule),
    data: {
      breadcrumb: dictionary.MyWallet,
    },
    canActivate: [MobileGuard],
  },
  {
    path: "branches/:branchId/payment",
    loadChildren: () => import("@modules/index").then((m) => m.PaymentModule),
    data: {
      breadcrumb: dictionary.Payment,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/financial",
    loadChildren: () => import("@modules/index").then((m) => m.FinancialModule),
    data: {
      breadcrumb: dictionary.Financial,
      deActive: true,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/dashboard",
    loadChildren: () => import("@modules/index").then((m) => m.DashboardModule),
    data: {
      breadcrumb: dictionary.Dashboard,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/team",
    loadChildren: () => import("@modules/index").then((m) => m.TeamModule),
    data: {
      breadcrumb: dictionary.Team,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/gateway-lists",
    loadChildren: () =>
      import("@modules/index").then((m) => m.GatewayListsModule),
    data: {
      breadcrumb: dictionary.GatewayLists,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/products",
    loadChildren: () => import("@modules/index").then((m) => m.ProductsModule),
    data: {
      breadcrumb: dictionary.Products,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/physical-gift-cards",
    loadChildren: () =>
      import("@modules/index").then((m) => m.PhysicalGiftCardsModule),
    data: {
      breadcrumb: dictionary.PhysicalGiftCards,
      deActive: true,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/pos",
    loadChildren: () => import("@modules/index").then((m) => m.PosModule),
    data: {
      breadcrumb: dictionary.POS,
      deActive: true,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/postpaid",
    loadChildren: () => import("@modules/index").then((m) => m.PostPaidModule),
    data: {
      breadcrumb: dictionary.PostPaid,
      deActive: true,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/customer-postpaid",
    loadChildren: () =>
      import("@modules/index").then((m) => m.CustomerPostpaidModule),
    data: {
      breadcrumb: dictionary.CustomerPostpaid,
      deActive: true,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/all-customers",
    loadChildren: () =>
      import("@modules/index").then((m) => m.AllCustomersModule),
    data: {
      breadcrumb: dictionary.AllCustomers,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "branches/:branchId/profile",
    loadChildren: () => import("@modules/index").then((m) => m.ProfileModule),
    data: {
      breadcrumb: dictionary.Profile,
    },
    canActivate: [DesktopGuard],
  },
  {
    path: "forbidden",
    loadChildren: () => import("@modules/index").then((m) => m.ForbiddenModule),
    data: {
      breadcrumb: dictionary.Forbidden,
    },
  },

  { path: "**", redirectTo: "notfound", pathMatch: "full" },
];
