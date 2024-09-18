import { Injectable } from "@angular/core";

import { BuildDetailsService } from "./build-details.service";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { BuildDetails } from "./build-details";

@Injectable({ providedIn: "root" })
export class BuildDetailsHttpService {
  constructor(
    private http: HttpClient,
    private buildDetailsService: BuildDetailsService
  ) {}

  fetchBuildDetails(): Promise<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Cache-Control": "no-cache",
      }),
    };

    return new Promise((resolve) => {
      this.http
        .get<BuildDetails>(
          "../assets/build-details/build-details.json",
          httpOptions
        )
        .subscribe((response: any) => {
          this.buildDetailsService.buildDetails = response.buildNumber;
          resolve(response);
        });
    });
  }
}
