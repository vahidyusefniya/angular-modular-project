import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  CategoryProduct,
  PhysicalCardActivation,
  PriceInvoice,
  ProductBuyPrice,
  ProductsClient,
} from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { ActivateDto, IButtonFaceValue } from "../../dto/activate.dto";
import { Subscription } from "rxjs";
import { LayoutService } from "@app/layout";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { LoadingService } from "@app/core/services";

@Component({
  selector: "app-activation-code-modal",
  templateUrl: "./activation-code-modal.component.html",
  styleUrls: ["./activation-code-modal.component.scss"],
})
export class ActivationCodeModalComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  buttonFaceValues: IButtonFaceValue[] = [];
  selectedFaceValueButton: IButtonFaceValue | undefined;
  isOpenAlert = false;
  alertButtons = [
    {
      text: dictionary.Cancel,
      role: "cancel",
      handler: () => {
        this.isOpenAlert = false;
      },
    },
    {
      text: dictionary.Continue,
      role: "confirm",
      handler: () => {
        this.isOpenAlert = false;
        this.activate.emit(this.activateData);
        this.onDismiss();
      },
    },
  ];
  alertMessage: string | undefined;
  branchId!: number;
  price: number | undefined;
  getProductInvoice$ = new Subscription();
  activateData = new ActivateDto();
  amountRangeLabel: string | undefined;
  priceRangeMessage: string | undefined;

  @Input() isOpen = false;
  @Input() cardNumber: string | undefined;
  @Input() product = new CategoryProduct();
  @Input() physicalCardActivation = new PhysicalCardActivation();

  @Output() activate = new EventEmitter<ActivateDto>();
  @Output() dismiss = new EventEmitter();
  @Output() cancel = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private productsClient: ProductsClient,
    private layoutService: LayoutService,
    private loadingService: LoadingService
  ) {
    this.branchId = this.layoutService.branch!.branchId;
  }

  ngOnInit() {
    if (!this.product.categories) return;
    const productBuyPrices = this.product.categories[0].productBuyPrices;
    if (productBuyPrices[0].faceValues) {
      this.buttonFaceValues = this.fillButtonFaceValues(productBuyPrices[0]);
      this.buttonFaceValues = this.convertButtonFaceValues(
        this.buttonFaceValues
      );
      if (this.buttonFaceValues.length == 1) {
        this.onFaceValuesClick(this.buttonFaceValues[0]);
      }
    }
  }
  fillButtonFaceValues(productBuyPrices: ProductBuyPrice): IButtonFaceValue[] {
    let i = 0;
    const buttonFaceValues: any = productBuyPrices.faceValues?.map((item) => ({
      id: i++,
      endValue: item.endValue,
      faceValue: item.faceValue,
      isEndless: item.isEndless,
      start: item.start,
      end: item.end,
      fill: "outline",
      currency: productBuyPrices.currency,
    }));

    return buttonFaceValues;
  }
  convertButtonFaceValues(data: IButtonFaceValue[]): IButtonFaceValue[] {
    const buttons: IButtonFaceValue[] = [];
    data.forEach((value) => {
      if (buttons.length == 0) {
        buttons.push(value);
      } else {
        if (value.start && value.end) {
          const index = buttons.findIndex(
            (b) => b.faceValue == value.faceValue
          );

          if (index != -1) {
            buttons[index] = {
              currency: buttons[index].currency,
              end:
                buttons[index].end! > value.end
                  ? buttons[index].end
                  : value.end,
              start:
                buttons[index].start! < value.start
                  ? buttons[index].start
                  : value.start,
              endValue: buttons[index].endValue,
              faceValue: buttons[index].faceValue,
              fill: buttons[index].fill,
              id: buttons[index].id,
              isEndless: buttons[index].isEndless,
            };
          } else {
            buttons.push(value);
          }
        } else {
          buttons.push(value);
        }
      }
    });

    return buttons;
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
  onCancelClick(): void {
    this.modalCtrl.dismiss();
    this.cancel.emit();
  }

  onFaceValuesClick(data: IButtonFaceValue): void {
    const index = this.buttonFaceValues.findIndex((b) => b.id == data.id);
    if (index != -1) {
      this.buttonFaceValues[index].fill = "solid";
      this.selectedFaceValueButton = data;
      this.amountRangeLabel = `Type an amount between ${this.selectedFaceValueButton.start} and ${this.selectedFaceValueButton.end}`;
      if (!data.end) this.price = data.start;
      else this.price = undefined;
      this.buttonFaceValues.forEach((item) => {
        if (item.id != data.id) item.fill = "outline";
      });
    }
  }
  createButtonLabel(data: IButtonFaceValue): string {
    if (data.end)
      return `${data.start} - ${data.end} (${data.currency.currencyName})`;
    else return `${data.start} (${data.currency.currencyName})`;
  }

  onInput(price: any): void {
    if (
      this.selectedFaceValueButton &&
      this.selectedFaceValueButton.faceValue
    ) {
      let priceWithoutComma = Number(price.target.value.replace(/,/g, ""));
      if (!isNaN(priceWithoutComma)) {
        if (
          Number(priceWithoutComma) < this.selectedFaceValueButton.start! ||
          Number(priceWithoutComma) > this.selectedFaceValueButton.end!
        ) {
          this.priceRangeMessage = "No price range specified for this amount.";
        } else {
          this.priceRangeMessage = "";
        }
      } else {
        this.priceRangeMessage = "No price range specified for this amount.";
      }
    }
  }

  checkActiveButtonDisabled(): boolean {
    if (!this.selectedFaceValueButton) return true;
    if (this.selectedFaceValueButton.end && !this.price) return true;
    if (this.priceRangeMessage) return true;
    return false;
  }
  confirmClick(): void {
    const me = this;
    this.loadingService.present();
    if (!this.selectedFaceValueButton) return;

    this.getProductInvoice$ = this.productsClient
      .getProductInvoice(
        this.branchId,
        this.physicalCardActivation.product.productId,
        this.selectedFaceValueButton.end
          ? this.price!
          : this.selectedFaceValueButton.start!
      )
      .subscribe({
        next(res: PriceInvoice) {
          me.loadingService.dismiss();
          me.isOpenAlert = true;
          me.alertMessage = `Your paying for this amount of product will be equal to <b>${res.sellAmount} ${me.selectedFaceValueButton?.currency.currencyName}</b>`;
          me.activateData.init({
            buyPrice: res.sellAmount,
            productPrice: me.price!,
            serialNumber: me.cardNumber!,
            withExchange: false,
            currency: me.selectedFaceValueButton?.currency,
            totalPrice: res.sellAmount,
            unitBuyPrice: res.buyAmount,
            unitFaceValuePrice: me.selectedFaceValueButton?.start,
          });
          me.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          me.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  ngOnDestroy(): void {
    this.getProductInvoice$.unsubscribe();
  }
}
