import { Injectable } from "@angular/core";
import {
  CustomerAccountingReport,
  OfficeAccountingReport,
  SaleManagerAccountingReport,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import * as moment from "moment-timezone";
import {
  CustomerDto,
  DateRangeType,
  FilterDateRangeDto,
  OfficeDto,
  SaleManagerDto,
} from "../dto/dashboard.dto";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  getDateRange(type: DateRangeType): FilterDateRangeDto {
    const range = new FilterDateRangeDto();
    const day = 1000 * 60 * 60 * 24;

    if (type === "Today") {
      range.init({
        end: new Date(
          new Date(new Date().getTime() + day).setHours(0, 0, 1, 0)
        ),
        start: new Date(new Date().setHours(0, 0, 1, 0)),
      });
    }

    if (type === "CurrentMonth") {
      range.init({
        end: new Date(
          new Date(new Date().getTime() + day).setHours(0, 0, 1, 0)
        ),
        start: this.getFirstDayOfMonth(),
      });
    }

    return range;
  }

  getTypeTime(from: any, end: any): string {
    const dayInMillis = 1000 * 60 * 60 * 24;
  
    const todayStart = new Date();
    todayStart.setHours(0, 0, 1, 0);
  
    const tomorrowStart = new Date(todayStart.getTime() + dayInMillis);
  
    const currentMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    currentMonthStart.setSeconds(1);
  
    if (from.getTime() === todayStart.getTime() && end.getTime() === tomorrowStart.getTime()) {
      return 'Today';
    } else if (from.getTime() === currentMonthStart.getTime() && end.getTime() === tomorrowStart.getTime()) {
      return 'CurrentMonth';
    } else {
      return 'Custom';
    }
  }
  

  getFirstDayOfMonth(): Date {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    return new Date(currentYear, currentMonth - 1, 1);
  }

  groupCustomerAccountingReportByDate(data: CustomerAccountingReport[]): {
    date: string;
    customerAccountingReport: any;
  }[] {
    const groups = data.reduce((groups: any, customerAccountingReport) => {
      const date = customerAccountingReport.date.toISOString().split("T")[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(customerAccountingReport);
      return groups;
    }, {});
    const groupArrays = Object.keys(groups).map((date) => {
      return {
        date,
        customerAccountingReport: groups[date],
      };
    });

    return groupArrays;
  }

  fillProfitChartData(
    data: Array<{
      date: string;
      customerAccountingReport: CustomerAccountingReport[];
    }>
  ): Array<{ profits: number; date: string }> {
    let profitChartData: Array<{ profits: number; date: string }> = [];

    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      item.customerAccountingReport.forEach((data) => {
        if (profitChartData.length == 0) {
          profitChartData.push({
            profits: data.profit,
            date: data.date.toISOString(),
          });
        } else {
          const findProfitIndex = profitChartData.findIndex(
            (f) => f.date.split("T")[0] === item.date
          );
          if (findProfitIndex != -1) {
            profitChartData[findProfitIndex].profits += data.profit;
          } else {
            profitChartData.push({
              profits: data.profit,
              date: data.date.toISOString(),
            });
          }
        }
      });
    }

    return profitChartData;
  }

  fillSaleChartData(
    data: Array<{
      date: string;
      customerAccountingReport: CustomerAccountingReport[];
    }>
  ): Array<{ sale: number; date: string }> {
    let saleChartData: Array<{ sale: number; date: string }> = [];

    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      item.customerAccountingReport.forEach((data) => {
        if (saleChartData.length == 0) {
          saleChartData.push({
            sale: data.saleAmount,
            date: data.date.toISOString(),
          });
        } else {
          const findIndex = saleChartData.findIndex(
            (f) => f.date.split("T")[0] === item.date
          );
          if (findIndex != -1) {
            saleChartData[findIndex].sale += data.saleAmount;
          } else {
            saleChartData.push({
              sale: data.saleAmount,
              date: data.date.toISOString(),
            });
          }
        }
      });
    }

    return saleChartData;
  }

  convertChartDates(dates: string[]): string[] {
    const sevenDaysEgo = this.getLastSevenDays();
    const chartDates: string[] = [];

    for (let index = 0; index < dates.length; index++) {
      const date = dates[index];
      if (sevenDaysEgo[0] === date) {
        chartDates.push(dictionary.Today);
      } else if (sevenDaysEgo[1] === date) {
        chartDates.push(dictionary.Yesterday);
      } else if (sevenDaysEgo[2] == date) {
        chartDates.push(this.getDayName(date));
      } else if (sevenDaysEgo[3] == date) {
        chartDates.push(this.getDayName(date));
      } else if (sevenDaysEgo[4] == date) {
        chartDates.push(this.getDayName(date));
      } else if (sevenDaysEgo[5] == date) {
        chartDates.push(this.getDayName(date));
      } else if (sevenDaysEgo[6] == date) {
        chartDates.push(this.getDayName(date));
      } else {
        chartDates.push(this.fixformatDate(date));
      }
    }

    return chartDates;
  }
  getLastSevenDays(): string[] {
    const result: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(d.toISOString().split("T")[0]);
    }

    return result;
  }
  fixformatDate(date: string): string {
    return moment(date).format("MM/DD");
  }
  getDayName(date: string): string {
    const days = [
      dictionary.Sunday,
      dictionary.Monday,
      dictionary.Tuesday,
      dictionary.Wednesday,
      dictionary.Thursday,
      dictionary.Friday,
      dictionary.Saturday,
    ];
    return days[new Date(date).getDay()];
  }

  fillCustomers(data: CustomerAccountingReport[]): CustomerDto[] {
    const customers: CustomerDto[] = [];
    const groupCustomerAccountingByCustomer =
      this.groupCustomerAccountingReportByCustomer(data);

    for (
      let index = 0;
      index < groupCustomerAccountingByCustomer.length;
      index++
    ) {
      const item = groupCustomerAccountingByCustomer[index];
      item.customerAccountingReport.forEach(
        (data: CustomerAccountingReport) => {
          if (customers.length == 0) {
            customers.push({
              name: data.customer.merchantName,
              sales: Math.floor(data.saleAmount),
              profit: Math.floor(data.profit),
            });
          } else {
            const findIndex = customers.findIndex(
              (f) => f.name === data.customer.merchantName
            );
            if (findIndex != -1) {
              customers[findIndex].profit! += Math.floor(data.profit);
              customers[findIndex].sales! += Math.floor(data.saleAmount);
            } else {
              customers.push({
                name: data.customer.merchantName,
                sales: Math.floor(data.saleAmount),
                profit: Math.floor(data.profit),
              });
            }
          }
        }
      );
    }

    return customers;
  }
  groupCustomerAccountingReportByCustomer(data: CustomerAccountingReport[]): {
    customerId: number;
    customerAccountingReport: any;
  }[] {
    const groups = data.reduce((groups: any, customerAccountingReport) => {
      const customerId = customerAccountingReport.customer.merchantId;
      if (!groups[customerId]) {
        groups[customerId] = [];
      }
      groups[customerId].push(customerAccountingReport);
      return groups;
    }, {});
    const groupArrays = Object.keys(groups).map((customerId) => {
      return {
        customerId: Number(customerId),
        customerAccountingReport: groups[customerId],
      };
    });

    return groupArrays;
  }

  fillSaleManagers(data: SaleManagerAccountingReport[]): SaleManagerDto[] {
    const saleManagers: SaleManagerDto[] = [];
    const groupSaleManagersById =
      this.groupSaleManagersAccountingBySaleManager(data);

    for (let index = 0; index < groupSaleManagersById.length; index++) {
      const item = groupSaleManagersById[index];
      item.saleManagersAccounting.forEach(
        (data: SaleManagerAccountingReport) => {
          if (saleManagers.length == 0) {
            saleManagers.push({
              name: data.saleManager?.name!,
              sales: Math.floor(data.saleAmount),
              profit: Math.floor(data.profit),
            });
          } else {
            const findIndex = saleManagers.findIndex(
              (f) => f.name === data.saleManager?.name
            );
            if (findIndex != -1) {
              saleManagers[findIndex].profit! += Math.floor(data.profit);
              saleManagers[findIndex].sales! += Math.floor(data.saleAmount);
            } else {
              saleManagers.push({
                name: data.saleManager?.name!,
                sales: Math.floor(data.saleAmount),
                profit: Math.floor(data.profit),
              });
            }
          }
        }
      );
    }
    return saleManagers;
  }
  groupSaleManagersAccountingBySaleManager(
    data: SaleManagerAccountingReport[]
  ): {
    Id: number;
    saleManagersAccounting: any;
  }[] {
    const groups = data.reduce((groups: any, saleManagersAccounting) => {
      const id = saleManagersAccounting.saleManager?.saleManagerId;

      if (id) {
        if (!groups[id]) groups[id] = [];
        groups[id].push(saleManagersAccounting);
      }

      return groups;
    }, {});

    const groupArrays = Object.keys(groups).map((id) => {
      return {
        id: Number(id),
        saleManagersAccounting: groups[id],
      };
    });

    return groupArrays as any;
  }

  fillOffices(data: OfficeAccountingReport[]): SaleManagerDto[] {
    const offices: OfficeDto[] = [];
    const groupOfficesById = this.groupOfficesById(data);

    for (let index = 0; index < groupOfficesById.length; index++) {
      const item = groupOfficesById[index];
      item.offices.forEach((data: OfficeAccountingReport) => {
        if (offices.length == 0) {
          offices.push({
            name: data.branch.branchName,
            sales: Math.floor(data.saleAmount),
            profit: Math.floor(data.profit),
          });
        } else {
          const findIndex = offices.findIndex(
            (f) => f.name === data.branch.branchName
          );
          if (findIndex != -1) {
            offices[findIndex].profit! += Math.floor(data.profit);
            offices[findIndex].sales! += Math.floor(data.saleAmount);
          } else {
            offices.push({
              name: data.branch.branchName,
              sales: Math.floor(data.saleAmount),
              profit: Math.floor(data.profit),
            });
          }
        }
      });
    }
    return offices;
  }
  groupOfficesById(data: OfficeAccountingReport[]): {
    Id: number;
    offices: any;
  }[] {
    const groups = data.reduce((groups: any, offices) => {
      const id = offices.branch.branchId;
      if (!groups[id]) groups[id] = [];
      groups[id].push(offices);
      return groups;
    }, {});

    const groupArrays = Object.keys(groups).map((id) => {
      return {
        id: Number(id),
        offices: groups[id],
      };
    });

    return groupArrays as any;
  }
}
