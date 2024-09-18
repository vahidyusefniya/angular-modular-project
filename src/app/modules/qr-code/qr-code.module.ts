import { NgModule } from "@angular/core";

import { SharedModule } from "@app/shared/shared.module";
import { QrCodeRoutingModule } from "./qr-code-routing.module";
import { QrCodeViewComponent } from "./view/qr-code-view/qr-code-view.component";

@NgModule({
  declarations: [QrCodeViewComponent],
  imports: [SharedModule, QrCodeRoutingModule],
})
export class QrCodeModule {}
