import { Injectable } from '@angular/core';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetSelectionService } from './magnet-selection.service';

@Injectable({
    providedIn: 'root',
})
export class MoveSelectionService {
    constructor(private drawingService: DrawingService, private magnetSelectionService: MagnetSelectionService) {}

    movingWithMouse: boolean = false;
    mouseMoveOffset: Vec2 = { x: 0, y: 0 };
    isUsingMagnet: boolean = false;

    readonly arrowMoveDelta: number = 3;

    movingWithArrows: boolean = false;
    private keyUpIsPressed: boolean = false;
    private keyDownIsPressed: boolean = false;
    private keyLeftIsPressed: boolean = false;
    private keyRightIsPressed: boolean = false;
    initialKeyPress: boolean = false;

    calculateDelta(): Vec2 {
        let deltaY = 0;
        let deltaX = 0;
        if (this.keyUpIsPressed) deltaY -= this.arrowMoveDelta;
        if (this.keyDownIsPressed) deltaY += this.arrowMoveDelta;
        if (this.keyLeftIsPressed) deltaX -= this.arrowMoveDelta;
        if (this.keyRightIsPressed) deltaX += this.arrowMoveDelta;
        return { x: deltaX, y: deltaY };
    }

    checkIfAnyArrowIsPressed(): boolean {
        return this.keyUpIsPressed || this.keyDownIsPressed || this.keyLeftIsPressed || this.keyRightIsPressed;
    }

    updateArrowKeysPressed(event: KeyboardEvent, state: boolean): void {
        if (event.code === 'ArrowUp') this.keyUpIsPressed = state;
        if (event.code === 'ArrowDown') this.keyDownIsPressed = state;
        if (event.code === 'ArrowLeft') this.keyLeftIsPressed = state;
        if (event.code === 'ArrowRight') this.keyRightIsPressed = state;
    }

    moveSelectionWithArrows(ctx: CanvasRenderingContext2D, delta: Vec2, selectionCoords: SelectionCoords): void {
        const emptyPosition = { x: 0, y: 0 };

        this.magnetSelectionService.isUsingMouse = false;
        if (this.isUsingMagnet) {
            this.magnetSelectionService.alignToProperMagnetPosition(emptyPosition, selectionCoords, delta);
        } else {
            selectionCoords.finalTopLeft.x += delta.x;
            selectionCoords.finalTopLeft.y += delta.y;
            selectionCoords.finalBottomRight.x += delta.x;
            selectionCoords.finalBottomRight.y += delta.y;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    moveSelectionWithMouse(ctx: CanvasRenderingContext2D, pos: Vec2, delta: Vec2, selectionCoords: SelectionCoords): void {
        const width = selectionCoords.finalBottomRight.x - selectionCoords.finalTopLeft.x;
        const height = selectionCoords.finalBottomRight.y - selectionCoords.finalTopLeft.y;

        this.magnetSelectionService.isUsingMouse = true;
        if (this.isUsingMagnet) {
            this.magnetSelectionService.alignToProperMagnetPosition(pos, selectionCoords, delta);
        } else {
            selectionCoords.finalTopLeft = { x: pos.x - this.mouseMoveOffset.x, y: pos.y - this.mouseMoveOffset.y };
            selectionCoords.finalBottomRight = {
                x: selectionCoords.finalTopLeft.x + width,
                y: selectionCoords.finalTopLeft.y + height,
            };
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }
}
