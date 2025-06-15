import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'tep-client-toast-close-img',
    templateUrl: './toast-close-img.component.html',
    styleUrls: ['./toast-close-img.component.scss'],
})
export class ToastCloseImgComponent {
    @Input() color: string = "";
}
