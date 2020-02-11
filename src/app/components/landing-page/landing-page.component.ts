import { Component, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subject } from 'rxjs';

@Component({
  templateUrl: './landing-page-dialog.component.html',
  styleUrls: ['./landing-page-dialog.component.scss']
})
export class LandingPageDialogComponent {
  @Output() public startEvent: Subject<string> = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<LandingPageDialogComponent>) { }

  public config(mode: string) {
    this.startEvent.next(mode);
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {

  @Output() public startEvent: Subject<string> = new Subject<string>();
  public dialogRef: MatDialogRef<LandingPageDialogComponent>;

  constructor(private dialog: MatDialog) { }

  public openChoice() {
    this.dialogRef = this.dialog.open(LandingPageDialogComponent);
    this.dialogRef.componentInstance.startEvent.subscribe( mode => this.startEvent.next(mode));
  }
}


