import { Component, Output, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

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
export class LandingPageComponent implements AfterViewInit {

  @Output() public startEvent: Subject<string> = new Subject<string>();
  public dialogRef: MatDialogRef<LandingPageDialogComponent>;

  constructor(
    private dialog: MatDialog,
    public snackbar: MatSnackBar,
    private router: Router) { }

  public openChoice() {
    this.dialogRef = this.dialog.open(LandingPageDialogComponent, { disableClose: true });
    this.dialogRef.componentInstance.startEvent.subscribe(mode => this.startEvent.next(mode));
  }

  public ngAfterViewInit() {
    this.openChoice();
    this.startEvent.subscribe(mode => {
      if (mode === 'new') {
        this.dialogRef.close();
        this.router.navigate(['map-config']);
      } else {
        this.snackbar.open('Not available now', '', { duration: 2000 });
      }
    });
  }

}


