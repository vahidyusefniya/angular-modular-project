import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, timer } from "rxjs";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { BuildDetails } from "./build-details";
import { BuildDetailsService } from "./build-details.service";
import { environment } from "@environments/environment";

@Injectable({ providedIn: "root" })
export class UpToDateBuildService {
  private buildIsUpToDateSubject = new BehaviorSubject<boolean>(false);
  private buildNumberAtStartup: string | undefined;

  constructor(
    buildDetailsService: BuildDetailsService,
    private httpClient: HttpClient
  ) {
    this.buildNumberAtStartup = buildDetailsService.buildDetails.buildNumber;
    this.pollForBuildNumber();
  }

  public get buildIsUpToDate(): Observable<boolean> {
    return this.buildIsUpToDateSubject;
  }

  private pollForBuildNumber() {
    const pollInterval = environment.CHECK__BUILD__TIME;

    const httpOptions = {
      headers: new HttpHeaders({
        "Cache-Control": "no-cache",
      }),
    };

    timer(0, pollInterval).subscribe(() => {
      this.httpClient
        .get<BuildDetails>(
          "../assets/build-details/build-details.json",
          httpOptions
        )
        .subscribe((response) => {
          const newBuildNumber = response.buildNumber;
          if (!this.buildNumberAtStartup) {
            this.buildNumberAtStartup = newBuildNumber;
          } else if (this.buildNumberAtStartup != newBuildNumber) {
            this.buildIsUpToDateSubject.next(true);
          }
        });
    });
  }
}
