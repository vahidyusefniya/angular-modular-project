import { Component, OnInit } from '@angular/core';
import { dictionary } from '@dictionary/dictionary';

@Component({
  selector: 'app-confirm-forget-pass',
  templateUrl: './confirm-forget-pass.component.html',
  styleUrls: ['./confirm-forget-pass.component.scss'],
})
export class ConfirmForgetPassComponent  implements OnInit {
  dictionary = dictionary;

  constructor() { }

  ngOnInit() {}

}
