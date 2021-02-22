import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DialogType } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';

interface ShortcutFunctions {
    action?: () => void;
    actionCtrl?: () => void;
}

enum shortCutManager {
    SAVE = 'KeyS',
    CAROUSEL = 'KeyG',
    EXPORT = 'KeyE',
    NEWDRAWING = 'KeyO',
    ERASER = 'KeyE',
    PENCIL = 'KeyC',
    LINE = 'KeyL',
    SPRAY_CAN = 'KeyA',
    EYE_DROPPER = 'KeyI',
    ELLIPSE = 'Digit2',
    RECTANGLE = 'Digit1',
    POLYGON = 'Digit3',
}

type ShortcutManager = {
    [key in shortCutManager]: ShortcutFunctions;
};

@Injectable({
    providedIn: 'root',
})
export class HotkeyService {
    shortCutManager: ShortcutManager;

    constructor(
        public router: Router,
        public drawingService: DrawingService,
        private toolService: ToolsService,
        private dialogService: DialogService,
    ) {
        this.shortCutManager = {
            KeyS: { actionCtrl: () => this.dialogService.openDialog(DialogType.Save) },
            KeyG: { actionCtrl: () => this.dialogService.openDialog(DialogType.Carousel) },
            KeyO: { actionCtrl: () => this.handleCtrlO() },
            KeyA: { action: () => this.toolService.setCurrentTool(this.toolService.sprayCanService) },
            KeyI: { action: () => this.toolService.setCurrentTool(this.toolService.eyeDropperService) },
            KeyE: {
                action: () => this.toolService.setCurrentTool(this.toolService.eraserService),
                actionCtrl: () => this.dialogService.openDialog(DialogType.Export),
            },
            KeyL: { action: () => this.toolService.setCurrentTool(this.toolService.lineService) },
            KeyC: { action: () => this.toolService.setCurrentTool(this.toolService.pencilService) },
            Digit1: { action: () => this.toolService.setCurrentTool(this.toolService.rectangleDrawingService) },
            Digit2: { action: () => this.toolService.setCurrentTool(this.toolService.ellipseDrawingService) },
            Digit3: { action: () => this.toolService.setCurrentTool(this.toolService.polygonService) },
        };
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey) {
            event.preventDefault();
            this.shortCutManager[event.code as shortCutManager]?.actionCtrl?.();
        } else {
            this.shortCutManager[event.code as shortCutManager]?.action?.();
        }
        this.toolService.currentTool.onKeyDown(event);
        event.returnValue = true; // To accept default web shortCutManager
    }

    handleCtrlO(): void {
        this.router.navigate(['editor']);
        this.drawingService.handleNewDrawing();
    }
}
