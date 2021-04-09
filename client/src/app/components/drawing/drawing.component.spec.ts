import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize-selection.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { LineService } from '@app/services/tools/trace-tool/line/line.service';
import { PencilService } from '@app/services/tools/trace-tool/pencil/pencil.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { DrawingComponent } from './drawing.component';

const MOUSE_POSITION_DEFAULT = 1000;
const INSIDE_CANVAS_WIDTH = 500;
const INSIDE_CANVAS_HEIGHT = 500;
const mouseEventClick = { pageX: MOUSE_POSITION_DEFAULT, pageY: MOUSE_POSITION_DEFAULT, button: 0 } as MouseEvent;
const mouseEventInsideCanvas = { pageX: INSIDE_CANVAS_WIDTH, pageY: INSIDE_CANVAS_HEIGHT, button: 0 } as MouseEvent;
const keyBoardEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });
const OVER_MINIMUM_WIDTH = 1000;
const OVER_MINIMUM_HEIGHT = 1000;

const baseImage = new Image();

// tslint:disable: no-string-literal
// tslint:disable: no-any
describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;

    // tslint:disable-next-line: prefer-const
    let colorServiceStub: ColorService;
    let drawingStub: DrawingService;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let moveSelectionServiceSpyObj: jasmine.SpyObj<MoveSelectionService>;
    let resizeSelectionSpyObj: jasmine.SpyObj<ResizeSelectionService>;
    let imageSpyObj: jasmine.SpyObj<HTMLImageElement>;

    let hotKeyServiceSpy: jasmine.SpyObj<HotkeyService>;
    let toolsServiceSpy: jasmine.SpyObj<ToolsService>;

    const canvasMock = document.createElement('canvas');

    beforeEach(async(() => {
        drawingStub = new DrawingService({} as MatBottomSheet);

        toolsServiceSpy = jasmine.createSpyObj('ToolsService', ['onKeyUp']);
        hotKeyServiceSpy = jasmine.createSpyObj('HotkeyService', ['onKeyDown']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('undoRedoService', ['addCommand', 'enableUndoRedo', 'disableUndoRedo']);
        moveSelectionServiceSpyObj = jasmine.createSpyObj('MoveSelectionService', ['']);
        resizeSelectionSpyObj = jasmine.createSpyObj('ResizeSelectionService', ['']);

        imageSpyObj = jasmine.createSpyObj('Image', ['decode']);

        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [
                { provide: ToolsService, useValue: toolsServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
                { provide: HotkeyService, useValue: hotKeyServiceSpy },
                { provide: ColorService, useValue: colorServiceStub },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
                { provide: MoveSelectionService, useValue: moveSelectionServiceSpyObj },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: OVER_MINIMUM_WIDTH });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: OVER_MINIMUM_HEIGHT });

        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;

        colorServiceStub = TestBed.inject(ColorService);
        drawingStub = TestBed.inject(DrawingService);
        toolsServiceSpy.currentTool = new PencilService(drawingStub, colorServiceStub, undoRedoServiceSpyObj);

        localStorage.setItem('canvas', canvasMock.toDataURL());

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#ngAfterViewInit should set the base context and preview context correctly', () => {
        component.ngAfterViewInit();
        expect(component['drawingService'].baseCtx).toBe(component.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(component['drawingService'].previewCtx).toBe(component.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(component['drawingService'].canvas).toBe(component.baseCanvas.nativeElement);
        expect(component['drawingService'].previewCanvas).toBe(component.previewCanvas.nativeElement);
    });

    it('#ngAfterViewInit should call #loadCanvasWithIncomingImage', () => {
        spyOn<any>(component, 'loadCanvasWithIncomingImage').and.stub();
        component.ngAfterViewInit();
        expect(component['loadCanvasWithIncomingImage']).toHaveBeenCalled();
    });

    it('#loadCanvasWithIncomingImage should call #handleNewDrawing with base image if the user creates a new drawing', async () => {
        drawingStub.isNewDrawing = true;
        spyOn(drawingStub, 'handleNewDrawing');
        await component['loadCanvasWithIncomingImage'](baseImage);
        expect(drawingStub.handleNewDrawing).toHaveBeenCalledWith(baseImage);
        expect(drawingStub.isNewDrawing).toBeFalse();
    });

    it("#loadCanvasWithIncomingImage should call #handleNewDrawing with drawing service's new image if image is loaded from carousel ", async () => {
        const newImage = new Image();
        drawingStub.newImage = newImage;
        spyOn(drawingStub, 'handleNewDrawing');
        await component['loadCanvasWithIncomingImage'](baseImage);
        expect(drawingStub.handleNewDrawing).toHaveBeenCalledWith(newImage);
        expect(drawingStub.newImage).toBeUndefined();
    });

    it('#loadCanvasWithIncomingImage should call #changeDrawing from drawingService if the user reloads the editor page', async () => {
        component['refreshedImage'] = imageSpyObj;
        drawingStub.isNewDrawing = false;
        drawingStub.newImage = undefined;

        spyOn(drawingStub, 'changeDrawing');
        await component['loadCanvasWithIncomingImage'](baseImage);
        expect(drawingStub.changeDrawing).toHaveBeenCalled();
    });

    it('#disableDrawing Should disable drawing if the resize button is being used', () => {
        const isUsingResizeButtonStub = true;
        component.disableDrawing(isUsingResizeButtonStub);
        expect(component['canDraw']).toEqual(false);

        component.disableDrawing(!isUsingResizeButtonStub);
        expect(component['canDraw']).toBeTrue();
    });

    it("#onMouseMove should call the current tool's #onMouseMove when receiving a mouse move event if canDraw flag is true", () => {
        component['canDraw'] = true;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseMove');
        component.onMouseMove(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseMove should not call the current tool's #onMouseMove when receiving a mouse move event if canDraw flag is false", () => {
        component['canDraw'] = false;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseMove');
        component.onMouseMove(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseDown should call the current tool's #onMouseDown when receiving a mouse down event inside the canvas if canDrawflag is true ", () => {
        component['canDraw'] = true;
        spyOn<any>(component, 'isInsideCanvas').and.returnValue(true);
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseDown');
        component.onMouseDown(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseDown should not call the current tool's #onMouseDown when receiving a mouse down event if canDrawflag is false ", () => {
        component['canDraw'] = false;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseDown');
        component.onMouseDown(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseUp should call the current tool's #onMouseUp when receiving a mouse down event if canDrawflag is true ", () => {
        component['canDraw'] = true;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseUp');
        component.onMouseUp(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it('#onMouseUp is instance of line should not call enableUndoRedo from undoRedoService ', () => {
        component['canDraw'] = true;
        toolsServiceSpy.currentTool = new LineService(drawingStub, colorServiceStub, undoRedoServiceSpyObj);
        component.onMouseUp(mouseEventClick);
        expect(undoRedoServiceSpyObj.enableUndoRedo).not.toHaveBeenCalled();
    });

    it('#onMouseUp is instance of line should not call enableUndoRedo from undoRedoService ', () => {
        component['canDraw'] = true;
        toolsServiceSpy.currentTool = new RectangleSelectionService(
            drawingStub,
            new RectangleDrawingService(drawingStub, colorServiceStub, undoRedoServiceSpyObj),
            undoRedoServiceSpyObj,
            moveSelectionServiceSpyObj,
            resizeSelectionSpyObj,
        );
        component.onMouseUp(mouseEventClick);
        expect(undoRedoServiceSpyObj.enableUndoRedo).not.toHaveBeenCalled();
    });

    it("#onMouseUp should not call the current tool's #onMouseUp when receiving a mouse down event if canDrawflag is true ", () => {
        component['canDraw'] = false;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseUp');
        component.onMouseUp(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseOut should call the current tool's #onMouseOut when receiving a mouse out event", () => {
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseOut');
        component.onMouseOut(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it('#onKeyDown should call #onKeyDown of hotKeyService', () => {
        component.onKeyDown(keyBoardEvent);
        expect(hotKeyServiceSpy.onKeyDown).toHaveBeenCalled();
    });

    it("#onKeyUp should call tools service's #onKeyUp", () => {
        component.onKeyUp(keyBoardEvent);
        expect(toolsServiceSpy.onKeyUp).toHaveBeenCalled();
    });

    it("#onMouseEnter should call the current tool's #onMouseEnter when receiving a mouse enter event if canDrawflag is true", () => {
        component['canDraw'] = true;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseEnter');
        component.onMouseEnter(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseEnter should not call the current tool's #onMouseEnter when receiving a mouse enter event if canDrawflag is false", () => {
        component['canDraw'] = false;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseEnter');
        component.onMouseEnter(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it('#onMouseDown should call undoRedoService if it is not a selectionTool and is inside the canvas', () => {
        component['canDraw'] = true;
        spyOn<any>(component, 'isInsideCanvas').and.returnValue(true);
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseDown').and.stub();
        component.onMouseDown(mouseEventClick);
        expect(undoRedoServiceSpyObj.disableUndoRedo).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it('#onMouseDown should not call undoRedoService if it is a selectionTool', () => {
        component['canDraw'] = true;
        spyOn<any>(component, 'isInsideCanvas').and.returnValue(true);
        toolsServiceSpy.currentTool = new RectangleSelectionService(
            drawingStub,
            new RectangleDrawingService(drawingStub, colorServiceStub, undoRedoServiceSpyObj),
            undoRedoServiceSpyObj,
            moveSelectionServiceSpyObj,
            resizeSelectionSpyObj,
        );
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseDown').and.stub();
        component.onMouseDown(mouseEventClick);
        expect(undoRedoServiceSpyObj.disableUndoRedo).not.toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it('#onScroll should call #rotateStamp if the current tool is the stamp', () => {
        const wheelEvent = {} as WheelEvent;
        toolsServiceSpy.stampService = new StampService(drawingStub, undoRedoServiceSpyObj);
        toolsServiceSpy.currentTool = toolsServiceSpy.stampService;
        spyOn(toolsServiceSpy.stampService, 'rotateStamp');
        component.onScroll(wheelEvent);
        expect(toolsServiceSpy.stampService.rotateStamp).toHaveBeenCalledWith(wheelEvent);
    });

    it('#onScroll should not call #rotateStamp if the current tool is not the stamp', () => {
        const wheelEvent = {} as WheelEvent;
        toolsServiceSpy.stampService = new StampService(drawingStub, undoRedoServiceSpyObj);
        spyOn(toolsServiceSpy.stampService, 'rotateStamp');
        component.onScroll(wheelEvent);
        expect(toolsServiceSpy.stampService.rotateStamp).not.toHaveBeenCalledWith(wheelEvent);
    });

    it('#isInsideCanvas should return true if the mouse event click is inside the canvas', () => {
        drawingStub.canvas.width = MOUSE_POSITION_DEFAULT;
        drawingStub.canvas.height = MOUSE_POSITION_DEFAULT;
        component['isInsideCanvas'](mouseEventInsideCanvas);
        expect(component['isInsideCanvas'](mouseEventInsideCanvas)).toBeTrue();
    });
});
