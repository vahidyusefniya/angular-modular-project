import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportBulkPricesModalComponent } from './import-bulk-prices-modal.component';
import { ModalController } from '@ionic/angular';
import { CoreService } from './../../../../core/services/core.service';
import { PriceListService } from '../../service/price-list.service';
import { LayoutService } from './../../../../layout/service/layout.service';
import { Branch } from '@app/proxy/proxy';

describe('ImportBulkPricesModalComponent', () => {
    let component: ImportBulkPricesModalComponent;
    let fixture: ComponentFixture<ImportBulkPricesModalComponent>;

    // Create spies for the services
    const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const coreServiceSpy = jasmine.createSpyObj('CoreService', ['getBranchId']);
    const priceListServiceSpy = jasmine.createSpyObj('PriceListService', []);
    const layoutServiceSpy = jasmine.createSpyObj('LayoutService', ['getBranch']);

    beforeEach(async () => {
        // Set up spies to return mock data
        coreServiceSpy.getBranchId.and.returnValue(1);
        layoutServiceSpy.getBranch.and.returnValue({ branchId: 1, branchName: 'test branch' } as Branch);

        await TestBed.configureTestingModule({
            declarations: [ImportBulkPricesModalComponent],
            providers: [
                { provide: ModalController, useValue: modalCtrlSpy },
                { provide: CoreService, useValue: coreServiceSpy },
                { provide: PriceListService, useValue: priceListServiceSpy },
                { provide: LayoutService, useValue: layoutServiceSpy }
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ImportBulkPricesModalComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
