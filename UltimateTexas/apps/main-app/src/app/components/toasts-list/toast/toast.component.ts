import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastImgBySeverityComponent } from '../toast-img-by-severity/toast-img-by-severity.component';
import { ToastCloseImgComponent } from '../toast-close-img/toast-close-img.component';
import { Toast, ToastType } from '../../../interfaces/toast.interface';

@Component({
    standalone: true,
    imports: [CommonModule, ToastImgBySeverityComponent, ToastCloseImgComponent],
    selector: 'tep-client-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss']
})

export class ToastComponent implements OnInit {
    public ToastType = ToastType;
    public fadeOutInd: boolean = false
    @Input() toast!: Toast;
    @Output() dismistEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() { }

    ngOnInit(): void {
        if (this.toast.autoDismiss) {
            this.setAutoDismist()
        }
    }

    getToastColor() {
        switch (this.toast.toastType) {
            case ToastType.Success:
                return '#60977b';
            case ToastType.Info:
                return '#368c9d';
            case ToastType.Warning:
                return '#bb923f';
            case ToastType.Error:
                return '#c56067';
            default:
                return '#60977b';
        }
    }

    getToastBackgroundColor() {
        switch (this.toast.toastType) {
            case ToastType.Success:
                return '#daf2da';
            case ToastType.Info:
                return '#caecf8';
            case ToastType.Warning:
                return '#ffeac1';
            case ToastType.Error:
                return '#f9c7c8';
            default:
                return '#daf2da';
        }
    }

    setAutoDismist() {
        if (!this.toast.dismissTimer) {
            this.toast.dismissTimer = 5000;
        }

        setTimeout(() => {
            this.fadeOutInd = true
            setTimeout(() => {
                this.dismist();
            }, 1000)
        }, this.toast.dismissTimer)
    }

    dismist() {
        this.dismistEvent.next(true);
    }
}
