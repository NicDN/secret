import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { By } from '@angular/platform-browser';
import { Color } from '@app/classes/color';
import { Shape, TraceType } from '@app/classes/shape';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { TraceTypeSelectorComponent } from './trace-type-selector.component';

describe('TraceTypeSelectorComponent', () => {
    let component: TraceTypeSelectorComponent;
    let fixture: ComponentFixture<TraceTypeSelectorComponent>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    const undoRedoServiceStub: UndoRedoService = {} as UndoRedoService;

    const shape: Shape = new RectangleDrawingService(new DrawingService({} as MatBottomSheet), new ColorService(), undoRedoServiceStub);

    const mainColorMock: Color = {
        rgbValue: 'main color',
    } as Color;

    const secondaryColorMock: Color = {
        rgbValue: 'secondary color',
    } as Color;

    beforeEach(async(() => {
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['']);
        TestBed.configureTestingModule({
            declarations: [TraceTypeSelectorComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [{ provide: ColorService, useValue: colorServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TraceTypeSelectorComponent);
        component = fixture.componentInstance;
        component.tool = shape;
        colorServiceSpy.mainColor = mainColorMock;
        colorServiceSpy.secondaryColor = secondaryColorMock;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('click from trace-type-button should toggle #setActiveTraceType', () => {
        spyOn(component, 'setActiveTraceType');
        const traceTypeButton = fixture.debugElement.query(By.css('.trace-type-button'));
        traceTypeButton.triggerEventHandler('click', null);
        expect(component.setActiveTraceType).toHaveBeenCalled();
    });

    it('#getColor should get the right color according to the toolTipContent provided', () => {
        expect(component.getColor('Contour')).toBe(colorServiceSpy.secondaryColor.rgbValue);
        expect(component.getColor('Plein')).toBe(colorServiceSpy.mainColor.rgbValue);
        expect(component.getColor('')).toBe('white');
    });

    it('#setActiveTraceType should set the active trace type correclty ', () => {
        const traceTypeExpected: TraceType = TraceType.Bordered;
        component.setActiveTraceType(traceTypeExpected);
        expect(component.tool.traceType).toBe(traceTypeExpected);
    });
});
