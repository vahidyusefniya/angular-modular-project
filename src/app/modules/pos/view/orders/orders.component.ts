import { HttpParams } from "@angular/common/http";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  IPageChange,
  ITag,
  LoadingService,
  TagService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  PaymentOrderState,
  PosOrder,
  PosOrderPaymentItem,
  PosOrderState,
  PosOrdersClient,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";
import {
  InprogressStates,
  IPosOrdersTags,
  PosOrdersFilterDto,
} from "../../dto/pos.dto";

declare var require: any;
const html2pdf = require("html2pdf.js");

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.scss"],
})
export class OrdersComponent implements OnInit {
  dictionary = dictionary;
  initPage$ = new Subscription();
  posAction$ = new Subscription();
  loading: boolean = false;
  branchId: number;
  branch: Branch;
  merchantId: number;
  page = 1;
  pageSize = 10;
  openPosOrdersFilterModal: boolean = false;
  cols: any[] = [
    {
      field: "posOrderId",
      header: dictionary.Id,
    },
    {
      field: "product",
      header: dictionary.ProductName,
    },
    {
      field: "isSubscriptive",
      header: dictionary.Subscriptive,
    },
    {
      field: "price",
      header: dictionary.Price,
    },
    {
      field: "quantity",
      header: dictionary.Quantity,
    },
    {
      field: "createdTime",
      header: dictionary.OrderTime,
    },
    {
      field: "paymentMethod",
      header: dictionary.PaymentMethod,
    },
    {
      field: "state",
      header: dictionary.State,
    },
    {
      field: "invoice",
      header: dictionary.Invoice,
    },
  ];
  posOrders: PosOrder[] = [];
  posOrder = new PosOrder();
  invoice: PosOrder | undefined;
  posOrderFilter = new PosOrdersFilterDto();
  changeTagList$ = new Subscription();
  removeTag$ = new Subscription();
  tagList: ITag[] = [];
  openPosOrderModal: boolean = false;
  address = "7940 silverton Ave. Suite 101-A San Diego, CA 92126.";
  email = "info@ezpin.com";
  phone = "01458488";
  posOrderPaymentItemPaymentState = PaymentOrderState;

  @ViewChild("pdfContent", { static: false }) pdfContent!: ElementRef;

