import { SelectionCommand, SelectionProperties } from '@app/classes/commands/selection-command/selection-command';
import { HORIZONTAL_OFFSET, MouseButton, Tool, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetSelectionService } from '@app/services/tools/selection/magnet/magnet-selection.service';
import { MoveSelectionService, SelectedPoint } from '@app/services/tools/selection/move/move-selection.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize/resize-selection.service';
import { RectangleDrawingService as ShapeService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export interface SelectionCoords {
    initialTopLeft: Vec2;
    initialBottomRight: Vec2;
    finalTopLeft: Vec2;
    finalBottomRight: Vec2;
}

export abstract class SelectionTool extends Tool {
    constructor(
        drawingService: DrawingService,
        protected shapeService: ShapeService,
        toolName: string,
        protected undoRedoService: UndoRedoService,
        protected moveSelectionService: MoveSelectionService,
        protected resizeSelectionService: ResizeSelectionService,
        protected magnetSelectionService: MagnetSelectionService,
    ) {
        super(drawingService, toolName);
    }
    data: ImageData;
    selectionExists: boolean = false;
    private readonly selectionOffSet: number = 13;
    private intervalHandler: number;
    private timeoutHandler: number;
    readonly INITIAL_ARROW_TIMER: number = 500;
    readonly ARROW_INTERVAL: number = 100;
    coords: SelectionCoords = {
        initialTopLeft: { x: 0, y: 0 },
        initialBottomRight: { x: 0, y: 0 },
        finalTopLeft: { x: 0, y: 0 },
        finalBottomRight: { x: 0, y: 0 },
    };

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        if (this.isInsideSelection(this.getPositionFromMouse(event)) && this.selectionExists) {
            this.handleSelectionMouseDown(event);
            return;
        }
        this.undoRedoService.disableUndoRedo();
        this.cancelSelection();
        this.coords.initialTopLeft = this.getPositionFromMouse(event);
        this.coords.initialBottomRight = this.coords.initialTopLeft;
    }

    onMouseMove(event: MouseEvent): void {
        this.updateResizeProperties(this.getPositionFromMouse(event));
        if (event.buttons !== 1) this.mouseDown = false;
        if (!this.mouseDown) return;

        if (
            this.resizeSelectionService.selectedPointIndex !== SelectedPoint.NO_POINT &&
            this.resizeSelectionService.selectedPointIndex !== SelectedPoint.CENTER
        ) {
            this.resizeSelection(this.getPositionFromMouse(event));
            return;
        }

        if (this.moveSelectionService.movingWithMouse) {
            this.moveSelectionService.moveSelectionWithMouse(this.getPositionFromMouse(event), this.coords);
            this.drawAll(this.drawingService.previewCtx);
            return;
        }
        this.coords.initialBottomRight = this.getPositionFromMouse(event);
        this.adjustToDrawingBounds();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.coords.initialTopLeft, this.coords.initialBottomRight);
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.mouseDown = false;
        if (this.resizeSelectionService.selectedPointIndex !== SelectedPoint.NO_POINT) {
            this.resizeSelectionService.selectedPointIndex = SelectedPoint.NO_POINT;
            return;
        }
        if (this.moveSelectionService.movingWithMouse) {
            this.moveSelectionService.movingWithMouse = false;
            return;
        }
        this.handleSelectionMouseUp(event);
    }

    protected handleSelectionMouseDown(event: MouseEvent): void {
        this.resizeSelectionService.checkIfAControlPointHasBeenSelected(this.getPositionFromMouse(event), this.coords, false);
        if (
            this.resizeSelectionService.selectedPointIndex === SelectedPoint.NO_POINT ||
            this.resizeSelectionService.selectedPointIndex === SelectedPoint.CENTER
        ) {
            this.setOffSet(this.getPositionFromMouse(event));
            this.moveSelectionService.movingWithMouse = true;
        }
    }

    private handleSelectionMouseUp(event: MouseEvent): void {
        this.coords.initialBottomRight = this.getPositionFromMouse(event);
        this.adjustToDrawingBounds();
        this.coords.initialBottomRight = this.shapeService.getTrueEndCoords(
            this.coords.initialTopLeft,
            this.coords.initialBottomRight,
            this.shapeService.alternateShape,
        );
        this.shapeService.alternateShape = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.createSelection();
    }

    protected updateResizeProperties(pos: Vec2): void {
        this.resizeSelectionService.previewSelectedPointIndex = this.isInsideSelection(pos) ? SelectedPoint.MOVING : SelectedPoint.NO_POINT;
        this.resizeSelectionService.checkIfAControlPointHasBeenSelected(pos, this.coords, true);
    }
    onKeyDown(event: KeyboardEvent): void {
        if (event.code === 'Escape') this.cancelSelection();
        if (this.selectionExists) this.handleMovingArrowsKeyDown(event);
        if (event.code === 'ShiftLeft') this.handleLeftShift(event, this.shapeService.onKeyDown);
    }

    onKeyUp(event: KeyboardEvent): void {
        this.handleMovingArrowsKeyUp(event);
        if (event.code === 'ShiftLeft') this.handleLeftShift(event, this.shapeService.onKeyUp);
    }

    private handleLeftShift(event: KeyboardEvent, callback: (keyEvent: KeyboardEvent) => void): void {
        if (!this.selectionExists) {
            callback.call(this.shapeService, event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPerimeter(this.drawingService.previewCtx, this.coords.initialTopLeft, this.coords.initialBottomRight);
            return;
        }
        if (callback === this.shapeService.onKeyDown) {
            this.resizeSelectionService.lastDimensions = {
                x: Math.abs(this.coords.finalBottomRight.x - this.coords.finalTopLeft.x),
                y: Math.abs(this.coords.finalBottomRight.y - this.coords.finalTopLeft.y),
            };
            this.resizeSelectionService.shiftKeyIsDown = true;
            return;
        }
        this.resizeSelectionService.shiftKeyIsDown = false;
        this.resizeSelection(this.resizeSelectionService.lastMousePos);
    }

    protected resizeSelection(pos: Vec2): void {
        this.resizeSelectionService.resizeSelection(pos, this.coords);
        this.drawAll(this.drawingService.previewCtx);
    }

    private handleMovingArrowsKeyDown(event: KeyboardEvent): void {
        this.moveSelectionService.updateArrowKeysPressed(event, true);
        if (
            this.moveSelectionService.checkIfAnyArrowIsPressed() &&
            !this.moveSelectionService.movingWithArrows &&
            !this.moveSelectionService.initialKeyPress
        )
            this.handleArrowInitialTime(this.drawingService.previewCtx, event);
    }

    private handleMovingArrowsKeyUp(event: KeyboardEvent): void {
        if (this.moveSelectionService.initialKeyPress) {
            this.moveSelectionService.initialKeyPress = false;
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = 0;
            this.moveSelectionService.moveSelectionWithArrows(this.moveSelectionService.calculateDelta(), this.coords);
            this.drawAll(this.drawingService.previewCtx);
        }
        this.moveSelectionService.updateArrowKeysPressed(event, false);

        if (!this.moveSelectionService.checkIfAnyArrowIsPressed()) {
            this.moveSelectionService.movingWithArrows = false;
            clearInterval(this.intervalHandler);
            this.intervalHandler = 0;
        }
    }

    private handleArrowInitialTime(ctx: CanvasRenderingContext2D, event: KeyboardEvent): void {
        this.moveSelectionService.initialKeyPress = true;
        this.timeoutHandler = (setTimeout(
            (() => {
                this.startContinousArrowMovement(ctx);
            }).bind(this),
            this.INITIAL_ARROW_TIMER,
            ctx,
        ) as unknown) as number;
    }

    private startContinousArrowMovement(ctx: CanvasRenderingContext2D): void {
        if (this.moveSelectionService.initialKeyPress) {
            this.moveSelectionService.initialKeyPress = false;
            this.moveSelectionService.movingWithArrows = true;
            this.intervalHandler = (setInterval(
                (() => {
                    this.moveSelectionService.moveSelectionWithArrows(this.moveSelectionService.calculateDelta(), this.coords);
                    this.drawAll(ctx);
                }).bind(this),
                this.ARROW_INTERVAL,
                ctx,
                this.moveSelectionService.calculateDelta(),
            ) as unknown) as number;
        }
    }

    protected createSelection(): void {
        if (this.coords.initialTopLeft.x === this.coords.initialBottomRight.x || this.coords.initialTopLeft.y === this.coords.initialBottomRight.y) {
            this.undoRedoService.enableUndoRedo();
            return;
        }
        this.saveSelection(this.drawingService.baseCtx);
        this.drawAll(this.drawingService.previewCtx);
        this.selectionExists = true;
    }

    private saveSelection(ctx: CanvasRenderingContext2D): void {
        this.setSelectionCoords();
        this.data = ctx.getImageData(
            this.coords.initialTopLeft.x,
            this.coords.initialTopLeft.y,
            this.coords.initialBottomRight.x - this.coords.initialTopLeft.x,
            this.coords.initialBottomRight.y - this.coords.initialTopLeft.y,
        );
        this.fillWithWhite(this.loadUpProperties(ctx));
    }

    private setSelectionCoords(): void {
        this.coords.finalTopLeft = {
            x: Math.min(this.coords.initialTopLeft.x, this.coords.initialBottomRight.x),
            y: Math.min(this.coords.initialTopLeft.y, this.coords.initialBottomRight.y),
        };
        this.coords.finalBottomRight = {
            x: Math.max(this.coords.initialTopLeft.x, this.coords.initialBottomRight.x),
            y: Math.max(this.coords.initialTopLeft.y, this.coords.initialBottomRight.y),
        };
        this.coords.initialTopLeft = { x: this.coords.finalTopLeft.x, y: this.coords.finalTopLeft.y };
        this.coords.initialBottomRight = { x: this.coords.finalBottomRight.x, y: this.coords.finalBottomRight.y };
    }

    private adjustToDrawingBounds(): void {
        if (this.coords.initialBottomRight.x < 0) this.coords.initialBottomRight.x = 0;
        if (this.coords.initialBottomRight.x > this.drawingService.canvas.width) this.coords.initialBottomRight.x = this.drawingService.canvas.width;
        if (this.coords.initialBottomRight.y < 0) this.coords.initialBottomRight.y = 0;
        if (this.coords.initialBottomRight.y > this.drawingService.canvas.height)
            this.coords.initialBottomRight.y = this.drawingService.canvas.height;
    }

    cancelSelection(): void {
        if (this.drawingService.previewCtx === undefined) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.selectionExists) {
            this.draw(this.drawingService.baseCtx);
            this.coords.initialTopLeft = { x: 0, y: 0 };
            this.coords.initialBottomRight = { x: 0, y: 0 };
            this.coords.finalBottomRight = { x: 0, y: 0 };
            this.coords.finalTopLeft = { x: 0, y: 0 };
            this.selectionExists = false;
            this.moveSelectionService.movingWithMouse = false;
            this.moveSelectionService.movingWithArrows = false;
            clearInterval(this.intervalHandler);
            this.intervalHandler = 0;
            this.undoRedoService.enableUndoRedo();
            return;
        }
        this.coords.initialTopLeft = { x: this.coords.initialBottomRight.x, y: this.coords.initialBottomRight.y };
    }

    drawAll(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(ctx);
        this.draw(ctx);
        this.drawPerimeter(ctx, this.coords.finalTopLeft, this.coords.finalBottomRight);
        this.resizeSelectionService.drawBox(ctx, this.coords.finalTopLeft, this.coords.finalBottomRight);
    }

    private draw(ctx: CanvasRenderingContext2D): void {
        const selectionCommand: SelectionCommand = new SelectionCommand(this.loadUpProperties(ctx), this);
        selectionCommand.execute();
        if (ctx === this.drawingService.baseCtx && this.selectionHasChanged()) this.undoRedoService.addCommand(selectionCommand);
    }

    private selectionHasChanged(): boolean {
        return (
            this.coords.initialTopLeft.x !== this.coords.finalTopLeft.x ||
            this.coords.initialTopLeft.y !== this.coords.finalTopLeft.y ||
            this.coords.finalBottomRight.x !== this.coords.initialBottomRight.x ||
            this.coords.finalBottomRight.y !== this.coords.initialBottomRight.y
        );
    }

    selectAll(): void {
        this.onMouseDown({ pageX: HORIZONTAL_OFFSET, pageY: VERTICAL_OFFSET, button: MouseButton.Left } as MouseEvent);
        this.onMouseUp({
            pageX: this.drawingService.canvas.width + HORIZONTAL_OFFSET,
            pageY: this.drawingService.canvas.height + VERTICAL_OFFSET,
            button: MouseButton.Left,
        } as MouseEvent);
    }

    protected isInsideSelection(point: Vec2): boolean {
        const minX = Math.min(this.coords.finalTopLeft.x, this.coords.finalBottomRight.x);
        const maxX = Math.max(this.coords.finalTopLeft.x, this.coords.finalBottomRight.x);
        const minY = Math.min(this.coords.finalTopLeft.y, this.coords.finalBottomRight.y);
        const maxY = Math.max(this.coords.finalTopLeft.y, this.coords.finalBottomRight.y);
        return (
            point.x > minX - this.selectionOffSet &&
            point.x < maxX + this.selectionOffSet &&
            point.y > minY - this.selectionOffSet &&
            point.y < maxY + this.selectionOffSet
        );
    }

    protected setOffSet(pos: Vec2): void {
        this.moveSelectionService.mouseMoveOffset = { x: pos.x - this.coords.finalTopLeft.x, y: pos.y - this.coords.finalTopLeft.y };
        this.magnetSelectionService.mouseMoveOffset = { x: pos.x - this.coords.finalTopLeft.x, y: pos.y - this.coords.finalTopLeft.y };
    }

    protected loadUpProperties(ctx?: CanvasRenderingContext2D): SelectionProperties {
        return {
            selectionCtx: ctx,
            imageData: this.data,
            coords: {
                initialTopLeft: this.coords.initialTopLeft,
                initialBottomRight: this.coords.initialBottomRight,
                finalTopLeft: this.coords.finalTopLeft,
                finalBottomRight: this.coords.finalBottomRight,
            },
        };
    }

    protected scaleContext(coords: SelectionCoords, ctx: CanvasRenderingContext2D): void {
        const ratioX: number = (coords.finalBottomRight.x - coords.finalTopLeft.x) / (coords.initialBottomRight.x - coords.initialTopLeft.x);
        const ratioY: number = (coords.finalBottomRight.y - coords.finalTopLeft.y) / (coords.initialBottomRight.y - coords.initialTopLeft.y);

        ctx.translate(coords.finalTopLeft.x, coords.finalTopLeft.y);
        ctx.scale(ratioX, ratioY);
        ctx.translate(-coords.finalTopLeft.x, -coords.finalTopLeft.y);
    }

    abstract drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;
    abstract drawSelection(selectionPropreties: SelectionProperties): void;
    abstract fillWithWhite(selectionPropreties: SelectionProperties): void;
}
