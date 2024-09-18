import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { CoreService } from "@app/core/services";
import { Pos } from "@app/proxy/proxy";
import { AlertController } from "@ionic/angular";

@Component({
  selector: "app-shop-card",
  templateUrl: "./shop-card.component.html",
  styleUrls: ["./shop-card.component.scss"],
})
export class ShopCardComponent implements OnInit {
  dictionary = dictionary;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  width = 0;
  id: string | undefined
  showDescriptionModal: boolean = false
  @Input() pos: Pos | undefined
  @Output() showDetail = new EventEmitter()

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.width = event.target.innerWidth;
  }

  constructor(
    private coreService: CoreService,
    private alertController: AlertController
  ) {
    
  }
  
  ngOnInit(): void {
    this.width = window.innerWidth;
  }

  onShowProductDetail() {
    this.showDetail.emit(this.pos)
  }

  async showDescription() {
    this.showDescriptionModal = true
  }

  
}
