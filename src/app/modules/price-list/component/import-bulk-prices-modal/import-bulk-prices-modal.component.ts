import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  PriceRange,
  PriceResult,
  PriceRule,
  PriceRulePermission,
  PriceView,
  ProductPriceRule,
  ProductSummary
} from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { FileSelectEvent } from "primeng/fileupload";
import * as XLSX from "xlsx";
import { IUploadRule } from "../../dto/price-list.dto";
import { PriceListService } from "../../service/price-list.service";
interface PriceRangeViewProduct { rangeMin: number, rangeMax: number }
interface ResultPriceValue { value: string | number, color: string, isValid: boolean }

@Component({
  selector: "app-import-bulk-prices-modal",
  templateUrl: "./import-bulk-prices-modal.component.html",
  styleUrls: ["./import-bulk-prices-modal.component.scss"],
})
export class ImportBulkPricesModalComponent {
  dictionary = dictionary;
  cols: ICol[] = [
    {
      field: "rowNumber",
      header: `Excel ${dictionary.Row}`,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "productId",
      header: dictionary.ProductId,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "productName",
      header: dictionary.ProductName,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "priceRange",
      header: dictionary.Price,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "sellingMargin",
      header: dictionary.SellingMargin,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "isActive",
      header: dictionary.Status,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "errorMessage",
      header: dictionary.Error,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
  ];
  showCodeCount = false;
  rules: IUploadRule[] = [];
  rulesTemp: IUploadRule[] = [];
  rulesExportData: IUploadRule[] = [];
  productPriceRules: ProductPriceRule[] = [];
  branchId: number;
  branch: Branch;
  isNotEqualWithRange: boolean = false;
  showAlertImport: boolean = false;
  hasFile!: boolean;
  priceValueModeStatus: number;
  countInvalid: number = 0;
  validRule: IUploadRule[] = [];
  alertMessage: string = '';
  importAlert = [
    {
      text: dictionary.Cancel,
      role: "cancel",
      handler: () => {
        this.showAlertImport = false;
      },
    },
    {
      text: dictionary.Upload,
      handler: () => {
        this.showAlertImport = false;
        this.preparationProductViaRules();
      },
    },
  ];



  validatedMinPrice: { value: number | string; color: string; } | undefined;
  validatedMaxPrice: { value: number | string, color: string } | undefined;

  @Input() isOpen = false;
  @Input() products: ProductSummary[] = [];
  @Input() priceViews: PriceView[] = [];

  @Output() dismiss = new EventEmitter();
  @Output() uploadRules = new EventEmitter<ProductPriceRule[]>();
  @Output() exportSampleExcel = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService,
    private priceListService: PriceListService,
    private layoutService: LayoutService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.branch = this.layoutService.getBranch(this.branchId)!
    this.priceValueModeStatus = this.branch.canSetBuyValue ? 1 : 0;
  }

