import { Component } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-notfound",
  templateUrl: "./notfound.component.html",
  styleUrls: ["./notfound.component.scss"],
})
export class NotfoundComponent {
  dictionary = dictionary;
  appUrl: string = location.origin;
}
