import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class SnackBarService {
    constructor(public snackBar: MatSnackBar) {}

    openSnackBar(message: string, action: string, duration: number = 2000): MatSnackBarRef<TextOnlySnackBar> {
        return this.snackBar.open(message, action, {
            duration,
        });
    }
}
