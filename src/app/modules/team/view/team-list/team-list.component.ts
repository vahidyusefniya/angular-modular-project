import { Component, OnInit } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  IPageChange,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  ApiKey,
  BranchesClient,
  ListResultOfUserRole,
  Role,
  TeamClient,
  UserPin,
  UserRole,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ActionSheetController, AlertController } from "@ionic/angular";
import { Subscription, combineLatest } from "rxjs";
import { INewBot, INewMember } from "../../dto/team.dto";

@Component({
  selector: "app-team-list",
  templateUrl: "./team-list.component.html",
  styleUrls: ["./team-list.component.scss"],
})
export class TeamListComponent implements OnInit {
  dictionary = dictionary;
  loading = false;
  cols = [
    {
      field: "botIcon",
      header: dictionary.Empty,
    },
    {
      field: "email",
      header: dictionary.Email,
    },
    {
      field: "role",
      header: dictionary.Role,
    },
    {
      field: "exData",
      header: dictionary.Pin,
    },
    {
      field: "delete",
      header: dictionary.Empty,
    },
  ];
  teamList: UserRole[] = [];
  teamListTemp: UserRole[] = [];
  page = 1;
  pageSize = 10;
  getUserRolesFull$ = new Subscription();
  newMemberSub$ = new Subscription();
  newBotSub$ = new Subscription();
  editMemberSub$ = new Subscription();
  getListRolesSub$ = new Subscription();
  branchId: number;
  showNewMemberModal = false;
  showNewBotModal = false;
  roles: Role[] = [];
  showEditMemberModal = false;
  userId: string | undefined;
  selectedRole: string | undefined;
  selectedMemberName: string | undefined;
  ruleNames = [
    {
      roleName: "BranchOperator",
      tRoleName: dictionary.BranchOperator,
    },
    {
      roleName: "Financial",
      tRoleName: dictionary.Financial,
    },
    {
      roleName: "Accountant",
      tRoleName: dictionary.Accountant,
    },
    {
      roleName: "FinancialCreator",
      tRoleName: dictionary.FinancialCreator,
    },
    {
      roleName: "SaleManager",
      tRoleName: dictionary.SaleManager,
    },
    {
      roleName: "BranchReadOnly",
      tRoleName: dictionary.BranchReadOnly,
    },
    {
      roleName: "DigitalOrderStaff",
      tRoleName: dictionary.DigitalOrderStaff,
    },
    {
      roleName: "PhysicalOrderStaff",
      tRoleName: dictionary.PhysicalOrderStaff,
    },
  ];
  showPinModal = false;
  pinModalTitle = dictionary.SetPin;
  row: UserRole | undefined;

  constructor(
    private coreService: CoreService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private actionSheetCtrl: ActionSheetController,
    private teamClient: TeamClient,
    private alertController: AlertController,
    private branchesClient: BranchesClient
  ) {
    this.branchId = this.layoutService.branch!.branchId;
    this.layoutService.checkPagePermission("RoleRead");
  }

