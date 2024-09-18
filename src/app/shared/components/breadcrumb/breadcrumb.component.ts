import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { distinctUntilChanged } from "rxjs/operators";
import { IBreadCrumb } from "./breadcrumb.interface";
import { CoreService } from "@app/core/services";
import { Subscription } from "rxjs";
import { LayoutService } from "@app/layout";

@Component({
  selector: "app-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["./breadcrumb.component.scss"],
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: IBreadCrumb[] = [];
  urlParams: string[] = [];
  branchId: number;
  breadcrumbVariable: string | undefined;
  breadcrumbVariable$ = new Subscription();
  breadcrumbsItems: IBreadCrumb[] = [];
  breadcrumbItems$ = new Subscription();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private coreService: CoreService,
    private layoutService: LayoutService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
    this.breadcrumbVariable$ = this.layoutService.breadcrumbVariable.subscribe(
      (data) => {
        this.breadcrumbVariable = data;
      }
    );

    this.breadcrumbItems$ = this.layoutService.breadcrumbsItems.subscribe(
      (data) => {
        this.breadcrumbsItems = data;
      }
    );
  }

  ngOnInit() {
    this.router.events.pipe(distinctUntilChanged()).subscribe(() => {
      this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
    });
    this.getQueryParams();
  }

  buildBreadCrumb(
    route: ActivatedRoute,
    url: string = "",
    breadcrumbs: IBreadCrumb[] = []
  ): IBreadCrumb[] {
    let label =
      route.routeConfig && route.routeConfig.data
        ? route.routeConfig.data["breadcrumb"]
        : "";

    let path =
      route.routeConfig && route.routeConfig.data ? route.routeConfig.path : "";

    const lastRoutePart = path?.split("/").pop();
    const isDynamicRoute = lastRoutePart?.startsWith(":");
    if (isDynamicRoute && !!route.snapshot) {
      const paramName = lastRoutePart?.split(":")[1];
      path = path?.replace(lastRoutePart!, route.snapshot.params[paramName!]);
      label = route.snapshot.params[paramName!];
    }

    const nextUrl = path ? `${url}/${path}` : url;
    let convertUrl = `branches/${this.branchId}/${nextUrl
      .split("branchId")
      .pop()}`;

    let deActive =
      route.routeConfig && route.routeConfig.data
        ? route.routeConfig.data["deActive"]
        : false;

    const breadcrumb: IBreadCrumb = {
      label: label,
      url: `/${convertUrl}`,
      deActive: deActive,
    };
    const newBreadcrumbs = breadcrumb.label
      ? [...breadcrumbs, breadcrumb]
      : [...breadcrumbs];

    if (route.firstChild) {
      return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs;
  }

  getQueryParams(): void {
    const utl = location.href;
    const params: string[] = utl.split(";");
    let paramsDic: string[] = [];
    for (let index = 1; index < params.length; index++) {
      const param = params[index];
      let hasParam = paramsDic.find((p) => p === param);
      if (!hasParam) paramsDic.push(param);
    }

    this.urlParams = paramsDic;
  }

  ngOnDestroy(): void {
    this.breadcrumbVariable$.unsubscribe();
    this.breadcrumbItems$.unsubscribe();
  }
}
