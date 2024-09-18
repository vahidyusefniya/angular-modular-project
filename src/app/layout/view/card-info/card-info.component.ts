import { Component, OnInit } from '@angular/core';
import { NotificationService } from '@app/core/services';
import { dictionary } from '@dictionary/dictionary';

@Component({
  selector: 'app-card-info',
  templateUrl: './card-info.component.html',
  styleUrls: ['./card-info.component.scss'],
})
export class CardInfoComponent implements OnInit {
  dictionary = dictionary;
  productList = [
    {
      pinCode: '465310981337509871',
      cardNumber: 'MZPKCLCPWM4BJUCR',
      expireDate: '2025-03-06'
    },
    {
      pinCode: '465310981337509871',
      cardNumber: 'MZPKCLCPWM4BJUCR',
      expireDate: '2025-03-06'
    },
    {
      pinCode: '465310981337509871',
      cardNumber: 'MZPKCLCPWM4BJUCR',
      expireDate: '2025-03-06'
    },
  ]

  constructor(
    private notificationService: NotificationService,
  ) { }


  ngOnInit() { }

  copyPin(pinCode: string) {
    navigator.clipboard.writeText(pinCode);
    this.notificationService.showSuccessNotification(
      dictionary.CopySuccessFully
    );
  }

}
