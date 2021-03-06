// Reference: https://malcoded.com/posts/angular-color-picker/
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
@Component({
    selector: 'app-color-palette',
    templateUrl: './color-palette.component.html',
    styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent implements AfterViewInit, OnChanges {
    @Input()
    hue: string;

    @Output()
    color: EventEmitter<string> = new EventEmitter(true);

    @ViewChild('canvas')
    canvas: ElementRef<HTMLCanvasElement>;

    private readonly DEFAULT_POSITION: Vec2 = { x: 0, y: 0 };

    private readonly DIAMETER: number = 10;
    private readonly THICKNESS: number = 5;

    private ctx: CanvasRenderingContext2D;

    private mousedown: boolean = false;

    private selectedPosition: Vec2 = this.DEFAULT_POSITION;

    ngAfterViewInit(): void {
        this.renderPalette();
    }

    private renderPalette(): void {
        if (!this.canvas) {
            return;
        }
        if (!this.ctx) {
            this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        }
        const width = this.canvas.nativeElement.width;
        const height = this.canvas.nativeElement.height;

        this.ctx.fillStyle = this.hue || 'rgba(255,255,255,1)';
        this.ctx.fillRect(0, 0, width, height);

        const whiteGrad = this.ctx.createLinearGradient(0, 0, width, 0);
        whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
        whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');

        this.ctx.fillStyle = whiteGrad;
        this.ctx.fillRect(0, 0, width, height);

        const blackGrad = this.ctx.createLinearGradient(0, 0, 0, height);
        blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
        blackGrad.addColorStop(1, 'rgba(0,0,0,1)');

        this.ctx.fillStyle = blackGrad;
        this.ctx.fillRect(0, 0, width, height);

        this.renderCircle();
    }

    private renderCircle(): void {
        if (this.selectedPosition !== this.DEFAULT_POSITION) {
            this.ctx.strokeStyle = 'white';
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(this.selectedPosition.x, this.selectedPosition.y, this.DIAMETER, 0, 2 * Math.PI);
            this.ctx.lineWidth = this.THICKNESS;
            this.ctx.stroke();
        }
    }

    ngOnChanges(): void {
        this.renderPalette();
        const pos = this.selectedPosition;
        if (this.selectedPosition !== this.DEFAULT_POSITION) {
            this.color.emit(this.getColorAtPosition(pos.x, pos.y));
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(): void {
        this.mousedown = false;
    }

    onMouseDown(evt: MouseEvent): void {
        this.mousedown = true;
        this.handleMouseEvent(evt);
    }

    onMouseMove(evt: MouseEvent): void {
        if (this.mousedown) {
            this.handleMouseEvent(evt);
        }
    }

    handleMouseEvent(evt: MouseEvent): void {
        this.selectedPosition = { x: evt.offsetX, y: evt.offsetY };
        this.renderPalette();
        this.emitColor(evt.offsetX, evt.offsetY);
    }

    private emitColor(x: number, y: number): void {
        const rgbColor = this.getColorAtPosition(x, y);
        this.color.emit(rgbColor);
    }

    private getColorAtPosition(x: number, y: number): string {
        const imageData = this.ctx.getImageData(x, y, 1, 1).data;
        return 'rgb(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ')';
    }
}
