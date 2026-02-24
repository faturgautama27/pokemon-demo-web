import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, ArrowRight } from 'lucide-angular';

/**
 * PaginationComponent
 * 
 * Navigation control for browsing Pokemon pages.
 * Displays page buttons with current page centered (except for edge cases).
 * Maximum of 7 buttons total including Prev and Next.
 */
@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
    @Input() currentPage: number = 1;
    @Input() totalPages: number = 1;
    @Output() pageChange = new EventEmitter<number>();

    // Lucide icons
    readonly ArrowLeft = ArrowLeft;
    readonly ArrowRight = ArrowRight;

    /**
     * Get visible pages (cached to avoid recalculation)
     */
    get visiblePages(): number[] {
        return this.calculateVisiblePages();
    }

    /**
     * Calculate which page buttons should be visible
     * Maximum 7 buttons total: [Prev] [1] [2] [3] [4] [5] [Next]
     * Current page should be centered except for first 2 and last 2 pages
     */
    private calculateVisiblePages(): number[] {
        const maxPageButtons = 5; // 5 page numbers + Prev + Next = 7 total
        const pages: number[] = [];

        if (this.totalPages <= maxPageButtons) {
            // Show all pages if total is 5 or less
            for (let i = 1; i <= this.totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Complex logic for centering current page
            if (this.currentPage <= 2) {
                // First 2 pages: show [1] [2] [3] [4] [5]
                for (let i = 1; i <= maxPageButtons; i++) {
                    pages.push(i);
                }
            } else if (this.currentPage >= this.totalPages - 1) {
                // Last 2 pages: show last 5 pages
                for (let i = this.totalPages - maxPageButtons + 1; i <= this.totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Middle pages: center current page
                // Show [current-2] [current-1] [current] [current+1] [current+2]
                for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
                    pages.push(i);
                }
            }
        }

        return pages;
    }

    /**
     * Handle page change event
     */
    onPageChange(page: number): void {
        if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
            this.pageChange.emit(page);
        }
    }

    /**
     * Handle previous page navigation
     */
    onPrevious(): void {
        if (this.currentPage > 1) {
            this.pageChange.emit(this.currentPage - 1);
        }
    }

    /**
     * Handle next page navigation
     */
    onNext(): void {
        if (this.currentPage < this.totalPages) {
            this.pageChange.emit(this.currentPage + 1);
        }
    }

    /**
     * Check if Prev button should be disabled
     */
    isPrevDisabled(): boolean {
        return this.currentPage === 1;
    }

    /**
     * Check if Next button should be disabled
     */
    isNextDisabled(): boolean {
        return this.currentPage === this.totalPages;
    }

    /**
     * Check if a page button is the current page
     */
    isCurrentPage(page: number): boolean {
        return page === this.currentPage;
    }
}
