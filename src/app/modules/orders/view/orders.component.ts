// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, ITag } from "@app/core/services";
import { LayoutService } from "@app/layout";

import { dictionary } from "@dictionary/dictionary";
import { InfiniteScrollCustomEvent } from "@ionic/angular";
import { Subscription } from "rxjs";
import { OrderFilterRequestDto } from "../dto/order.dto";
import { BuyOrdersClient, BuyOrder } from "@app/proxy/shop-proxy";

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.scss"],
})
export class OrdersComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  loading = false;
  orders: BuyOrder[] = [];
  orderFilterRequest = new OrderFilterRequestDto();
  tagList: ITag[] = [];
  branchId: number;
  orderDetailPath: string | undefined;
  page = 1;
  pageSize = 10;
  currentSize: number | undefined;
  pageLoading = false;
  getOrderSub$ = new Subscription();
  activeIndex: number = 0;
  debounce: any = null;
  searchCriteria: string | undefined;
  willDismiss: boolean = false;

  constructor(
    private ordersClient: BuyOrdersClient,
    private coreService: CoreService,
    private layoutService: LayoutService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.orderDetailPath = `/${this.branchId}/reports/order-detail`;
    this.layoutService.selectedBranch.subscribe((branch) => {
      this.branchId = branch.branchId;
      this.initGetOrders(this.orderFilterRequest);
    });
  }

  ngOnInit() {
    this.initGetOrders(this.orderFilterRequest);
  }
  initGetOrders(filter: OrderFilterRequestDto): void {
    this.orderFilterRequest.pageNumber = this.page;
    this.orderFilterRequest.pageSize = this.pageSize;
    this.getOrders(filter, "init");
  }
  scrollGetOrders(filter: OrderFilterRequestDto): void {
    this.getOrders(filter, "scroll");
  }
  getOrders(filter: OrderFilterRequestDto, type: "scroll" | "init"): void {
    this.loadingHandler(type);
    this.orderFilterRequest.branchId = this.branchId;
    this.getOrderSub$ = this.ordersClient
      .getBuyOrders(
        filter.branchId,
        null,
        this.activeIndex === 1 ? true : false,
        this.searchCriteria,
        null,
        filter.beginTime,
        filter.endTime,
        filter.pageNumber,
        filter.pageSize
      )
      .subscribe({
        next: (res: BuyOrder[]) => {
          this.willDismiss = false;
          this.currentSize = res.length < filter.pageSize! ? 0 : res.length;
          res.forEach((order) => {
            this.orders.push(order);
          });
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          this.pageLoading = false;
          new Error(error.message);
        },
        complete: () => {
          this.loading = false;
          this.pageLoading = false;
        },
      });
  }

  onTabChange() {
    this.willDismiss = true;
    this.orders = [];
    this.orderFilterRequest.pageNumber = 1;
    this.getOrders(this.orderFilterRequest, "init");
  }

  onSearchInput(data: any) {
    this.orders = [];
    this.searchCriteria = data;
    this.getOrders(this.orderFilterRequest, "init");
  }

  loadingHandler(type: "scroll" | "init") {
    if (type === "init") {
      this.pageLoading = true;
    } else {
      this.loading = true;
    }
  }

  onScroll(ev: any): void {
    if (this.currentSize && this.currentSize > 0) {
      this.loading = true;
      this.debounce = setTimeout(() => {
        clearTimeout(this.debounce);
        if (this.currentSize! < 99) {
          this.orderFilterRequest.pageNumber =
            this.orderFilterRequest.pageNumber! + 1;
          this.scrollGetOrders(this.orderFilterRequest);
          (ev as InfiniteScrollCustomEvent).target.complete();
        }
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    this.getOrderSub$.unsubscribe();
  }
}
