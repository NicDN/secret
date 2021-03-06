import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { By } from '@angular/platform-browser';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { PencilService } from '@app/services/tools/trace-tool/pencil/pencil.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolBarComponent } from './tool-bar.component';

describe('ToolBarComponent', () => {
    let component: ToolBarComponent;
    let fixture: ComponentFixture<ToolBarComponent>;
    let undoRedoServiceStub: UndoRedoService;
    let tool: Tool;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ToolBarComponent],
            providers: [ToolsService, { provide: UndoRedoService, useValue: undoRedoServiceStub }, { provide: MatBottomSheet, useValue: {} }],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        undoRedoServiceStub = TestBed.inject(UndoRedoService);
        tool = new PencilService(new DrawingService({} as MatBottomSheet), new ColorService(), undoRedoServiceStub);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToolBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call #toggleActive when a tool bar element is clicked', () => {
        // tslint:disable-next-line: no-any
        spyOn<any>(component, 'initializeToolBarElements');
        const toolBarElement = fixture.debugElement.query(By.css('.list-item'));
        toolBarElement.triggerEventHandler('click', tool);
        expect(component.toolService.currentTool).toBeInstanceOf(PencilService);
        // tslint:disable-next-line: no-string-literal
        expect(component['initializeToolBarElements']).toHaveBeenCalled();
    });
});