  ngOnInit() {
    this.checkShowPin();
    this.initTeamList();
  }
  initTeamList(): void {
    const me = this;
    this.loading = true;
    this.getUserRolesFull$ = this.teamClient
      .getUserRolesFull(this.branchId)
      .subscribe({
        next(res: UserRole[]) {
          me.teamList = res;
          me.teamListTemp = res;
          me.pageChanged({ page: 1, pageSize: me.pageSize });
          me.loading = false;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }
  checkShowPin(): void {
    const isActivePin = this.layoutService.branch?.merchant?.isActivePin;
    if (!isActivePin) this.cols = this.cols.filter((c) => c.field !== "exData");
  }

  onNewMemberButtonClick(): void {
    this.getListRoles(dictionary.NewMember);
  }

  onNewBotButtonClick(): void {
    this.getListRoles(dictionary.NewBot);
  }

  onRefreshClick(): void {
    this.initTeamList();
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: this.initActionSheetItems(),
    });

    await actionSheet.present();
  }
  initActionSheetItems(): any[] {
    const permissions: string[] = this.layoutService.getPermissions();
    const isNewMemberPermission = permissions.find((p) => p === "RoleWrite");
    const isSNewBotPermission = permissions.find((p) => p === "RoleWrite");
    const items = [
      {
        id: 1,
        text: dictionary.NewMember,
        handler: () => {
          this.onNewMemberButtonClick();
        },
      },
      {
        id: 2,
        text: dictionary.NewBot,
        handler: () => {
          this.onNewBotButtonClick();
        },
      },
      {
        text: dictionary.Cancel,
        role: "cancel",
        data: {
          action: "cancel",
        },
      },
    ];

    if (!isNewMemberPermission) {
      const inddex = items.findIndex((i) => i.id === 2);
      if (inddex > -1) items.splice(inddex, 1);
    }
    if (!isSNewBotPermission) {
      const index = items.findIndex((i) => i.id === 1);
      if (index > -1) items.splice(index, 1);
    }

    return items;
  }

  newMemberEvent(data: INewMember): void {
    this.loadingService.present();
    this.newMemberSub$ = this.teamClient
      .addUserByEmail(String(this.branchId), data.roleId!, data.email!)
      .subscribe({
        next: (res) => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            res.role?.roleName + dictionary.RoleAddedTo + res.user?.email
          );
          this.initTeamList();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  newBotEvent(data: INewBot) {
    this.loadingService.present();
    this.newBotSub$ = this.teamClient
      .addNewBot(String(this.branchId), data.roleId!, data.addParam)
      .subscribe({
        next: (res) => {
          this.copyBotAuthTokenAlert(res);
          this.loadingService.dismiss();
          this.initTeamList();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  async copyBotAuthTokenAlert(data: ApiKey) {
    let message = `${data.accessToken.scheme} ${data.accessToken.value}`;
    const alert = await this.alertController.create({
      header: dictionary.BotToken!,
      message: message,
      cssClass: "base_alert",
      buttons: [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.Copy,
          role: "confirm",
          cssClass: "success-alert-btn",
          handler: () => {
            navigator.clipboard.writeText(message);
            this.notificationService.showSuccessNotification(
              dictionary.CopySuccessFully
            );
          },
        },
      ],
    });

    await alert.present();
  }

  onEditMemberClick(data: any): void {
    this.userId = data.userId;
    this.selectedRole = data.roleId;
    this.selectedMemberName = data.email;
    this.getListRoles(dictionary.EditMember);
  }

  getListRoles(type: string): void {
    this.loadingService.present();
    this.getListRolesSub$ = this.teamClient
      .listRoles(String(this.branchId))
      .subscribe({
        next: (res) => {
          if (type === dictionary.NewMember) this.showNewMemberModal = true;
          if (type === dictionary.NewBot) this.showNewBotModal = true;
          if (type === dictionary.EditMember) this.showEditMemberModal = true;
          this.roles = res;
          this.roles.forEach((role) => {
            role.roleName = this.getConvertedRoleName(role);
          });
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
        },
      });
  }

  editMemberEvent(roleId: string): void {
    this.loadingService.present();
    this.editMemberSub$ = this.teamClient
      .addUser(String(this.branchId), roleId, this.userId!)
      .subscribe({
        next: (res) => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `Edit Member "${this.selectedMemberName}" ${dictionary.SuccessFully}`
          );
          this.initTeamList();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  async onDeleteButtonClick(data: UserRole) {
    const alert = await this.alertController.create({
      header: `${dictionary.DeleteMember}`,
      message: `${dictionary.AreYouSureDeleteRoleFrom} <b>${data.user?.email}</b>?`,
      animated: false,
      buttons: [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
          handler() {
            alert.dismiss();
          },
        },
        {
          text: dictionary.Delete,
          role: "confirm",
          cssClass: "danger-alert-btn",
          handler: () => {
            alert.dismiss();
            this.deleteMemberEvent(data);
          },
        },
      ],
    });

    await alert.present();
  }

  deleteMemberEvent(data: UserRole): void {
    this.loadingService.present();
    this.editMemberSub$ = this.teamClient
      .removeUser(String(this.branchId), data.role.roleId, data.userId!)
      .subscribe({
        next: () => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(`Delete Member`);
          this.initTeamList();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  onExcelExportClick(): void {
    const exportData = this.teamListTemp.map((member) => ({
      email: member.user?.email,
      roleName: member.role,
      isBot: member.user?.isBot,
    }));
    this.coreService.exportExcel(exportData, "Team members");
  }

  getConvertedRoleName(role: Role): string {
    const name = this.ruleNames.find(
      (r) => r.roleName === role.roleName
    )?.tRoleName;
    return name ? name : role.roleName;
  }

  onAdvancedFilterClick(): void {}

  pageChanged(data: IPageChange): void {
    this.page = data.page;
    this.teamList = this.teamListTemp;
    this.teamList = this.teamList.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize
    );
  }

  onPinClick(data: UserRole): void {
    this.row = data;
    this.pinModalTitle = data.user?.exData
      ? dictionary.UpdatePin
      : dictionary.SetPin;

    this.showPinModal = true;
  }
  updatePin(pin: string): void {
    const me = this;
    this.loadingService.present();
    this.showPinModal = false;
    this.branchesClient
      .resetUserPin(
        this.branchId,
        this.layoutService.branch?.merchantId!,
        this.row?.user?.userId!,
        pin
      )
      .subscribe({
        next() {
          me.row = undefined;
          me.loadingService.dismiss();
          me.notificationService.showSuccessNotification("Pin updated");
          me.initTeamList();
        },
        error: (error: ResponseErrorDto) => {
          me.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  ngOnDestroy(): void {
    this.newMemberSub$.unsubscribe();
    this.newBotSub$.unsubscribe();
    this.getUserRolesFull$.unsubscribe();
    this.editMemberSub$.unsubscribe();
  }
}
