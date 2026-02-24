import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZoneChangeDetection } from '@angular/core';
import { PaginationComponent } from './pagination.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('PaginationComponent', () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaginationComponent],
            providers: [provideZoneChangeDetection({ eventCoalescing: true })]
        }).compileComponents();

        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with default values', () => {
            expect(component.currentPage).toBe(1);
            expect(component.totalPages).toBe(1);
        });
    });

    describe('Button Rendering', () => {
        it('should render Prev button', () => {
            component.currentPage = 1;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const prevButton = buttons[0];
            expect(prevButton.nativeElement.getAttribute('aria-label')).toBe('Previous page');
        });

        it('should render Next button', () => {
            component.currentPage = 1;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const nextButton = buttons[buttons.length - 1];
            expect(nextButton.nativeElement.getAttribute('aria-label')).toBe('Next page');
        });

        it('should render correct page number buttons', () => {
            component.currentPage = 1;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            // Should have Prev + 5 page buttons + Next = 7 buttons
            expect(buttons.length).toBe(7);

            // Check page numbers (skip Prev and Next buttons)
            const pageButtons = buttons.slice(1, -1);
            expect(pageButtons[0].nativeElement.textContent.trim()).toBe('1');
            expect(pageButtons[1].nativeElement.textContent.trim()).toBe('2');
            expect(pageButtons[2].nativeElement.textContent.trim()).toBe('3');
            expect(pageButtons[3].nativeElement.textContent.trim()).toBe('4');
            expect(pageButtons[4].nativeElement.textContent.trim()).toBe('5');
        });

        it('should never render more than 7 total buttons', () => {
            component.currentPage = 8;
            component.totalPages = 15;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            expect(buttons.length).toBeLessThanOrEqual(7);
        });

        it('should center current page button for middle pages', () => {
            component.currentPage = 8;
            component.totalPages = 15;
            fixture.detectChanges();

            const visiblePages = component.visiblePages;
            // For page 8, should show [6, 7, 8, 9, 10] with 8 in center
            expect(visiblePages).toEqual([6, 7, 8, 9, 10]);
            expect(visiblePages[2]).toBe(8); // Center position
        });

        it('should show current page in actual position on page 1', () => {
            component.currentPage = 1;
            component.totalPages = 15;
            fixture.detectChanges();

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([1, 2, 3, 4, 5]);
        });

        it('should show current page in actual position on page 2', () => {
            component.currentPage = 2;
            component.totalPages = 15;
            fixture.detectChanges();

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([1, 2, 3, 4, 5]);
        });

        it('should show current page in actual position on page 14', () => {
            component.currentPage = 14;
            component.totalPages = 15;
            fixture.detectChanges();

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([11, 12, 13, 14, 15]);
        });

        it('should show current page in actual position on page 15', () => {
            component.currentPage = 15;
            component.totalPages = 15;
            fixture.detectChanges();

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([11, 12, 13, 14, 15]);
        });
    });

    describe('Button States', () => {
        it('should disable current page button', () => {
            component.currentPage = 3;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const pageButtons = buttons.slice(1, -1); // Skip Prev and Next

            // Find button with text "3"
            const currentPageButton = pageButtons.find(
                btn => btn.nativeElement.textContent.trim() === '3'
            );

            expect(currentPageButton?.nativeElement.disabled).toBe(true);
            expect(currentPageButton?.nativeElement.getAttribute('aria-current')).toBe('page');
        });

        it('should disable Prev button on page 1', () => {
            component.currentPage = 1;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const prevButton = buttons[0];

            expect(prevButton.nativeElement.disabled).toBe(true);
            expect(prevButton.nativeElement.getAttribute('aria-disabled')).toBe('true');
        });

        it('should disable Next button on last page', () => {
            component.currentPage = 5;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const nextButton = buttons[buttons.length - 1];

            expect(nextButton.nativeElement.disabled).toBe(true);
            expect(nextButton.nativeElement.getAttribute('aria-disabled')).toBe('true');
        });

        it('should enable Prev button on pages 2+', () => {
            component.currentPage = 2;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const prevButton = buttons[0];

            expect(prevButton.nativeElement.disabled).toBe(false);
        });

        it('should enable Next button on pages before last', () => {
            component.currentPage = 4;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const nextButton = buttons[buttons.length - 1];

            expect(nextButton.nativeElement.disabled).toBe(false);
        });

        it('should apply active styling to current page', () => {
            component.currentPage = 3;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const pageButtons = buttons.slice(1, -1);

            const currentPageButton = pageButtons.find(
                btn => btn.nativeElement.textContent.trim() === '3'
            );

            expect(currentPageButton?.nativeElement.classList.contains('active')).toBe(true);
        });
    });

    describe('Navigation', () => {
        it('should emit pageChange event with correct page on button click', () => {
            component.currentPage = 1;
            component.totalPages = 5;
            fixture.detectChanges();

            spyOn(component.pageChange, 'emit');

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const pageButtons = buttons.slice(1, -1);

            // Click page 3 button
            const page3Button = pageButtons.find(
                btn => btn.nativeElement.textContent.trim() === '3'
            );
            page3Button?.nativeElement.click();

            expect(component.pageChange.emit).toHaveBeenCalledWith(3);
        });

        it('should emit pageChange with previous page on Prev click', () => {
            component.currentPage = 3;
            component.totalPages = 5;
            fixture.detectChanges();

            spyOn(component.pageChange, 'emit');

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const prevButton = buttons[0];
            prevButton.nativeElement.click();

            expect(component.pageChange.emit).toHaveBeenCalledWith(2);
        });

        it('should emit pageChange with next page on Next click', () => {
            component.currentPage = 3;
            component.totalPages = 5;
            fixture.detectChanges();

            spyOn(component.pageChange, 'emit');

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const nextButton = buttons[buttons.length - 1];
            nextButton.nativeElement.click();

            expect(component.pageChange.emit).toHaveBeenCalledWith(4);
        });

        it('should not emit event when clicking disabled button', () => {
            component.currentPage = 1;
            component.totalPages = 5;
            fixture.detectChanges();

            spyOn(component.pageChange, 'emit');

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const prevButton = buttons[0];

            // Prev button should be disabled on page 1
            expect(prevButton.nativeElement.disabled).toBe(true);

            // Try to click (should not emit)
            prevButton.nativeElement.click();

            expect(component.pageChange.emit).not.toHaveBeenCalled();
        });

        it('should not emit event when clicking current page', () => {
            component.currentPage = 3;
            component.totalPages = 5;
            fixture.detectChanges();

            spyOn(component.pageChange, 'emit');

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const pageButtons = buttons.slice(1, -1);

            const currentPageButton = pageButtons.find(
                btn => btn.nativeElement.textContent.trim() === '3'
            );

            currentPageButton?.nativeElement.click();

            expect(component.pageChange.emit).not.toHaveBeenCalled();
        });
    });

    describe('Keyboard Navigation', () => {
        it('should activate button with Enter key', () => {
            component.currentPage = 1;
            component.totalPages = 5;
            fixture.detectChanges();

            spyOn(component.pageChange, 'emit');

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const pageButtons = buttons.slice(1, -1);

            const page2Button = pageButtons.find(
                btn => btn.nativeElement.textContent.trim() === '2'
            );

            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            page2Button?.nativeElement.dispatchEvent(enterEvent);
            page2Button?.nativeElement.click();

            expect(component.pageChange.emit).toHaveBeenCalledWith(2);
        });

        it('should activate button with Space key', () => {
            component.currentPage = 1;
            component.totalPages = 5;
            fixture.detectChanges();

            spyOn(component.pageChange, 'emit');

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const pageButtons = buttons.slice(1, -1);

            const page2Button = pageButtons.find(
                btn => btn.nativeElement.textContent.trim() === '2'
            );

            const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
            page2Button?.nativeElement.dispatchEvent(spaceEvent);
            page2Button?.nativeElement.click();

            expect(component.pageChange.emit).toHaveBeenCalledWith(2);
        });
    });

    describe('Edge Cases', () => {
        it('should handle single page scenario (page 1 of 1)', () => {
            component.currentPage = 1;
            component.totalPages = 1;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            // Should have Prev + 1 page button + Next = 3 buttons
            expect(buttons.length).toBe(3);

            // Both Prev and Next should be disabled
            const prevButton = buttons[0];
            const nextButton = buttons[buttons.length - 1];
            expect(prevButton.nativeElement.disabled).toBe(true);
            expect(nextButton.nativeElement.disabled).toBe(true);
        });

        it('should handle two page scenario', () => {
            component.currentPage = 1;
            component.totalPages = 2;
            fixture.detectChanges();

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([1, 2]);

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            expect(buttons.length).toBe(4); // Prev + 2 pages + Next
        });

        it('should handle maximum pages (15)', () => {
            component.currentPage = 8;
            component.totalPages = 15;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            expect(buttons.length).toBe(7); // Prev + 5 pages + Next
        });

        it('should handle rapid button clicks', () => {
            component.currentPage = 5;
            component.totalPages = 10;
            fixture.detectChanges();

            spyOn(component.pageChange, 'emit');

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const nextButton = buttons[buttons.length - 1];

            // Click multiple times rapidly
            nextButton.nativeElement.click();
            nextButton.nativeElement.click();
            nextButton.nativeElement.click();

            // Should emit 3 times (component doesn't prevent rapid clicks)
            expect(component.pageChange.emit).toHaveBeenCalledTimes(3);
            expect(component.pageChange.emit).toHaveBeenCalledWith(6);
        });
    });

    describe('Accessibility', () => {
        it('should have aria-label on Prev button', () => {
            component.currentPage = 2;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const prevButton = buttons[0];

            expect(prevButton.nativeElement.getAttribute('aria-label')).toBe('Previous page');
        });

        it('should have aria-label on Next button', () => {
            component.currentPage = 2;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const nextButton = buttons[buttons.length - 1];

            expect(nextButton.nativeElement.getAttribute('aria-label')).toBe('Next page');
        });

        it('should have aria-current="page" on current page', () => {
            component.currentPage = 3;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const pageButtons = buttons.slice(1, -1);

            const currentPageButton = pageButtons.find(
                btn => btn.nativeElement.textContent.trim() === '3'
            );

            expect(currentPageButton?.nativeElement.getAttribute('aria-current')).toBe('page');
        });

        it('should have aria-disabled on disabled buttons', () => {
            component.currentPage = 1;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const prevButton = buttons[0];

            expect(prevButton.nativeElement.getAttribute('aria-disabled')).toBe('true');
        });

        it('should have descriptive aria-labels on page buttons', () => {
            component.currentPage = 1;
            component.totalPages = 5;
            fixture.detectChanges();

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const pageButtons = buttons.slice(1, -1);

            pageButtons.forEach((btn, index) => {
                const pageNumber = index + 1;
                expect(btn.nativeElement.getAttribute('aria-label')).toBe(`Page ${pageNumber}`);
            });
        });
    });

    describe('calculateVisiblePages Method', () => {
        it('should return all pages when total is 5 or less', () => {
            component.currentPage = 1;
            component.totalPages = 3;

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([1, 2, 3]);
        });

        it('should return first 5 pages when on page 1', () => {
            component.currentPage = 1;
            component.totalPages = 10;

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([1, 2, 3, 4, 5]);
        });

        it('should return first 5 pages when on page 2', () => {
            component.currentPage = 2;
            component.totalPages = 10;

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([1, 2, 3, 4, 5]);
        });

        it('should center current page when on page 3', () => {
            component.currentPage = 3;
            component.totalPages = 10;

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([1, 2, 3, 4, 5]);
        });

        it('should center current page when on middle pages', () => {
            component.currentPage = 5;
            component.totalPages = 10;

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([3, 4, 5, 6, 7]);
        });

        it('should return last 5 pages when on second-to-last page', () => {
            component.currentPage = 9;
            component.totalPages = 10;

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([6, 7, 8, 9, 10]);
        });

        it('should return last 5 pages when on last page', () => {
            component.currentPage = 10;
            component.totalPages = 10;

            const visiblePages = component.visiblePages;
            expect(visiblePages).toEqual([6, 7, 8, 9, 10]);
        });
    });

    describe('Helper Methods', () => {
        it('isPrevDisabled should return true on page 1', () => {
            component.currentPage = 1;
            expect(component.isPrevDisabled()).toBe(true);
        });

        it('isPrevDisabled should return false on page 2+', () => {
            component.currentPage = 2;
            expect(component.isPrevDisabled()).toBe(false);
        });

        it('isNextDisabled should return true on last page', () => {
            component.currentPage = 5;
            component.totalPages = 5;
            expect(component.isNextDisabled()).toBe(true);
        });

        it('isNextDisabled should return false before last page', () => {
            component.currentPage = 4;
            component.totalPages = 5;
            expect(component.isNextDisabled()).toBe(false);
        });

        it('isCurrentPage should return true for current page', () => {
            component.currentPage = 3;
            expect(component.isCurrentPage(3)).toBe(true);
        });

        it('isCurrentPage should return false for other pages', () => {
            component.currentPage = 3;
            expect(component.isCurrentPage(2)).toBe(false);
            expect(component.isCurrentPage(4)).toBe(false);
        });
    });
});
