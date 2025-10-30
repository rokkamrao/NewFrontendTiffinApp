import { Component } from '@angular/core';

@Component({
  selector: 'ds-button',
  standalone: true,
  template: `<button class="btn btn-primary btn-lg"><ng-content></ng-content></button>`
})
export class DsButton {}
