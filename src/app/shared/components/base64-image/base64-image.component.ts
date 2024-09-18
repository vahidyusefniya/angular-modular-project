import { Component, Input, OnInit } from '@angular/core';
import { CoreService } from '@app/core/services';

@Component({
  selector: 'app-base64-image',
  templateUrl: './base64-image.component.html',
  styleUrls: ['./base64-image.component.scss']
})
export class Base64ImageComponent implements OnInit {
  @Input() base64Image: string = 'assets/img/placeholder.jpg';

  constructor(
    private coreService: CoreService
  ) {

  }
  ngOnInit() {
    
    // this.coreService.getBase64Image(this.base64Image).subscribe(data => {
    //   this.base64Image = data;
    // });
  }
}