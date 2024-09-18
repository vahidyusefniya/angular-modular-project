import { Directive, ElementRef, Input, OnInit } from "@angular/core";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";

@Directive({
  selector: "[appPermission]",
})
export class PermissionDirective implements OnInit {
  @Input("inputAppPermission") permission: string | undefined;

  constructor(
    private elementRef: ElementRef,
    private layoutService: LayoutService,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    if (this.permission) {
      this.elementRef.nativeElement.style.display = "none";
      this.isGranted(this.permission);
    }
  }

  private isGranted(permission: string) {
    if (this.hasPermission(permission)) {
      this.elementRef.nativeElement.style.display = "block";
    }
  }

  hasPermission(permission: string): boolean {
    const permissions = this.layoutService.getPermissions();
    if (!permission) return false;
    let hasPermission = permissions.find((p) => p === permission);
    return !!hasPermission;
  }
}
