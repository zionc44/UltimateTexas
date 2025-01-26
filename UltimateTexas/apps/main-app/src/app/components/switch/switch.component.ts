import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-switch',
  imports: [CommonModule],
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.scss',
})
export class SwitchComponent {
  @Input() isOn: boolean = false; // Initial state of the switch
  @Output() isOnChange = new EventEmitter<boolean>();

  toggleSwitch() {
    this.isOn = !this.isOn; // Toggle the switch state
    this.isOnChange.emit(this.isOn); // Emit the updated value
  }
}
