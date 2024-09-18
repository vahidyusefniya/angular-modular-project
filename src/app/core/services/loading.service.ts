import { Injectable } from "@angular/core";
import { LoadingController } from "@ionic/angular";

@Injectable({
  providedIn: "root",
})
export class LoadingService {
  isLoading = false;
  private loadingElement: HTMLIonLoadingElement | null = null;

  constructor(public loadingController: LoadingController) {}

  async present() {
    this.isLoading = true;
    if (!this.loadingElement) {
      this.loadingElement = await this.loadingController.create({
        message: "Loading...",
      });
      await this.loadingElement.present();
    }

    if (!this.isLoading && this.loadingElement) {
      await this.loadingElement.dismiss();
      this.loadingElement = null;
    }
  }

  async dismiss() {
    this.isLoading = false;
    if (this.loadingElement) {
      await this.loadingElement.dismiss();
      this.loadingElement = null;
    }
  }
}
