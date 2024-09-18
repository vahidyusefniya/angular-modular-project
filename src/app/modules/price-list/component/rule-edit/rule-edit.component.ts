// noinspection JSIgnoredPromiseFromCall,DuplicatedCode

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import {
  IRule,
  PriceValueMode,
  PriceViewDto,
  RuleDto,
} from "../../dto/price-list.dto";
import { Branch, PriceView } from "@proxy/proxy";
import { LayoutService } from "@app/layout";
import { environment } from "@environments/environment";

@Component({
  selector: "app-rule-edit",
  templateUrl: "./rule-edit.component.html",
  styleUrls: ["./rule-edit.component.scss"],
})
export class RuleEditComponent implements OnInit {
  dictionary = dictionary;
  rule = new RuleDto();
  priceValue: string = "";
  branch: Branch | undefined;
  priceValueModes = [
    {
      name: dictionary.SellingDiscount,
      id: 0,
    },
    {
      name: dictionary.SellingMargin,
      id: 1,
    },
  ];
  activeList: any[] = [];
  isActive: any = true;
  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: environment.precision,
  });
  isAddException = false;
  isPriceRange: boolean = false;
  expandedStatus: string | undefined;
  priceListId: number | undefined;
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement();
  parentBranchId!: number | null;
  regionName: string | undefined;
  isOpenedBySetBuyingPrice = false;

  errorTextEndValue: string | undefined;
  errorTextStartValue: string | undefined;
  maxEndValue: number | undefined;
  minEndValue: number | undefined;

  @Input() showRangeStartAndEndInRuleModal = true;
  @Input() isOpen = false;
  @Input() ruleData: IRule | undefined;
  @Input() productName: string = "";
  @Input() selectedPriceView: PriceViewDto | undefined;
  @Input() priceRange: { start: number; end: number } | undefined;

  @Output() editRule = new EventEmitter<RuleDto>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private activatedRoute: ActivatedRoute,
    private coreService: CoreService,
    private layoutService: LayoutService,
    private router: Router
  ) {
    this.rule.priceValueMode = PriceValueMode.FaceValue;
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params["branch"] && params["priceList"]) {
        this.isAddException = true;
      }
      this.priceListId = Number(params["id"]);
    });
    this.parentBranchId = this.layoutService.getParentBranchId();
    this.branch = this.layoutService.branch;
    this.isOpenedBySetBuyingPrice = this.router.url.includes("/products");
  }

  ngOnInit(): void {
    if (
      this.branch?.rootPriceListId !== this.priceListId &&
      !this.isOpenedBySetBuyingPrice
    ) {
      this.activeList = [
        {
          name: this.dictionary.Inherit,
          value: 1,
        },
        {
          name: this.dictionary.Active,
          value: true,
        },
        {
          name: this.dictionary.Inactive,
          value: false,
        },
      ];
    } else {
      this.activeList = [
        {
          name: this.dictionary.Active,
          value: true,
        },
        {
          name: this.dictionary.Inactive,
          value: false,
        },
      ];
    }

    this.minEndValue = this.priceRange?.start;
    this.maxEndValue = this.priceRange?.end;

    if (this.ruleData) {
      this.rule.faceValue.start = Number(this.ruleData.faceValue.start);
      this.rule.faceValue.end = Number(this.ruleData.faceValue.end);
      this.isPriceRange = !!this.ruleData.faceValue.end;
      this.rule.priceValue = this.ruleData.priceValue;
      this.priceValue = this.ruleData.priceValue
        ?.toFixed(5)
        .replace(/\.?0+$/, "") as any;
      this.rule.priceValueMode = this.ruleData.priceValueMode;
      this.rule.consumerFee = this.rule.consumerFee
        ? Number(this.ruleData.consumerFee)
        : undefined;
      this.rule.consumerTax = this.rule.consumerTax
        ? Number(this.ruleData.consumerTax)
        : undefined;
      this.rule.id = Number(this.ruleData.id);
      this.rule.minBenefit = this.rule.minBenefit
        ? Number(this.ruleData.minBenefit)
        : undefined;
      this.rule.step = this.ruleData.step
        ? Number(this.ruleData.step)
        : undefined;
      this.isActive =
        this.ruleData.isActive === null ? 1 : this.ruleData.isActive;
    }

    if (this.selectedPriceView?.price!.regions) {
      this.regionName = this.selectedPriceView?.price!.regions![0]?.code;
    }
  }

  onSaveClick(): void {
    this.rule.id = this.ruleData?.id;
    this.convertRule();
    this.editRule.emit(this.rule);
    this.modalCtrl.dismiss();
  }
  convertRule(): void {
    if (this.rule.consumerFee) {
      this.rule.consumerFee = Number(
        (this.rule.consumerFee?.toString() as any).replace(/,/g, "")
      );
    } else {
      this.rule.consumerFee = null;
    }

    if (this.rule.step) {
      this.rule.step = Number(
        (this.rule.step?.toString() as any).replace(/,/g, "")
      );
    } else {
      this.rule.step = null;
    }

    if (this.rule.consumerTax) {
      this.rule.consumerTax = Number(
        (this.rule.consumerTax?.toString() as any).replace(/,/g, "")
      );
    } else {
      this.rule.consumerTax = null;
    }

    if (this.rule.minBenefit) {
      this.rule.minBenefit = Number(
        (this.rule.minBenefit?.toString() as any).replace(/,/g, "")
      );
    } else {
      this.rule.minBenefit = null;
    }

    if (this.rule.faceValue.start) {
      if (this.rule.faceValue.start.toString().search(",") != -1) {
        this.rule.faceValue.start = Number(
          (this.rule.faceValue.start as any).replace(/,/g, "")
        );
      } else {
        this.rule.faceValue.start = Number(this.rule.faceValue.start);
      }
    }

    if (this.isPriceRange) {
      if (this.rule.faceValue.end) {
        if (this.rule.faceValue.end.toString().search(",") != -1) {
          this.rule.faceValue.end = Number(
            (this.rule.faceValue.end as any).replace(/,/g, "")
          );
        } else if (isNaN(Number(this.rule.faceValue.end))) {
          this.rule.faceValue.end =
            this.coreService.convertMaskitoNegativeNumber(
              this.rule.faceValue.end as any
            );
        } else {
          this.rule.faceValue.end = Number(this.rule.faceValue.end);
        }
      }
    } else {
      this.rule.faceValue.end = null;
    }

    this.rule.isActive = this.isActive === 1 ? null : this.isActive;
    this.priceValue =
      typeof this.priceValue === "number"
        ? this.priceValue
        : this.priceValue.replace(/,/g, "");
    if (isNaN(Number(this.priceValue))) {
      this.rule.priceValue = this.coreService.convertMaskitoNegativeNumber(
        this.priceValue
      );
    } else {
      this.rule.priceValue = Number(this.priceValue);
    }
  }

  accordionGroupChange = (ev: any) => {
    this.expandedStatus = ev.detail.value;
  };
  showPriceValueMode(id: number): string {
    return this.priceValueModes.find((item) => item.id === id)?.name!;
  }

  onInputStart(amountEl: any) {
    let numberWithoutComma = amountEl.target.value.replace(/,/g, "");

    if (Number(numberWithoutComma) < this.minEndValue!) {
      this.errorTextStartValue = `The amount must be greater than ${this.minEndValue}`;
    } else {
      this.errorTextStartValue = "";
    }
  }

  onInputEnd(amountEl: any) {
    let numberWithoutComma = amountEl.target.value?.replace(/,/g, "");
    if (this.maxEndValue) {
      if (Number(numberWithoutComma) > this.maxEndValue!) {
        this.errorTextEndValue = `The amount must be smaller than ${this.maxEndValue}`;
      } else {
        this.errorTextEndValue = "";
      }
    }
  }

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
