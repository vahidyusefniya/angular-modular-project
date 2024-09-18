import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FirebaseAuthService } from "@app/auth";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ResponseErrorDto } from "../dto/core.dto";
import { ErrorService } from "../services";

@Injectable({
  providedIn: "root",
})
export class HttpErrorInterceptor implements HttpInterceptor {
  errorObj = new ResponseErrorDto();
  errorResponse: any;

  constructor(
    private errorService: ErrorService,
    private authService: FirebaseAuthService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error && error.status == 401) {
          this.authService.signout();
        }

        if (error.error && error.status.toString().charAt(0) === "5") {
          this.errorService.showAlertErrorServer();
        }

        if (error.error && error.error instanceof Blob) {
          this.errorResponse = this.errorService.ConvertBlobErrorToObject(
            error.error
          );
        }

        this.errorObj.init({
          message: this.errorResponse.message
            ? this.errorResponse.message
            : this.errorResponse.Message,
          type: error.statusText,
          typeName: this.errorResponse?.TypeName,
          status: this.errorResponse?.status,
        });

        return throwError(() => this.errorObj);
      })
    );
  }
}
