import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DrawingOptionsComponent } from '@app/components/drawing-options/drawing-options.component';
import { LineSettingsSelectorComponent } from '@app/components/tool-settings/line-settings-selector/line-settings-selector.component';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { ClickOutsideModule } from 'ng-click-outside';
import { ClipboardModule } from 'ngx-clipboard';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AttributesPanelComponent } from './components/attributes-panel/attributes-panel.component';
import { BottomSheetConfirmNewDrawingComponent } from './components/bottom-sheet-confirm-new-drawing/bottom-sheet-confirm-new-drawing.component';
import { CardDrawingComponent } from './components/card-drawing/card-drawing.component';
import { ColorPaletteComponent } from './components/color/color-palette/color-palette.component';
import { ColorPanelComponent } from './components/color/color-panel/color-panel.component';
import { ColorSliderComponent } from './components/color/color-slider/color-slider.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { CarouselDialogComponent } from './components/dialogs/carousel-dialog/carousel-dialog.component';
import { ExportDialogComponent } from './components/dialogs/export-dialog/export-dialog.component';
import { SaveDialogComponent } from './components/dialogs/save-dialog/save-dialog.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { EyeDropperComponent } from './components/eye-dropper/eye-dropper.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { OptionBarComponent } from './components/option-bar/option-bar.component';
import { ResizeContainerComponent } from './components/resize-container/resize-container.component';
import { SelectionOptionsComponent } from './components/selection-options/selection-options.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToolBarComponent } from './components/tool-bar/tool-bar.component';
import { GenericSliderComponent } from './components/tool-settings/generic-slider/generic-slider.component';
import { GridSelectorComponent } from './components/tool-settings/grid-selector/grid-selector/grid-selector.component';
import { PointSelectorComponent } from './components/tool-settings/point-selector/point-selector.component';
import { SelectionSelectorComponent } from './components/tool-settings/selection-selector/selection-selector.component';
import { SprayCanSettingsSelectorComponent } from './components/tool-settings/spray-can-settings-selector/spray-can-settings-selector.component';
import { StampSelectorComponent } from './components/tool-settings/stamp-selector/stamp-selector/stamp-selector.component';
import { TextSelectorComponent } from './components/tool-settings/text-selector/text-selector/text-selector.component';
import { TraceTypeSelectorComponent } from './components/tool-settings/trace-type-selector/trace-type-selector.component';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        AttributesPanelComponent,
        ControlPanelComponent,
        ColorPanelComponent,
        ResizeContainerComponent,
        ToolBarComponent,
        OptionBarComponent,
        TraceTypeSelectorComponent,
        LineSettingsSelectorComponent,
        ColorSliderComponent,
        ColorPaletteComponent,
        SprayCanSettingsSelectorComponent,
        DrawingOptionsComponent,
        EyeDropperComponent,
        CarouselDialogComponent,
        SaveDialogComponent,
        ExportDialogComponent,
        CardDrawingComponent,
        SelectionSelectorComponent,
        SelectionOptionsComponent,
        GenericSliderComponent,
        GridSelectorComponent,
        TextSelectorComponent,
        StampSelectorComponent,
        PointSelectorComponent,
        BottomSheetConfirmNewDrawingComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatDividerModule,
        FontAwesomeModule,
        MatTooltipModule,
        MatSliderModule,
        FormsModule,
        MatSlideToggleModule,
        MatInputModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonToggleModule,
        MatChipsModule,
        MatRippleModule,
        MatSnackBarModule,
        ClickOutsideModule,
        ClipboardModule,
        MatBottomSheetModule,
        MatGridListModule,
    ],
    entryComponents: [CarouselDialogComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    bootstrap: [AppComponent],
})
export class AppModule {
    // adding icons packs for font-awesome
    constructor(library: FaIconLibrary) {
        library.addIconPacks(fas, far);
    }
}
