import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSlider, MatSliderChange, MatSliderModule } from '@angular/material/slider';
import { SliderSetting } from '@app/classes/slider-setting';

import { GenericSliderComponent } from './generic-slider.component';

describe('GenericSliderComponent', () => {
    let component: GenericSliderComponent;
    let fixture: ComponentFixture<GenericSliderComponent>;
    let mockAttribute = 10;

    const sliderSettinMock: SliderSetting = {
        title: 'mock title',
        unit: 'pixels',
        min: 1,
        max: 50,
        getAttribute: () => {
            return mockAttribute;
        },
        action: (value: number) => {
            mockAttribute = value;
        },
    };

    const matSliderMock = {
        blur(): void {
            return;
        },
    } as MatSlider;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GenericSliderComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [MatSliderModule],
            providers: [{ provide: MatSlider, useValue: matSliderMock }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GenericSliderComponent);
        component = fixture.componentInstance;
        component.sliderSetting = sliderSettinMock;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#updateSetting should update the setting correctly', () => {
        spyOn(component.sliderSetting, 'action');
        spyOn(component.matSlider, 'blur');
        const SLIDER_EXPECTED_VALUE = 30;
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = SLIDER_EXPECTED_VALUE;
        component.updateSetting(matSliderChange);
        expect(component.sliderSetting.action).toHaveBeenCalledWith(matSliderChange.value as number);
        expect(component.matSlider.blur).toHaveBeenCalled();
    });
});