  constructor(
    private coreService: CoreService,
    private layoutService: LayoutService,
    private router: Router,
    private posOrdersClient: PosOrdersClient,
    private tagService: TagService,
    private activatedRoute: ActivatedRoute,
    private loadingService: LoadingService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.branch = this.layoutService.getBranch(this.branchId)!;
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });

    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.State) {
        this.posOrderFilter.posOrderState = undefined;
      }

      this.page = 1;
      this.updateRouteParameters(this.posOrderFilter!);
      this.initPage(this.posOrderFilter!);
    });

    this.layoutService.checkPagePermission("PosOrderRead");
  }

  ngOnInit() {
    this.initPosOrdersFilterFromUrlParams();
    this.initPage(this.posOrderFilter!);
  }

  initPosOrdersFilterFromUrlParams(): void {
    const params = this.getUrlParams();
    if (params) {
      this.posOrderFilter.init({
        posOrderState: params.posOrderState
          ? (params.posOrderState as PosOrderState)
          : undefined,
        pageNumber: this.page,
        pageSize: this.pageSize,
      });
    }

    this.updateRouteParameters(this.posOrderFilter);
  }

  getUrlParams(): IPosOrdersTags | undefined {
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const posOrderState = httpParams.get("posOrderState")!;

    let tags: IPosOrdersTags;
    tags = {
      posOrderState,
    };

    return tags;
  }

  initPage(filter: PosOrdersFilterDto): void {
    this.loading = true;
    this.initPage$ = this.posOrdersClient
      .getPosOrders(
        this.branchId,
        filter.posOrderState,
        filter.pageNumber,
        filter.pageSize
      )
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.posOrders = res;
          this.createTagFromUrlParams();
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  onRefreshClick() {
    this.initPage(this.posOrderFilter!);
  }

  onExcelExportClick() {
    this.loading = true;
    this.initPage$ = this.posOrdersClient
      .getPosOrders(this.branchId, this.posOrderFilter.posOrderState, -1)
      .subscribe({
        next: (res) => {
          this.loading = false;
          let temp = [];
          temp = res.map((item) => {
            return {
              posOrderId: item.posOrderId,
              posId: item.pos.posId,
              posName: item.pos.name,
              isSubscriptive: item.pos.isSubscriptive,
              price: item.pos.price,
              currencyId: item?.pos.currency.currencyId,
              currencyName: item?.pos.currency.currencyName,
              quantity: item.quantity,
              paymentMethod: item.paymentMethod,
              posOrderState: item.state,
              paymentInstallmentCacheState: item.paymentInstallmentCacheState,
            };
          });
          temp = res;
          this.coreService.exportExcel(temp, dictionary.PosOrders);
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  filterClick(filter: PosOrdersFilterDto) {
    this.openPosOrdersFilterModal = false;
    this.page = 1;
    this.posOrderFilter.init(filter);
    this.updateRouteParameters(filter);
    this.initPage(this.posOrderFilter);
  }

  createTagFromUrlParams(): void {
    const params = this.getUrlParams()!;
    if (params) this.createTags(params);
  }

  createTags(data: IPosOrdersTags): void {
    let tags: ITag[];

    let posOrderState;

    switch (data.posOrderState) {
      case InprogressStates:
        posOrderState = dictionary.Inprogress;
        break;

      case "2":
        posOrderState = PosOrderState.Paid;
        break;

      case "7":
        posOrderState = PosOrderState.Failed;
        break;

      case "6":
        posOrderState = PosOrderState.Shipping;
        break;

      case "5":
        posOrderState = dictionary.Complete;
        break;

      default:
        posOrderState = undefined;
        break;
    }

    const posOrderStateTag: ITag = {
      key: dictionary.State,
      value: data.posOrderState && !!posOrderState ? posOrderState : undefined,
      clearable: true,
    };

    tags = [posOrderStateTag];
    this.tagService.createTags(tags);
  }

  updateRouteParameters(filter: PosOrdersFilterDto) {
    const params: Params = {
      posOrderState: filter.posOrderState,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }

  downloadInvoice(rowData: PosOrder) {
    this.invoice = rowData;
    this.loadingService.present();

    setTimeout(() => {
      const options = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: "invoice.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      const content: Element = this.pdfContent.nativeElement;

      html2pdf()
        .from(content)
        .set(options)
        .toPdf()
        .get("pdf")
        .then((pdf: any) => {
          // Limit to only one page
          const totalPages = pdf.internal.getNumberOfPages();
          if (totalPages > 1) {
            pdf.deletePage(2);
            pdf.deletePage(3);
          }
        })
        .save();

      this.loadingService.dismiss();
      this.invoice = undefined;
    }, 1000);
  }

  showDetail(data: PosOrder) {
    this.posOrder = data;
    this.openPosOrderModal = true;
  }

  getCapturedStates(posOrderPaymentItem: PosOrderPaymentItem[]) {
    return posOrderPaymentItem.filter(
      (x) => x.state === this.posOrderPaymentItemPaymentState.Captured
    ).length;
  }

  convertState(state: string): { status: string; icon: string } {
    const typeMap: { [key: string]: { status: string; icon: string } } = {
      WaitingForAutoPay: { status: "Inprogress", icon: "Inprogress_pos_order" },
      WaitingForPay: { status: "Inprogress", icon: "Inprogress_pos_order" },
      PaymentOrderCaptured: {
        status: "Inprogress",
        icon: "Inprogress_pos_order",
      },
      Shipping: { status: "Shipping", icon: "Shipping_pos_order" },
      Delivered: { status: "Complete", icon: "Complete" },
      Paying: { status: "Inprogress", icon: "Inprogress_pos_order" },
      Paid: { status: "Paid", icon: "Inprogress_pos_order" },
      Created: { status: "Inprogress", icon: "Inprogress_pos_order" },
      Failed: { status: "Failed", icon: "Failed" },
    };
    return typeMap[state];
  }

  pageChanged(data: IPageChange): void {
    this.page = data.page;
    this.posOrderFilter.pageNumber = data.page;
    this.initPage(this.posOrderFilter);
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
  }
}
