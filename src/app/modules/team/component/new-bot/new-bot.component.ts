import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Role } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { NewBot } from "../../dto/team.dto";

@Component({
  selector: "app-new-bot",
  templateUrl: "./new-bot.component.html",
  styleUrls: ["./new-bot.component.scss"],
})
export class NewBotComponent implements OnInit {
  dictionary = dictionary;
  newBot = new NewBot();

  @Input() roles: Role[] = [];
  @Input() isOpen = false;

  @Output() dismiss = new EventEmitter();
  @Output() newBotEvent = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    if (this.roles.length === 1) this.newBot.roleId = this.roles[0].roleId;
  }

  onClickSave(): void {
    this.newBotEvent.emit(this.newBot);
    this.modalCtrl.dismiss();
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
