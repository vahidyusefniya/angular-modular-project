// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService } from "@app/core/services";
import {
  Price,
  PriceListsClient,
  PriceRule,
  PriceView,
  Product,
  ProductSummary,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertController, ModalController } from "@ionic/angular";
import { IRule, PriceDto, RuleDto } from "../../dto/price-list.dto";
import { LayoutService } from "@app/layout";

@Component({
  selector: "app-price-edit",
  templateUrl: "./price-edit.component.html",
  styleUrls: ["./price-edit.component.scss"],
})
export class PriceEditComponent implements OnInit {
  dictionary = dictionary;
  price = new PriceDto();
  priceRule: PriceRule[] = [];
  rules: IRule[] = [];
  loading = false;
  openCreateRuleModal = false;
  showDiscardAlert = false;
  openEditRuleModal = false;
  alertButtons = [
    {
      text: dictionary.Cancel,
      role: "cancel",
      handler: () => {
        this.showDiscardAlert = false;
      },
    },
    {
      text: dictionary.Discard,
      role: "confirm",
      handler: () => {
        this.modalCtrl.dismiss();
        this.dismiss.emit();
        this.showDiscardAlert = false;
      },
    },
  ];
  alertDeleteRuleButtons = [
    {
      text: dictionary.Close,
      role: "cancel",
      handler: () => {
        this.showDeleteAlert = false;
      },
    },
  ];
  showDeleteAlert: boolean = false;
  ruleData: IRule | undefined;
  isAddException = false;
  rulesLengthTemp = 0;
  currency: string | undefined;
  priceResultsData: any[] = [];
  rulesColumns: any[] = [
    {
      field: "price",
      header: dictionary.Price,
    },
  ];
  columns: any[] = [
    {
      field: "priceRange",
      header: dictionary.Price,
    },
    // {
    //   field: "discountBuyingPrice",
    //   header: dictionary.DiscountBuyingPrice,
    // },
    {
      field: "buyingPrice",
      header: dictionary.BuyingPrice,
    },
  ];
  coreService$: CoreService;
  isDirtyPage = false;
  showRangeStartAndEndInRuleModal = true;
  regionName: string | undefined;
  showNewExceptionButton = false;
  isPriceRange = true;
  showPriceRangeCheckBox = true;

