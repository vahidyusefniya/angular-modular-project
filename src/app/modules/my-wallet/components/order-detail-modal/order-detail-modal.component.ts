import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BuyOrder } from '@app/proxy/shop-proxy';
import { dictionary } from '@dictionary/dictionary';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-order-detail-modal',
  templateUrl: './order-detail-modal.component.html',
  styleUrls: ['./order-detail-modal.component.scss'],
})
export class OrderDetailModalComponent implements OnInit {
  dictionary = dictionary;

  @Input() isOpen = false;
  @Input() order: BuyOrder | undefined;
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() { }


  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