  onSelectFile(event: FileSelectEvent): void {
    this.onRemoveFile();
    let workBook: any;
    let jsonData: any[];
    const reader = new FileReader();
    const file = event.files[0];
    if (file) this.hasFile = true;
    this.showCodeCount = true;
    reader.onload = () => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: "binary" });
      workBook.SheetNames.forEach((name: any) => {
        const sheet = workBook.Sheets[name];
        jsonData = XLSX.utils.sheet_to_json(sheet);
      }, {});
      const parsePrice = (value: number | string | null | undefined) =>
        value != null ? Number(String(value).replace(/,/g, '')) : null;
      this.rulesTemp = jsonData.map(item => ({
        ...item,
        minPriceRange: parsePrice(item.minPriceRange)!,
        maxPriceRange: parsePrice(item.maxPriceRange)!,
      }));
      this.rulesExportData = jsonData;
      this.rules = jsonData.map((item, index) => ({
        rowNumber: index + 2,
        productId: item.productId,
        productName: item.productName,
        minPriceRange: parsePrice(item.minPriceRange)!,
        maxPriceRange: parsePrice(item.maxPriceRange)!,
        sellingMargin: (item.sellingMargin === undefined || item.sellingMargin === null) ? undefined :
          this.isValidSellingMargin(item.sellingMargin, this.priceValueModeStatus) ? item.sellingMargin : dictionary.invalid,
        currencyName: item.currencyName,
        isActive: this.convertIsActive(item.isActive),
        errorMessage: undefined
      }));
      this.countInvalidData();
      this.sortData(this.rules);
      this.sortData(this.rulesExportData);
    };
    reader.readAsBinaryString(file);
  }

  getPriceRange(productId: number): PriceRangeViewProduct | null {
    const entryProduct = this.priceViews.find(
      firstItem => +productId === firstItem.price.product.productId
    );

    if (entryProduct) {
      const [rangeMin, rangeMax] = this.getMaxAndMinPriceRange(entryProduct.priceResults)
        .split(' - ')
        .map(value => Number(value.replace(/,/g, '')));
      return { rangeMin, rangeMax };
    } else {
      return { rangeMin: null as any, rangeMax: null as any };
    }
  }

  validateMinPrice(product: IUploadRule, priceRange: PriceRangeViewProduct): ResultPriceValue {
    const value = product.minPriceRange;
    const { rangeMin, rangeMax } = priceRange;
    if (product.minPriceRange === null) {
      return { value: dictionary.invalid, color: 'danger', isValid: false };
    }
    if (rangeMax === undefined && rangeMin !== undefined) {
      return (product.minPriceRange === rangeMin && product.maxPriceRange === 0)
        ? { value, color: '', isValid: true }
        : { value: dictionary.invalid, color: 'danger', isValid: false };
    }
    if (rangeMin !== undefined && product.minPriceRange >= rangeMin && product.minPriceRange <= rangeMax) {
      return { value, color: '', isValid: true };
    }
    if (rangeMin === undefined && product.minPriceRange > 0) {
      return { value, color: '', isValid: true };
    }
    return { value: dictionary.invalid, color: 'danger', isValid: false };
  }

  validateMaxPrice(product: IUploadRule, priceRange: PriceRangeViewProduct): ResultPriceValue {
    const value = product.maxPriceRange;
    const { rangeMax, rangeMin } = priceRange;
    if (product.minPriceRange === null) {
      return { value: dictionary.invalid, color: 'danger', isValid: false };
    }
    if (product.maxPriceRange === 0) {
      return { value: '', color: 'danger', isValid: true }; // is valid true because is valid from business
    }
    if (rangeMax === undefined && rangeMin !== undefined) {
      return { value: dictionary.invalid, color: 'danger', isValid: false };
    }
    if (rangeMax !== undefined && product.maxPriceRange <= rangeMax && product.maxPriceRange >= rangeMin) {
      return { value, color: '', isValid: true };
    }
    if (rangeMax === undefined && product.maxPriceRange > 0) {
      return { value, color: '', isValid: true };
    }
    return { value: dictionary.invalid, color: 'danger', isValid: false };
  }

  countInvalidData(): number {
    const invalidRules: any[] = [];
    const validRules: any[] = [];

    this.rules.forEach((rule: any) => {
      let errorMessages: string[] = [];
      const priceRange = this.getPriceRange(rule.productId);

      if (!this.isValidProductName(rule)) {
        errorMessages.push('Product id is not available in price list');
        rule.errorMessage = errorMessages.join(' - ');
        invalidRules.push(rule);
        this.countInvalid++;
        return;  // Skip further validation if product name is invalid
      }

      const minPriceValid = this.validateMinPrice(rule, priceRange!).isValid;
      const maxPriceValid = this.validateMaxPrice(rule, priceRange!).isValid;

      if (!minPriceValid && !maxPriceValid) {
        errorMessages.push('Price range is incorrect');
      } else {
        if (!minPriceValid) {
          errorMessages.push('minPriceRange is incorrect');
        }
        if (!maxPriceValid) {
          errorMessages.push('maxPriceRange is incorrect');
        }
      }

      if (!this.isValidSellMarginValue(rule)) {
        errorMessages.push('Valid value is number');
      }
      if (!this.isValidIsActive(rule)) {
        errorMessages.push('Valid value (TRUE-FALSE-Inherit)');
      }

      if (errorMessages.length > 0) {
        rule.errorMessage = errorMessages.join(' - ');
        invalidRules.push(rule);
        this.countInvalid++;
      } else {
        validRules.push(rule);
      }
    });
    this.validRule = [...validRules];
    return this.countInvalid;
  }

  sortData(data: IUploadRule[]): void {
    data.sort(
      (first, second) =>
        Number(
          this.isValidProductName(first) &&
          this.isValidSellMarginValue(first) &&
          this.isValidIsActive(first) &&
          this.validateMinPrice(first, this.getPriceRange(first.productId)!).isValid &&
          this.validateMaxPrice(first, this.getPriceRange(first.productId)!).isValid
        ) - Number(
          this.isValidProductName(second) &&
          this.isValidSellMarginValue(second) &&
          this.isValidIsActive(second) &&
          this.validateMinPrice(second, this.getPriceRange(second.productId)!).isValid &&
          this.validateMaxPrice(second, this.getPriceRange(second.productId)!).isValid
        )
    );
  }
  onRemoveFile(): void {
    this.showCodeCount = false;
    this.hasFile = false;
    this.countInvalid = 0;
    this.rules = [];
  }
  isValidProductName(rule: IUploadRule): boolean {
    if (this.getProduct(rule)) return true;
    else return false;
  }
  getProduct(rule: IUploadRule): ProductSummary | undefined {
    return this.products.find((p) => p.productId === Number(rule.productId));
  }
  isValidPriceRange(rule: IUploadRule): boolean {
    return this.isNumber(rule.minPriceRange) && this.isNumber(rule.maxPriceRange);
  }

  isNumber(input: any) {
    const sanitizedInput = String(input).replace(/,/g, '').trim();
    return !isNaN(parseFloat(sanitizedInput)) && isFinite(Number(sanitizedInput));
  }

  isValidSellingMargin(input: any, priceValueModeStatus: number) {
    const sanitizedInput = String(input).replace(/,/g, '').trim();
    const isNumber = !isNaN(parseFloat(sanitizedInput)) && isFinite(Number(sanitizedInput));
    const value = parseFloat(sanitizedInput);
    if (priceValueModeStatus === 0) {
      return isNumber;
    } else {
      return isNumber && value >= 0;  // Accept only 0 and positive numbers
    }
  }

  isValidSellMarginValue(rule: IUploadRule): boolean {
    if (rule.sellingMargin === dictionary.invalid as any) {
      return false;
    }
    return true;
  }

  isValidIsActive(rule: IUploadRule): boolean {
    if (rule.isActive === dictionary.invalid as any) {
      return false;
    }
    return true;
  }

  convertIsActive(value: any): any {
    if (typeof value === 'boolean') {
      return value;
    }
    const normalizedInput = String(value).toLowerCase().trim();
    if (normalizedInput === "true") return true;
    if (normalizedInput === "false") return false;
    if (normalizedInput === "inherit") return dictionary.Inherit;
    return dictionary.invalid;
  }

  onSaveRulesClick(): void {
    if (this.countInvalid > 0) {
      this.alertMessage = `Your Excel has <b>${this.countInvalid}</b> errors. Do you want the records without errors to be uploaded only?`
      this.showAlertImport = true;
    } else {
      this.preparationProductViaRules();
    }
  }

  preparationProductViaRules() {
    const groupedProducts = this.validRule.reduce((acc: any, product: IUploadRule) => {
      acc[product.productId] = acc[product.productId] || [];
      acc[product.productId].push(product);
      return acc;
    }, {});
    Object.entries(groupedProducts).forEach(([productId, rules]) => {
      const productPriceRule = new ProductPriceRule();
      productPriceRule.init({
        productId: +productId,
        rules: this.generateRules(rules as IUploadRule[], +productId).filter(Boolean),
      });
      this.productPriceRules.push(productPriceRule);
    });

    this.uploadRules.emit(this.productPriceRules);
    this.modalCtrl.dismiss();
  }

  generateRules(items: IUploadRule[], productId: number): PriceRule[] {
    const priceRulesList: PriceRule[] = [];
    const faceValue = new PriceRange();
    const priceRulePermission = new PriceRulePermission();
    const excelRangeItems = this.getItemsRange(items);
    const range = this.getPriceRange(productId);
    this.isNotEqualWithRange = false;
    priceRulePermission.init({
      canSetPriceModeToFaceValue: null,
      maxConsumerFee: null,
      maxConsumerTax: null,
      minMinBenefit: null,
    });

    items.forEach((rule) => {
      const priceRule = new PriceRule();
      if (this.checkRanges(range, excelRangeItems) && excelRangeItems.isSameSellingMargin) {
        if (excelRangeItems.minPrice === rule.minPriceRange || excelRangeItems.maxPrice === rule.maxPriceRange) {
          if (!this.isNotEqualWithRange) {
            this.isNotEqualWithRange = true;
            faceValue.init({
              start: 0,
              end: -1,
              endValue: 0,
              isEndless: false,
            });
            priceRule.init({
              productId: this.getProduct(rule)?.productId,
              consumerFee: null,
              minBenefit: null,
              step: null,
              faceValue: faceValue,
              isActive: rule.isActive === dictionary.Inherit ? null : rule.isActive,
              permission: priceRulePermission,
              priceValueMode: this.priceValueModeStatus,
              priceValue: this.priceValueModeStatus === 1 ? (excelRangeItems.minSellingMargin! / 100) : ((excelRangeItems.minSellingMargin! + 100) / 100),
            });
            priceRulesList.push(priceRule);
          } else {
            priceRulesList.push(undefined as any);
          }
        } else {
          priceRulesList.push(this.generateGenralRule(range, rule, priceRulePermission));
        }
      } else {
        priceRulesList.push(this.generateGenralRule(range, rule, priceRulePermission));
      }
    });

    return priceRulesList;
  }

  generateGenralRule(range: PriceRangeViewProduct | null, rule: IUploadRule, priceRulePermission: PriceRulePermission) {
    const priceRule = new PriceRule();
    const faceValue = this.getFaceValue(range, rule); // Refactor repeated faceValue initialization
    priceRule.init({
      productId: this.getProduct(rule)?.productId,
      consumerFee: null,
      minBenefit: null,
      step: null,
      faceValue: faceValue,
      isActive: rule.isActive === dictionary.Inherit ? null : rule.isActive,
      permission: priceRulePermission,
      priceValueMode: this.priceValueModeStatus,
      priceValue: this.getPriceValue(rule),
    });
    return priceRule;
  }

  getFaceValue(range: PriceRangeViewProduct | null, rule: IUploadRule): PriceRange {
    const faceValue = new PriceRange();
    if (range?.rangeMin === +rule.minPriceRange && range.rangeMax === +rule.maxPriceRange) {
      faceValue.init({ start: 0, end: -1, endValue: 0, isEndless: false });
    } else if (range?.rangeMin === +rule.minPriceRange && (!rule.maxPriceRange || +rule.maxPriceRange === 0)) {
      faceValue.init({ start: 0, end: -1, endValue: 0, isEndless: false });
    } else if (+rule.minPriceRange > range?.rangeMin! && +rule.minPriceRange < range?.rangeMax! && (!rule.maxPriceRange || +rule.maxPriceRange === 0)) {
      faceValue.init({ start: +rule.minPriceRange, end: null, endValue: 0, isEndless: false });
    } else {
      faceValue.init({ start: +rule.minPriceRange, end: +rule.maxPriceRange, endValue: 0, isEndless: false });
    }
    return faceValue;
  }

  getPriceValue(rule: IUploadRule): number {
    return this.priceValueModeStatus === 1 ? (+rule.sellingMargin / 100) : ((+rule.sellingMargin + 100) / 100);
  }

  getItemsRange(productList: IUploadRule[]) {
    let maxPrice = Math.max(...productList.map((item) => item.maxPriceRange!));
    let minPrice = Math.min(...productList.map((item) => item.minPriceRange!));
    let maxSellingMargin = productList.find(item => item.maxPriceRange === maxPrice)?.sellingMargin;
    let minSellingMargin = productList.find(item => item.minPriceRange === minPrice)?.sellingMargin;
    return {
      minPrice,
      maxPrice,
      minSellingMargin,
      maxSellingMargin,
      isSameSellingMargin: minSellingMargin === maxSellingMargin ? true : false,
    }
  }

  checkRanges(priceViewRange: any, excelItemRange: any): boolean {
    return priceViewRange?.rangeMax === excelItemRange.maxPrice &&
      priceViewRange.rangeMin === excelItemRange.minPrice
  }


  getMaxAndMinExcel(rule: IUploadRule) {
    const filterdRulesList = this.rules.filter(item => item.productId === rule.productId);
    let maxPrice = Math.max(...filterdRulesList.map((item) => item.maxPriceRange!));
    let minPrice = Math.min(...filterdRulesList.map((item) => item.minPriceRange!));
    let maxSellingMargin = filterdRulesList.find(item => item.maxPriceRange === maxPrice)?.sellingMargin;
    let minSellingMargin = filterdRulesList.find(item => item.minPriceRange === minPrice)?.sellingMargin;
    return {
      minPrice,
      maxPrice,
      minSellingMargin,
      maxSellingMargin,
      ruleLength: filterdRulesList.length
    }
  }

  onExcelExportClick() {
    if (this.rulesExportData.length == 0) return;
    this.coreService.exportExcel(this.rulesExportData, dictionary.Rules);
  }

  getMaxAndMinPriceRange(data: PriceResult[]): string {
    return this.priceListService.getMaxAndMinPriceRange(data);
  }

  onSampleExcelClick(): void {
    this.exportSampleExcel.emit();
  }
  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}