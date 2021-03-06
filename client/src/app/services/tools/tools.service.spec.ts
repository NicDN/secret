import { TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Tool } from '@app/classes/tool';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { Subject } from 'rxjs';
import { EllipseDrawingService } from './shape/ellipse/ellipse-drawing.service';
import { ToolsService } from './tools.service';
import { PencilService } from './trace-tool/pencil/pencil.service';

// tslint:disable: no-string-literal
// tslint:disable: no-any
describe('ToolsService', () => {
    let service: ToolsService;
    let pencilService: PencilService;
    let ellipseDrawingService: EllipseDrawingService;
    const keyboardEvent = new KeyboardEvent('test');
    let clearCanvasSpy: jasmine.Spy;

    const snackBarServiceStub = {} as SnackBarService;

    const toolStub = {} as Tool;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PencilService,
                EllipseDrawingService,
                { provide: SnackBarService, useValue: snackBarServiceStub },
                { provide: MatBottomSheet, useValue: {} },
            ],
        });
        service = TestBed.inject(ToolsService);
        pencilService = TestBed.inject(PencilService);
        ellipseDrawingService = TestBed.inject(EllipseDrawingService);

        service['drawingService'].previewCanvas = document.createElement('canvas');
        clearCanvasSpy = spyOn<any>(service['drawingService'], 'clearCanvas');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set initial current tool to pencil', () => {
        expect(service.currentTool).toBe(pencilService);
    });

    it('#setCurrentTool should update the provided current tool and call its subscribers', () => {
        spyOn(service['subject'], 'next');

        const cancelSelectionSpy = spyOn<any>(service, 'cancelSelectionOnToolChange');
        const registerTextCommandSpy = spyOn<any>(service, 'registerTextCommandOnToolChange');
        const removeLinePreviewSpy = spyOn<any>(service, 'removeLinePreview');
        const handleStampCurrentToolSpy = spyOn<any>(service, 'handleStampCurrentTool');
        const handleGridCurrentToolSpy = spyOn<any>(service, 'handleGridCurrentTool');

        service.setCurrentTool(ellipseDrawingService);
        expect(service.currentTool).toBe(ellipseDrawingService);
        expect(service['subject'].next).toHaveBeenCalled();
        expect(service['subject'].next).toHaveBeenCalledWith(ellipseDrawingService);

        expect(cancelSelectionSpy).toHaveBeenCalled();
        expect(registerTextCommandSpy).toHaveBeenCalled();
        expect(removeLinePreviewSpy).toHaveBeenCalled();
        expect(handleStampCurrentToolSpy).toHaveBeenCalled();
        expect(handleGridCurrentToolSpy).toHaveBeenCalled();
    });

    it('#getCurrentTool should return an observable subject', () => {
        const expectedSubject: Subject<Tool> = new Subject<Tool>();
        service['subject'] = expectedSubject;
        expect(service.getCurrentTool()).toEqual(expectedSubject.asObservable());
    });

    it("#onKeyDown should call the current tool's #onKeyDown", () => {
        spyOn(service.currentTool, 'onKeyDown');
        service.onKeyDown(keyboardEvent);
        expect(service.currentTool.onKeyDown).toHaveBeenCalled();
        expect(service.currentTool.onKeyDown).toHaveBeenCalledWith(keyboardEvent);
    });

    it("#onKeyUp should call the current tool's #onKeyUp", () => {
        spyOn(service.currentTool, 'onKeyUp');
        service.onKeyUp(keyboardEvent);
        expect(service.currentTool.onKeyUp).toHaveBeenCalled();
        expect(service.currentTool.onKeyUp).toHaveBeenCalledWith(keyboardEvent);
    });

    it('#registerTextCommandOnToolChange should not register text command if the current tool is not the text', () => {
        service.currentTool = service.pencilService;
        service.textService.isWriting = true;
        const registerTextCommandSpy = spyOn(service.textService, 'registerTextCommand');
        service['registerTextCommandOnToolChange']();
        expect(registerTextCommandSpy).not.toHaveBeenCalled();
    });

    it('#registerTextCommandOnToolChange should not register text command if the user is not writing text', () => {
        service.currentTool = service.textService;
        service.textService.isWriting = false;
        const registerTextCommandSpy = spyOn(service.textService, 'registerTextCommand');
        service['registerTextCommandOnToolChange']();
        expect(registerTextCommandSpy).not.toHaveBeenCalled();
    });

    it('#registerTextCommandOnToolChange should register text command if the user is writing text', () => {
        service.currentTool = service.textService;
        service.textService.isWriting = true;
        const registerTextCommandSpy = spyOn(service.textService, 'registerTextCommand');
        service['registerTextCommandOnToolChange']();
        expect(registerTextCommandSpy).toHaveBeenCalled();
    });

    it('#removeLinePreview should not remove the line preview if the current tool is not the line', () => {
        const clearPathSpy = spyOn(service.lineService, 'clearPath');
        const updatePreviewSpy = spyOn(service.lineService, 'updatePreview');
        service.currentTool = service.pencilService;
        service['removeLinePreview']();

        expect(clearPathSpy).not.toHaveBeenCalled();
        expect(updatePreviewSpy).not.toHaveBeenCalled();
    });

    it('#removeLinePreview should remove the line preview if the current tool is the line', () => {
        const clearPathSpy = spyOn(service.lineService, 'clearPath');
        const updatePreviewSpy = spyOn(service.lineService, 'updatePreview');
        service.currentTool = service.lineService;
        service['removeLinePreview']();

        expect(clearPathSpy).toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('#handleStampCurrentTool should set isStamp to false if the current tool is not the stamp', () => {
        service.currentTool = service.pencilService;
        service['drawingService'].isStamp = true;
        service['handleStampCurrentTool']();
        expect(service['drawingService'].isStamp).toBeFalse();
    });

    it('#handleStampCurrentTool should set isStamp to true if the current tool is the stamp', () => {
        service.currentTool = service.stampService;
        service['drawingService'].isStamp = false;
        service['handleStampCurrentTool']();
        expect(service['drawingService'].isStamp).toBeTrue();
    });

    it('#handleGridCurrentTool should not draw the grid if the current tool is not the grid', () => {
        service.currentTool = service.pencilService;
        const drawGridSpy = spyOn(service.gridService, 'drawGrid');
        service['handleGridCurrentTool']();
        expect(drawGridSpy).not.toHaveBeenCalled();
    });

    it('#handleGridCurrentTool should  draw the grid if the current tool is the grid', () => {
        service.currentTool = service.gridService;
        const drawGridSpy = spyOn(service.gridService, 'drawGrid');
        service['handleGridCurrentTool']();
        expect(drawGridSpy).toHaveBeenCalled();
    });

    it('#cancelSelectionOnToolChange should not cancel any selection if #preventCancelSelectionIfUsingGrid returns true ', () => {
        spyOn<any>(service, 'preventCancelSelectionIfUsingGrid').and.returnValue(true);

        const ellipseCancelSelectionSpy = spyOn(service.ellipseSelectionService, 'cancelSelection');
        const rectangleCancelSelectionSpy = spyOn(service.rectangleSelectionService, 'cancelSelection');
        const lassoCancelSelectionSpy = spyOn(service.lassoSelectionService, 'cancelSelection');

        service['cancelSelectionOnToolChange'](toolStub);

        expect(ellipseCancelSelectionSpy).not.toHaveBeenCalled();
        expect(rectangleCancelSelectionSpy).not.toHaveBeenCalled();
        expect(lassoCancelSelectionSpy).not.toHaveBeenCalled();
    });

    it('#cancelSelectionOnToolChange should cancel the selection of ellipse if it is the current tool ', () => {
        const ellipseCancelSelectionSpy = spyOn(service.ellipseSelectionService, 'cancelSelection');
        service.currentTool = service.ellipseSelectionService;
        service['cancelSelectionOnToolChange'](toolStub);
        expect(ellipseCancelSelectionSpy).toHaveBeenCalled();
    });

    it('#cancelSelectionOnToolChange should cancel the selection of rectangle if it is the current tool ', () => {
        const rectangleCancelSelectionSpy = spyOn(service.rectangleSelectionService, 'cancelSelection');
        service.currentTool = service.rectangleSelectionService;
        service['cancelSelectionOnToolChange'](toolStub);
        expect(rectangleCancelSelectionSpy).toHaveBeenCalled();
    });

    it('#cancelSelectionOnToolChange should cancel the selection of lasso if it is the current tool ', () => {
        const lassoCancelSelectionSpy = spyOn(service.lassoSelectionService, 'cancelSelection');
        service.currentTool = service.lassoSelectionService;
        service['cancelSelectionOnToolChange'](toolStub);
        expect(lassoCancelSelectionSpy).toHaveBeenCalled();
    });

    it('#handleSelectionCurrentTool should set selectedSelectionService if the current tool is a SelectionTool ', () => {
        service['handleSelectionCurrentTool'](service.ellipseSelectionService);
        expect(service.selectedSelectionService).toEqual(service.ellipseSelectionService);
    });

    it('#handleSelectionCurrentTool should not set selectedSelectionService if the current tool is not a SelectionTool ', () => {
        service['handleSelectionCurrentTool'](service.pencilService);
        expect(service.selectedSelectionService).not.toEqual(service.pencilService);
    });

    it('#preventCancelSelectionIfUsingGrid should return true if the incoming tool is the grid and the current tool is a selection tool', () => {
        service.currentTool = service.ellipseSelectionService;
        expect(service['preventCancelSelectionIfUsingGrid'](service.gridService)).toBeTrue();
    });

    it('#preventCancelSelectionIfUsingGrid should return false if the incoming tool is not the grid and the current tool is a selection tool', () => {
        service.currentTool = service.ellipseSelectionService;
        const incomingTool = service.pencilService;
        expect(service['preventCancelSelectionIfUsingGrid'](incomingTool)).toBeFalse();
    });

    it('#preventCancelSelectionIfUsingGrid should return false if the incoming tool is the grid and the current tool is not a selection tool', () => {
        service.currentTool = service.pencilService;
        const incomingTool = service.gridService;
        expect(service['preventCancelSelectionIfUsingGrid'](incomingTool)).toBeFalse();
    });

    it('#preventCancelSelectionIfUsingGrid should return false if incoming tool is not the grid and the current tool is not a selection tool', () => {
        service.currentTool = service.pencilService;
        const incomingTool = service.lineService;
        expect(service['preventCancelSelectionIfUsingGrid'](incomingTool)).toBeFalse();
    });

    it('#clearPreview should not clear the preview  if the preview canvas is undefined', () => {
        // tslint:disable-next-line: prefer-const
        let undefinedCustom: any;
        service['drawingService'].previewCanvas = undefinedCustom;
        service['clearPreview']({} as Tool);
        expect(clearCanvasSpy).not.toHaveBeenCalled();
    });

    it('#clearPreview should not clear the preview if current tool is a selection tool', () => {
        service.currentTool = service.rectangleSelectionService;
        service['clearPreview'](service.rectangleDrawingService);
        expect(clearCanvasSpy).not.toHaveBeenCalled();
    });

    it('#clearPreview should not clear the preview if current tool is instance of gridService and tool is instance of SelectionTool', () => {
        service.currentTool = service.gridService;
        service['clearPreview'](service.rectangleSelectionService);
        expect(clearCanvasSpy).not.toHaveBeenCalled();
    });

    it('#clearPreview should clear the preview correctly', () => {
        service.currentTool = service.pencilService;
        service['clearPreview'](service.rectangleDrawingService);
        expect(clearCanvasSpy).toHaveBeenCalled();
    });
});
