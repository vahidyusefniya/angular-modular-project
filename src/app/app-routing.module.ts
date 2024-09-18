import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AUTH_ROUTES, AuthComponent, AuthGuard } from "@app/auth";
import { CONTENT_ROUTES } from "@shared/routes/content-layout.routing";
import { ApplicationComponent, NotfoundComponent } from "./layout";
import { CardInfoComponent } from "./layout/view/card-info/card-info.component";

const routes: Routes = [
  {
    path: "",
    component: ApplicationComponent,
    children: CONTENT_ROUTES,
    canActivate: [AuthGuard],
  },
  {
    path: "auth",
    component: AuthComponent,
    children: AUTH_ROUTES,
  },

  {
    path: "notfound",
    component: NotfoundComponent,
  },
  {
    path: "card-info",
    component: CardInfoComponent,
  },

  { path: "**", redirectTo: "notfound", pathMatch: "full" },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
