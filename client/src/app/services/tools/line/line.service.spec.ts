// tslint:disable: no-string-literal
// tslint:disable: max-file-line-count

import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MouseButton } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { LineService } from './line.service';

describe('LineService', () => {
    let service: LineService;
    let keyboardEvent: KeyboardEvent;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;

    let updatePreviewSpy: jasmine.Spy;
    let calculateAngleSpy: jasmine.Spy;
    let lockLineSpy: jasmine.Spy;
    let clearPathSpy: jasmine.Spy;
    let removePointSpy: jasmine.Spy;

    const DEFAULT_MOUSE_POSITION = { x: 45, y: 55 };
    const EXPECTED_NUMBER_OF_CALLS = 4;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LineService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        updatePreviewSpy = spyOn(service, 'updatePreview').and.stub();
        calculateAngleSpy = spyOn(service, 'calculateAngle').and.stub();
        lockLineSpy = spyOn(service, 'lockLine').and.stub();
        clearPathSpy = spyOn(service, 'clearPath').and.stub();
        removePointSpy = spyOn(service, 'removePoint').and.stub();

        service.mousePosition = DEFAULT_MOUSE_POSITION;
        service.pathData = [
            { x: 10, y: 10 },
            { x: 10, y: 15 },
            { x: 15, y: 10 },
            { x: 5, y: 5 },
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#onMouseDown should set mouseDown when Left is pressed', () => {
        const EXPECTED_MOUSE_DOWN = true;
        mouseEvent = { button: MouseButton.Left } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(EXPECTED_MOUSE_DOWN);
    });

    it('#onMouseDown shouldnt set mouseDown when Left isnt pressed', () => {
        const EXPECTED_MOUSE_DOWN = false;
        mouseEvent = { button: MouseButton.Right } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(EXPECTED_MOUSE_DOWN);
    });

    it('#onMouseUp should return if Left isnt pressed', () => {
        service.mouseDown = false;
        service.canDoubleClick = false;
        mouseEvent = {} as MouseEvent;
        spyOn(service, 'addPoint');
        spyOn(service, 'finishLine');

        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toBeFalse();
        expect(service.canDoubleClick).toBeFalse();
        expect(service.addPoint).not.toHaveBeenCalled();
        expect(service.finishLine).not.toHaveBeenCalled();
    });

    it('#onMouseUp should add a point with a simple left click', () => {
        mouseEvent = {} as MouseEvent;
        service.mouseDown = true;
        service.canDoubleClick = false;
        spyOn(service, 'addPoint');
        spyOn(service, 'finishLine');

        service.onMouseUp(mouseEvent);
        expect(service.canDoubleClick).toBeTrue();
        expect(service.mouseDown).toBeFalse();
        expect(service.addPoint).toHaveBeenCalled();
        expect(service.finishLine).not.toHaveBeenCalled();
    });

    it('#onMouseUp should finish the line with a double left click and a line to draw', () => {
        service.mouseDown = true;
        service.canDoubleClick = true;
        mouseEvent = {} as MouseEvent;
        spyOn(service, 'addPoint');
        spyOn(service, 'finishLine');

        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toBeFalse();
        expect(service.canDoubleClick).toBeTrue();
        expect(service.addPoint).not.toHaveBeenCalled();
        expect(service.finishLine).toHaveBeenCalled();
    });

    it('#onMouseUp should call nothing with a double left click if theres no line', () => {
        mouseEvent = { button: MouseButton.Left } as MouseEvent;
        service.pathData = [];
        service.mouseDown = true;
        service.canDoubleClick = true;
        spyOn(service, 'finishLine');
        spyOn(service, 'addPoint');

        service.onMouseUp(mouseEvent);
        expect(service.finishLine).not.toHaveBeenCalled();
        expect(service.addPoint).not.toHaveBeenCalled();
    });

    it('#onMouseMove should lock the line when shift is pressed', () => {
        service.isShiftDown = true;
        mouseEvent = {} as MouseEvent;
        spyOn(service, 'getPositionFromMouse').and.returnValue(DEFAULT_MOUSE_POSITION);

        service.onMouseMove(mouseEvent);
        expect(service.mousePosition).toEqual(DEFAULT_MOUSE_POSITION);
        expect(service.pathData[service.pathData.length - 1]).toEqual(DEFAULT_MOUSE_POSITION);
        expect(lockLineSpy).toHaveBeenCalled();
        expect(updatePreviewSpy).not.toHaveBeenCalled();
    });

    it('#onMouseMove should lock the line when shift is pressed', () => {
        service.isShiftDown = false;
        mouseEvent = {} as MouseEvent;
        spyOn(service, 'getPositionFromMouse').and.returnValue(DEFAULT_MOUSE_POSITION);

        service.onMouseMove(mouseEvent);
        expect(service.mousePosition).toEqual(DEFAULT_MOUSE_POSITION);
        expect(service.pathData[service.pathData.length - 1]).toEqual(DEFAULT_MOUSE_POSITION);
        expect(lockLineSpy).not.toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('#onKeyDown should clear the path when Escape is pressed', () => {
        keyboardEvent = { code: 'Escape' } as KeyboardEvent;
        service.isShiftDown = false;

        service.onKeyDown(keyboardEvent);
        expect(service.isShiftDown).toBeFalse();
        expect(clearPathSpy).toHaveBeenCalled();
        expect(removePointSpy).not.toHaveBeenCalled();
        expect(lockLineSpy).not.toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('#onKeyDown should remove a point when Backspace is pressed', () => {
        keyboardEvent = { code: 'Backspace' } as KeyboardEvent;
        service.isShiftDown = false;

        service.onKeyDown(keyboardEvent);
        expect(service.isShiftDown).toBeFalse();
        expect(clearPathSpy).not.toHaveBeenCalled();
        expect(removePointSpy).toHaveBeenCalled();
        expect(lockLineSpy).not.toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('#onKeyDown should lock the line when ShiftRight is pressed', () => {
        keyboardEvent = { code: 'ShiftRight' } as KeyboardEvent;
        service.isShiftDown = false;

        service.onKeyDown(keyboardEvent);
        expect(service.isShiftDown).toBeTrue();
        expect(clearPathSpy).not.toHaveBeenCalled();
        expect(removePointSpy).not.toHaveBeenCalled();
        expect(lockLineSpy).toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('#onKeyDown should lock the line when ShiftLeft is pressed', () => {
        keyboardEvent = { code: 'ShiftLeft' } as KeyboardEvent;
        service.isShiftDown = false;

        service.onKeyDown(keyboardEvent);
        expect(service.isShiftDown).toBeTrue();
        expect(clearPathSpy).not.toHaveBeenCalled();
        expect(removePointSpy).not.toHaveBeenCalled();
        expect(lockLineSpy).toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('#onKeyDown should just update the preview when nothing is pressed', () => {
        keyboardEvent = {} as KeyboardEvent;
        service.isShiftDown = false;

        service.onKeyDown(keyboardEvent);
        expect(service.isShiftDown).toBeFalse();
        expect(clearPathSpy).not.toHaveBeenCalled();
        expect(removePointSpy).not.toHaveBeenCalled();
        expect(lockLineSpy).not.toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('#onKeyUp should replace the preview when ShiftLeft is pressed', () => {
        service.isShiftDown = true;
        keyboardEvent = { code: 'ShiftLeft' } as KeyboardEvent;

        service.onKeyUp(keyboardEvent);
        expect(service.isShiftDown).toBeFalse();
        expect(service.pathData[service.pathData.length - 1]).toEqual(DEFAULT_MOUSE_POSITION);
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('#onKeyUp should replace the preview when ShiftRight is pressed', () => {
        service.isShiftDown = true;
        keyboardEvent = { code: 'ShiftRight' } as KeyboardEvent;

        service.onKeyUp(keyboardEvent);
        expect(service.isShiftDown).toBeFalse();
        expect(service.pathData[service.pathData.length - 1]).toEqual(DEFAULT_MOUSE_POSITION);
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('#onKeyUp shouldnt replace the preview when nothing is pressed', () => {
        service.isShiftDown = true;
        keyboardEvent = {} as KeyboardEvent;

        service.onKeyUp(keyboardEvent);
        expect(service.isShiftDown).toBeTrue();
        expect(service.pathData[service.pathData.length - 1]).not.toEqual(DEFAULT_MOUSE_POSITION);
        expect(updatePreviewSpy).not.toHaveBeenCalled();
    });

    it('#addPoint should add a point in pathData', () => {
        service.addPoint();
        expect(service.pathData[service.pathData.length - 1]).toEqual(DEFAULT_MOUSE_POSITION);
    });

    it('#removePoint should remove a point', () => {
        const EXPECTED_LENGTH = 3;
        removePointSpy.and.callThrough();

        service.removePoint();
        expect(service.pathData.length).toEqual(EXPECTED_LENGTH);
    });

    it('#removePoint shouldnt remove a point if there are not enough', () => {
        service.pathData = [{ x: 5, y: 5 }];
        removePointSpy.and.callThrough();

        service.removePoint();
        expect(service.pathData.length).toEqual(1);
    });

    it('#finishLine shouldnt change the last point if it isnt near the first', () => {
        const EXPECTED_LAST_POINT: Vec2 = { x: 5, y: 5 };
        spyOn(service, 'drawLine').and.stub();

        service.finishLine();
        expect(service.pathData[service.pathData.length - 1]).toEqual(EXPECTED_LAST_POINT);
        expect(service.drawLine).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('#finishLine should change the last point if it is near the first', () => {
        const EXPECTED_LAST_POINT: Vec2 = { x: 10, y: 10 };
        service.mousePosition = { x: 20, y: 20 };
        spyOn(service, 'drawLine');

        service.finishLine();
        expect(service.pathData[service.pathData.length - 1]).toEqual(EXPECTED_LAST_POINT);
        expect(service.drawLine).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('#updatePreview should update the previews', () => {
        spyOn(service['drawingService'], 'clearCanvas').and.stub();
        spyOn(service, 'drawLine').and.stub();
        updatePreviewSpy.and.callThrough();

        service.updatePreview();
        expect(service['drawingService'].clearCanvas).toHaveBeenCalled();
        expect(service.drawLine).toHaveBeenCalled();
    });

    it('#calculateAngle should return the angle in degrees', () => {
        const EXPECTED_ANGLE = 225;
        const lastSelectedPoint = { x: 55, y: 65 };
        calculateAngleSpy.and.callThrough();

        expect(service.calculateAngle(lastSelectedPoint)).toEqual(EXPECTED_ANGLE);
    });

    it('#calculateAngle should keep the angle in degrees above 0', () => {
        const lastSelectedPoint = { x: 55, y: 10 };
        calculateAngleSpy.and.callThrough();
        expect(service.calculateAngle(lastSelectedPoint) > 0).toBeTrue();
    });

    it('#drawLine should not draw anything if theres no point in the path', () => {
        service.pathData = [];
        spyOn(baseCtxStub, 'beginPath');
        spyOn(baseCtxStub, 'lineTo');
        spyOn(baseCtxStub, 'fill');

        service.drawLine(baseCtxStub, service.pathData);
        expect(baseCtxStub.beginPath).toHaveBeenCalled();
        expect(baseCtxStub.lineTo).not.toHaveBeenCalled();
        expect(baseCtxStub.fill).not.toHaveBeenCalled();
    });

    it('#drawLine should not draw junctions if drawWithJunction isnt set', () => {
        spyOn(baseCtxStub, 'beginPath');
        spyOn(baseCtxStub, 'lineTo');
        spyOn(baseCtxStub, 'fill');

        service.drawLine(baseCtxStub, service.pathData);
        expect(baseCtxStub.beginPath).toHaveBeenCalled();
        expect(baseCtxStub.lineTo).toHaveBeenCalledTimes(EXPECTED_NUMBER_OF_CALLS);
        expect(baseCtxStub.fill).not.toHaveBeenCalled();
    });

    it('#drawLine should draw junctions if drawWithJunction is set', () => {
        service.drawWithJunction = true;
        spyOn(baseCtxStub, 'beginPath');
        spyOn(baseCtxStub, 'lineTo');
        spyOn(baseCtxStub, 'fill');

        service.drawLine(baseCtxStub, service.pathData);
        expect(baseCtxStub.beginPath).toHaveBeenCalled();
        expect(baseCtxStub.lineTo).toHaveBeenCalledTimes(EXPECTED_NUMBER_OF_CALLS);
        expect(baseCtxStub.fill).toHaveBeenCalledTimes(EXPECTED_NUMBER_OF_CALLS);
    });

    it('#lockLine should lock the line near the x axis', () => {
        const EXPECTED_Y_POSITION = 55;
        const DEFAULT_ANGLE = 3;
        calculateAngleSpy.and.returnValue(DEFAULT_ANGLE);
        lockLineSpy.and.callThrough();

        service.lockLine();
        expect(service.pathData[service.pathData.length - 1].y).toEqual(EXPECTED_Y_POSITION);
    });

    it('#lockLine should lock the line near the y axis', () => {
        const EXPECTED_X_POSITION = 45;
        const DEFAULT_ANGLE = 87;
        calculateAngleSpy.and.returnValue(DEFAULT_ANGLE);
        lockLineSpy.and.callThrough();

        service.lockLine();
        expect(service.pathData[service.pathData.length - 1].x).toEqual(EXPECTED_X_POSITION);
    });

    it('#lockLine should lock the line near the first diagonal', () => {
        const EXPECTED_Y_POSITION = 40;
        const DEFAULT_ANGLE = 47;
        calculateAngleSpy.and.returnValue(DEFAULT_ANGLE);
        lockLineSpy.and.callThrough();

        service.lockLine();
        expect(service.pathData[service.pathData.length - 1].y).toEqual(EXPECTED_Y_POSITION);
    });

    it('#lockLine should lock the line near the second diagonal', () => {
        const EXPECTED_Y_POSITION = -20;
        const DEFAULT_ANGLE = 133;
        calculateAngleSpy.and.returnValue(DEFAULT_ANGLE);
        lockLineSpy.and.callThrough();

        service.lockLine();
        expect(service.pathData[service.pathData.length - 1].y).toEqual(EXPECTED_Y_POSITION);
    });

    it('#clearPath should clear pathData', () => {
        clearPathSpy.and.callThrough();
        service.clearPath();
        expect(service.pathData).toEqual([]);
    });
});