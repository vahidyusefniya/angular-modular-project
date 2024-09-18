// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  PriceListsClient,
  PriceResult,
  PriceRule,
  PriceValueMode,
  PriceView,
  Product,
  ProductSummary,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertController, ModalController } from "@ionic/angular";
import {
  IRule,
  PriceDto,
  PriceViewDto,
  RuleDto,
} from "../../dto/price-list.dto";

@Component({
  selector: "app-price-create",
  templateUrl: "./price-create.component.html",
  styleUrls: ["./price-create.component.scss"],
})
export class PriceCreateComponent implements OnInit {
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
        this.showDiscardAlert = false;
        this.dismiss.emit();
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
  rulesColumns: any[] = [
    {
      field: "price",
      header: dictionary.Price,
    },
  ];
  showDeleteAlert: boolean = false;
  ruleData: IRule | undefined;
  productId: number | undefined;
  isAddException = false;
  productName: string | undefined;
  openProductSearchModal = false;
  coreService$: CoreService;
  allProducts: ProductSummary[] = [];
  currency: string | undefined;
  priceResultsData: any[] = [];
  isDirtyPage = false;
  defaultRule = new RuleDto();
  branch: Branch | undefined;
  showRangeStartAndEndInRuleModal = true;
  regionName: string | undefined;
  showNewExceptionButton = false;
  isPriceRange = true;
  showPriceRangeCheckBox = true;
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

  @Input() isOpen = false;
  @Input() priceId: number | undefined;
  @Input() priceListId!: number;
  @Input() products: ProductSummary[] = [];
  @Input() searchProductLoading = false;
  @Input() openCreatePriceModalByPricesTab = true;
  @Input() productIdInput: number | undefined;
  @Input() productNameInput: string | undefined;
  @Input() priceRange: { start: number; end: number } | undefined;
  @Input() selectedPriceView!: PriceViewDto;
  @Input() branchId: number | undefined;

  @Output() newPrice = new EventEmitter<PriceView>();
  @Output() dismiss = new EventEmitter();
  @Output() searchEvent = new EventEmitter<string>();

