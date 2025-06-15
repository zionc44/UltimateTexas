import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Toast, ToastType } from '../interfaces/toast.interface';

@Injectable({
    providedIn: 'root'
})

export class ToastService {
    private static instance: ToastService;
    private toastId: number = 0;
    private datePipe: DatePipe = new DatePipe('en-US');
    private toastsQueue: Subject<Toast>;
    private toastsDismist: Subject<number>;

    constructor() {
        ToastService.instance = this;
        this.toastsQueue = new Subject<Toast>();
        this.toastsDismist = new Subject<number>();
    }
    
    public static getInstance() {
        return this.instance;
    }


    public showToast(toast: Toast) {
        this.toastId++;
        toast.toastId = this.toastId;
        let formattedDate = this.datePipe.transform(new Date(), "HH:mm:ss dd/MM/yyyy")
        if (formattedDate && toast.toastTexts) {
            toast.toastTexts.push(formattedDate)
        }

        this.toastsQueue.next(toast);
        return toast.toastId;
    }

    public newSuccessToast(toastTests: string[], toastTitle: string, isAutoDismiss: boolean) {
        let toast:Toast = {
            toastId: 0,
            toastType: ToastType.Success,
            toastTitle: toastTitle,
            toastTexts: toastTests,
            displayCloseButton: true,
            dismissTimer: 6000,
            autoDismiss: isAutoDismiss,
        }

        return this.showToast(toast);
    }

    public newInfoToast(toastTests: string[], toastTitle: string, isAutoDismiss: boolean) {
        let toast:Toast = {
            toastId: 0,
            toastType: ToastType.Info,
            toastTitle: toastTitle,
            toastTexts: toastTests,
            displayCloseButton: true,
            dismissTimer: 6000,
            autoDismiss: isAutoDismiss,
        }

        return this.showToast(toast);
    }
    
    public newErrorToast(toastTests: string[], toastTitle: string, isAutoDismiss: boolean) {
        let toast:Toast = {
            toastId: 0,
            toastType: ToastType.Error,
            toastTitle: toastTitle,
            toastTexts: toastTests,
            displayCloseButton: true,
            dismissTimer: 0,
            autoDismiss: isAutoDismiss,
        }

        return this.showToast(toast);
    }
    
    public newWarningToast(toastTests: string[], toastTitle: string) {
        let toast:Toast = {
            toastId: 0,
            toastType: ToastType.Warning,
            toastTitle: toastTitle,
            toastTexts: toastTests,
            displayCloseButton: true,
            dismissTimer: 6000,
            autoDismiss: false,
        }

        return this.showToast(toast);
    }

    public dismistToast(toastId: number) {
        this.toastsDismist.next(toastId);
    }

    public getToasterObservable() {
        return this.toastsQueue.asObservable();
    }

    public getDismistToast() {
        return this.toastsDismist.asObservable();
    }
}
