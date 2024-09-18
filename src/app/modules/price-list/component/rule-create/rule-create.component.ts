// noinspection JSIgnoredPromiseFromCall,DuplicatedCode

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { IonInput, ModalController } from "@ionic/angular";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { Branch } from "@proxy/proxy";
import {
  PriceValueMode,
  PriceViewDto,
  RuleDto,
} from "../../dto/price-list.dto";

@Component({
  selector: "app-rule-create",
  templateUrl: "./rule-create.component.html",
  styleUrls: ["./rule-create.component.scss"],
})
export class RuleCreateComponent implements OnInit {
  dictionary = dictionary;
  rule = new RuleDto();
  priceValue: string = "";
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
  isAddException = false;
  branch: Branch | undefined;
  @Input() isPriceRange: boolean = true;
  priceListId: number | undefined;
  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: environment.precision,
  });
  expandedStatus: string | undefined;
  @ViewChild("discountInput") discountInput!: IonInput;
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement();
  parentBranchId!: number | null;

  regionName: string | undefined;
  errorTextEndValue: string | undefined;
  errorTextStartValue: string | undefined;
  maxEndValue: number | undefined;
  minEndValue: number | undefined;
  isOpenedBySetBuyingPrice = false;
  parentBranch: Branch | undefined;

  @Input() isOpen = false;
  @Input() priceResultsData: any = [];
  @Input() priceRange: { start: number; end: number } | undefined;
  @Input() showRangeStartAndEndInRuleModal = true;
  @Input() selectedPriceView: PriceViewDto | undefined;
  @Input() productName: string = "";
  @Input() showPriceRangeCheckBox = true;
  @Output() addRule = new EventEmitter<RuleDto>();
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
    this.parentBranch = this.layoutService.branches.find(
      (branch) => branch.merchant?.parentBranchId === null
    );
    this.branch = this.layoutService.branch;
    this.isOpenedBySetBuyingPrice = this.router.url.includes("/products");
  }

  ngOnInit() {
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
      this.isActive = 1;
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
      this.isActive = true;
    }
    this.rule.faceValue.start = this.priceRange?.start!;
    this.rule.faceValue.end = this.priceRange?.end!;
    this.minEndValue = this.rule.faceValue.start;
    this.maxEndValue = this.rule.faceValue.end;
    if (!(this.branch?.canSetBuyValue && this.branch.canSetFaceValue)) {
      if (this.branch?.canSetBuyValue) {
        this.rule.priceValueMode = PriceValueMode.BuyValue;
      }
      if (this.branch?.canSetFaceValue) {
        this.rule.priceValueMode = PriceValueMode.FaceValue;
      }
    }
    this.regionName = this.selectedPriceView?.price!.regions![0]?.code;
  }

  setFocusForInput() {
    setTimeout(() => {
      this.discountInput.setFocus();
    }, 500);
  }

  onSaveClick(): void {
    this.rule.id = Math.floor(Math.random() * 100);
    this.convertRule();
    this.addRule.emit(this.rule);
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

    this.priceValue = this.priceValue.replace(/,/g, "");
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

  onInputEnd(amountEl: any) {
    let numberWithoutComma = amountEl.target.value.replace(/,/g, "");
    if (this.maxEndValue) {
      if (Number(numberWithoutComma) > this.maxEndValue!) {
        this.errorTextEndValue = `The amount must be smaller than ${this.maxEndValue}`;
      } else {
        this.errorTextEndValue = "";
      }
    }
  }

  onInputStart(amountEl: any) {
    let numberWithoutComma = amountEl.target.value.replace(/,/g, "");

    if (Number(numberWithoutComma) < this.minEndValue!) {
      this.errorTextStartValue = `The amount must be greater than ${this.minEndValue}`;
    } else {
      this.errorTextStartValue = "";
    }
  }

  showPriceValueMode(id: number): string {
    return this.priceValueModes.find((item) => item.id === id)?.name!;
  }

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
