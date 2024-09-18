import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute, NavigationStart, Router } from "@angular/router";
import { CoreService } from "@app/core/services";
import {
  PaymentOrder,
  PaymentOrderState,
  PosOrder,
  PosOrderPaymentItem,
} from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { Subscription } from "rxjs";

@Component({
  selector: "app-order-detail",
  templateUrl: "./order-detail.component.html",
  styleUrls: ["./order-detail.component.scss"],
})
export class OrderDetailComponent implements OnInit {
  dictionary = dictionary;
  branchId: number | undefined;
  getPaymentOrder$ = new Subscription();
  paymentOrder: PaymentOrder | undefined;
  loading: boolean = false;
  cols: ICol[] = [];
  currencySymbol: string | undefined;
  payments: PosOrderPaymentItem[] = [];
  paymentState = PaymentOrderState;
  isLinkToFinancialPayments: boolean = false
  @Input() posOrder: PosOrder | undefined;
  @Input() isOpen = false;
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.branchId = this.coreService.getBranchId()!;

    this.router.events.subscribe(event => {
      
      if (event instanceof NavigationStart) {
        if(event.url.includes('all-orders')){
          this.isLinkToFinancialPayments = false
        }else{
          this.isLinkToFinancialPayments = true
        }
      }
    });
  }

  ngOnInit(): void {
    if(this.router.url.includes('all-orders')){
      this.isLinkToFinancialPayments = false
    }else{
      this.isLinkToFinancialPayments = true
    }
    
    if (this.posOrder) {
      let payments: any = JSON.parse(
        JSON.stringify(this.posOrder.paymentItems!)
      );
      let dueTime = JSON.parse(JSON.stringify(this.posOrder?.createdTime));
      if (!payments) this.payments = [];
      else {
        this.payments = payments.map(
          (payment: PosOrderPaymentItem, index: number) => ({
            ...payment,
            payTime: new Date(payment.modifiedTime),
            dueDate:
              index == 0
                ? new Date(dueTime)
                : new Date(
                    new Date(dueTime).setMonth(
                      new Date(dueTime).getMonth() + index
                    )
                  ),
          })
        );
        this.currencySymbol = this.posOrder.pos.currency.symbol!;
      }
    }
    
    this.initCols();
  }

  redirectToFinancialPayments(posOrderPaymentItem: PosOrderPaymentItem) {
    this.onDismiss()
    this.router.navigate([`/branches/${this.branchId}/financial/peyments`], {
      queryParams: {
        paymentOrderType: 'ChargeByPosOrder',
        paymentOrderId: posOrderPaymentItem.paymentOrderId
      }
    });
  }

  initCols(): void {
    let showErrorCol = false;
    let cols: ICol[] = [
      {
        field: "dueDate",
        header: dictionary.DueDate,
        hidden: false,
        width: "auto",
        hasDateTimeRow: true,
      },
      {
        field: "amount",
        header: dictionary.Amount,
        hidden: false,
        width: "auto",
        hasNormalRow: true,
      },
      {
        field: "payTime",
        header: dictionary.PayTime,
        hidden: false,
        width: "auto",
        hasNormalRow: true,
      },
      {
        field: "state",
        header: dictionary.State,
        hidden: false,
        width: "auto",
        hasNormalRow: true,
      },
      {
        field: "error",
        header: dictionary.Error,
        hidden: false,
        width: "auto",
        hasNormalRow: true,
      },
    ];
    if (!this.payments) {
      this.cols = cols;
    } else {
      for (let index = 0; index < this.payments.length; index++) {
        const payment = this.payments[index];
        if (payment.error) {
          showErrorCol = true;
          return;
        }
      }
      if (!showErrorCol) cols = cols.filter((c) => c.field !== "error");
      this.cols = cols;
    }
  }

  convertDate(date: Date | undefined, index: number): string | undefined {
    if (!date) return undefined;
    if (index == 0) {
      return this.coreService.changeFormatDate(date.toISOString());
    } else {
      return this.coreService.changeFormatDate(
        this.firstDayOfMonth(date).toISOString()
      );
    }
  }
  firstDayOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  onDismiss(): void {
    this.payments = [];
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
