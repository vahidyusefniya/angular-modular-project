import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SignInRequest } from "@app/proxy/proxy";
import { Observable, map } from "rxjs";
import { StorageService } from "../services";

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  signInRequest = new SignInRequest();
  token: string | undefined;

  constructor(private storageService: StorageService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.token = this.storageService.get("token");
    if (!request.url.includes(".svg")) {
      request = request.clone({
        headers: request.headers.set("Authorization", `Bearer ${this.token}`),
      });
    }
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
        }

        return event;
      })
    );
  }
}
