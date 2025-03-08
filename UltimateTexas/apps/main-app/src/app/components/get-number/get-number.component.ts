import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-get-number',
  imports: [CommonModule],
  templateUrl: './get-number.component.html',
  styleUrl: './get-number.component.scss',
})
export class GetNumberComponent {

  @ViewChild('span') mySpan!: ElementRef;

  focusOut() {
    this.value = Number(this.mySpan.nativeElement.innerHTML);
    this.valueChange.emit(this.value);
  }


  @Input() value: number = 0; // Two-way bound number
  @Output() valueChange = new EventEmitter<number>(); // Emitter for two-way binding
  @Input() name: string = ''; // Optional name for the component
  @Input() showControls: boolean = true; // Input to toggle +/- buttons

  increment() {
    this.value++;
    this.valueChange.emit(this.value);
  }

  decrement() {
    if (this.value > 0) { // Optional: Prevent negative numbers
      this.value--;
      this.valueChange.emit(this.value);
    }
  }


}
