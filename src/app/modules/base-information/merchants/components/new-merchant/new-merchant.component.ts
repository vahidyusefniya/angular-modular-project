// noinspection JSIgnoredPromiseFromCall

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { LayoutService } from "@app/layout";
import { Branch, CreateMerchantRequest } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { IonInput, ModalController } from "@ionic/angular";

@Component({
  selector: "app-new-merchant",
  templateUrl: "./new-merchant.component.html",
  styleUrls: ["./new-merchant.component.scss"],
})
export class NewMerchantComponent implements OnInit {
  dictionary = dictionary;
  loading = false;
  merchant = new CreateMerchantRequest();
  branches: Branch[] = [];
  parentBranchId: Branch | undefined;

  @Input() isOpen: boolean = false;
  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter();
  @ViewChild("emailInput") emailInput!: IonInput;
  constructor(
    private layoutService: LayoutService,
    private modalCtrl: ModalController
  ) {
    this.branches = this.layoutService.branches;
  }
  ngOnInit(): void {
    this.parentBranchId = this.branches.find(
      (branch) => branch.parentBranchId === null
    );
  }
  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  submitForm(): void {
    this.merchant.parentBranchId = this.parentBranchId!.branchId;
    this.merchant.externalReference = "string";
    this.submit.emit(this.merchant);
    this.modalCtrl.dismiss();
  }
}