  constructor(
    private modalCtrl: ModalController,
    private priceListsClient: PriceListsClient,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private activatedRoute: ActivatedRoute,
    private layoutService: LayoutService,
    private alertController: AlertController
  ) {
    this.coreService$ = this.coreService;
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params["branch"] && params["priceList"]) {
        this.isAddException = true;
      }
    });
    this.branch = this.layoutService.branch;
  }

  ngOnInit(): void {
    this.initRulesColumns();
    this.allProducts = this.products;
    if (this.productIdInput) {
      this.productId = this.productIdInput;
    }
    if (this.productNameInput) {
      this.productName = this.productNameInput;
    }

    if (
      this.selectedPriceView!.price!.regions &&
      this.selectedPriceView!.price!.regions!.length > 0
    ) {
      this.regionName = this.selectedPriceView!.price!.regions![0]?.code;
    }
    if (this.openCreatePriceModalByPricesTab) {
      this.currency = this.selectedPriceView.price.currency.currencyName;
      // this.priceResultsData = this.initPriceResultsData(
      //   this.selectedPriceView.priceResults
      // );
    }
    if (this.productId) {
      this.setDefaultRule();
      this.getPreviewResult("init");
    } else {
      this.showNewExceptionButton = true;
    }
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
      }
    );
  }

  addRule(rule: RuleDto): void {
    this.openCreateRuleModal = false;
    // this.rules.push(rule);
    // this.price.rules = this.rules;
    this.price.rules.push(rule);
    this.getPreviewResult("edit", "setAddRule", rule);
    // this.isDirtyPage = true;
  }

  setAddRule(rule: RuleDto): void {
    this.rules = this.price.rules;
    this.isDirtyPage = true;
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
    this.getPreviewResult("edit", "setEditRule", rule);
    // this.isDirtyPage = true;
  }

  serEditRule(rule: RuleDto): void {
    this.rules = this.price.rules;
    this.isDirtyPage = true;
  }

  removeRule(rule: IRule): void {
    const index = this.rules.indexOf(rule, 0);
    if (index == -1) return;
    this.rules.splice(index, 1);
    this.getPreviewResult("edit");
    this.isDirtyPage = true;
  }
  onRenderItems(event: any) {
    const draggedItem = this.rules.splice(event.detail.from, 1)[0];
    this.rules.splice(event.detail.to, 0, draggedItem);
    event.detail.complete();
  }

  onProductChange(product: Product): void {
    this.productName = product.productName;
    this.productId = product.productId;
  }

  onDismiss(): void {
    if (this.rules.length != 0) this.showDiscardAlert = true;
    else {
      this.modalCtrl.dismiss();
      this.dismiss.emit();
    }
  }

  onNewClick(): void {
    this.loadingService.present();
    this.price.rules.forEach((rule: any) => {
      rule.priceValue =
        rule.priceValueMode === 0
          ? (rule.priceValue + 100) / 100
          : rule.priceValue / 100;
      this.priceRule.push(rule);
    });
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
          this.newPrice.emit(res);
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
          this.modalCtrl.dismiss();
        },
      });
  }
  searchProduct(event: any) {
    this.searchEvent.emit(event);
  }
  dismissProductModalEvent(): void {
    this.products = this.allProducts;
    this.openProductSearchModal = false;
  }

  getPreviewResult(
    mode: "init" | "edit",
    action?: "setAddRule" | "setEditRule",
    rule?: RuleDto
  ): void {
    this.loadingService.present();
    let priceRules: any[];
    // this.priceResultsData = [];

    priceRules = this.price.rules.map((rule: any) => ({
      ...rule,
      priceValue:
        rule.priceValueMode === 0
          ? (rule.priceValue + 100) / 100
          : rule.priceValue / 100,
    }));

    // else priceRules = this.price.rules;

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
              this.serEditRule(rule!);
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
  initPriceResultsData(data: PriceView): any[] {
    let priceResult: any;
    priceResult = data.priceResults.map((item) => ({
      ...item,
      priceRange: `${
        data.price.currency.symbol
      }${this.coreService.numberWithCommas(item.rule!.faceValue.start)}  ${
        item.rule!.faceValue.end! !== null
          ? this.coreService.isUnlimitedNumber(item.rule!.faceValue.end!)
            ? "- ထ"
            : "- " +
              data.price.currency.symbol +
              this.coreService.numberWithCommas(item.rule!.faceValue.end!)
          : ""
      }`,
      priceValue: item.rule.priceValue! * 100,
      discountBuyingPrice: item.buyingRule?.priceValue! * 100 - 100,
      buyingPrice: `${
        data.price.currency.symbol
      }${this.coreService.numberWithCommas(item.buyingPriceAmount?.start!)} ${
        item.buyingPriceAmount?.end! !== null
          ? this.coreService.isUnlimitedNumber(item.buyingPriceAmount?.end!)
            ? "- ထ"
            : "- " +
              data.price.currency.symbol +
              this.coreService.numberWithCommas(item.buyingPriceAmount?.end!)
          : ""
      }`,

      discountSellingPrice: item.rule?.priceValue! * 100 - 100,
      sellingPrice: `${
        data.price.currency.symbol
      }${this.coreService.numberWithCommas(item.resellPriceAmount?.start!)} ${
        item.resellPriceAmount?.end! !== null
          ? this.coreService.isUnlimitedNumber(item.resellPriceAmount?.end!)
            ? "- ထ"
            : "- " +
              data.price.currency.symbol +
              this.coreService.numberWithCommas(item.resellPriceAmount?.end!)
          : ""
      }`,
    }));
    return priceResult;
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

  setDefaultRule(): void {
    if (!(this.branch?.canSetBuyValue && this.branch.canSetFaceValue)) {
      if (this.branch?.canSetBuyValue) {
        this.defaultRule.priceValueMode = PriceValueMode.BuyValue;
      }
      if (this.branch?.canSetFaceValue) {
        this.defaultRule.priceValueMode = PriceValueMode.FaceValue;
      }
    }
    this.rules.push({
      ...this.defaultRule,
      faceValue: { start: 0, end: -1 },
      isActive: this.setIsActive(),
      priceValue: 0,
      consumerFee: null,
      consumerTax: null,
      minBenefit: null,
      id: Math.floor(Math.random() * 100),
    });
    this.price.rules = this.rules;
  }

  setIsActive(): boolean | null {
    if (this.branch?.rootPriceListId !== Number(this.priceListId)) {
      return null;
    } else {
      return false;
    }
  }

  isRuleDefault(rule: IRule): boolean {
    if (rule.faceValue.start === 0 && rule.faceValue.end === -1) {
      return true;
    } else {
      return false;
    }
  }
  getMaxAndMinPrice(rule: IRule): string {
    let priceText = "";
    if (rule.faceValue.start === 0 && rule.faceValue.end === -1) {
      let maxPrice = Math.max(
        ...this.priceResultsData.map((price) => price.rule.faceValue.end!)
      );
      let minPrice = Math.min(
        ...this.priceResultsData.map((price) => price.rule.faceValue.start!)
      );
      priceText = `${this.selectedPriceView.price.currency.symbol}${minPrice} ${
        maxPrice
          ? " -" + this.selectedPriceView.price.currency.symbol + maxPrice
          : ""
      }`;
    } else {
      priceText = `${
        this.selectedPriceView.price.currency.symbol
      }${this.coreService.numberWithCommas(rule!.faceValue.start)} ${
        rule!.faceValue.end! !== null
          ? this.coreService.isUnlimitedNumber(rule!.faceValue.end!)
            ? "- ထ"
            : "-" +
              this.selectedPriceView.price.currency.symbol +
              this.coreService.numberWithCommas(rule!.faceValue.end!)
          : ""
      }`;
    }
    return priceText;
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
}
