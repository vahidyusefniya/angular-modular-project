import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { CoreService } from "@app/core/services";
import { Role } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { IonInput, ModalController } from "@ionic/angular";
import { NewMember } from "../../dto/team.dto";

@Component({
  selector: "app-new-member",
  templateUrl: "./new-member.component.html",
  styleUrls: ["./new-member.component.scss"],
})
export class NewMemberComponent implements OnInit {
  dictionary = dictionary;
  newMember = new NewMember();

  @Input() roles: Role[] = [];
  @Input() isOpen = false;

  @Output() dismiss = new EventEmitter();
  @Output() newMemberEvent = new EventEmitter();

  @ViewChild("emailInput") emailInput!: IonInput;

  constructor(
    private coreService: CoreService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit(): void {
    if (this.roles.length === 1) this.newMember.roleId = this.roles[0].roleId;
  }

  onClickSave(): void {
    this.newMemberEvent.emit(this.newMember);
    this.modalCtrl.dismiss();
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