  @Input() isOpen = false;
  @Input() priceId: number | undefined;
  @Input() inputPrice: Price | undefined;
  @Input() productId: number | undefined;
  @Input() title: string | undefined;
  @Input() priceListId!: number;
  @Input() products: ProductSummary[] = [];
  @Input() branchId: number | undefined;
  @Input() priceRange: { start: number; end: number } | undefined;
  @Output() editPrice = new EventEmitter<PriceView>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private priceListsClient: PriceListsClient,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private layoutService: LayoutService
  ) {
    this.coreService$ = this.coreService;
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params["branch"] && params["priceList"]) {
        this.isAddException = true;
      }
    });
  }

  ngOnInit() {
    if (!this.branchId) {
      this.branchId = this.coreService.getBranchId();
    }

    this.initRulesColumns();

    if (this.inputPrice) {
      this.price.init({
        productId: this.inputPrice.product.productId,
        productName: this.inputPrice.product.productName!,
        rules: this.inputPrice.rules as any,
      });

      let rules = this.inputPrice.rules.map((item) => ({
        ...item,
        priceValue:
          item.priceValueMode === 0
            ? item.priceValue! * 100 - 100
            : item.priceValue! * 100,
        id: Math.random(),
      }));

      this.rules = JSON.parse(JSON.stringify(rules));
      this.rulesLengthTemp = this.rules.length;
    }
    let defaultIndex = this.rules.findIndex((r) => this.isRuleDefault(r));
    this.rules = this.coreService.changeArrayItemIndex(
      this.rules,
      defaultIndex,
      0
    );

    this.regionName = this.inputPrice?.regions![0]?.code;

    this.getPreviewResult("init");
    this.initColumns();
  }

  initRulesColumns() {
    const branch = this.layoutService.branches.find(
      (x) => x.branchId === this.branchId
    );

    // if (branch?.canSetBuyValue) {
    this.rulesColumns.push({
      field: "sellingMargin",
      header: `${
        branch?.canSetBuyValue
          ? dictionary.SellingMargin + " (%)"
          : dictionary.SellingDiscount
      }`,
    });
    // }

    this.rulesColumns.push(
      {
        field: "status",
        header: dictionary.Status,
      },
      {
        field: "action",
        header: dictionary.Empty,
      }
    );
  }

  initColumns(): void {
    const branch = this.layoutService.branches.find(
      (x) => x.branchId === this.branchId
    );

    // if (branch?.canSetFaceValue) {
    //   this.columns.push({
    //     field: "discountSellingPrice",
    //     header: dictionary.SellingDiscount + " (%)",
    //   });
    // }

    // if (branch?.canSetBuyValue) {
    //   this.columns.push({
    //     field: "sellingMargin",
    //     header: dictionary.SellingMargin + " (%)",
    //   });
    // }

    this.columns.push(
      {
        field: "sellingPrice",
        header: dictionary.SellingPrice,
      },
      {
        field: "isActive",
        header: dictionary.Status,
      },
      {
        field: "error",
        header: dictionary.Empty,
      }
    );
  }

  addRule(rule: RuleDto): void {
    this.openCreateRuleModal = false;
    this.price.rules.push(rule);
    this.getPreviewResult("edit", "setAddRule", rule);
  }
  setAddRule(rule: RuleDto): void {
    this.isDirtyPage = true;
    this.rules = this.price.rules;
  }
  onEditRuleClick(rule: IRule): void {
    this.ruleData = rule;
    if (this.isRuleDefault(rule)) {
      this.showRangeStartAndEndInRuleModal = false;
    } else {
      this.showRangeStartAndEndInRuleModal = true;
    }

    this.openEditRuleModal = true;
  }
  editRule(rule: RuleDto): void {
    let updateItem = this.rules.find((r) => r.id == rule.id);
    let index = this.rules.indexOf(updateItem!);
    if (index == -1) return;
    // this.rules[index] = rule;
    this.price.rules[index] = rule;
    // this.isDirtyPage = true;
    this.getPreviewResult("edit", "setEditRule", rule);
  }
  setEditRule(rule: IRule): void {
    // let updateItem = this.rules.find((r) => r.id == rule.id);
    // let index = this.rules.indexOf(updateItem!);
    // if (index == -1) return;
    // this.rules[index] = rule;
    this.rules = this.price.rules;
    this.isDirtyPage = true;
  }
  removeRule(rule: IRule): void {
    const index = this.rules.indexOf(rule, 0);
    if (index == -1) return;
    this.rules.splice(index, 1);
    this.price.rules = this.rules;
    this.getPreviewResult("edit");
    this.isDirtyPage = true;
  }
  onRenderItems(event: any) {
    this.isDirtyPage = true;
    const draggedItem = this.rules.splice(event.detail.from, 1)[0];
    this.rules.splice(event.detail.to, 0, draggedItem);
    event.detail.complete();
  }

  onDismiss(): void {
    if (this.rulesLengthTemp != this.rules.length) this.showDiscardAlert = true;
    else {
      this.modalCtrl.dismiss();
      this.showDiscardAlert = false;
      this.dismiss.emit();
    }
  }

  onNewClick(): void {
    this.loadingService.present();
    this.priceRule = this.rules.map((rule: any) => ({
      ...rule,
      priceValue:
        rule.priceValueMode === 0
          ? (rule.priceValue + 100) / 100
          : rule.priceValue / 100,
    }));
    this.priceListsClient
      .setPriceRulesByProduct(
        this.branchId!,
        this.priceListId,
        this.productId!,
        this.priceRule,
        false
      )
      .subscribe({
        next: (res: PriceView) => {
          this.editPrice.emit(res);
          this.loadingService.dismiss();
          this.modalCtrl.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  getPreviewResult(
    mode: "init" | "edit",
    action?: "setAddRule" | "setEditRule",
    rule?: RuleDto
  ): void {
    this.loadingService.present();
    let priceRules: any[];
    // this.priceResultsData = [];
    if (mode === "edit") {
      priceRules = this.price.rules.map((rule: any) => ({
        ...rule,
        priceValue:
          rule.priceValueMode === 0
            ? (rule.priceValue + 100) / 100
            : rule.priceValue / 100,
      }));
    } else priceRules = this.price.rules;

    this.priceListsClient
      .setPriceRulesByProduct(
        this.branchId!,
        this.priceListId,
        this.productId!,
        priceRules,
        true
      )
      .subscribe({
        next: (res: PriceView) => {
          this.currency = res.price.currency.currencyName;
          if (res.priceResults.some((item) => item.errors.length > 0)) {
            this.showAlertError(
              res.priceResults.find((item) => item.errors?.length > 0)
                ?.errors[0].message!
            );
            if (mode === "init") {
              this.priceResultsData = this.initPriceResultsData(res);
            }
          } else {
            if (action === "setAddRule") {
              this.setAddRule(rule!);
            }
            if (action === "setEditRule") {
              this.setEditRule(rule!);
            }
            this.priceResultsData = [];
            this.priceResultsData = this.initPriceResultsData(res);
          }

          this.checkShowNewExceptionButton();
          this.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  initPriceResultsData(res: PriceView): any[] {
    return res.priceResults.map((item) => ({
      ...item,
      priceRange: `${
        res.price.currency.symbol
      }${this.coreService.numberWithCommas(item.rule!.faceValue.start)} ${
        item.rule!.faceValue.end! !== null
          ? this.coreService.isUnlimitedNumber(item.rule!.faceValue.end!)
            ? "- ထ"
            : "- " +
              res.price.currency.symbol +
              this.coreService.numberWithCommas(item.rule!.faceValue.end!)
          : ""
      }`,
      priceValue: item.rule.priceValue! * 100,
      discountBuyingPrice: item.buyingRule?.priceValue! * 100 - 100,
      buyingPrice: `${
        res.price.currency.symbol
      }${this.coreService.numberWithCommas(item.buyingPriceAmount?.start!)}  ${
        item.buyingPriceAmount?.end! !== null
          ? this.coreService.isUnlimitedNumber(item.buyingPriceAmount?.end!)
            ? "- ထ"
            : "- " +
              res.price.currency.symbol +
              this.coreService.numberWithCommas(item.buyingPriceAmount?.end!)
          : ""
      }`,

      discountSellingPrice: item.rule?.priceValue! * 100 - 100,
      sellingPrice: `${
        res.price.currency.symbol
      }${this.coreService.numberWithCommas(item.resellPriceAmount?.start!)} ${
        item.resellPriceAmount?.end! !== null
          ? this.coreService.isUnlimitedNumber(item.resellPriceAmount?.end!)
            ? "- ထ"
            : "- " +
              res.price.currency.symbol +
              this.coreService.numberWithCommas(item.resellPriceAmount?.end!)
          : ""
      }`,
    }));
  }

  async showAlertError(message: string) {
    const alert = await this.alertController.create({
      header: dictionary.Error,
      message: message,
      animated: false,
      cssClass: "assignToBranch__alert",
      buttons: [
        {
          text: dictionary.Close,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
      ],
    });

    await alert.present();
  }
  async onShowErrorPriceViewClick(data: string) {
    let message = data;
    const alert = await this.alertController.create({
      header: dictionary.Error,
      message: `${message}`,
      animated: false,
      cssClass: "duplicateCode__alert",
      buttons: [
        {
          text: dictionary.Close,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
      ],
    });
    await alert.present();
  }
  getMaxAndMinPrice(rule: IRule): string {
    let priceText = "";
    if (
      rule.faceValue.start === 0 &&
      rule.faceValue.end === -1 &&
      this.checkAllRulesIsSinglePrice()
    ) {
      priceText = this.priceResultsData
        .map((item) => item.rule.faceValue.start)
        .join(", ");
    } else if (rule.faceValue.start === 0 && rule.faceValue.end === -1) {
      let maxPrice = Math.max(
        ...this.priceResultsData.map((price) => price.rule.faceValue.end!)
      );
      let minPrice = Math.min(
        ...this.priceResultsData.map((price) => price.rule.faceValue.start!)
      );
      priceText = `${this.inputPrice?.currency.symbol}${minPrice}  ${
        maxPrice ? " - " + this.inputPrice?.currency.symbol + maxPrice : ""
      }`;
    } else {
      priceText = `${
        this.inputPrice?.currency.symbol
      }${this.coreService.numberWithCommas(rule!.faceValue.start)} ${
        rule!.faceValue.end! !== null
          ? this.coreService.isUnlimitedNumber(rule!.faceValue.end!)
            ? "- ထ"
            : "- " +
              this.inputPrice?.currency.symbol +
              this.coreService.numberWithCommas(rule!.faceValue.end!)
          : ""
      }`;
    }
    return priceText;
  }

  isRuleDefault(rule: IRule): boolean {
    if (rule.faceValue.start === 0 && rule.faceValue.end === -1) {
      return true;
    } else {
      return false;
    }
  }

  checkShowNewExceptionButton() {
    let defaultRule = this.priceResultsData.every(
      (item) => item.rule.faceValue.end === null
    );
    this.showNewExceptionButton =
      defaultRule && this.priceResultsData.length == 1 ? false : true;
    this.isPriceRange = this.showPriceRangeCheckBox = defaultRule
      ? false
      : true;
  }

  checkAllRulesIsSinglePrice(): boolean {
    return this.priceResultsData.every(
      (item) => item.rule.faceValue.end === null
    );
  }
}
