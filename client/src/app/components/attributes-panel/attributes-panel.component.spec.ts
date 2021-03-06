import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DrawingTool } from '@app/classes/drawing-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { FillDripService } from '@app/services/tools/fill-drip/fill-drip.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { LineService } from '@app/services/tools/trace-tool/line/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { AttributesPanelComponent } from './attributes-panel.component';

// tslint:disable: no-string-literal
describe('AttributesPanelComponent', () => {
    let component: AttributesPanelComponent;
    let fixture: ComponentFixture<AttributesPanelComponent>;
    const undoRedoServiceStub: UndoRedoService = {} as UndoRedoService;

    let toolsService: ToolsService;

    const drawingTool: DrawingTool = new DrawingTool(new DrawingService({} as MatBottomSheet), new ColorService(), 'tool');
    const polygonService: PolygonService = new PolygonService(new DrawingService({} as MatBottomSheet), new ColorService(), undoRedoServiceStub);
    const snackBarServiceStub = {} as SnackBarService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AttributesPanelComponent],
            providers: [ToolsService, { provide: SnackBarService, useValue: snackBarServiceStub }, { provide: MatBottomSheet, useValue: {} }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributesPanelComponent);
        component = fixture.componentInstance;
        toolsService = TestBed.inject(ToolsService);
        component.currentTool = drawingTool;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#subscribe assings current tool correctly ', async(() => {
        const expectedCurrentTool = new LineService(new DrawingService({} as MatBottomSheet), new ColorService(), undoRedoServiceStub);
        spyOn(toolsService, 'getCurrentTool').and.returnValue(of(expectedCurrentTool));
        // tslint:disable-next-line: no-string-literal
        component['subscribe']();
        fixture.detectChanges();
        expect(component.currentTool).toBe(expectedCurrentTool);
    }));

    it('#shapeIsActive should verify that a shape is active', () => {
        component.currentTool = polygonService;
        expect(component.shapeIsActive()).toBeTrue();
    });

    it('#polygonIsActive should verify if the Polygon shape is active', () => {
        component.currentTool = polygonService;
        expect(component.polygonIsActive()).toBeTrue();
    });

    it('#needsTraceThickness should verify that the tool needs a thickness', () => {
        expect(component.needsTraceThickness()).toBeTrue();
        component.currentTool = toolsService.sprayCanService;
        expect(component.needsTraceThickness()).toBeFalse();
    });

    it('thicknessSetting should call  #getAttribute correctly ', () => {
        const EXPECTED_THICKNESS = 10;
        (component.currentTool as DrawingTool).thickness = EXPECTED_THICKNESS;
        expect(component.thicknessSetting.getAttribute()).toBe(EXPECTED_THICKNESS);
    });

    it('polygonSetting should call  #getAttribute correctly ', () => {
        component.currentTool = polygonService;
        const EXPECTED_NUMBER_OF_SIDES = 10;
        (component.currentTool as PolygonService).numberOfSides = EXPECTED_NUMBER_OF_SIDES;
        expect(component.polygonSetting.getAttribute()).toBe(EXPECTED_NUMBER_OF_SIDES);
    });

    it('thicknessSetting should call  #action correctly ', () => {
        const EXPECTED_VALUE = 10;
        component.thicknessSetting.action(EXPECTED_VALUE);
        expect((component.currentTool as DrawingTool).thickness).toBe(EXPECTED_VALUE);
    });

    it('polygonSetting should call  #action correctly ', () => {
        const EXPECTED_VALUE = 10;
        component.polygonSetting.action(EXPECTED_VALUE);
        expect((component.currentTool as PolygonService).numberOfSides).toBe(EXPECTED_VALUE);
    });

    it('#getAttribute of fillDripSetting should return the acceptance percentage', () => {
        const EXPECTED_ACCEPTANCE_PERCENTAGE = 10;
        component.currentTool = { acceptancePercentage: EXPECTED_ACCEPTANCE_PERCENTAGE } as FillDripService;
        const returnValue = component.fillDripSetting.getAttribute();
        expect(returnValue).toEqual(EXPECTED_ACCEPTANCE_PERCENTAGE * component['PERCENTAGE']);
    });

    it('#action of fillDripSetting should set the acceptancePercentage', () => {
        const EXPECTED_ACCEPTANCE_PERCENTAGE = 10;
        component.currentTool = { acceptancePercentage: 0 } as FillDripService;
        component.fillDripSetting.action(EXPECTED_ACCEPTANCE_PERCENTAGE);
        expect((component.currentTool as FillDripService).acceptancePercentage).toEqual(EXPECTED_ACCEPTANCE_PERCENTAGE / component['PERCENTAGE']);
    });
});
