import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rectangle-btn',
  imports: [CommonModule],
  templateUrl: './rectangle-btn.component.html',
  styleUrl: './rectangle-btn.component.scss',
})
export class RectangleBtnComponent {
  @Input() label: string = 'Button'; // Text displayed on the button
  @Input() disabled: boolean = false; // Disable/enable the button
  @Input() style: 'outline' | 'negative' = 'outline'; // Style for the button
  @Input() size: 'large' | 'small' = 'large'
  @Output() clicked = new EventEmitter<void>(); // Emit event when the button is clicked

  onClick() {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
