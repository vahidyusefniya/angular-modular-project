import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService, LoadingService } from '@app/core/services';
import { dictionary } from '@dictionary/dictionary';
import { AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-return-order-modal',
  templateUrl: './return-order-modal.component.html',
  styleUrls: ['./return-order-modal.component.scss'],
})
export class ReturnOrderModalComponent implements OnInit {
  dictionary = dictionary;
  orderId!: number;

  @Input() isOpen = false;
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService,
    private alertController: AlertController,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() { }

  validateNumberInput(event: any) {
    this.coreService.checkNumberInput(event)
  }

  async onSaveClick(orderNumber: number) {
    this.onDismiss();
    const walletOrderApproveAlert = await this.alertController.create({
      header: `Create return buy order ${orderNumber} request`,
      message: `
        Are you sure about returning this order with the following specifications?<br/><br />
        <span><span class="text-value">${dictionary.Id}:</span> ${'data.orderId'
        }</span><br />
        <span><span class="text-value">${dictionary.Item
        }:</span> ${'data.amount.toLocaleString()'}</span><br />
        <span><span class="text-value">${dictionary.Quantity}:</span> ${'data.financialOrderType'
        }</span><br />
        <span><span class="text-value">${dictionary.TotalBuyPrice}:</span> ${'data["baseMerchant"].merchantId !== this.merchantId'
        }</span>><br />
        <span><span class="text-value">${dictionary.CreatedTime}:</span> ${'data["baseMerchant"].merchantId !== this.merchantId'
        }</span>><br />
        <span><span class="text-value">${dictionary.State}:</span> ${'data["baseMerchant"].merchantId !== this.merchantId'
        }</span>
        
        `,
      animated: false,
      cssClass: "deletePrice__alert",
      buttons: [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          id: dictionary.ReturnOrder,
          text: dictionary.ReturnOrder,
          role: "confirm",
          cssClass: "primary-alert-btn",
          handler: () => {
            // this.loadingService.present();
            console.log('init API');
          },
        },
      ],
    });

    await walletOrderApproveAlert.present();
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
