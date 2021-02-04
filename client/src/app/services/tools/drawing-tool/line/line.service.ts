import { Injectable } from '@angular/core';
import { DrawingTool } from '@app/classes/drawing-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { ColorService } from '@app/services/color/color.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Injectable({
    providedIn: 'root',
})
export class LineService extends DrawingTool {
    thickness: number;
    // values for the force alignment
    isShiftDown: boolean;
    shiftAngle: number;
    lastSelectedPoint: Vec2;

    // parameters for the dot jonctions
    private dotJonction: boolean;
    private dotThickness: number;

    private pathData: Vec2[];
    private mousePosition: Vec2;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
        this.clearPath();
    }
    draw(event: MouseEvent): void {
        throw new Error('Method not implemented.');
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
    }

    onMouseUp(event: MouseEvent): void {
        const MAX_OFFSET = 20;
        if (this.mouseDown) {
            const delay = 120;
            this.pathData.push(this.mousePosition);
            this.updatePreview();
            this.mouseDown = false;
            // double click
            setTimeout(() => {
                if (this.mouseDown) {
                    const firstPos = this.pathData[0];
                    if (this.mousePosition.x <= firstPos.x + MAX_OFFSET && this.mousePosition.x >= firstPos.x - MAX_OFFSET) {
                        if (this.mousePosition.y <= firstPos.y + MAX_OFFSET && this.mousePosition.y >= firstPos.y - MAX_OFFSET) {
                            // Since a double-click push 2 times the last value, we need to pop the last 2 values
                            this.pathData.pop();
                            this.pathData.pop();
                            this.pathData.push(this.pathData[0]);
                        }
                    }
                    this.drawLine(this.drawingService.baseCtx, this.pathData);
                    this.clearPath();
                    this.pathData = [];
                }
            }, delay);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.mousePosition = this.getPositionFromMouse(event);
        this.updatePreview();
    }

    onKeyDown(event: KeyboardEvent): void {
        const MIN_LENGTH_FOR_REMOVING_DOT = 2;

        switch (event.code) {
            case 'Escape':
                this.pathData = [];
                break;
            case 'Backspace':
                if (this.pathData.length > MIN_LENGTH_FOR_REMOVING_DOT) {
                    // We need to remove the preview point AND the last selected point
                    this.pathData.pop();
                    this.pathData.pop();
                    this.pathData.push(this.mousePosition);
                }
                break;
            case 'ShiftRight':
            case 'ShiftLeft':
                this.lastSelectedPoint = this.pathData[this.pathData.length - 2];
                if (this.isShiftDown !== true) {
                    this.updateFixAngle();
                }
                this.isShiftDown = true;
                this.updatePreview();
                break;
            default:
                break;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawLine(this.drawingService.previewCtx, this.pathData);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            this.isShiftDown = false;
            this.updatePreview();
        }
    }

    private updatePreview(): void {
        let tempMousePosition: Vec2;
        tempMousePosition = { x: this.mousePosition.x, y: this.mousePosition.y };

        // force align the line on the closest predefined axe
        if (this.isShiftDown) {
            const dx = this.mousePosition.x - this.lastSelectedPoint.x;

            if (this.shiftAngle >= 337.5 || this.shiftAngle < 22.5) {
                tempMousePosition.x = this.lastSelectedPoint.x;
            } else if (this.shiftAngle < 67.5) {
                tempMousePosition.y = this.lastSelectedPoint.y + dx;
            } else if (this.shiftAngle < 112.5) {
                tempMousePosition.y = this.lastSelectedPoint.y;
            } else if (this.shiftAngle < 157.5) {
                tempMousePosition.y = this.lastSelectedPoint.y - dx;
            } else if (this.shiftAngle < 202.5) {
                tempMousePosition.x = this.lastSelectedPoint.x;
            } else if (this.shiftAngle < 247.5) {
                tempMousePosition.y = this.lastSelectedPoint.y + dx;
            } else if (this.shiftAngle < 292.5) {
                tempMousePosition.y = this.lastSelectedPoint.y;
            } else if (this.shiftAngle < 337.5) {
                tempMousePosition.y = this.lastSelectedPoint.y - dx;
            }
        }

        this.pathData.pop();
        this.pathData.push(tempMousePosition);

        // We draw on the preview canvas and we erase it between each movement of the mouse
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawLine(this.drawingService.previewCtx, this.pathData);
    }

    private updateFixAngle(): void {
        const dx = this.mousePosition.x - this.lastSelectedPoint.x;
        const dy = this.mousePosition.y - this.lastSelectedPoint.y;
        const rads = Math.atan2(dx, dy);
        let degrees = (rads * 180) / Math.PI;
        while (degrees >= 360) degrees -= 360;
        while (degrees < 0) degrees += 360;
        this.shiftAngle = degrees;
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        this.thickness = 10; // default value, to be removed
        this.dotJonction = false; // default value, to be removed
        this.dotThickness = 20; // default value, to be removed

        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.beginPath();

        for (const point of path) {
            ctx.lineWidth = this.thickness;
            ctx.lineTo(point.x, point.y);
            if (this.dotJonction) {
                const circle = new Path2D();
                circle.arc(point.x, point.y, this.dotThickness, 0, 2 * Math.PI);
                ctx.fill(circle);
            }
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
