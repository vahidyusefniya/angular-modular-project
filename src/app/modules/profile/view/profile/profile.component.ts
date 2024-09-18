import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CoreService } from '@app/core/services';
import { LayoutService } from '@app/layout';
import { ITimezone } from '@app/modules/customer/dto/customer.dto';
import { Branch } from '@app/proxy/proxy';
import { dictionary } from '@dictionary/dictionary';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  dictionary = dictionary;
  bracnchId: number | undefined
  bracnch: Branch | undefined;
  timezones: ITimezone[] = [];
  timezoneNumber: string | undefined;

  constructor(
    private layoutService: LayoutService,
    private coreService: CoreService,
    private http: HttpClient
  ) {
    this.bracnchId = this.coreService.getBranchId();
    this.bracnch = this.layoutService.getBranch(this.bracnchId!);
    this.initTimezones(this.bracnch!);
  }

  ngOnInit() { }

  initTimezones(bracnch: Branch): void {
    this.http.get<ITimezone[]>("/assets/timezones.json").subscribe((res) => {
      this.timezones = res;
      const timezone = this.timezones.find((t) => t.code === bracnch?.merchant?.timeZone);
      if (timezone) {
        this.timezoneNumber = `${timezone?.time_diff} ${timezone?.code}`;
      } else this.timezoneNumber = "-";
    });
  }

}
