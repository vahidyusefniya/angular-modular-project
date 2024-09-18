import { Injectable } from "@angular/core";
import { FirebaseCrashlytics } from "@capacitor-firebase/crashlytics";

export interface ICustomKey {
  key: string;
  value: string;
  type: type;
}
export type type = "string" | "long" | "double" | "boolean" | "int" | "float";

@Injectable({
  providedIn: "root",
})
export class CapacitorFirebaseCrashlyticsService {
  setCustomKey = async (data: ICustomKey) => {
    await FirebaseCrashlytics.setCustomKey({
      key: data.key,
      value: data.value,
      type: data.type,
    });
  };

  setUserId = async (userId: string) => {
    await FirebaseCrashlytics.setUserId({
      userId: userId,
    });
  };

  log = async (message: string) => {
    await FirebaseCrashlytics.log({
      message: message,
    });
  };

  setEnabled = async () => {
    await FirebaseCrashlytics.setEnabled({
      enabled: true,
    });
  };

  isEnabled = async () => {
    const { enabled } = await FirebaseCrashlytics.isEnabled();
    return enabled;
  };

  didCrashOnPreviousExecution = async () => {
    const { crashed } = await FirebaseCrashlytics.didCrashOnPreviousExecution();
    return crashed;
  };

  sendUnsentReports = async () => {
    await FirebaseCrashlytics.sendUnsentReports();
  };

  deleteUnsentReports = async () => {
    await FirebaseCrashlytics.deleteUnsentReports();
  };

  recordException = async (message: string) => {
    await FirebaseCrashlytics.recordException({
      message: message,
    });
  };
}
