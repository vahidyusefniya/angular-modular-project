import { Component, OnInit } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-qr-code-view",
  templateUrl: "./qr-code-view.component.html",
  styleUrls: ["./qr-code-view.component.scss"],
})
export class QrCodeViewComponent implements OnInit {
  dictionary = dictionary;

  constructor() {}

  ngOnInit() {}
}
