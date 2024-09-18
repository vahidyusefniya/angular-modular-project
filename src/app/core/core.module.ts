import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import {
  HttpConfigInterceptor,
  HttpErrorInterceptor,
} from "@core/interceptors";
import {
  CoreService,
  ErrorService,
  LoadingService,
  NotificationService,
  StorageService,
  TagService,
  ExchangeService,
  CapacitorFirebaseCrashlyticsService,
} from "@core/services";
import { GlobalErrorHandler } from "./global-error/global-error";

@NgModule({
  imports: [HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    CoreService,
    TagService,
    NotificationService,
    LoadingService,
    ErrorService,
    StorageService,
    ExchangeService,
    CapacitorFirebaseCrashlyticsService,
  ],
})
export class CoreModule {}
