// tslint:disable: no-any
// tslint:disable: no-string-literal
// tslint:disable: max-file-line-count
/*describe('ClipboardService', () => {
    let service: ClipboardSelectionService;
    let toolServiceSpyObj: jasmine.SpyObj<ToolsService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let moveSelectionService: jasmine.SpyObj<MoveSelectionService>;

    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let rectangleSelectionServiceStub: RectangleSelectionService;
    let ellipseSelectionServiceStub: EllipseSelectionService;
    let lassoSelectionServiceStub: LassoSelectionService;

    beforeEach(() => {
        toolServiceSpyObj = jasmine.createSpyObj('ToolsService', ['setCurrentTool']);
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['fillWithWhite', 'clearCanvas']);

        rectangleDrawingServiceSpyObj = jasmine.createSpyObj('RectangleDrawingService', ['']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['']);
        moveSelectionService = jasmine.createSpyObj('MoveSelectionService', ['']);
        TestBed.configureTestingModule({
            providers: [
                { provide: ToolsService, useValue: toolServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpyObj.canvas = canvasTestHelper.canvas;

        drawingServiceSpyObj.baseCtx = baseCtxStub;
        drawingServiceSpyObj.previewCtx = previewCtxStub;

        service = TestBed.inject(ClipboardSelectionService);

        rectangleSelectionServiceStub = new RectangleSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionService,
        );

        ellipseSelectionServiceStub = new EllipseSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionService,
        );

        lassoSelectionServiceStub = new LassoSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionService,
        );
        toolServiceSpyObj.rectangleSelectionService = rectangleSelectionServiceStub;
        toolServiceSpyObj.ellipseSelectionService = ellipseSelectionServiceStub;
        toolServiceSpyObj.lassoSelectionService = lassoSelectionServiceStub;
        toolServiceSpyObj.currentTool = toolServiceSpyObj.rectangleSelectionService;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#switchToStoredClipboardImageSelectionTool should switch to the tool with the appropriate type', () => {
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Ellipse,
        };
        service.clipBoardData.selectionType = SelectionType.Rectangle;
        service['switchToStoredClipboardImageSelectionTool']();
        expect(toolServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolServiceSpyObj.rectangleSelectionService);

        service.clipBoardData.selectionType = SelectionType.Ellipse;
        service['switchToStoredClipboardImageSelectionTool']();
        expect(toolServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolServiceSpyObj.ellipseSelectionService);

        service.clipBoardData.selectionType = SelectionType.Lasso;
        service['switchToStoredClipboardImageSelectionTool']();
        expect(toolServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolServiceSpyObj.lassoSelectionService);
    });

    it('#canUseClipBoardService should return true if the current tool is a selection tool instance and if a selection exists', () => {
        toolServiceSpyObj.currentTool = rectangleSelectionServiceStub;
        rectangleSelectionServiceStub.selectionExists = true;
        expect(service.canUseClipboardService()).toBeTrue();
    });

    it('#canUseClipBoardService should return false if the current tool is not a selection tool instance and if a selection exists', () => {
        toolServiceSpyObj.currentTool = toolServiceSpyObj.pencilService;
        rectangleSelectionServiceStub.selectionExists = true;
        expect(service.canUseClipboardService()).toBeFalse();
    });

    it('#canUseClipBoardService should return false if the current tool is selection tool instance and if a selection doesnt exists', () => {
        toolServiceSpyObj.currentTool = rectangleSelectionServiceStub;
        rectangleSelectionServiceStub.selectionExists = false;
        expect(service.canUseClipboardService()).toBeFalse();
    });

    it('#getSelectionType should return selection type rectangle if the current tool is a rectangleSelection', () => {
        toolServiceSpyObj.currentTool = rectangleSelectionServiceStub;
        expect(service['getSelectionType']()).toEqual(SelectionType.Rectangle);
    });

    it('#checkSelectionType should return selection type ellipse if the current tool is a ellipseSelection', () => {
        toolServiceSpyObj.currentTool = ellipseSelectionServiceStub;
        expect(service['getSelectionType']()).toEqual(SelectionType.Ellipse);
    });

    it('#checkSelectionType should return selection type rectangle if the current tool is a lassoSelection', () => {
        toolServiceSpyObj.currentTool = lassoSelectionServiceStub;
        expect(service['getSelectionType']()).toEqual(SelectionType.Lasso);
    });

    it('#checkSelectionType should return selection type none if the current tool is not a selection tool', () => {
        toolServiceSpyObj.currentTool = toolServiceSpyObj.pencilService;
        expect(service['getSelectionType']()).toEqual(SelectionType.None);
    });

    it('#cut should call copy and delete from the service', () => {
        const copySpy = spyOn(service, 'copy');
        const deleteSpy = spyOn(service, 'delete');
        service.cut();
        expect(copySpy).toHaveBeenCalled();
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('#delete should change by 1 pixel the position of initial coords', () => {
        spyOn(service, 'canUseClipboardService').and.returnValue(true);
        (toolServiceSpyObj.currentTool as SelectionTool).data = drawingServiceSpyObj.previewCtx.getImageData(
            0,
            0,
            drawingServiceSpyObj.previewCtx.canvas.width,
            drawingServiceSpyObj.previewCtx.canvas.height,
        );
        (toolServiceSpyObj.currentTool as SelectionTool).coords.initialBottomRight = { x: 1, y: 1 };
        (toolServiceSpyObj.currentTool as SelectionTool).coords.initialTopLeft = { x: 1, y: 1 };
        service.delete();
        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.initialBottomRight).toEqual({ x: 0, y: 0 });
        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.initialTopLeft).toEqual({ x: 0, y: 0 });
    });

    it('#delete should call the fill with white on preview context and cancel selection', () => {
        spyOn(service, 'canUseClipboardService').and.returnValue(true);
        const cancelSelectionSpy = spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'cancelSelection');
        (toolServiceSpyObj.currentTool as SelectionTool).data = drawingServiceSpyObj.previewCtx.getImageData(
            0,
            0,
            drawingServiceSpyObj.previewCtx.canvas.width,
            drawingServiceSpyObj.previewCtx.canvas.height,
        );
        service.delete();
        expect(drawingServiceSpyObj.fillWithWhite).toHaveBeenCalledWith(drawingServiceSpyObj.previewCtx);
        expect(cancelSelectionSpy).toHaveBeenCalled();
    });

    it('#delete should set all the pixels of the image to white', () => {
        const whiteRGB = 255;
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        (toolServiceSpyObj.currentTool as SelectionTool).data = drawingServiceSpyObj.previewCtx.getImageData(
            0,
            0,
            drawingServiceSpyObj.previewCtx.canvas.width,
            drawingServiceSpyObj.previewCtx.canvas.height,
        );
        service.delete();
        let opacity = true;
        let red = true;
        let green = true;
        let blue = true;
        const pixelSize = 4;
        const globalAlphaPosition = 3;
        for (let index = 0; index < (toolServiceSpyObj.currentTool as SelectionTool).data.data.length; index += pixelSize) {
            if ((toolServiceSpyObj.currentTool as SelectionTool).data.data[index] !== 0) red = false;
            if ((toolServiceSpyObj.currentTool as SelectionTool).data.data[index + 1] !== 0) green = false;
            if ((toolServiceSpyObj.currentTool as SelectionTool).data.data[index + 2] !== 0) blue = false;
            if ((toolServiceSpyObj.currentTool as SelectionTool).data.data[index + globalAlphaPosition] !== whiteRGB) opacity = false;
        }
        expect(opacity).toBeTrue();
        expect(red).toBeTrue();
        expect(green).toBeTrue();
        expect(blue).toBeTrue();
    });

    it('#paste should change the data in selection tool with the one in clipboard selection service', () => {
        spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        (toolServiceSpyObj.currentTool as SelectionTool).data = drawingServiceSpyObj.previewCtx.getImageData(
            0,
            0,
            drawingServiceSpyObj.previewCtx.canvas.width,
            drawingServiceSpyObj.previewCtx.canvas.height,
        );
        drawingServiceSpyObj.previewCtx.fillStyle = 'green';
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
        };
        service.paste();
        expect((toolServiceSpyObj.currentTool as SelectionTool).data).toBe(service.clipBoardData.clipboardImage);
    });

    it('#paste should call the switch to stored clipboard image selection tool and the drawAll method from the 
    current tool ( if it is a selection tool', () => {
        const drawAllSpy = spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        const switchToolSpy = spyOn<any>(service, 'switchToStoredClipboardImageSelectionTool').and.returnValues();
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
        };
        service.paste();
        expect(drawAllSpy).toHaveBeenCalledWith(drawingServiceSpyObj.previewCtx);
        expect(switchToolSpy).toHaveBeenCalled();
    });

    it('#paste should set selection exist of current tool to true', () => {
        spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
        };
        (toolServiceSpyObj.currentTool as SelectionTool).selectionExists = false;
        service.paste();
        expect((toolServiceSpyObj.currentTool as SelectionTool).selectionExists).toBeTrue();
    });

    it('#paste should not paste if clipboard there are no images', () => {
        const switchToolSpy = spyOn<any>(service, 'switchToStoredClipboardImageSelectionTool');
        service.paste();
        expect(switchToolSpy).not.toHaveBeenCalled();
    });

    it('#paste should set selection exist of current tool to true', () => {
        spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        const switchSpy = spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'cancelSelection').and.returnValue();
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
        };
        (toolServiceSpyObj.currentTool as SelectionTool).selectionExists = true;
        service.paste();
        expect(switchSpy).toHaveBeenCalled();
    });

    it('#paste should not paste if clipboard there are no images', () => {
        const switchToolSpy = spyOn<any>(service, 'switchToStoredClipboardImageSelectionTool');
        service.paste();
        expect(switchToolSpy).not.toHaveBeenCalled();
    });

    it('#paste should put selection in the upper right corner', () => {
        spyOn(toolServiceSpyObj.currentTool as SelectionTool, 'drawAll').and.returnValue();
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
        };
        service.paste();
        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.finalTopLeft).toEqual({
            x: service['pasteOffSet'],
            y: service['pasteOffSet'],
        });

        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.finalBottomRight).toEqual({
            x: service['pasteOffSet'] + service.clipBoardData.clipboardImage.width,
            y: service['pasteOffSet'] + service.clipBoardData.clipboardImage.height,
        });

        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.initialTopLeft).toEqual({
            x: service['outsideDrawingZoneCoords'],
            y: service['outsideDrawingZoneCoords'],
        });

        expect((toolServiceSpyObj.currentTool as SelectionTool).coords.initialBottomRight).toEqual({
            x: service['outsideDrawingZoneCoords'] + service.clipBoardData.clipboardImage.width,
            y: service['outsideDrawingZoneCoords'] + service.clipBoardData.clipboardImage.height,
        });
    });

    it('#copy should change the current clipboard image', () => {
        spyOn(service, 'canUseClipboardService').and.returnValue(true);
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        (toolServiceSpyObj.currentTool as SelectionTool).data = drawingServiceSpyObj.previewCtx.getImageData(
            0,
            0,
            drawingServiceSpyObj.previewCtx.canvas.width,
            drawingServiceSpyObj.previewCtx.canvas.height,
        );
        drawingServiceSpyObj.previewCtx.fillStyle = 'green';
        drawingServiceSpyObj.previewCtx.fillRect(0, 0, drawingServiceSpyObj.previewCtx.canvas.width, drawingServiceSpyObj.previewCtx.canvas.height);
        service.clipBoardData = {
            clipboardImage: drawingServiceSpyObj.previewCtx.getImageData(
                0,
                0,
                drawingServiceSpyObj.previewCtx.canvas.width,
                drawingServiceSpyObj.previewCtx.canvas.height,
            ),
            selectionType: SelectionType.Rectangle,
        };
        service.copy();

        expect(service.clipBoardData.clipboardImage).toBe((toolServiceSpyObj.currentTool as SelectionTool).data);
    });

    it('#copy should not copy there are no selection active', () => {
        spyOn(service, 'canUseClipboardService').and.returnValue(false);
        const checkSelectionType = spyOn<any>(service, 'getSelectionType');
        service.copy();
        expect(checkSelectionType).not.toHaveBeenCalled();
    });
});*/