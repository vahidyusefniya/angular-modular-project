import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { Role } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-edit-member",
  templateUrl: "./edit-member.component.html",
  styleUrls: ["./edit-member.component.scss"],
})
export class EditMemberComponent implements OnInit {
  dictionary = dictionary;
  roleId: string | undefined;
  @Input() roles: Role[] = [];
  @Input() isOpen = false;
  @Input() selectedRole: string | undefined;
  @Input() selectedMemberName: string | undefined;

  @Output() dismiss = new EventEmitter();
  @Output() editMemberEvent = new EventEmitter();

  constructor(
    private modalCtrl: ModalController
  ) {}

  ngOnInit(): void {
    if (this.selectedRole) this.roleId = this.selectedRole;
  }

  onClickSave(): void {
    this.editMemberEvent.emit(this.roleId);
    this.modalCtrl.dismiss();
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
