import { NgModule } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { TreeTableModule } from "primeng/treetable";
import { ScrollerModule } from "primeng/scroller";
import { TreeModule } from "primeng/tree";
import { FileUploadModule } from "primeng/fileupload";
import { EditorModule } from "primeng/editor";
import { CarouselModule } from "primeng/carousel";
import { CardModule } from "primeng/card";
import { TabViewModule } from "primeng/tabview";
import { TooltipModule } from "primeng/tooltip";
import { TabMenuModule } from "primeng/tabmenu";
import { CalendarModule } from "primeng/calendar";
import { SidebarModule } from 'primeng/sidebar';

@NgModule({
  imports: [
    TableModule,
    ButtonModule,
    TreeTableModule,
    ScrollerModule,
    TreeModule,
    FileUploadModule,
    EditorModule,
    CarouselModule,
    CardModule,
    TabViewModule,
    TooltipModule,
    TabMenuModule,
    CalendarModule,
    SidebarModule
  ],
  exports: [
    TableModule,
    ButtonModule,
    TreeTableModule,
    ScrollerModule,
    TreeModule,
    FileUploadModule,
    EditorModule,
    CarouselModule,
    CardModule,
    TabViewModule,
    TooltipModule,
    TabMenuModule,
    CalendarModule,
    SidebarModule
  ],
})
export class PrimeNgModule {}
