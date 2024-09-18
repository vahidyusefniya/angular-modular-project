import { Component, Input } from "@angular/core";

@Component({
  selector: "app-icon",
  templateUrl: "./icon.component.html",
  styleUrls: ["./icon.component.scss"],
})
export class IconComponent {
  @Input() type = "PayPal";
  @Input() width = 20;
  @Input() height = 20;
  @Input() color!: "black";

}
