import { TestBed } from '@angular/core/testing';
import { BoxSize } from '@app/classes/box-size';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetSelectionService } from '@app/services/tools/selection/magnet/magnet-selection.service';
import { of } from 'rxjs';
import { MoveSelectionService, SelectedPoint } from './move-selection.service';

// tslint:disable: no-any
// tslint:disable: no-string-literal
describe('MoveSelectionService', () => {
    let service: MoveSelectionService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let magnetServiceSpyObj: jasmine.SpyObj<MagnetSelectionService>;

    let selectionCoordsStub: SelectionCoords;
    let selectionWidth: number;
    let selectionHeight: number;
    const positionToMagnetize = { x: 60, y: 40 };
    let deltaStub: Vec2;

    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const MOUSE_OFFSET = 5;
    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 40 };
    const boxSizeStub: BoxSize = { widthBox: 100, heightBox: 100 };
    const deltaX = 60;
    const deltaY = 60;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'newIncomingResizeSignals', 'newGridSignals']);
        magnetServiceSpyObj = jasmine.createSpyObj('MagnetSelectionService', [
            'getMagnetizedOffsetPosition',
            'topLeft',
            'topMid',
            'topRight',
            'midLeft',
            'magCenter',
            'midRight',
            'botLeft',
            'botMid',
            'botRight',
        ]);
        // tslint:disable-next-line: prefer-const
        let emptyMessage: any;
        drawingServiceSpyObj.newGridSignals.and.returnValue(of(emptyMessage));
        drawingServiceSpyObj.newIncomingResizeSignals.and.returnValue(of(boxSizeStub));
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: MagnetSelectionService, useValue: magnetServiceSpyObj },
            ],
        });

        selectionCoordsStub = {
            initialTopLeft: TOP_LEFT_CORNER_COORDS,
            initialBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
            finalTopLeft: TOP_LEFT_CORNER_COORDS,
            finalBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
        };

        selectionWidth = BOTTOM_RIGHT_CORNER_COORDS.x - TOP_LEFT_CORNER_COORDS.x;
        selectionHeight = BOTTOM_RIGHT_CORNER_COORDS.y - TOP_LEFT_CORNER_COORDS.y;

        deltaStub = { x: deltaX, y: deltaY };

        service = TestBed.inject(MoveSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#calculateDelta should calculate by how much the selection should move based on every arrow key condition', () => {
        service['keyDownIsPressed'] = true;
        service['keyLeftIsPressed'] = true;
        const calculatedDelta = service.calculateDelta();
        expect(calculatedDelta).toEqual({ x: -service['ARROW_MOVE_DELTA'], y: service['ARROW_MOVE_DELTA'] });
    });

    it('#calculateDelta should calculate by how much the selection should move based on every arrow key condition', () => {
        service['keyUpIsPressed'] = true;
        service['keyRightIsPressed'] = true;
        const calculatedDelta = service.calculateDelta();
        expect(calculatedDelta).toEqual({ x: service['ARROW_MOVE_DELTA'], y: -service['ARROW_MOVE_DELTA'] });
    });

    it('#calculateDelta should return 0,0 if everykey is pressed', () => {
        service['keyDownIsPressed'] = true;
        service['keyLeftIsPressed'] = true;
        service['keyRightIsPressed'] = true;
        service['keyUpIsPressed'] = true;
        const calculatedDelta = service.calculateDelta();
        expect(calculatedDelta).toEqual({ x: 0, y: 0 });
    });

    it('#checkIfAnyArrowIsPressed should return true if any of the arrow press booleans are true', () => {
        service['keyUpIsPressed'] = true;
        const anyArrowPressed = service.checkIfAnyArrowIsPressed();
        expect(anyArrowPressed).toBeTrue();
    });

    it('#checkIfAnyArrowIsPressed should return true if any of the arrow press booleans are true', () => {
        service['keyDownIsPressed'] = true;
        const anyArrowPressed = service.checkIfAnyArrowIsPressed();
        expect(anyArrowPressed).toBeTrue();
    });

    it('#checkIfAnyArrowIsPressed should return true if any of the arrow press booleans are true', () => {
        service['keyLeftIsPressed'] = true;
        const anyArrowPressed = service.checkIfAnyArrowIsPressed();
        expect(anyArrowPressed).toBeTrue();
    });

    it('#checkIfAnyArrowIsPressed should return true if any of the arrow press booleans are true', () => {
        service['keyRightIsPressed'] = true;
        const anyArrowPressed = service.checkIfAnyArrowIsPressed();
        expect(anyArrowPressed).toBeTrue();
    });

    it('#updateArrowKeysPressed should change the arrow press boolean related to the KeyboardEvent to true, and not affect the others, when applicable', () => {
        service['keyDownIsPressed'] = false;
        service['keyUpIsPressed'] = true;
        service['keyLeftIsPressed'] = false;
        service['keyRightIsPressed'] = true;
        const arrowEvent = { code: 'ArrowLeft' } as KeyboardEvent;

        service.updateArrowKeysPressed(arrowEvent, true);

        expect(service['keyDownIsPressed']).toBeFalse();
        expect(service['keyUpIsPressed']).toBeTrue();
        expect(service['keyLeftIsPressed']).toBeTrue();
        expect(service['keyRightIsPressed']).toBeTrue();
    });

    it('#updateArrowKeysPressed should change every arrowPress boolean to the given parameter if all keys are pressed in sucession', () => {
        service['keyDownIsPressed'] = false;
        service['keyUpIsPressed'] = false;
        service['keyLeftIsPressed'] = false;
        service['keyRightIsPressed'] = false;

        service.updateArrowKeysPressed({ code: 'ArrowLeft' } as KeyboardEvent, true);
        service.updateArrowKeysPressed({ code: 'ArrowUp' } as KeyboardEvent, true);
        service.updateArrowKeysPressed({ code: 'ArrowDown' } as KeyboardEvent, true);
        service.updateArrowKeysPressed({ code: 'ArrowRight' } as KeyboardEvent, true);

        expect(service['keyDownIsPressed']).toBeTrue();
        expect(service['keyUpIsPressed']).toBeTrue();
        expect(service['keyLeftIsPressed']).toBeTrue();
        expect(service['keyRightIsPressed']).toBeTrue();
    });

    it('#updateArrowKeysPressed should change the arrow press boolean related to the KeyboardEvent to false, and not affect the others, when applicable', () => {
        service['keyDownIsPressed'] = false;
        service['keyUpIsPressed'] = true;
        service['keyLeftIsPressed'] = false;
        service['keyRightIsPressed'] = true;
        const arrowEvent = { code: 'ArrowUp' } as KeyboardEvent;

        service.updateArrowKeysPressed(arrowEvent, false);

        expect(service['keyDownIsPressed']).toBeFalse();
        expect(service['keyUpIsPressed']).toBeFalse();
        expect(service['keyLeftIsPressed']).toBeFalse();
        expect(service['keyRightIsPressed']).toBeTrue();
    });

    it('#moveSelectionWithArrows should move the selection coordinates by the given delta and redraw selection at the new position', () => {
        service.isUsingMagnet = false;
        selectionCoordsStub.finalTopLeft = { x: TOP_LEFT_CORNER_COORDS.x, y: TOP_LEFT_CORNER_COORDS.y };
        selectionCoordsStub.finalBottomRight = { x: BOTTOM_RIGHT_CORNER_COORDS.x, y: BOTTOM_RIGHT_CORNER_COORDS.y };

        service.moveSelectionWithArrows(
            {
                x: service['ARROW_MOVE_DELTA'],
                y: service['ARROW_MOVE_DELTA'],
            },
            selectionCoordsStub,
        );
        expect(selectionCoordsStub.finalTopLeft).toEqual({
            x: TOP_LEFT_CORNER_COORDS.x + service['ARROW_MOVE_DELTA'],
            y: TOP_LEFT_CORNER_COORDS.y + service['ARROW_MOVE_DELTA'],
        });
        expect(selectionCoordsStub.finalBottomRight).toEqual({
            x: BOTTOM_RIGHT_CORNER_COORDS.x + service['ARROW_MOVE_DELTA'],
            y: BOTTOM_RIGHT_CORNER_COORDS.y + service['ARROW_MOVE_DELTA'],
        });
    });

    it('#moveSelectionWithArrows should call alignToProperMagnetPosition if usingMagnet is true', () => {
        service.isUsingMagnet = true;
        selectionCoordsStub.finalBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        selectionCoordsStub.finalTopLeft = TOP_LEFT_CORNER_COORDS;
        const alignSpy = spyOn<any>(service, 'alignToProperMagnetPosition');
        service.moveSelectionWithArrows(MOUSE_POSITION, selectionCoordsStub);
        expect(alignSpy).toHaveBeenCalled();
    });

    it('#moveSelectionWithMouse should call alignToProperMagnetPosition if usingMagnet is true', () => {
        service.isUsingMagnet = true;
        const alignSpy = spyOn<any>(service, 'alignToProperMagnetPosition');
        service.moveSelectionWithMouse(MOUSE_POSITION, selectionCoordsStub);
        expect(alignSpy).toHaveBeenCalled();
    });

    it('#moveSelectionWithMouse should move the selection coordinates to the given position minus the mouseOffset', () => {
        service.isUsingMagnet = false;
        selectionCoordsStub.initialTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionCoordsStub.initialBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        selectionCoordsStub.finalTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionCoordsStub.finalBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        service.mouseMoveOffset = { x: MOUSE_OFFSET, y: MOUSE_OFFSET };

        service.moveSelectionWithMouse(MOUSE_POSITION, selectionCoordsStub);
        expect(selectionCoordsStub.finalTopLeft).toEqual({
            x: MOUSE_POSITION.x - MOUSE_OFFSET,
            y: MOUSE_POSITION.y - MOUSE_OFFSET,
        });
        expect(selectionCoordsStub.finalBottomRight).toEqual({
            x: MOUSE_POSITION.x - MOUSE_OFFSET + selectionWidth,
            y: MOUSE_POSITION.y - MOUSE_OFFSET + selectionHeight,
        });
    });

    it('#alignToProperMagnetPosition should keep values of  deltaX and deltaY if they are negative  ', () => {
        const negativeDelta = -20;
        deltaStub = { x: negativeDelta, y: negativeDelta };
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(deltaStub.x).toEqual(negativeDelta);
        expect(deltaStub.y).toEqual(negativeDelta);
    });

    it('#alignToProperMagnetPosition should keep the values of deltaX and deltaY if they equal 0  ', () => {
        deltaStub = { x: 0, y: 0 };
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(deltaStub.x).toEqual(0);
        expect(deltaStub.y).toEqual(0);
    });

    it('#alignToProperMagnetPosition should call topLeft if the selected point is top left', () => {
        magnetServiceSpyObj.pointToMagnetize = SelectedPoint.TOP_LEFT;
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magnetServiceSpyObj.topLeft).toHaveBeenCalled();
    });

    it('#alignToProperMagnetPosition should call topMid if the selected point is top middle', () => {
        magnetServiceSpyObj.pointToMagnetize = SelectedPoint.TOP_MIDDLE;
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magnetServiceSpyObj.topMid).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call topRight if the selected point is top right', () => {
        magnetServiceSpyObj.pointToMagnetize = SelectedPoint.TOP_RIGHT;
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magnetServiceSpyObj.topRight).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call midLeft if the selected point is middle left', () => {
        magnetServiceSpyObj.pointToMagnetize = SelectedPoint.MIDDLE_LEFT;
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magnetServiceSpyObj.midLeft).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call magCenter if the selected point is center', () => {
        magnetServiceSpyObj.pointToMagnetize = SelectedPoint.CENTER;
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magnetServiceSpyObj.magCenter).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call midRight if the selected point is middle right', () => {
        magnetServiceSpyObj.pointToMagnetize = SelectedPoint.MIDDLE_RIGHT;
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magnetServiceSpyObj.midRight).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call botLeft if the selected point is bottom left', () => {
        magnetServiceSpyObj.pointToMagnetize = SelectedPoint.BOTTOM_LEFT;
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magnetServiceSpyObj.botLeft).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call botMid if the selected point is bottom middle', () => {
        magnetServiceSpyObj.pointToMagnetize = SelectedPoint.BOTTOM_MIDDLE;
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magnetServiceSpyObj.botMid).toHaveBeenCalled();
    });

    it('#alignToProperMagnetMousePosition should call botRight if the selected point is bottom right', () => {
        magnetServiceSpyObj.pointToMagnetize = SelectedPoint.BOTTOM_RIGHT;
        service['alignToProperMagnetPosition'](positionToMagnetize, selectionCoordsStub, deltaStub);
        expect(magnetServiceSpyObj.botRight).toHaveBeenCalled();
    });
});
