// noinspection JSIgnoredPromiseFromCall

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { FirebaseAuthService } from "@app/auth";
import { NavService } from "@app/layout";
import { INavItem } from "@app/layout/models/nav-item";
import { dictionary } from "@dictionary/dictionary";
import { AlertController, MenuController } from "@ionic/angular";

@Component({
  selector: "app-menu-list-item",
  templateUrl: "./menu-list-item.component.html",
  styleUrls: ["./menu-list-item.component.scss"],
  animations: [
    trigger("indicatorRotate", [
      state("collapsed", style({ transform: "rotate(0deg)" })),
      state("expanded", style({ transform: "rotate(180deg)" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4,0.0,0.2,1)")
      ),
    ]),
  ],
})
export class MenuListItemComponent implements OnInit {
  expanded!: boolean;
  @HostBinding("attr.aria-expanded") ariaExpanded = this.expanded;
  @Input() item!: INavItem;
  @Output() menuItemWarngin = new EventEmitter()
  constructor(
    public _navService: NavService,
    public router: Router,
    private authService: FirebaseAuthService,
    private alertController: AlertController,
    private menuController: MenuController
  ) {}

  ngOnInit(): void {
    this._navService.currentUrl.subscribe((url: string | undefined) => {
      if (this.item.route && url) {
        this.expanded = url.indexOf(`/${this.item.route}`) === 0;
        this.ariaExpanded = this.expanded;
      }
    });
  }

  menuItemWarnginClick(event: any) {
    this.menuItemWarngin.emit(event)
  }

  onMenuClick(menu: INavItem): void {
    if (menu.route) this.menuController.close();
    // this.expanded = !this.expanded;
    this.item.expanded = !this.item.expanded;
    if (menu.displayName === dictionary.SignOut) this.onLogoutClick();
  }

  async onLogoutClick() {
    const alert = await this.alertController.create({
      header: dictionary.SignOut!,
      message: dictionary.SignOutConfirmMessage,
      animated: false,
      buttons: [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.SignOut,
          role: "confirm",
          cssClass: "danger-alert-btn",
          handler: () => {
            this.authService.signout();
          },
        },
      ],
    });

    await alert.present();
  }
}
