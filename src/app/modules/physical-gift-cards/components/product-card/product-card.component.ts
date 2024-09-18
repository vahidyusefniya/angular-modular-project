import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import { CoreService } from "@app/core/services";
import { IButtonFaceValue } from "@app/modules/activate/dto/activate.dto";
import { PhysicalCardActivation, PriceRangeDto, ProductBuyPrice } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { IonInput } from "@ionic/angular";

@Component({
  selector: "app-product-card",
  templateUrl: "./product-card.component.html",
  styleUrls: ["./product-card.component.scss"],
})
export class ProductCardComponent implements OnInit {
  dictionary = dictionary;
  coreService$: CoreService;

  @Input() data: PhysicalCardActivation | undefined
  @Input() activateCode: string | undefined
  @Input() faceValues: IButtonFaceValue[] = []
  @Input() productBuyPrice: ProductBuyPrice | undefined
  @Input() activeFaceValue: IButtonFaceValue | undefined
  @Output() chooseFaceValue = new EventEmitter();
  @Output() setActiveFaceValue = new EventEmitter();
  
  constructor(
    private coreService: CoreService
  ) {
    this.coreService$ = this.coreService
  }
  ngOnInit(): void {
  }

  setActiveFaceValueStart (faceValue: number) {
    this.setActiveFaceValue.emit(faceValue)
  }

}
