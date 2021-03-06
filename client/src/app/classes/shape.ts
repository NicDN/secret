import { DrawingTool } from '@app/classes/drawing-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Color } from './color';
import { ShapePropreties } from './commands/shape-command/shape-command';
import { MouseButton } from './tool';
import { Vec2 } from './vec2';

export enum TraceType {
    Bordered,
    FilledNoBordered,
    FilledAndBordered,
}
export abstract class Shape extends DrawingTool {
    private beginCoord: Vec2;
    private endCoord: Vec2;

    traceType: TraceType;
    alternateShape: boolean = false;
    readonly DASH_SIZE: number = 2;

    constructor(drawingService: DrawingService, colorService: ColorService, toolName: string) {
        super(drawingService, colorService, toolName);
        this.traceType = TraceType.FilledAndBordered;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.beginCoord = this.getPositionFromMouse(event);
            this.endCoord = this.beginCoord;
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.endCoord = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.draw(this.drawingService.baseCtx, this.beginCoord, this.endCoord);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        // 1 = leftclick
        if (event.buttons !== 1) {
            this.mouseDown = false;
        }
        if (this.mouseDown) {
            this.endCoord = this.getPositionFromMouse(event);
            this.drawPreview();
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft') this.alternateShape = true;
        if (this.mouseDown) this.drawPreview();
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft') this.alternateShape = false;
        if (this.mouseDown) this.drawPreview();
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.setLineDash([this.DASH_SIZE * 2, this.DASH_SIZE]);

        ctx.rect(begin.x, begin.y, end.x - begin.x, end.y - begin.y);
        ctx.stroke();
        ctx.restore();
    }

    drawEllipticalPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const actualEndCoords: Vec2 = this.getTrueEndCoords(begin, end, this.alternateShape);
        const center: Vec2 = this.getCenterCoords(begin, actualEndCoords);
        const radiuses: Vec2 = { x: this.getRadius(begin.x, actualEndCoords.x), y: this.getRadius(begin.y, actualEndCoords.y) };
        ctx.save();
        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.setLineDash([this.DASH_SIZE * 2, this.DASH_SIZE]);

        ctx.ellipse(center.x, center.y, radiuses.x, radiuses.y, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    private drawPreview(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.beginCoord, this.endCoord);
        this.draw(this.drawingService.previewCtx, this.beginCoord, this.endCoord);
    }

    getTrueEndCoords(begin: Vec2, end: Vec2, isAlternateShape: boolean): Vec2 {
        let endCoordX: number = end.x;
        let endCoordY: number = end.y;
        const distX: number = Math.abs(end.x - begin.x);
        const distY: number = Math.abs(end.y - begin.y);
        if (isAlternateShape) {
            endCoordX = begin.x + Math.sign(end.x - begin.x) * Math.min(distX, distY);
            endCoordY = begin.y + Math.sign(end.y - begin.y) * Math.min(distX, distY);
        }
        return { x: endCoordX, y: endCoordY };
    }

    private setFillColor(ctx: CanvasRenderingContext2D, color: Color): void {
        ctx.fillStyle = color.rgbValue;
        ctx.globalAlpha = color.opacity;
    }

    private setStrokeColor(ctx: CanvasRenderingContext2D, color: Color): void {
        ctx.strokeStyle = color.rgbValue;
        ctx.globalAlpha = color.opacity;
    }

    getCenterCoords(begin: Vec2, end: Vec2): Vec2 {
        return { x: (end.x + begin.x) / 2, y: (end.y + begin.y) / 2 };
    }

    protected getRadius(begin: number, end: number): number {
        return Math.abs(end - begin) / 2;
    }

    protected adjustToBorder(ctx: CanvasRenderingContext2D, radiuses: Vec2, begin: Vec2, end: Vec2, traceType: number): void {
        const thicknessAdjustment: number = traceType !== TraceType.FilledNoBordered ? ctx.lineWidth / 2 : 0;
        radiuses.x -= thicknessAdjustment;
        radiuses.y -= thicknessAdjustment;
        if (radiuses.x <= 0) {
            ctx.lineWidth = begin.x !== end.x ? Math.abs(begin.x - end.x) : 1;
            radiuses.x = 1;
            radiuses.y = this.getRadius(begin.y, end.y) - ctx.lineWidth / 2;
        }
        if (radiuses.y <= 0) {
            ctx.lineWidth = begin.y !== end.y ? Math.abs(begin.y - end.y) : 1;
            radiuses.y = 1;
            radiuses.x = begin.x !== end.x ? this.getRadius(begin.x, end.x) - ctx.lineWidth / 2 : 1;
        }
    }

    protected drawTraceType(shapePropreties: ShapePropreties): void {
        if (shapePropreties.traceType !== TraceType.Bordered) {
            this.setFillColor(shapePropreties.drawingContext, shapePropreties.mainColor);
            shapePropreties.drawingContext.fill();
        }
        if (shapePropreties.traceType !== TraceType.FilledNoBordered) {
            this.setStrokeColor(shapePropreties.drawingContext, shapePropreties.secondaryColor);
            shapePropreties.drawingContext.stroke();
        }
        shapePropreties.drawingContext.restore();
    }

    protected abstract draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;
    abstract drawShape(shapePropreties: ShapePropreties): void;
}
