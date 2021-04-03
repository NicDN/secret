import { TestBed } from '@angular/core/testing';
import { Tool } from '@app/classes/tool';
// import { DrawingService } from '@app/services/drawing/drawing.service';
import { Subject } from 'rxjs';
import { EllipseDrawingService } from './shape/ellipse/ellipse-drawing.service';
import { ToolsService } from './tools.service';
import { PencilService } from './trace-tool/pencil/pencil.service';

// tslint:disable: no-string-literal
describe('ToolsService', () => {
    let service: ToolsService;
    let pencilService: PencilService;
    let ellipseDrawingService: EllipseDrawingService;
    const keyboardEvent = new KeyboardEvent('test');
    // let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        // drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['newBaseLineSignals'], {
        //     isStamp: false,
        // });
        TestBed.configureTestingModule({
            providers: [PencilService, EllipseDrawingService],
        });
        service = TestBed.inject(ToolsService);
        pencilService = TestBed.inject(PencilService);
        ellipseDrawingService = TestBed.inject(EllipseDrawingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set initial current tool to pencil', () => {
        expect(service.currentTool).toBe(pencilService);
    });

    it('#setCurrentTool should update the provided current tool and call its subscribers', () => {
        spyOn(service['subject'], 'next');
        spyOn(service.lineService, 'clearPath');
        spyOn(service.lineService, 'updatePreview');
        service.setCurrentTool(ellipseDrawingService);
        expect(service.currentTool).toBe(ellipseDrawingService);
        expect(service['subject'].next).toHaveBeenCalled();
        expect(service['subject'].next).toHaveBeenCalledWith(ellipseDrawingService);
        expect(service.lineService.clearPath).not.toHaveBeenCalledWith();
        expect(service.lineService.updatePreview).not.toHaveBeenCalledWith();
    });

    it('#setCurrentTool should update the provided current tool and call its subscribers and reset lineService', () => {
        service.currentTool = service.lineService;
        spyOn(service['subject'], 'next');
        spyOn(service.lineService, 'clearPath');
        spyOn(service.lineService, 'updatePreview');
        service.setCurrentTool(ellipseDrawingService);
        expect(service.currentTool).toBe(ellipseDrawingService);
        expect(service['subject'].next).toHaveBeenCalled();
        expect(service['subject'].next).toHaveBeenCalledWith(ellipseDrawingService);
        expect(service.lineService.clearPath).toHaveBeenCalledWith();
        expect(service.lineService.updatePreview).toHaveBeenCalledWith();
    });

    it('#setCurrentTool should set the isStamp attribute of drawingService to true if the current tool is the stamp ', () => {
        service.setCurrentTool(service.stampService);
        expect(service['drawingService'].isStamp).toBeTrue();
    });

    it('#setCurrentTool should set the isStamp attribute of drawingService to false if the current tool is not the stamp ', () => {
        service.setCurrentTool(service.pencilService);
        expect(service['drawingService'].isStamp).toBeFalse();
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
});
