// noinspection JSIgnoredPromiseFromCall

import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable } from "@angular/core";
import {
  CapacitorFirebaseCrashlyticsService,
  ErrorService,
  NotificationService,
} from "../services";
import { environment } from "@environments/environment";
import { Platform } from "@ionic/angular";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private notificationService: NotificationService,
    private errorService: ErrorService,
    private capacitorFirebaseCrashlyticsService: CapacitorFirebaseCrashlyticsService,
    private platform: Platform
  ) {}
  handleError(error: Error | HttpErrorResponse) {
    const alertNum =
      document.getElementsByClassName("error-global-alert").length;
    if (alertNum >= 1) return;
    else if (error instanceof HttpErrorResponse) {
      let serverErrorMessage: string =
        this.errorService.getServerErrorMessage(error) !== "" ||
        this.errorService.getServerErrorMessage(error) != undefined
          ? this.errorService.getServerErrorMessage(error)
          : JSON.stringify(error);
      this.notificationService.showErrorAlertNotification(serverErrorMessage);
      this.recordException(serverErrorMessage);
    } else {
      let clientErrorMessage =
        this.errorService.getClientErrorMessage(error) !== "" ||
        this.errorService.getClientErrorMessage(error) != undefined
          ? this.errorService.getClientErrorMessage(error)
          : JSON.stringify(error);

      this.recordException(clientErrorMessage);

      if (error.message.includes("A network AuthError")) return;
      if (error.message.includes("setPhotoOptions")) return;
      if (error.message.includes("/main")) return;
      this.notificationService.showErrorAlertNotification(clientErrorMessage);
    }
    if (!environment.production) {
      console.error(error);
    }
  }

  recordException(data: string): void {
    if (this.platform.is("hybrid")) {
      this.capacitorFirebaseCrashlyticsService.recordException(data);
    }
  }
}
