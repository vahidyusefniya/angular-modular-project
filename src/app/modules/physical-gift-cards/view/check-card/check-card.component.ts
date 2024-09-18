import { Component, OnInit } from '@angular/core';
import { ResponseErrorDto } from '@app/core/dto/core.dto';
import { CoreService, LoadingService } from '@app/core/services';
import { PhysicalCardActivation, PhysicalCardsClient } from '@app/proxy/shop-proxy';
import { dictionary } from '@dictionary/dictionary';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-check-card',
  templateUrl: './check-card.component.html',
  styleUrls: ['./check-card.component.scss'],
})
export class CheckCardComponent  implements OnInit {
  dictionary = dictionary;
  barcode: string = '';
  checkCard$ = new Subscription()
  branchId: number;
  card: PhysicalCardActivation | undefined

  constructor(
    private coreService: CoreService,
    private physicalCards: PhysicalCardsClient,
    private loadingService: LoadingService,
    private alertController: AlertController,
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

  ngOnInit() {}

  onCheckClick(){
    this.loadingService.present();
    this.checkCard$ = this.physicalCards.checkActivation(this.branchId, this.barcode)
    .subscribe({
      next: (data: PhysicalCardActivation) => {
        this.card = data
        this.loadingService.dismiss();
      },
      error: async (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        const alert = await this.alertController.create({
          header: dictionary.CantCheck,
          message: error.message,
          animated: false,
          buttons: [
            {
              text: dictionary.Cancel,
              role: "cancel",
              cssClass: "info-alert-btn",
            },
          ],
        });
        await alert.present();
      }
    })
  }

  watchBarcode(event: any) {
    event === '' ? this.card = undefined : ''
  }

  validateNumberInput(event: any){
    this.coreService.checkNumberInput(event)
  }

}
