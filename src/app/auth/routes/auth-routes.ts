import { Routes } from "@angular/router";
import { ForgetPasswordComponent, SigninComponent, SignupComponent } from "..";
import { ConfirmForgetPassComponent } from "../view/confirm-forget-pass/confirm-forget-pass.component";

export const AUTH_ROUTES: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "signin",
  },
  {
    path: "signin",
    component: SigninComponent,
  },
  {
    path: "signup",
    component: SignupComponent,
  },
  {
    path: "forget-password",
    component: ForgetPasswordComponent,
  },
  {
    path: "confirm",
    component: ConfirmForgetPassComponent,
  },
];
