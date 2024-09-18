import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "@app/core/services";
import {
  PhysicalCardOrder,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-order-detail",
  templateUrl: "./order-detail.component.html",
  styleUrls: ["./order-detail.component.scss"],
})
export class OrderDetailComponent implements OnInit {
  dictionary = dictionary;
  branchId: number | undefined;
  loading: boolean = false;
  cols: any[] = [
    {
      field: "item",
      header: dictionary.Item,
    },
    {
      field: "quantity",
      header: dictionary.Quantity,
    },
    {
      field: "bundleSize",
      header: dictionary.BundleSize,
    },
  ];
  @Input() physicalCardOrder: PhysicalCardOrder | undefined;
  @Input() isOpen = false;
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService,
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

  ngOnInit(): void {
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
